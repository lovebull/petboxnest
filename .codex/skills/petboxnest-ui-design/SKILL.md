---
name: petboxnest-ui-design
description: >-
  Use this skill whenever designing, redesigning, implementing, or reviewing the
  PetBoxNest ecommerce storefront, including homepage, collection pages, product
  pages, cart, promotional landing pages, editorial content, and responsive UI.
  The visual direction combines Kitty Poo Club's conversion clarity and trust
  structure with BARK's playful pet-first personality, while remaining original
  to PetBoxNest and suitable for a broader cat-and-dog home-products brand.
---

# PetBoxNest UI Design Skill

## 1. Mission

Design PetBoxNest as a **playful, warm, pet-first home brand** rather than a generic pet-supplies store.

The experience must feel:

- joyful, but not childish;
- cozy, but not beige and bland;
- conversion-focused, but not aggressive;
- visually expressive, but easy to scan;
- pet-centric, but still attractive inside a modern home.

North-star phrase:

> **Playful Home Comfort — practical products, happier pets, calmer homes.**

Every design decision should support at least one of these outcomes:

1. Help shoppers quickly understand what the product solves.
2. Help shoppers feel that PetBoxNest understands real pet life.
3. Reduce purchase anxiety with clear proof, specifications, policies, and reviews.
4. Make the storefront memorable through playful visual personality.
5. Keep the system reusable across cats, dogs, litter boxes, beds, mats, and future home-pet categories.

---

## 2. Inspiration Blend — Do Not Clone

PetBoxNest may borrow **principles**, never proprietary layouts or brand assets.

### From Kitty Poo Club, retain

- Immediate problem/solution messaging in the hero.
- Strong trust proof near the top of the page.
- Benefit-led icon sections.
- Clear “How it works” explanations for products that require education.
- Repeated but tasteful calls to action after major persuasion sections.
- Proof blocks such as reviews, expert quotes, guarantees, shipping, and returns.
- Easy-to-understand product comparisons and configuration choices.

### From BARK, retain

- A visible brand personality instead of commodity-store styling.
- Large expressive headlines and confident type hierarchy.
- Bright accent colors used with restraint.
- Product-first photography with pets actively using or reacting to products.
- Humor and microcopy that sounds written by people who live with pets.
- Themeable campaign sections and seasonal merchandising.
- Card-based discovery that makes browsing feel fun.

### PetBoxNest must add

- A warmer “home” layer because **Nest** is part of the brand promise.
- More visual calm than BARK so bedding and home products still feel premium.
- Broader category architecture than a subscription-only brand.
- More neutral merchandising surfaces so colorful products remain the focus.
- A unified visual language for both cats and dogs.

Do not reproduce Kitty Poo Club or BARK logos, proprietary illustrations, exact copy, exact section ordering, or exact color combinations.

---

## 3. Brand Personality

Use these personality sliders:

| Attribute | Target |
|---|---:|
| Playful | 8/10 |
| Warm | 9/10 |
| Premium | 6/10 |
| Minimal | 6/10 |
| Quirky | 6/10 |
| Technical | 3/10 |
| Trustworthy | 9/10 |
| Family-friendly | 9/10 |

PetBoxNest should feel like **a cheerful modern home shared with pets**.

Avoid:

- clinical veterinary styling;
- dark luxury-fashion styling;
- overly childish cartoon-store styling;
- generic Amazon-style dense grids;
- sterile SaaS UI;
- excessive gradients, glassmorphism, or neon effects.

---

## 4. Core Visual Direction

### 4.1 Layout language

Prefer:

- broad white/cream breathing room;
- large editorial image blocks;
- asymmetric but balanced hero compositions;
- rounded cards with generous padding;
- occasional organic shapes behind pets/products;
- full-width storytelling bands between product grids;
- alternating calm sections and colorful campaign moments.

Default desktop content width:

```css
--container-max: 1280px;
--container-wide: 1440px;
--gutter-desktop: 32px;
--gutter-tablet: 24px;
--gutter-mobile: 16px;
```

Use 12 columns on desktop, 6 on tablet, and 4 on mobile.

### 4.2 Density

PetBoxNest is not a marketplace. Do not cram products together.

Default product grids:

- Desktop: 4 columns normally, 3 for premium/editorial cards.
- Tablet: 2–3 columns.
- Mobile: 2 columns for compact collections; 1 column for editorial/premium cards.

---

## 5. Color System

The palette should combine **cozy home neutrals** with **playful pet accents**.

### Core tokens

```css
:root {
  --pbn-ink: #202433;
  --pbn-ink-soft: #596071;
  --pbn-cream: #FFF8EF;
  --pbn-paper: #FFFFFF;
  --pbn-mist: #F4F6F8;
  --pbn-border: #E6E8EC;

  --pbn-purple: #6557D9;
  --pbn-purple-dark: #4A3DB8;
  --pbn-mint: #BFE7D3;
  --pbn-mint-dark: #3E8067;
  --pbn-yellow: #FFD966;
  --pbn-coral: #FF766C;
  --pbn-sky: #BFE3F4;

  --pbn-success: #2F7D58;
  --pbn-warning: #A66B00;
  --pbn-danger: #B5403C;
}
```

### Usage ratio

Use approximately:

- 60–70% cream / white / mist;
- 15–20% ink / dark neutrals;
- 10–15% primary purple;
- 5–10% rotating accent colors.

### Rules

- Primary CTA: purple.
- Secondary CTA: white or cream with dark border.
- Yellow: promotions, badges, playful emphasis — never long body backgrounds.
- Mint: sustainability, calm-home, care, comfort.
- Coral: urgency or joyful campaign accents, not error states.
- Sky: informational or dog/cat lifestyle modules.

Never place more than **three strong accent colors in the same viewport** unless designing a deliberate seasonal campaign.

---

## 6. Typography

Use open, implementation-friendly fonts.

### Preferred pairing

- Display / marketing headlines: **Fredoka** 600–700.
- Body / UI / commerce: **DM Sans** 400–700.

Fallback:

```css
font-family: "Fredoka", "Arial Rounded MT Bold", sans-serif;
font-family: "DM Sans", Inter, system-ui, sans-serif;
```

### Type scale

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 22px;
--text-2xl: 28px;
--text-3xl: 36px;
--text-4xl: 48px;
--text-5xl: 64px;
--text-hero: clamp(44px, 6vw, 82px);
```

Rules:

- Hero headlines should usually be 2–4 lines max on desktop.
- Body text max width: 58–68 characters.
- Use sentence case for most UI.
- Short campaign phrases may use uppercase sparingly.
- Avoid ultralight type weights.
- Avoid using playful display font for long paragraphs or form controls.

---

## 7. Shape, Radius, Border, Shadow

PetBoxNest geometry should feel soft but not bubble-like.

```css
--radius-sm: 10px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-pill: 999px;

--shadow-card: 0 8px 24px rgba(32, 36, 51, 0.08);
--shadow-float: 0 16px 40px rgba(32, 36, 51, 0.12);
```

Rules:

- Product image cards: 18–24px radius.
- Buttons: 12–16px radius; use pill shape only for chips/tags.
- Images may use larger 24–32px rounding.
- Use shadows sparingly. Prefer borders + subtle background separation.
- Never use glassmorphism as a default surface.

---

## 8. Spacing System

Use an 8px base scale with a few 4px increments.

```text
4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128
```

Section rhythm:

- Desktop normal: 96px top/bottom.
- Desktop hero / major story section: 112–128px.
- Tablet: 72–88px.
- Mobile: 56–72px.

Inside cards:

- Compact UI: 16px.
- Product cards: 16–20px.
- Editorial/value cards: 24–32px.

---

## 9. Image Direction

Photography is a major brand asset.

### Required visual mix

Use a balance of:

1. **Product clarity** — clean product-only shots.
2. **Pet interaction** — cat/dog actively using, sniffing, sleeping in, or investigating product.
3. **Home context** — product integrated into a tasteful but lived-in room.
4. **Emotion** — pets showing curiosity, comfort, excitement, or relaxation.
5. **Scale/specification** — dimensions and size comparison where useful.

### Art direction

- Bright natural light.
- Warm-white interiors.
- Realistic homes, not sterile showrooms.
- Visible material texture.
- Pets should feel candid rather than overly posed.
- Crop pets boldly when it increases personality.
- Keep backgrounds simple enough that product remains clear.

### Graphic overlays

Allowed:

- paw marks;
- hand-drawn arrows;
- simple stars/sparkles;
- loose doodle lines;
- organic blobs;
- tiny “pet commentary” callouts.

Do not use more than 1–2 doodle motifs per module.

---

## 10. Iconography

Use a custom-feeling rounded line icon system.

Icon subjects commonly include:

- shipping truck;
- shield / guarantee;
- paw;
- home;
- moon / sleep;
- recycle;
- washable / water droplet;
- size / ruler;
- easy setup;
- returns;
- customer care.

Style:

- 2px stroke;
- rounded line caps;
- simple silhouette;
- icon container may use mint/yellow/sky circular backgrounds.

Avoid mixing outline, filled, emoji, and 3D icons in the same section.

---

## 11. Motion & Interaction

Motion should express pet energy without hurting usability.

Use:

- 150–220ms button/card hover transitions;
- 250–400ms section reveals;
- 1–3px button lift or slight scale on hover;
- subtle image zoom on product cards;
- small doodle movement only on campaign pages;
- smooth accordions for FAQ and specifications.

Do not use:

- endless bouncing CTAs;
- auto-moving carousels without controls;
- parallax that compromises reading;
- large cursor effects;
- motion that delays add-to-cart.

Respect `prefers-reduced-motion`.

---

## 12. Content Voice

Tone: **warm + useful + lightly playful**.

Good examples:

- “Made for messy paws and cozy naps.”
- “Less cleanup. More cuddle time.”
- “A better corner of the house—for both of you.”
- “Built for pets. Designed to live with.”
- “Find their next favorite spot.”
- “Pet-approved comfort, human-approved cleanup.”

Microcopy can use gentle pet humor:

- “No judgment. We know who really owns the couch.”
- “Tiny paws, strong opinions.”
- “For professional nappers.”

Rules:

- Product benefit comes before joke.
- One joke is enough; do not turn every label into wordplay.
- Avoid baby-talk overload: no constant “fur baby”, “pawsome”, “meowgical”.
- Never invent certifications, health benefits, sustainability claims, or performance claims.
- For measurable claims, use verified product data only.

---

## 13. Navigation Architecture

Default desktop header:

```text
Announcement bar
Logo | Cats | Dogs | Litter Boxes | Beds & Mats | Best Sellers | About | Search | Account | Cart
```

If catalog grows, use mega menus.

### Cat mega menu

- Litter Boxes
- Cat Beds
- Mats & Liners
- Accessories
- Best Sellers

### Dog mega menu

- Dog Beds
- Mats
- Home Accessories
- Best Sellers

Rules:

- Keep first-level navigation to 6–7 items maximum.
- Use “Cats” / “Dogs” as behavioral entry points.
- Keep core product nouns visible for SEO and recognition.
- Cart should always remain easy to access.
- Mobile navigation must support thumb reach and large tap targets.

---

## 14. Announcement Bar

Use one message at a time whenever possible.

Preferred content hierarchy:

1. Free shipping threshold or current offer.
2. Returns/guarantee.
3. Seasonal campaign.

Visual:

- Purple, yellow, or dark ink background.
- 13–14px semibold type.
- No marquee animation by default.
- Link or CTA allowed, but keep bar height 32–40px.

---

## 15. Header

Desktop header target: 72–84px tall.

Required behavior:

- Sticky after small scroll or sticky from load if header remains compact.
- Logo should have generous clear space.
- Search may be icon-first on desktop and full input on results/collection contexts.
- Show cart count.
- Hover mega menus should also be keyboard accessible.

Avoid giant logo headers or double navigation rows unless campaign needs it.

---

## 16. Homepage Blueprint

The homepage should blend education, emotion, and merchandising.

### Section 1 — Hero

Goal: explain PetBoxNest in under 5 seconds.

Recommended structure:

- Eyebrow: short trust or category cue.
- H1: clear emotional + practical promise.
- 1–2 sentence supporting copy.
- Primary CTA: `Shop Best Sellers` or category-specific action.
- Secondary CTA: `Shop Cats` / `Shop Dogs` or `Find Their Fit`.
- Hero imagery: 1 cat + 1 dog when representing the whole brand, or one species for campaign pages.
- Product must be visible, not only pets.

Example direction:

> **Better spaces for pets. Better-looking spaces for you.**
>
> Practical litter boxes, cozy beds, and everyday pet essentials designed to feel at home in your home.

### Section 2 — Trust strip

Use 3–4 concise trust items:

- Easy returns
- Secure checkout
- Fast shipping
- Pet-first support

Do not fake review counts or awards.

### Section 3 — Shop by pet

Large split cards:

- For Cats
- For Dogs

Use lifestyle imagery, not generic icons.

### Section 4 — Best sellers

3–4 products with clear price, rating if verified, variants, and quick add where safe.

### Section 5 — Brand value story

Headline example:

> **Pet products shouldn’t make your home harder to live in.**

Use 3 benefits:

- practical cleanup;
- real comfort;
- home-friendly design.

### Section 6 — Product education feature

For the current hero category, use a Kitty Poo Club-style educational pattern:

- large product visual;
- 3–5 callouts;
- setup/process steps;
- dimensions/materials where relevant.

This module should change by campaign/category.

### Section 7 — Social proof

Use UGC/review cards with pet photo, short quote, verified status when available.

### Section 8 — “Find their perfect nest” discovery

Use a small guided selector:

- Cat or dog?
- What are you shopping for?
- Size / behavior / room constraints.

CTA: `Find Their Match`.

### Section 9 — Editorial lifestyle band

Use BARK-like personality, but with PetBoxNest's home layer.

Ideas:

- “The Nap Report”
- “Mess Management 101”
- “Small Space, Big Pet Energy”

### Section 10 — Guarantee + footer CTA

Finish with reassurance, not another loud sales blast.

---

## 17. Collection Page Blueprint

Collection pages must prioritize shopping speed.

Desktop:

- H1 + concise 1–2 line category intro.
- Optional editorial banner under H1.
- Left filters or top filter drawer depending catalog size.
- Product grid.
- One editorial interruption block after 4–8 products.

Filters may include:

- pet type;
- product type;
- size;
- material;
- color;
- price;
- washable/easy-clean attributes;
- stock.

Product card requirements:

- clean image with secondary hover image on desktop;
- product name;
- short functional descriptor;
- price;
- review summary only when real;
- color/size swatches where useful;
- badge such as `Best Seller`, `New`, `Easy Clean` only when true;
- quick add only when variant ambiguity is low.

Avoid placing long marketing copy inside product cards.

---

## 18. Product Detail Page Blueprint

### Above the fold

Desktop 55/45 or 60/40 split:

Left:

- image gallery;
- zoom;
- lifestyle + product + detail shots.

Right:

- breadcrumb;
- product title;
- one-line benefit statement;
- verified rating/review count;
- price;
- variant selectors;
- size/fit help;
- quantity if needed;
- primary Add to Cart;
- shipping / return reassurance;
- payment options if implemented.

Mobile:

- gallery first;
- key purchase information immediately after;
- optional sticky Add to Cart after main CTA leaves viewport.

### Below the fold

Use this order unless category requires otherwise:

1. Top benefits.
2. Product in a real home.
3. Specifications / dimensions / materials.
4. How it works / setup / care.
5. Fit or size guide.
6. Reviews / UGC.
7. FAQ.
8. Related products / “Complete their corner”.

### Education rule

If the product requires behavioral change, setup, recurring replacement, unusual material, or sizing education, use a visual “How it works” section.

### Claim rule

Never borrow claims from Kitty Poo Club or BARK. Only use claims present in PetBoxNest product data.

---

## 19. Product Cards

Default card anatomy:

```text
[image area 4:5 or 1:1]
[badge optional]
Product name
Functional one-line descriptor
Rating (optional/verified)
Price / compare-at price
Swatches or size cue
Quick add / choose options
```

Hover behavior:

- image gently zooms 1–2%;
- secondary image fades in if available;
- button changes state;
- never move surrounding grid layout.

Image background defaults to `--pbn-mist` or very light cream.

---

## 20. Buttons

### Primary

- Purple background.
- White text.
- Minimum height: 48px desktop, 48–52px mobile.
- Horizontal padding: 22–28px.
- Font weight: 700.

### Secondary

- White/cream background.
- 1.5px ink or purple border.
- Dark text.

### Text link

- Underline on hover.
- May include small arrow.

States required:

- default;
- hover;
- focus-visible;
- active;
- loading;
- disabled.

Never encode essential meaning using color alone.

---

## 21. Forms & Variant Selectors

Form style:

- 48–52px control height;
- 12–14px radius;
- visible labels above fields;
- no placeholder-only labels;
- clear error text near field;
- strong focus ring.

Variant selectors:

- Prefer button chips/cards to hidden dropdowns for 2–6 options.
- Show unavailable combinations clearly.
- Size choices should include dimensions when relevant.
- For pet size, use actual measurements/weight guidance when product data supports it.

---

## 22. Reviews & Social Proof

Use proof honestly.

Review card:

- star rating;
- short quote;
- customer first name + last initial if available;
- pet name/species optionally;
- verified purchase tag only if backend supports it;
- customer pet photo if permission exists.

Do not fabricate “10,000+ happy pets”, veterinarian endorsements, or press logos.

---

## 23. Promotions

Promotional UI should feel celebratory, not desperate.

Use:

- yellow badge;
- coral campaign accent;
- playful product/pet cutout;
- one clear savings statement;
- one CTA.

Avoid:

- multiple countdown timers;
- fake scarcity;
- flashing bars;
- permanent “limited time” claims;
- stacked popup + sticky bar + modal combinations.

Maximum intrusive overlays: one at a time.

---

## 24. Cart Drawer

Prefer a right-side cart drawer on desktop and full-height sheet on mobile.

Must include:

- product image;
- title/variant;
- quantity controls;
- price;
- remove;
- subtotal;
- shipping threshold messaging if real;
- checkout CTA;
- continue shopping.

Optional cross-sell:

- max 1–2 relevant add-ons;
- visually secondary to checkout.

Never obscure fees until checkout.

---

## 25. Search

Search should support product discovery without looking like an enterprise catalog.

Search overlay may include:

- popular searches;
- recent searches;
- suggested categories;
- top product matches with thumbnails.

No-results page should offer:

- spelling suggestion;
- category shortcuts;
- best sellers;
- customer support path.

---

## 26. Mobile-First Rules

Mobile is a primary shopping surface.

Requirements:

- minimum tap target: 44x44px;
- body text minimum: 16px for long reading;
- no hover-dependent features;
- sticky purchase action allowed on PDP;
- filter/sort in bottom sheet or drawer;
- product card text should remain readable at 2-column width;
- preserve pet/product imagery without awkward crop;
- avoid horizontal overflow;
- navigation opens full-height with clear category hierarchy.

Mobile hero:

- copy first when product concept is unfamiliar;
- image first only when visual is self-explanatory and campaign-led;
- keep primary CTA visible without excessive scrolling.

---

## 27. Accessibility

Target WCAG 2.2 AA.

Required:

- 4.5:1 normal-text contrast where applicable;
- 3:1 large text / UI component contrast where applicable;
- semantic heading hierarchy;
- keyboard-accessible menus, drawers, modals, accordions;
- visible focus states;
- alt text for meaningful product/lifestyle images;
- empty alt for decorative doodles;
- reduced motion support;
- labels for icon-only controls;
- error messages must explain how to recover.

Do not put text over busy pet photography unless contrast is guaranteed.

---

## 28. Responsive Breakpoints

Default project breakpoints:

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

Design fluidly between breakpoints.

Never make desktop a fixed screenshot shrunk to mobile.

---

## 29. Recommended Tailwind Mapping

When Tailwind is used, map tokens semantically rather than scattering hex values.

```ts
// tailwind.config.ts concept
colors: {
  brand: {
    DEFAULT: '#6557D9',
    dark: '#4A3DB8',
  },
  ink: '#202433',
  muted: '#596071',
  cream: '#FFF8EF',
  mist: '#F4F6F8',
  mint: '#BFE7D3',
  yellow: '#FFD966',
  coral: '#FF766C',
  sky: '#BFE3F4',
}
```

Use semantic component classes or variants for buttons, cards, badges, fields, and section shells.

---

## 30. Component Naming

Prefer domain-oriented reusable components:

```text
AnnouncementBar
SiteHeader
MegaMenu
MobileNav
PetTypeSwitcher
HeroCampaign
TrustStrip
CategoryCard
ProductCard
ProductGrid
ProductGallery
VariantSelector
SizeGuide
BenefitGrid
HowItWorks
ReviewCard
UGCStrip
PromoBand
EditorialStory
FAQAccordion
CartDrawer
StickyAddToCart
SiteFooter
```

Avoid names like `BlueBox`, `BigCard2`, `Section7`, or layout-specific names that become inaccurate later.

---

## 31. Homepage Content Hierarchy Rules

Every homepage concept must answer these questions in order:

1. What does PetBoxNest sell?
2. Why should I care?
3. Is it for my cat or dog?
4. Which product should I start with?
5. Why is this better/easier/more comfortable?
6. Can I trust this shop and product?
7. What do I do next?

If a homepage fails any of these within a reasonable scroll depth, redesign the hierarchy.

---

## 32. Cat vs Dog Visual Differentiation

Do not create two unrelated brands.

Shared:

- typography;
- layout system;
- primary purple;
- cream/ink foundation;
- button system;
- photography quality.

Optional category accents:

- Cats: mint / soft sky.
- Dogs: yellow / coral.

These accents are secondary only; do not recolor the entire UI per species.

---

## 33. Editorial / Campaign Mode

Campaign pages can be more expressive than core commerce pages.

Allowed:

- oversized type;
- pet cutouts overlapping section boundaries;
- custom doodles;
- seasonal colors;
- themed product groupings;
- playful copy.

Still preserve:

- recognizable PetBoxNest typography;
- primary CTA style;
- header/footer consistency;
- accessible contrast;
- purchase clarity.

---

## 34. Empty, Loading, Error States

PetBoxNest personality should continue into utility states.

Examples:

Empty cart:

> “Nothing in the nest yet.”

Search no result:

> “No matches. Even the pets checked under the couch.”

Error copy must remain useful:

> “That didn’t load. Try again, or head back to Best Sellers.”

Do not let jokes replace recovery instructions.

---

## 35. SEO & Merchandising UI

Design should support crawlable, readable content without bloated visual sections.

Collection pages:

- one H1;
- concise intro above products;
- longer SEO copy can live below grid in expandable/readable editorial section;
- product names and descriptors must be real text, not embedded in images.

PDP:

- title, benefits, materials, dimensions, care, shipping, and FAQ should be HTML text;
- use structured data when supported by the stack;
- do not hide all product information behind tabs on mobile.

---

## 36. Performance Rules

A playful site must still feel fast.

- Prefer AVIF/WebP for photography.
- Serve responsive `srcset` sizes.
- Lazy-load below-fold images.
- Never lazy-load the LCP hero image.
- Reserve image dimensions to prevent CLS.
- Avoid video backgrounds by default.
- Keep decorative SVGs lightweight.
- Use CSS animation over heavy JS when possible.
- Avoid unnecessary carousels.

Target strong Core Web Vitals before adding visual effects.

---

## 37. Design Anti-Patterns

Reject designs that include several of these:

- too many rounded pills everywhere;
- gradients on every card;
- stock-photo pets with no product context;
- three or more different illustration styles;
- tiny gray text;
- oversized whitespace that hides products below the fold;
- huge marketing hero with no product visible;
- noisy multi-color navigation;
- generic marketplace grid as the whole homepage;
- fake trust counters;
- autoplay video with audio;
- unclear variant selection;
- low-contrast pastel-on-pastel text;
- constant pun-heavy microcopy;
- copying Kitty Poo Club's purple/mint layouts or BARK's exact campaigns.

---

## 38. Workflow When Designing a New Page

Follow this sequence:

### Step 1 — Identify page intent

Choose one primary purpose:

- discovery;
- education;
- conversion;
- comparison;
- retention;
- campaign.

### Step 2 — Identify shopper questions

List the 3–6 questions a shopper must answer on that page.

### Step 3 — Build information hierarchy

Place answers before decorative storytelling.

### Step 4 — Select modules from this skill

Reuse existing PetBoxNest patterns before inventing new ones.

### Step 5 — Apply tokens

Use the defined palette, typography, spacing, radii, and component states.

### Step 6 — Add personality

Only after clarity is solved, add pet cutouts, doodles, playful copy, color, and motion.

### Step 7 — Check responsive behavior

Verify desktop, tablet, 390px mobile, and narrow 320px fallback.

### Step 8 — Run accessibility and commerce QA

No page is complete until keyboard, contrast, CTA, pricing, variants, and trust information are checked.

---

## 39. Workflow When Redesigning Existing PetBoxNest Code

1. Preserve working business logic, routes, analytics hooks, SEO metadata, and checkout behavior.
2. Audit the existing page before changing structure.
3. Identify whether the primary issue is hierarchy, aesthetics, trust, navigation, product discovery, or responsive behavior.
4. Replace ad-hoc styles with PetBoxNest tokens.
5. Consolidate repeated UI into reusable components.
6. Improve one page systemically rather than creating isolated visual patches.
7. Keep all user-visible product claims grounded in actual data.
8. Verify no existing event tracking or accessibility behavior was removed.

---

## 40. Required Output When Asked for a PetBoxNest UI Proposal

When producing a design proposal, include:

1. Design intent in 2–4 sentences.
2. Page hierarchy / module order.
3. Desktop behavior.
4. Mobile behavior.
5. Key components.
6. Color and typography usage.
7. Conversion/trust strategy.
8. Any content/data assumptions.
9. Accessibility considerations.
10. A short QA checklist.

When coding, implement the system rather than merely describing it.

---

## 41. Required QA Checklist

Before declaring a page finished, confirm:

### Brand

- [ ] Feels like PetBoxNest, not a Kitty Poo Club/BARK clone.
- [ ] Warm home feeling is present.
- [ ] Playful personality is visible but controlled.
- [ ] Pet and product are both visually represented where appropriate.

### Commerce

- [ ] Primary CTA is obvious.
- [ ] Pricing is clear.
- [ ] Variants are understandable.
- [ ] Shipping/returns/guarantee are easy to find.
- [ ] Product claims are verified.
- [ ] Cart path works without friction.

### Visual system

- [ ] Colors use tokens.
- [ ] Typography follows hierarchy.
- [ ] Section spacing is consistent.
- [ ] Cards/buttons use consistent geometry.
- [ ] No unnecessary visual effect competes with products.

### Responsive

- [ ] Works at 320px.
- [ ] Works at 390px.
- [ ] Works at 768px.
- [ ] Works at 1024px.
- [ ] Works at 1440px+.
- [ ] No horizontal overflow.
- [ ] Mobile tap targets are at least 44px.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Contrast meets AA targets.
- [ ] Images have correct alt behavior.
- [ ] Accordions/modals/drawers are accessible.
- [ ] Reduced motion is respected.

### Performance

- [ ] Hero/LCP asset is optimized.
- [ ] Below-fold media is lazy loaded.
- [ ] Layout shifts are minimized.
- [ ] Decorative JS is not blocking purchase actions.

---

## 42. Final Design Principle

When there is tension between “cute” and “clear,” choose **clear**.

When there is tension between “premium” and “warm,” choose **warm**.

When there is tension between “brand personality” and “purchase usability,” preserve **purchase usability**, then add personality around it.

PetBoxNest should make shoppers think:

> **“This looks fun for my pet, easy for me, and good enough to live in my home.”**
