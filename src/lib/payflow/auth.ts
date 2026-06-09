import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "worker" | "business";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  onboardingComplete: boolean;
  hourlyRate: number;
  weeklyTarget: number;
  // Convenience fields hydrated separately for business users
  company?: string;
  joinCode?: string;
};

let user: AuthUser | null = null;
let initialised = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export const auth = {
  get: () => user,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

export function useAuth(): AuthUser | null {
  return useSyncExternalStore(
    (cb) => auth.subscribe(cb),
    () => user,
    () => null,
  );
}

async function loadProfile(userId: string, email: string) {
  // Profile row is auto-created via the on_auth_user_created trigger.
  // Retry once if the trigger hasn't landed yet.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, onboarding_complete, hourly_rate, weekly_target")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      user = {
        id: data.id,
        name: data.full_name || email.split("@")[0],
        email: data.email || email,
        role: (data.role as Role) ?? "worker",
        onboardingComplete: !!data.onboarding_complete,
        hourlyRate: Number(data.hourly_rate ?? 14.5),
        weeklyTarget: Number(data.weekly_target ?? 600),
      };
      // Fetch org for business users
      if (user.role === "business") {
        const { data: org } = await supabase
          .from("organisations")
          .select("name, join_code")
          .eq("owner_id", userId)
          .maybeSingle();
        if (org) { user.company = org.name; user.joinCode = org.join_code; }
      }
      emit();
      return;
    }
    if (error) console.warn("profile load", error);
    await new Promise((r) => setTimeout(r, 500));
  }
}

export async function ensureInitialised() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    await loadProfile(data.session.user.id, data.session.user.email ?? "");
  }
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session?.user) {
      user = null; emit(); return;
    }
    if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
      // defer to avoid recursive auth calls
      setTimeout(() => { void loadProfile(session.user.id, session.user.email ?? ""); }, 0);
    }
  });
}

function redirectFor(role: Role) {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/${role === "business" ? "business" : "app"}`;
}

export async function signupWorker(name: string, email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectFor("worker"),
      data: { full_name: name.trim(), role: "worker" },
    },
  });
  if (error) throw error;
}

export async function signupBusiness(name: string, email: string, company: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectFor("business"),
      data: { full_name: name.trim(), role: "business", company: company.trim() },
    },
  });
  if (error) throw error;
}

export async function loginWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
  user = null; emit();
}

export async function refreshProfile() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) await loadProfile(data.session.user.id, data.session.user.email ?? "");
}

export async function updateProfile(patch: { onboarding_complete?: boolean; hourly_rate?: number; weekly_target?: number; full_name?: string }) {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session?.user) return;
  await supabase.from("profiles").update(patch).eq("id", s.session.user.id);
  await refreshProfile();
}
