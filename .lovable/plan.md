&nbsp;

&nbsp;

Final PayFlow UX polish before tomorrow’s meeting.

Please act as a senior mobile UX designer for a UK worker-pay / payroll clarity app.

This should be **Monzo-inspired**, not a copy of Monzo.

Borrow the feeling of Monzo:

- emotional clarity
- big useful numbers
- one obvious next action
- friendly plain English
- calm spacing
- simple cards
- a feed that tells the story of money

But keep PayFlow original, worker-first and UK payroll-focused.

## Important

Do not rebuild the product.  
Do not add backend logic.  
Do not add new screens.  
Do not change Supabase, Stripe, auth, payments, database, secrets or business logic.  
Do not introduce a new colour system.  
Do not make the Today screen long again.

This is a controlled UX, copy, visual hierarchy and layout polish only.

## Product context

PayFlow is for UK hourly workers, including care workers, cleaners, security workers, warehouse workers, hospitality workers, agency workers, umbrella workers and international workers in the UK.

Many users are tired, busy and not highly technical.

They should open the app and understand what to do in under 5 seconds.

Core promise:

“Know your hours. Know your pay. Save from every shift.”

## Main goal

Make the Today screen feel calmer, clearer and more guided.

The user should immediately understand:

1. Am I on shift or off shift?
2. How much have I earned?
3. What should I tap next?
4. How many hours have I tracked?
5. Can I check my payslip?

## 1. Today header: big number first

Restructure the top of the Today screen so it feels less like stacked cards and more like one clear mobile app moment.

Use:

- warm greeting: “Morning 👋” / “Afternoon 👋” / “Evening 👋”
- today’s date in small muted text
- one big hero number

The hero number should be:

- live earnings today if on shift
- estimated earnings today if a shift has been tracked
- “£0.00” with a ready-to-start message if no shift is active

Use large, clear, tabular numerals.

This number should be the first thing the worker sees.

## 2. Next step sentence under the big number

Instead of making the user choose from equal-looking tiles, show one clear next step sentence under the hero number.

Use plain UK English.

Examples:

### Off shift

“Whenever you’re ready — tap Start shift when you clock on.”

### On shift

“You’re on the clock. Keep going, then end your shift when you finish.”

### On break

“Enjoy your break. Tap Resume when you’re back.”

### Shift ended

“Nice one — shift saved. You’re done for now.”

### Payslip moment

“Payslip arrived? Check it against your tracked hours.”

This should feel like a calm guide, not a warning banner.

Use a soft blue caption or pill style.

## 3. Main shift card

Keep the main shift card, but make it visually calmer and more premium.

Use the improved blue/white PayFlow style:

- blue/navy for trust and payroll clarity
- green only for money-positive amounts
- coral for Start shift / End shift where appropriate

The Start shift button should remain highly visible and thumb-friendly.

Use a subtle tap animation if safe:

- active scale effect
- smooth transition

Do not add complicated animations.

## 4. Pay and Save summary cards

Make the summary feel more like simple money pots.

Use two or three compact cards/chips:

- Take-home this week
- Hours tracked
- Saved this week

Design them as rounded, friendly cards with clear labels and large numbers.

Use:

- blue for hours/payroll clarity
- green for take-home and saved money
- white or pale blue card backgrounds

Do not make them cramped.

Do not make them huge.

If three cards in one row feel squeezed on small phones, use a better mobile layout:

- one larger Take-home card
- two smaller supporting cards underneath

## 5. Main action cards

Keep the two main actions visible:

### Check payslip

Subtext: “When your payslip arrives”

### Add a shift

Subtext: “If you forgot to start one”

These should be obvious, readable and easy to tap.

Check payslip should feel like an important blue payroll action.

Add a shift should feel useful but secondary.

Do not show too many equal-weight actions.

## 6. Recent shifts as a simple feed

Improve the Latest/Recent shifts section so it feels more useful and human.

Rename to:

“Recent shifts”

Each shift row should feel like a simple money story:

- left: small circular icon or emoji based on shift type if available
- middle: shift date/time and hours
- right: estimated amount in green

Example:

“Tue evening · 6h 12m”  
“+£74.40”

If job type is not known, use a simple neutral shift icon. Do not invent complex categories.

If there are no shifts, show:

“Your finished shifts will appear here, like a little payday diary.”

Keep this section compact. Do not let it dominate the Today screen.

Do not add inline expansion unless it already exists and is safe.

## 7. Weekly recap

Do not add a large new weekly recap if it increases scrolling.

If there is already a compact Weekly Recap component available, it can be shown lower down only if it stays short and does not make the Today screen feel like a long dashboard.

Priority remains:

- big number
- next step
- Start shift
- Take-home
- Check payslip
- Add a shift
- Recent shifts

## 8. Bottom navigation

Keep all bottom-nav labels visible for clarity.

These users may not be highly technical, so do not make inactive tabs icon-only.

Polish the nav:

- active tab clearly blue
- soft pill or stronger weight for active tab
- consistent icons
- thumb-friendly spacing
- no overlap with content
- safe area padding for iPhone Safari and Android Chrome

You may add a tiny active/tap scale effect if safe.

Do not add a payday dot indicator unless the existing state is already available and safe.

## 9. Copy tone

Make the copy feel friendly and human, but still professional.

Use simple UK English.

Good examples:

- “Whenever you’re ready — tap Start shift when you clock on.”
- “You’re on the clock.”
- “Nice one — shift saved.”
- “Payslip arrived? Check it against your tracked hours.”
- “Your finished shifts will appear here, like a little payday diary.”

Use emojis very sparingly:

- 👋 for greeting
- ☕ for break
- ✅ for saved
- 💷 for payslip/pay

Do not overuse emojis.

## 10. Visual rhythm

Improve spacing and hierarchy.

Use:

- clear section labels where helpful
- calm spacing between sections
- rounded cards
- blue/white trust foundation
- green for money
- coral for primary action/warning
- strong readable numbers
- no cramped cards
- no horizontal scrolling

Keep the screen low-scroll.

## 11. Landing page

Do not break the landing page.

Keep:

- stronger blue/white PayFlow identity
- phone mockup fitting on mobile
- Open PayFlow clearly visible
- no oversized mockup
- no horizontal scrolling

## 12. Pay Check modal

Do not break the Pay Check modal.

It must still say:

- “Take-home pay shown on your payslip (£)”
- “Paid hours shown on your payslip”
- “Compare with PayFlow”

Keep the explanation that PayFlow cannot read the payslip automatically.

## Do not change

Do not change:

- Supabase
- Stripe
- payments
- auth
- database
- secrets
- backend
- app routes
- Pay Check logic
- Flow Coach logic
- business pricing logic
- payroll calculation logic

## Acceptance criteria

A tired UK worker opens PayFlow and within 5 seconds understands:

“I can start my shift, see my pay, check my payslip, and add a shift if I forgot.”

The Today screen should feel:

- Monzo-inspired in clarity
- PayFlow-original in identity
- blue/white and payroll credible
- warm and human
- simple for non-technical workers
- not cramped
- not long
- not overloaded

Please apply carefully, preview on mobile, and publish when ready.