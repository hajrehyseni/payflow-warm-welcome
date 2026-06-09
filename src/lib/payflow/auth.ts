import { useSyncExternalStore } from "react";

export type Role = "worker" | "business";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  company?: string;
  joinCode?: string; // for business
  createdAt: number;
};

const KEY = "payflow.auth.v1";

function load(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

let user: AuthUser | null = typeof window !== "undefined" ? load() : null;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function persist() {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {}
}

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

function makeJoinCode() {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += a[Math.floor(Math.random() * a.length)];
  return out;
}

export function signupWorker(name: string, email: string): AuthUser {
  user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "worker",
    createdAt: Date.now(),
  };
  persist(); emit();
  return user;
}

export function signupBusiness(name: string, email: string, company: string): AuthUser {
  user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "business",
    company: company.trim(),
    joinCode: makeJoinCode(),
    createdAt: Date.now(),
  };
  persist(); emit();
  return user;
}

export function loginWithEmail(email: string): AuthUser {
  // Mock magic-link: if user exists, keep; else create a worker shell
  const existing = user;
  if (existing && existing.email === email.trim().toLowerCase()) return existing;
  user = {
    id: crypto.randomUUID(),
    name: email.split("@")[0],
    email: email.trim().toLowerCase(),
    role: "worker",
    createdAt: Date.now(),
  };
  persist(); emit();
  return user;
}

export function signOut() {
  user = null;
  persist(); emit();
}
