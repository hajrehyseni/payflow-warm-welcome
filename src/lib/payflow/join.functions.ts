import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type LookupResult = { name: string } | { error: string };

/** Public: resolve a join code to an org name. Returns nothing else. */
export const lookupOrgByCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => {
    const code = String(data.code ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(code)) throw new Error("Invalid code");
    return { code };
  })
  .handler(async ({ data }): Promise<LookupResult> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("organisations")
        .select("name")
        .eq("join_code", data.code)
        .maybeSingle();
      if (!row) return { error: "That code doesn't match a workplace." };
      return { name: row.name };
    } catch {
      return { error: "Could not look up code right now." };
    }
  });

type RosterMember = {
  user_id: string;
  name: string;
  joined_at: string;
  active_this_month: boolean;
};
type RosterResult = { members: RosterMember[] } | { error: string };

/** Auth + owner-only: list org members with active-this-month flag. */
export const getOrgRoster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RosterResult> => {
    const { supabase, userId } = context;
    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();
    if (!org) return { error: "Not authorised." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: members, error } = await supabaseAdmin
      .from("org_members")
      .select("user_id, joined_at")
      .eq("org_id", org.id)
      .order("joined_at", { ascending: false });
    if (error || !members) return { members: [] };

    if (members.length === 0) return { members: [] };

    const ids = members.map((m) => m.user_id);
    const [{ data: profiles }, { data: recentShifts }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, email").in("id", ids),
      supabaseAdmin
        .from("shifts")
        .select("user_id")
        .in("user_id", ids)
        .gte("shift_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
    ]);

    const nameById = new Map<string, string>();
    for (const p of profiles ?? []) {
      const fallback = (p.email as string | null)?.split("@")[0] ?? "Team member";
      nameById.set(p.id as string, ((p.full_name as string | null) || fallback).trim() || fallback);
    }
    const activeSet = new Set<string>((recentShifts ?? []).map((r) => r.user_id as string));

    return {
      members: members.map((m) => ({
        user_id: m.user_id as string,
        name: nameById.get(m.user_id as string) ?? "Team member",
        joined_at: m.joined_at as string,
        active_this_month: activeSet.has(m.user_id as string),
      })),
    };
  });
