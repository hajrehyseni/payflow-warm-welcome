Final PayFlow refinement before tomorrow’s meeting.

Please act as a senior mobile UX designer for a UK payroll / worker-pay app.

This is a controlled final polish pass.

Do not rebuild the product.  
Do not add new features.  
Do not change backend logic.  
Do not change payments, Supabase, Stripe, auth, database or secrets.

## Goal

Make the Today screen feel like a guided journey.

A tired worker should always know the single most useful next action.

Right now the hero card is clear, but below it the tiles can feel like equal-weight options. Please make the screen more guided, more obvious and easier for non-technical UK hourly workers.

The app should answer:

“What should I do next?”

## Main change: add a Next Step banner

Add a compact full-width “Next step” banner directly under the main hero shift card.

This banner should guide the user based on their current state.

Only one primary next action should feel most important at any time.

Use plain UK English.

Example states:

### Off shift, no active shift

“Ready when you are. Tap Start shift when you clock in.”

This should visually point the user back to the Start shift button in the hero card.

### On shift

“You’re earning. Take a break when you need one, then end your shift when you finish.”

### On break

“Enjoy your break. Tap Resume when you’re back.”

### Just ended a shift

“Shift saved ✓ You’re done for now.”

Do not mention adding a note or tip unless that feature already exists.

### Payday / payslip moment

“Payslip arrived? Check it against your tracked hours.”

This should guide the user towards Check payslip.

### No recent shifts

“Missed a shift? Add it so your pay stays right.”

This should guide the user towards Add a shift.

## Important

Do not create a complicated new feature.

This banner should use existing app state only.

If a state is not available, use a sensible simple fallback:

“Track your shift today, then check your payslip when it arrives.”

## Optional journey strip

Add a tiny “How PayFlow works” strip near the top, but only if it fits neatly without making the screen crowded.

It should be very compact:

1 Start shift → 2 End shift → 3 Check payslip

Keep it simple.

Do not build complex onboarding.

If making it dismissible requires new persistence logic, skip persistence and simply make it compact/collapsible.

Do not let this strip create extra scrolling.

## Rewrite action tile copy

Make each action tile explain when it is useful.

Use:

### Check payslip

Label: “Check payslip”  
Subtext: “When your payslip arrives”

### Add a shift

Label: “Add a shift”  
Subtext: “If you forgot to start one”

### Latest shift empty state

If there are no finished shifts, show:

“Your finished shifts will appear here.”

## End-of-shift behaviour

After tapping End shift, keep the existing toast/confirmation.

Then update the Next Step banner to:

“Shift saved ✓ You’re done for now.”

If payday/payslip timing is already known in the app, the banner can instead suggest:

“Payslip arrived? Check it against your tracked hours.”

Do not add new screens.

Do not add modals.

Do not add note/tip features.

## Bottom navigation

Keep the bottom navigation simple and low-tech friendly.

Do not make inactive tabs icon-only if that reduces clarity.

Preferred approach:

- keep all tab labels visible if space allows
- make the active tab more obvious with blue colour, stronger weight or a soft pill background
- keep icons consistent
- make it thumb-friendly
- make sure it does not cover content

The active tab should clearly show where the user is.

## Visual style

Use the existing improved blue/white PayFlow style.

Keep the app visually:

- blue/white for trust and payroll clarity
- green for money/savings/positive confirmation
- coral for Start shift and warnings

Do not introduce a new colour system.

Do not change fonts.

Do not make the screen taller.

## Layout requirement

Keep scrolling low.

The Today screen should still show the core value quickly:

- shift status
- live earnings
- Start shift / End shift
- hours tracked
- take-home
- saved amount
- Check payslip
- Add a shift

The Next Step banner should help, not add clutter.

## Plain English rules

Use simple UK English.

Use:

- Start shift
- End shift
- Take a break
- Resume
- Check payslip
- Add a shift
- Hours tracked
- Take-home
- Saved
- Estimates only

Avoid:

- technical payroll jargon
- corporate HR language
- clever marketing wording
- vague labels like “Check it”

## Do not change

Do not change:

- Supabase
- Stripe
- payments
- auth
- database
- secrets
- backend
- routes
- Pay Check modal logic
- Flow Coach logic
- business pricing logic

This is Today screen guidance, copy and layout refinement only.

## Acceptance criteria

A tired worker opening PayFlow should read the hero card plus the Next Step banner and immediately know what to tap next.

The screen should never feel like it is showing too many equal choices.

The Today screen should feel:

- guided
- calm
- clear
- payroll credible
- worker-friendly
- easy for non-technical users

Please apply carefully, preview on mobile, and publish when ready.