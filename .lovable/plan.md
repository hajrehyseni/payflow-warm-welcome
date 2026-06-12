# PayFlow — Functional + UX audit (UK fintech-inspired)

Acting as a senior product designer who has shipped at Monzo, Starling, Revolut and Wise. The app today is calm and clear; this audit finds the gaps that stop a tired UK worker from trusting it like a banking app, plus the highest-leverage ideas worth borrowing from leading UK financial services.

The output below is in three layers: what's working, what's missing, and a prioritised "borrow list" with specific implementation ideas. No backend changes. No new fonts or colours. No payments / Stripe / Supabase logic touched.

---

## 1) What's working today

- Today screen reads like a Monzo home: greeting, big number, single guiding caption, Pot-style "This week", Recent-shifts feed.
- Bottom nav has a clear active pill and payday dot on Pay.
- Plain-English copy ("Whenever you're ready 👋").
- Compliance footer is consistent.

## 2) Functional + UX gaps spotted in the audit

These are real cracks a worker will hit, ordered by likelihood-of-blocking.

**Today screen**
- Pay rate is hard-coded sample (£14.50/hr) on first open — no obvious way to fix the rate from Today; the "Use mine" CTA is a tiny coral pill the eye skips.
- After a shift ends, there's no inline confirmation card — only a fleeting toast. A tired user looks back 10 seconds later and the shift "disappeared" into the feed.
- No quick way to **edit the last shift** ("I forgot to log 30 min break"). Recent-shift row taps go to Pay; can't long-press / swipe to edit or delete.
- No haptic-style success feedback after End shift.

**Pay screen**
- "Pay confidence %" is shown but never explained — feels like a credit-score number without context.
- Deduction breakdown is good, but **gross vs net** isn't labelled in worker words ("Before tax" / "After tax").
- "Payroll query helper" is genuinely great but buried behind a square tile; users won't discover it.
- Shift history has no filters (this week / last week / this month), no totals row, no CSV export.
- No way to see **"what changed between last payslip and this one"** — the single biggest payroll question UK workers actually ask.

**Save screen**
- Goal is hard-coded to £1,000 emergency fund — workers can't set their own (deposit, car, Christmas).
- No "round-up" rule (Monzo / Starling / Chase staple).
- No visual breakdown of where savings came from (which shifts contributed).
- No way to **withdraw / pause** savings — feels like a one-way door, which breaks trust for low-income workers.

**Coach screen** (not opened in this audit, but the gap pattern repeats: no entry point from Today when relevant).

**Onboarding**
- Single-page "Let's set you up" doesn't capture **shift type** (care/cleaning/security/hospitality/warehouse). That single answer would unlock the right emoji, default rate hints, and tailored payslip translator copy.
- No "trust moment" — Monzo and Starling open by stating what they will *not* do (e.g. "We never share your data, we never read your bank, this is your private record"). PayFlow workers — many on visas, agency contracts — need this reassurance early.

**Cross-app**
- No global empty-state for first-run after onboarding ("Add your first shift — takes 10 seconds").
- No **search** for shifts (becomes painful after 50+ shifts).
- No settings screen visible from the app shell. Hourly rate, payday, workplace name should be editable from one obvious place.
- No "Help / Contact" — financial apps without a visible help route lose trust on first confusion.

---

## 3) Borrow list — what leading UK fintechs do that PayFlow should adopt

Each item has the source pattern, why it matters for a hourly worker, and a concrete PayFlow-shaped implementation. Sized small → medium so we can ship the highest-impact ones before tomorrow.

### A. Trust-first moments (Monzo, Starling)

1. **Privacy promise card on onboarding step 1.** One short screen: "Your shifts stay on your phone. We never read your bank, never share your data, never sell it. PayFlow is for you." Big shield icon, one Continue button.
2. **"Last updated" stamp** on the Today hero number ("Live · updated just now" when on shift, "Estimate · updated 2 min ago" when off). Banks always show freshness on a balance.
3. **Status pill on Pay screen** ("Estimate" / "Confirmed by your payslip ✓") once a Pay Check has been done. Borrowed from Starling's "cleared / pending" pattern.

### B. Money-pots discipline (Monzo Pots, Moneybox, Chase Pots)

4. **Custom savings goals.** Let the worker name a goal ("Christmas", "Visa renewal", "Driving lessons") and set a target. Replace the single hard-coded £1,000. Visual: same Pot-style chip we already shipped, just one row of named pots, horizontal scroll on mobile.
5. **Round-up rule.** Add a fourth save rule: "Round up each shift to the nearest £5/£10/£20." Monzo round-ups are the single most addictive saving behaviour in UK fintech. Pure local calc, no bank link.
6. **Withdraw / pause.** Two small buttons on the Saved Pot — "Move out" (decreases saved total) and "Pause rule" (so they can stop saving in a tight week). Removes the one-way-door anxiety.

### C. Plain-English payroll clarity (Plum, Snoop, Wise)

7. **"What changed?" Pay Check result card.** After running Pay Check, show one big sentence: "Your payslip is £18.40 lower than last week — mostly because you worked 2 fewer hours." Plum and Snoop do this brilliantly for transactions.
8. **Tax code badge on Pay screen.** Small chip "Tax code: 1257L · Standard". Tap → plain English explainer. Wise does this for currency codes; HMRC tax codes are equally opaque to most workers.
9. **Take-home label rename.** Replace "Take-home" with "After tax" in headers and "Gross" with "Before tax" everywhere. Workers don't say "net" or "gross".

### D. Guided journeys & nudges (Monzo Summary, Revolut weekly digest)

10. **End-of-week recap sheet** that auto-opens once a week on first Today visit on/after Sunday. Already 80% built (WeeklyRecap component exists, just isn't always wired). Make it a celebration moment with hours, take-home, saved, plus one suggestion ("You could save £12 more next week with round-ups").
11. **Smart Coach entry on Today.** When daysToPay ≤ 0 and the user has no Pay Check this cycle, surface a one-liner in the existing next-step caption: "Payday landed? Run Pay Check to confirm it's right." Today's caption logic already handles this — just add the new state.
12. **Streak chip on hero card.** "🔥 4-day streak" small badge top-right of the hero card. Revolut and Plum both use streaks for engagement; for hourly workers this also doubles as a quiet timesheet record.

### E. Recoverability (Starling, Chase UK)

13. **Swipe to delete on recent shifts**, with a 5-second "Undo" toast. Starling's transaction swipe is the gold standard.
14. **Edit last shift inline** — long-press or tap row → bottom sheet with the same Add Shift form pre-filled. Today's tile "Add a shift" stays for the "I forgot" case; this covers "I logged it wrong".
15. **Global undo toast** on End shift ("Shift saved · Undo") for 6 seconds. Banks always give you a moment to reverse a critical action.

### F. Help & control (HSBC, Nationwide, Monzo)

16. **Settings screen** behind a small avatar pill top-right of Today. One screen, one column: name, hourly rate, default workplace, payday, save rule, notifications (placeholder), Sign out, Delete my data. Workers need one obvious place to fix everything.
17. **Help row at the bottom of Settings + a small "?" on every modal header.** Pop-up answers three questions max per screen ("What is Pay Check?", "Why is this an estimate?", "How do I contact payroll?"). HSBC's contextual help pattern.
18. **Data export.** "Download my shifts (CSV)" link in Settings. Required-feeling for payroll-credible apps; trivial client-side.

### G. Onboarding (Monzo, Wise)

19. **Shift-type chip selector** on onboarding step 2 (care / cleaning / security / hospitality / warehouse / delivery / retail / agency / other). Unlocks the right emoji avatar default, sensible rate hint, and tailored Payslip Translator copy.
20. **Hourly rate quick chips.** "£11.44 (NLW)", "£12.21 (NLW Apr 26)", "£13", "£14", "Custom". Wise uses preset chips for currencies; we use them for the rate UK workers actually face.

---

## 4) Recommended scope for *this* turn

This is more than one ship. To stay safe before tomorrow's meeting, I recommend implementing the **highest-impact + lowest-risk** subset, all of which fit the existing visual system and need no backend changes:

**Today screen polish**
- Item 2: "Updated just now / Live" freshness stamp on hero number.
- Item 12: 🔥 streak chip on hero (logic already exists — `computeStreak` is already imported and computed; just isn't rendered).
- Item 13 + 15: swipe-to-delete + Undo toast on Recent shifts; Undo on End shift toast.
- Item 14: tap-and-hold (or a small pencil icon) on Recent shifts to edit.

**Pay screen polish**
- Item 7: "What changed?" headline on the most recent Pay Check result row.
- Item 9: rename "Take-home" → "After tax" / "Gross" → "Before tax" everywhere visible.
- Item 8: Tax code chip with plain-English popover.

**Save screen polish**
- Item 5: add "Round up to nearest £5/£10" as a fourth save rule.
- Item 6: "Move out" + "Pause rule" small buttons on the Saved Pot.

**Cross-app**
- Item 16: Settings screen behind a small avatar pill (replacing or supplementing the current Sign out / Save across devices pills).

Everything else (custom goals, shift-type onboarding, CSV export, recap auto-open, tax code explainer modal, help contextual popovers) goes in a **"Phase 2 after meeting"** list and can be picked off afterwards.

## 5) What we are deliberately NOT doing

- No bank linking, no Open Banking, no card issuance — out of scope and would change the regulatory shape of the product.
- No price/Stripe/auth/Supabase touchpoints.
- No new colour tokens, no font changes, no new third-party libraries.
- No notification system / push (would be Phase 3).

## 6) Acceptance for the recommended scope

- A worker can undo an accidental End shift within 6 seconds.
- A worker can correct a wrongly-logged shift without leaving the Today screen.
- The Saved Pot feels two-way (can move money back out, can pause the rule).
- "Before tax / After tax" replaces "Gross / Take-home" in every user-visible label.
- A 🔥 streak chip appears when ≥ 2 days in a row.
- A single Settings screen lets the worker fix their rate, payday, workplace and save rule in one place.

Approve and I'll implement section 4 in order, preview on mobile, and publish. Anything you'd like to swap in from sections A-G beyond section 4, just say which numbers.
