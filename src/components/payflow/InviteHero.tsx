import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Mail, MessageCircle, Users, CheckCircle2 } from "lucide-react";
import { getOrgRoster } from "@/lib/payflow/join.functions";

export function InviteHero({ company, code, joinLink }: { company: string; code: string; joinLink: string }) {
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [roster, setRoster] = useState<{ user_id: string; name: string; joined_at: string; active_this_month: boolean }[]>([]);

  useEffect(() => {
    if (!joinLink) return;
    void QRCode.toDataURL(joinLink, { margin: 1, width: 240, color: { dark: "#0F1419", light: "#F5EFE4" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [joinLink]);

  useEffect(() => {
    void getOrgRoster().then((r) => { if ("members" in r) setRoster(r.members); });
  }, []);

  function copy() {
    if (!joinLink) return;
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  }
  const shareText = `${company} invited you to PayFlow — free for you, forever. Track your hours and take-home pay in plain English: ${joinLink}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(`${company} invited you to PayFlow`)}&body=${encodeURIComponent(shareText)}`;

  const activeCount = roster.filter((m) => m.active_this_month).length;

  return (
    <div className="rounded-3xl bg-ink p-6 text-sand ring-1 ring-ink">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Invite your team</div>
      <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold">Free for every worker. Forever.</h2>
      <p className="mt-1 text-sm text-sand/70">Share the link, code or QR. Workers join in under 2 minutes — no card, no IT setup.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="rounded-2xl bg-sand p-3 flex items-center justify-center">
          {qr ? <img src={qr} alt="Join QR code" className="size-[176px]" /> : <div className="size-[176px] animate-pulse bg-sand-deep rounded-xl" />}
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Join code</div>
            <div className="font-display text-3xl font-extrabold tracking-[0.25em]">{code || "——"}</div>
          </div>
          <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Invite link</div>
            <div className="truncate text-sm">{joinLink || "—"}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={copy} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 text-xs font-bold text-accent-foreground hover:scale-[1.02] transition-transform">
              <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-sand/10 px-3 text-xs font-bold text-sand ring-1 ring-sand/15 hover:bg-sand/15">
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
            <a href={mailUrl} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-sand/10 px-3 text-xs font-bold text-sand ring-1 ring-sand/15 hover:bg-sand/15">
              <Mail className="size-3.5" /> Email
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-sand/5 p-4 ring-1 ring-sand/10">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold text-sand/80">
            <Users className="size-3.5" /> Roster · {roster.length} joined · {activeCount} active this month
          </div>
        </div>
        {roster.length === 0 ? (
          <p className="mt-2 text-[12px] text-sand/60">No one has joined yet. Share the link above to get going.</p>
        ) : (
          <ul className="mt-3 grid gap-1.5 md:grid-cols-2">
            {roster.slice(0, 8).map((m) => (
              <li key={m.user_id} className="flex items-center justify-between gap-2 rounded-xl bg-sand/5 px-3 py-2 text-[12px]">
                <span className="truncate">{m.name}</span>
                {m.active_this_month ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <CheckCircle2 className="size-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] text-sand/50">Joined {new Date(m.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
