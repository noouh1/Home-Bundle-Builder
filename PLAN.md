# Security System Builder — Implementation Plan & Agent Prompts

This turns the requirements doc into a data model, an architecture, and 8 sequential
prompts you can hand to a coding agent (Claude Code, Cursor, etc.) one at a time.
Each phase assumes the previous ones are done. There's also a single "master prompt"
at the end if you'd rather run it in one shot.

**v2 note:** updated against the reference screenshot (Wyze-style camera builder) —
several things originally flagged as open questions are now confirmed, and a few new
structural details showed up that weren't in the written spec (plan line has no
stepper, a "required" line item, two distinct button styles, odd-item grid centering).

---

## 0. Read first — assumptions & confirmed details

### Confirmed by the reference screenshot
1. **"N selected" = distinct products with qty > 0**, not total units or variant count.
   The screenshot shows "2 selected" with exactly 2 of 5 cameras at quantity > 0 —
   matches this reading.
2. **Card selected-state border** = highlighted (colored) border when the *active
   variant's* displayed quantity > 0. The two cards at qty > 0 in the screenshot are
   visibly bordered differently from the qty-0 cards.
3. **Two distinct button styles**, not one: "Next: Choose your plan" is an
   **outline** button (white fill, colored border + text); "Checkout" is a **solid**
   filled button (colored fill, white text). Don't reuse one button component styled
   identically for both.
4. **Not every review line has a stepper.** The Plan line (e.g. "Cam Unlimited") shows
   a name and price only — no quantity control. Plan-type items are a single
   subscription selection, not a quantity. This changes the data model (see below).
5. **At least one line item looks "required."** The screenshot shows a hub/base-station
   item labeled "(Required)" with a stepper but priced "FREE" (its compare-at price is
   struck through). Treat this as a product that ships pre-seeded, is unlikely to be
   removable to 0, and displays "FREE" as its active price instead of "$0.00" —
   confirm the exact locked/min-quantity behavior against the real design, since a
   static screenshot can't show what happens on interaction.
6. **Variant chips carry a small icon, not just a plain color dot** — each chip shows a
   miniature image/icon representing that color option plus its label.
7. **Odd-numbered product grids center the leftover card** rather than stretching it
   full-width or left-aligning it — when a step has 5 products in a 2-column grid, the
   5th sits centered alone on its own row.
8. **The open step is visually a distinct panel** (light tinted background, rounded
   container) while collapsed steps are plain flat rows separated by a hairline divider
   — not the same "card" treatment just collapsed.

### Still open / use judgment
1. **Exact hex values, spacing, and type scale** are estimated from the screenshot below
   (Section 1) — treat them as a starting point, not ground truth. If a real Figma
   file/export becomes available, reconcile against it before the fidelity pass
   (Phase 8).
2. **Exact price arithmetic per line** (unit price × quantity vs. some other
   presentation) should be verified against real product copy — don't hardcode assumed
   math from a screenshot transcription; get it from the actual source of truth.
3. **What persists on save.** Spec requires quantities/variants to survive
   save → reload. This plan also persists which accordion step was open and which
   variant was active per product, since "restored exactly as they left it" reads as
   full-state restore. Flag if that's more than intended.
4. **Whether the "required" hub-type item can be removed at all**, or just floor-clamped
   at quantity 1 — go with floor-clamped at 1 unless told otherwise, since the spec
   never mentions a fully-locked line item.
5. **Tech stack assumed:** React + TypeScript + Vite + Tailwind CSS, local JSON file for
   data, React Context + `useReducer` for state, `localStorage` for persistence. No
   backend. Swap freely — the phases below are stack-agnostic in structure even though
   the prompts assume this stack.

---

## 1. Visual & style tokens (best-effort, from the screenshot)

Use these as a starting point in Tailwind config / CSS variables; refine against the
real design file if one turns up.

| Token | Best-guess value | Used for |
|---|---|---|
| `color-primary` | indigo/violet, ~`#4F46E5` | badges, selected borders, "N selected" text, active prices in review, solid Checkout button, outline Next button |
| `color-primary-tint-bg` | very light lavender, ~`#EEF2FF` | expanded step panel background, whole review-panel background |
| `color-success` | green, ~`#059669` | "FREE" text, savings callout, "Congrats! You're saving…" line |
| `color-border-default` | light gray, ~`#E5E7EB` | unselected card border |
| `color-text-muted` | gray, ~`#6B7280` / `#9CA3AF` | step-label caps text, struck-through prices, category small-caps labels |
| Corner radius | ~`8-12px` | cards, buttons, badges |
| Card border (selected) | ~`2px` solid `color-primary` | selected product card |
| Typography | system sans / Inter-like | step labels are small, tracked, uppercase; product titles semibold; descriptions text-sm gray |

Two icon-style notes: step header icons are simple line/outline icons (camera, shield,
sensor, grid - one per step), and variant chips use small colored icon thumbnails
rather than plain circular swatches.

---

## 2. Data model

Treat **every product as having one or more variants** - a product with no color
options just gets a single synthetic variant with no label/icon. Add a `selectionType`
so plan-type products (single subscription, no stepper) are structurally distinct from
quantity-type products, and a `minQuantity` for "required" items that shouldn't zero out.

```json
{
  "steps": [
    { "id": "cameras",   "order": 1, "title": "Choose your cameras",  "icon": "camera" },
    { "id": "plan",      "order": 2, "title": "Choose your plan",     "icon": "shield" },
    { "id": "sensors",   "order": 3, "title": "Choose your sensors",  "icon": "sensor" },
    { "id": "protection","order": 4, "title": "Add extra protection", "icon": "grid" }
  ],
  "products": [
    {
      "id": "cam-v4",
      "stepId": "cameras",
      "reviewCategory": "Cameras",
      "title": "Cam v4",
      "description": "The clearest camera in the lineup.",
      "image": "/images/cam-v4.png",
      "learnMoreUrl": "#",
      "badge": "Save 22%",
      "selectionType": "quantity",
      "minQuantity": 0,
      "hasVariants": true,
      "activeVariantId": "white",
      "variants": [
        { "id": "white", "label": "White", "chipIcon": "/images/chip-cam-white.png", "image": "/images/cam-v4-white.png", "price": 27.98, "compareAtPrice": 35.98, "quantity": 1 },
        { "id": "grey",  "label": "Grey",  "chipIcon": "/images/chip-cam-grey.png",  "image": "/images/cam-v4-grey.png",  "price": 27.98, "compareAtPrice": 35.98, "quantity": 0 },
        { "id": "black", "label": "Black", "chipIcon": "/images/chip-cam-black.png", "image": "/images/cam-v4-black.png", "price": 27.98, "compareAtPrice": 35.98, "quantity": 0 }
      ]
    },
    {
      "id": "cam-doorbell",
      "stepId": "cameras",
      "reviewCategory": "Cameras",
      "title": "Duo Cam Doorbell",
      "description": "Two cameras. Two views. Double the porch protection.",
      "image": "/images/doorbell.png",
      "learnMoreUrl": "#",
      "badge": null,
      "selectionType": "quantity",
      "minQuantity": 0,
      "hasVariants": false,
      "activeVariantId": "default",
      "variants": [
        { "id": "default", "label": null, "chipIcon": null, "image": "/images/doorbell.png", "price": 69.98, "compareAtPrice": null, "quantity": 0 }
      ]
    },
    {
      "id": "sensor-hub",
      "stepId": "sensors",
      "reviewCategory": "Sensors",
      "title": "Sense Hub",
      "description": "Required base station for all sensors.",
      "image": "/images/hub.png",
      "learnMoreUrl": "#",
      "badge": null,
      "requiredLabel": "Required",
      "selectionType": "quantity",
      "minQuantity": 1,
      "hasVariants": false,
      "activeVariantId": "default",
      "variants": [
        { "id": "default", "label": null, "chipIcon": null, "image": "/images/hub.png", "price": 0, "compareAtPrice": 29.92, "quantity": 1 }
      ]
    },
    {
      "id": "plan-cam-unlimited",
      "stepId": "plan",
      "reviewCategory": "Plan",
      "title": "Cam Unlimited",
      "description": "Unlimited cloud recording for every camera.",
      "image": "/images/plan-icon.png",
      "learnMoreUrl": "#",
      "badge": null,
      "selectionType": "plan",
      "minQuantity": 1,
      "hasVariants": false,
      "activeVariantId": "default",
      "variants": [
        { "id": "default", "label": null, "chipIcon": null, "image": "/images/plan-icon.png", "price": 9.99, "compareAtPrice": 12.99, "quantity": 1 }
      ]
    }
  ]
}
```

A `price` of `0` with a non-null `compareAtPrice` renders as **"FREE"** instead of
"$0.00" in both the card and the review line (see `sensor-hub` above).

Real product names/images/prices/colors should come from the actual design - this is a
structural example transcribed from the reference screenshot for the agent to build
against, not verified final content.

---

## 3. State shape

```ts
type Variant = {
  id: string;
  label: string | null;
  chipIcon: string | null;
  image: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
};

type Product = {
  id: string;
  stepId: string;
  reviewCategory: 'Cameras' | 'Sensors' | 'Accessories' | 'Plan';
  title: string;
  description: string;
  image: string;
  learnMoreUrl: string;
  badge: string | null;
  requiredLabel?: string;        // e.g. "Required" - renders next to the title
  selectionType: 'quantity' | 'plan';  // 'plan' => no stepper anywhere, single line
  minQuantity: number;           // stepper/decrement floor, usually 0, 1 for required items
  hasVariants: boolean;
  activeVariantId: string;
  variants: Variant[];
};

type AppState = {
  products: Record<string, Product>;
  openStepId: string;        // which accordion step is expanded
  stepOrder: string[];       // ['cameras','plan','sensors','protection']
};
```

Key derived values (compute, don't store):
- **Step "N selected"** = distinct products in that step with `variants.some(v => v.quantity > 0)`.
- **Review line items** = flatten all products' variants where `quantity > 0`, grouped by `reviewCategory`, in fixed order: Cameras -> Sensors -> Accessories -> Plan.
- **Total** = sum of `price * quantity` across all variants with `quantity > 0`.
- **Pre-discount total** = sum of `(compareAtPrice ?? price) * quantity`.
- **Savings** = pre-discount total - total.
- **Display price** = `"FREE"` when `price === 0 && compareAtPrice != null`, else formatted currency.

Key actions/reducer cases:
- `SET_ACTIVE_VARIANT(productId, variantId)` - just changes which variant is displayed/edited on that card.
- `SET_QUANTITY(productId, variantId, quantity)` - updates one variant's count, clamped to `[minQuantity, infinity)`; single source of truth both the card stepper and the review-panel stepper read from and write to. No-op (or disabled UI) for `selectionType: 'plan'` products.
- `TOGGLE_STEP(stepId)` / `OPEN_STEP(stepId)` - accordion control, used by header click and by "Next: ...".
- `HYDRATE(state)` - replaces state wholesale on load from localStorage.

---

## 4. Component tree

```
App
├── BuilderColumn
│   └── AccordionStep x 4
│       ├── StepHeader (STEP X OF 4, icon, title, "N selected" | chevron)
│       │     - open step renders inside a tinted panel container;
│       │       collapsed steps render as plain rows with a divider, no panel
│       ├── ProductCard x N   (only rendered while step is open)
│       │   ├── Badge?
│       │   ├── ProductImage
│       │   ├── Title (+ optional requiredLabel) / Description / LearnMoreLink
│       │   ├── VariantChipSelector?   (icon + label per chip, only if hasVariants)
│       │   ├── QuantityStepper?       (omitted entirely for selectionType: 'plan')
│       │   └── PriceBlock (compareAtPrice struck through + active price, or "FREE")
│       │   - grid: 2 columns; a lone odd-numbered last card centers on its own row
│       └── NextButton   (outline style: "Next: <next step title>")
└── ReviewPanel                                  (tinted background, full column)
    ├── ReviewCategorySection x 4  (Cameras, Sensors, Accessories, Plan)
    │   └── ReviewLineItem  (thumbnail, name, QuantityStepper?, price)
    │         - Plan-category lines never render a stepper
    ├── ShippingRow
    ├── GuaranteeBadge (seal graphic)
    ├── FinancingLine (small pill, e.g. positioned near/over the guarantee seal)
    ├── TotalBlock (struck-through pre-discount total, active total, savings callout)
    ├── CheckoutButton (solid-fill style - placeholder, no real flow)
    └── SaveForLaterLink
```

`QuantityStepper` is one shared component used in both places, always controlled by the
same `(productId, variantId)` pair in state and respecting that product's `minQuantity`
- that's what keeps card and review panel in sync automatically rather than needing
manual reconciliation. It simply isn't rendered at all for `selectionType: 'plan'`
products.

---

## 5. Phase-by-phase prompts

Each prompt below is self-contained: it can be pasted into a brand-new agent session (no
prior chat, no need to attach the rest of this document) as long as the agent has file
access to the project so far. Later phases tell the agent which existing files to check
rather than repeating everything already built - that's the cheap way to confirm
context (a file read) instead of the expensive way (re-pasting or re-explaining it).

### Phase 1 - Scaffold & data layer

> Build a React + TypeScript + Vite app with Tailwind CSS for a security-system product
> configurator - a camera/plan/sensor/accessory bundle builder with a live order-summary
> side panel (think a Wyze-style camera-bundle builder). This is the first phase:
> scaffold the project and build the data layer only, no UI components yet.
>
> Create `src/types.ts` with:
> ```ts
> type Variant = {
>   id: string;
>   label: string | null;
>   chipIcon: string | null;
>   image: string;
>   price: number;
>   compareAtPrice: number | null;
>   quantity: number;
> };
>
> type Product = {
>   id: string;
>   stepId: string;
>   reviewCategory: 'Cameras' | 'Sensors' | 'Accessories' | 'Plan';
>   title: string;
>   description: string;
>   image: string;
>   learnMoreUrl: string;
>   badge: string | null;
>   requiredLabel?: string;              // e.g. "Required"
>   selectionType: 'quantity' | 'plan';  // 'plan' => no stepper anywhere
>   minQuantity: number;                 // stepper floor, 0 normally, 1 for "required" items
>   hasVariants: boolean;
>   activeVariantId: string;
>   variants: Variant[];
> };
>
> type Step = { id: string; order: number; title: string; icon: string };
> ```
>
> Create `src/data/products.json` (an array of `Step` plus an array of `Product`)
> covering 4 steps with these ids, in this order: `cameras`, `plan`, `sensors`,
> `protection`. Include at minimum: one product with 3 color variants (each variant has
> its own `price`, `compareAtPrice`, `quantity`, and a `chipIcon` image path); one
> product with `hasVariants: false` (single synthetic variant, no label/chipIcon); one
> `selectionType: 'plan'` product (a subscription line, no stepper); and one
> `minQuantity: 1` "required" product with `price: 0` and a non-null `compareAtPrice`
> (this will render as "FREE" once pricing UI exists). Seed a few products elsewhere in
> the JSON at `quantity` > 0 so a review panel built later is pre-populated on first
> load, even in steps the user hasn't opened yet.
>
> Render the parsed JSON as raw output somewhere on screen (a `<pre>` dump is fine) to
> confirm the shape loads correctly. No other UI yet.

### Phase 2 - Global state & sync logic

> Continuing an existing React + TypeScript + Vite + Tailwind project (a camera/plan/
> sensor/accessory bundle configurator). `src/types.ts` and `src/data/products.json`
> already exist - read both first to confirm exact field names before writing code.
> Expect a `Product` type with `id, stepId, reviewCategory, selectionType
> ('quantity'|'plan'), minQuantity, hasVariants, activeVariantId, variants[]`, and each
> `Variant` with `id, label, chipIcon, image, price, compareAtPrice, quantity`.
>
> Build global app state with React Context + `useReducer`:
> ```ts
> type AppState = {
>   products: Record<string, Product>;
>   openStepId: string;
>   stepOrder: string[];   // e.g. ['cameras','plan','sensors','protection']
> };
> ```
>
> Reducer actions:
> - `SET_ACTIVE_VARIANT(productId, variantId)` - changes only which variant is displayed
>   on that product's card. Must never touch any quantity.
> - `SET_QUANTITY(productId, variantId, quantity)` - updates one variant's count,
>   clamped to `[product.minQuantity, Infinity)`. Must be a no-op when that product's
>   `selectionType` is `'plan'`.
> - `OPEN_STEP(stepId)` / `TOGGLE_STEP(stepId)` - single-open accordion control.
> - `HYDRATE(state)` - replaces state wholesale (used by persistence later - just stub
>   the action now).
>
> Write these as pure derived-value selectors (computed, not stored):
> - Per-step "N selected" = count of distinct products in that step where any variant
>   has `quantity > 0`.
> - Grouped review line items = every variant across all products where `quantity > 0`,
>   grouped by `reviewCategory`, in fixed order Cameras -> Sensors -> Accessories -> Plan.
> - `total` = sum of `price * quantity` over those line items.
> - `preDiscountTotal` = sum of `(compareAtPrice ?? price) * quantity` over those line items.
> - `savings` = `preDiscountTotal - total`.
> - `displayPrice(variant)` = `"FREE"` when `price === 0 && compareAtPrice != null`,
>   otherwise formatted currency.
>
> Add a temporary debug panel (or gate it behind a `?debug=1` flag) that fires
> `SET_QUANTITY` / `SET_ACTIVE_VARIANT` and shows the derived values updating live.
> Confirm: switching a product's active variant never changes any quantity; a variant's
> quantity persists even when it isn't the currently active/displayed one; the
> `minQuantity: 1` "required" product can't be decremented below 1. Remove the debug
> panel, or leave it behind the flag, once confirmed.

### Phase 3 - Accordion builder shell

> Continuing the same project. Global state already exists via React Context +
> `useReducer`, with an `openStepId` field, `OPEN_STEP`/`TOGGLE_STEP` actions, and a
> per-step "N selected" selector - read the existing context/reducer file to confirm
> the exact hook and selector names before wiring up the UI.
>
> Build a `BuilderColumn` containing 4 `AccordionStep` sections in this fixed order:
> Cameras, Plan, Sensors, Protection ("Add extra protection"). Step 1 (Cameras) is
> expanded by default on load; the rest start collapsed.
>
> Requirements:
> - Each step header shows: "STEP X OF 4" (small, uppercase, tracked), an icon, the
>   step title, and on the right - when open: an up-chevron plus "N selected"; when
>   collapsed: a down-chevron alone, no count.
> - The **open** step renders inside a visually distinct panel (tinted background,
>   rounded container). **Collapsed** steps render as plain flat rows separated by a
>   hairline divider - no panel background.
> - Clicking a collapsed step's header opens it and collapses whichever step was
>   previously open (single-open accordion, not multi-open).
> - The open step ends with an **outline-style** button reading "Next: <next step's
>   title>" that opens the following step. Decide what happens on the last step (hide
>   the button, or make it a no-op) since that's unspecified - note whichever you pick.
>
> Product cards aren't built yet - render a placeholder (e.g. just each product's
> title as plain text) inside the open step so the accordion mechanics can be verified
> end to end.

### Phase 4 - Product card & variant selector

> Continuing the same project. The accordion shell, global state, and data layer
> already exist - read `src/types.ts` for the exact `Product`/`Variant` fields
> (`selectionType`, `minQuantity`, `hasVariants`, `activeVariantId`,
> `variants[].chipIcon`, etc.) and the existing state/reducer file for the
> `SET_QUANTITY` / `SET_ACTIVE_VARIANT` actions before wiring up this UI.
>
> Build `ProductCard`, rendered from data for whichever products belong to the
> currently open step, laid out in a 2-column grid - if a step has an odd number of
> products, the last card should center alone on its own row rather than stretching
> full width.
>
> Each card includes:
> - An optional badge (e.g. "Save 22%"), top-left over the image, only when
>   `product.badge` is set.
> - Product image, title, and (when `product.requiredLabel` is set) a small
>   "Required" label next to the title.
> - Description text and a "Learn More" link.
> - A row of variant chips, only when `hasVariants` is true - each chip shows a small
>   icon (`chipIcon`) plus its `label`. Selecting a chip only changes that product's
>   `activeVariantId` - it must never alter any quantity. Selected-chip styling can be
>   minimal for now; focus on correct behavior.
> - A quantity stepper, **omitted entirely** when `selectionType` is `'plan'`.
>   Otherwise it reads/writes the quantity of the currently active variant, respecting
>   `minQuantity` (disable or hide the decrement control once at the floor).
> - A price block: `compareAtPrice` struck through plus the active `price`, or "FREE"
>   when `price === 0`.
>
> The whole card gets a highlighted "selected" border when the active variant's
> quantity is greater than 0.

### Phase 5 - Review panel

> Continuing the same project. Global state, the accordion shell, and product cards
> already exist. Read the existing state/reducer file for the grouped-review-line-items
> selector, `total` / `preDiscountTotal` / `savings`, and the `displayPrice` helper
> before wiring this up - the review panel must consume the exact same
> `(productId, variantId)` quantity state as the product cards, not a separate copy.
>
> Build `ReviewPanel` (tinted background spanning the full column) with:
> - Four category sections in fixed order: Cameras, Sensors, Accessories, Plan. Each
>   renders only the variants currently at quantity > 0, one per line: thumbnail,
>   product name (append the variant label if the product has variants, e.g.
>   "Cam v4 - Black"), a quantity stepper bound to the same `(productId, variantId)`
>   state as that product's card (respecting `minQuantity`; **omitted** entirely for
>   `selectionType: 'plan'` lines), and that line's price (with "FREE" handling).
> - Below the line items: a shipping row, a satisfaction-guarantee badge/seal, a small
>   financing-line pill, then a total block showing the pre-discount total struck
>   through, the active total, and a savings callout (e.g. "Congrats! You're saving $X
>   on your security bundle!").
> - A **solid-fill** "Checkout" button - placeholder only, a simple alert/confirmation
>   is fine, no real destination.
> - A "Save my system for later" link - just render it for now, wire up persistence in
>   the next phase.
>
> Confirm changing a quantity from either the card or the review panel updates both
> instantly and recalculates the total - they must be reading/writing the same
> underlying state, not two separate trackers.

### Phase 6 - Persistence

> Continuing the same project. All state lives in a React Context + `useReducer` store
> shaped roughly as `{ products: Record<string, Product>, openStepId: string, stepOrder:
> string[] }`, with a `HYDRATE(state)` action already stubbed in - read the existing
> reducer file to confirm the exact shape and action name before wiring this up.
>
> Implement "Save my system for later": on click, serialize the full current state
> (every product's variant quantities, each product's `activeVariantId`, and the
> current `openStepId`) to `localStorage` under a single versioned key, e.g.
> `security-builder-state-v1`. On app load (before first render, or in a top-level
> effect), check `localStorage` for that key; if present and it parses successfully,
> dispatch `HYDRATE` with it instead of the default seed data. If it's missing or fails
> to parse, silently fall back to the default seed - never crash. Give light
> confirmation feedback when the save link is clicked (a toast or brief inline text is
> enough).
>
> Manually verify: configure a system (change some quantities, switch a variant, open a
> different step), click save, reload the page, and confirm every quantity, active
> variant, and the open accordion step are exactly as left.

### Phase 7 - Responsive pass

> Continuing the same project - a two-column (builder left, review panel right)
> product configurator, already functional on desktop. No new features in this phase,
> layout and spacing only.
>
> Make it responsive from desktop down to phone width:
> - The desktop two-column layout should collapse to a single column below a
>   reasonable breakpoint (e.g. ~1024px) - review panel above or below the builder,
>   your call, but note which you picked.
> - The 2-column product-card grid within each accordion step should drop to a single
>   column on narrow viewports.
> - Verify the accordion headers, product cards (badge/image/variant chips/stepper/
>   price block), and the review panel (line items, steppers, total block, the
>   financing pill near the guarantee seal, both buttons) all stay legible and don't
>   overflow or clip at common widths - roughly desktop ~1280px, tablet ~768px, phone
>   ~375px.
>
> No functional/state changes in this phase.

### Phase 8 - Fidelity & QA pass

> Continuing the same project, functionally complete. This is a fidelity and QA pass
> against a reference screenshot (a Wyze-style camera-bundle builder) - attach that
> screenshot to this prompt, since it isn't included here.
>
> Do a visual pass: spacing, typography, colors (starting point: primary indigo/violet
> ~`#4F46E5` for badges/selected borders/active prices/buttons; light lavender
> ~`#EEF2FF` for the open-step panel and review-panel background; green ~`#059669` for
> "FREE"/savings text; ~8-12px corner radii - refine all of these against the actual
> reference image, they're estimates), icon choices, and every element state (selected
> vs. unselected card, stepper at its `minQuantity` floor, collapsed vs. expanded step
> treatment, outline vs. solid buttons).
>
> Then verify each of the following end to end:
> - [ ] Step 1 expanded on load, others collapsed, review panel pre-populated to match
> - [ ] "N selected" reflects distinct products, not units or variants
> - [ ] Adding 2 of one variant then switching the active variant to another shows the
>       stepper at 0, while the first variant still shows in the review panel at its
>       original count
> - [ ] Switching a product's active variant never changes any quantity
> - [ ] A card's selected border shows only when its active variant's quantity > 0
> - [ ] Every quantity change, from either the card or the review panel, recalculates
>       the total instantly
> - [ ] Products with no variants show no chip row
> - [ ] `selectionType: 'plan'` products never render a stepper, on the card or in the
>       review panel
> - [ ] The "required" (`minQuantity: 1`) item can't go below 1 and displays "FREE" correctly
> - [ ] A step with an odd number of products centers the leftover card instead of
>       stretching or left-aligning it
> - [ ] "Next" is outline-style and "Checkout" is solid-style - visually distinct, not
>       the same component reused identically
> - [ ] Save -> reload -> identical state, including active variants and the open
>       accordion step
> - [ ] Layout holds up and stays usable at phone width
> - [ ] Checkout doesn't error - just shows a placeholder response

---

## 6. Master prompt (single-shot alternative)

If you'd rather give an agent everything at once instead of phase-by-phase, combine
Sections 1-4 verbatim as context, then append: *"Implement this fully: data-driven
rendering from the JSON (no hardcoded per-product markup), the 4-step accordion with
Step 1 open by default and a distinct panel treatment when expanded, product cards with
working variant-scoped quantity steppers (2-col grid, odd item centered), plan-type
lines with no stepper, a required/FREE line item clamped at its minimum quantity, a live
review panel kept in sync with the cards, working save/restore via localStorage, and a
responsive layout from desktop to phone. Flag any part of the spec that's ambiguous
rather than guessing silently."*