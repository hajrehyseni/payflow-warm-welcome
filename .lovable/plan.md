## The problem

The current "blue + white" theme reads as dull navy on a near-white background:

- `--primary` is a low-chroma navy (`oklch(0.42 0.12 250)`) — looks grey/muted, not "blue".
- `--background` / `--sand` are essentially white with a barely perceptible blue tint, so nothing on the page feels blue.
- The hero, CTAs and app surfaces don't share recognisable blue accents — the only strong colour is the coral "Start shift" button.

The result: landing and app both feel beige-grey with one orange button, not a confident blue fintech.

## What I'll change (visual only — no new features, no logic changes)

### 1. Sharpen the blue palette in `src/styles.css`

Replace the muted navy tokens with a clear, modern fintech blue and add a deeper "trust navy" for contrast surfaces:

- `--primary` → a vivid blue around `oklch(0.58 0.19 250)` (think Monzo / Revolut blue) — visible on white, still accessible for white text.
- `--primary-soft` → light blue tint (`oklch(0.96 0.04 250)`) for chips, icon backgrounds.
- `--ink` → true deep navy (`oklch(0.22 0.06 255)`) so dark cards/headers feel intentionally blue, not black-grey.
- `--sand` / `--background` → keep clean white (`oklch(1 0 0)`); use `--sand-deep` as a subtle blue-tinted surface for section banding.
- `--money` stays green (reserved strictly for earnings), `--accent` stays coral (reserved for the single primary action).
- `--ring`, `--border` nudged to a soft blue so focus states and dividers reinforce the palette.

### 2. Make the blue actually visible (landing + app)

Tiny, targeted edits — no layout changes:

- **Landing (`src/routes/index.tsx`)**
  - Hero: add a soft blue wash band behind the headline (using `--primary-soft`) so the page reads "blue" above the fold.
  - "How it works" + "For business" sections: alternate white and `--sand-deep` (tinted blue) bands for consistent rhythm.
  - Section eyebrows already use `text-primary` — these will pop once the blue is brighter.
  - Header logo tile + "Sign in" pill: use the new blue, not ink.
- **App (`src/components/app/screens.tsx`)**
  - Today hero shift card: switch from solid `bg-ink` to a blue gradient (`--primary` → deeper navy) so the main card is unmistakably blue.
  - Tab bar active state, icon chips (`bg-primary-soft text-primary`), progress bars, "View all" links: all inherit the new blue automatically.
  - Sticky headers: keep white, but border uses the new soft-blue border token.

### 3. Consistency pass

- Ensure every "info / neutral action" surface uses `primary` / `primary-soft` (not ad-hoc greys).
- Confirm coral (`accent`) appears only on the single hero CTA per screen ("Get PayFlow free", "Start shift").
- Confirm green (`money`) appears only on take-home / savings figures.

### 4. Verify

- Preview at mobile (`/app`) and desktop (`/`) to confirm the blue is visibly consistent across both, then publish.

## Files touched

- `src/styles.css` — palette tokens only.
- `src/routes/index.tsx` — small className tweaks for section banding + hero wash.
- `src/components/app/screens.tsx` — Today hero card gradient + a couple of token swaps.

No new components, no new dependencies, no backend or routing changes. I want light ocean style blue that its so kind for the eye

&nbsp;