**Context & Goals**
- Context: Create a minimal, token-driven UI guidance inspired by Jesse's Ramen (https://www.jesse-zhou.com/) to be applied to the Campus Guide 3D "Explore" experience.
- Goal: Provide implementation-ready design tokens, component rules, and accessibility acceptance criteria so front-end engineers can implement a consistent, accessible, responsive UI that presents the 3D campus model in a clean documentation-style layout.

**Restated design intent**
- Provide a minimal, type-forward documentation aesthetic where the 3D model is the primary visual, with clear typographic hierarchy and keyboard-first interactions.

---

**Design Tokens & Foundations**
- Typeface: `font.family.primary = Times, serif` (use fallback `serif`).
- Size scale (base): `font.size.base = 16px`, `font.size.xs = 16px`, `font.size.lg = 24px`, `font.size.xl = 32px`.
- Weight: `font.weight.base = 400`, `font.weight.bold = 700`, `font.weight.black = 900`.
- Line height: `font.lineHeight.base = normal`.
- Colors (semantic tokens):
  - `color.surface = #ffffff` (white)
  - `color.text.primary = #000000`
  - `color.muted = #000000CC` (70% black)
  - `color.accent = #000000` (use monochrome accents per brand)
- Spacing: semantic tokens should be used (e.g., `space.xs = 4px`, `space.sm = 8px`, `space.md = 16px`, `space.lg = 24px`).
- Radius / Motion: keep minimal — `radius.sm = 6px`, motion durations `motion.short = 120ms`, `motion.medium = 240ms`.

**Component-level rules**
1) Site Header (hero-style)
- Anatomy: container, title, subtitle, actions (1-2 CTAs).
- Variants: `hero-centered` (default), `hero-inline` (compact).
- States: default, focus-visible for actions, disabled state for actions.
- Behavior:
  - Title must use `font.family.primary`, `font.weight.black`, `font.size.xl`.
  - Actions must be keyboard operable (Tab, Enter, Space). Action focus uses visible outline (`focus-visible` must show 3px ring).
  - For small screens (<640px) reduce title size to `font.size.lg` and stack actions vertically.
- Accessibility:
  - Title must have semantic `h1` element.
  - Action buttons must include `aria-label` and visible focus ring (contrast >= 4.5:1).

2) 3D Canvas Container
- Anatomy: canvas wrapper, loading overlay, controls overlay, status text.
- Behavior:
  - Canvas must be responsive and occupy available vertical space (use `height: 100vh` or container-managed height).
  - Loading overlay must be keyboard and screen-reader accessible (announce progress via `aria-live="polite"`).
  - Controls (Center, Reset) must be accessible via keyboard and have `aria-label` attributes; they should be minimal, monochrome, and have a clear focus state.
- States: loading, ready, error (display helpful message and link to fallback content).

3) Action Button (primary control)
- Anatomy: label, optional icon.
- Tokens: padding `space.sm/space.md`, radius `radius.sm`, font `font.family.primary`, color `color.text.primary` on `color.surface`.
- States: default, hover (soft lift using shadow), active (pressed inset), focus-visible (2-3px ring), disabled (50% opacity, not focusable).
- Interaction: must respond to pointer, keyboard (Enter, Space), and touch.

**Accessibility acceptance criteria (testable)**
- All interactive elements must be reachable via Tab and activated with Enter and Space.
- Focus visible: when tabbing, the focused action must show a 3px ring with contrast >= 3:1 against surface.
- Contrast: body text (`color.text.primary` on `color.surface`) must meet 4.5:1 contrast.
- Loading overlay must announce progress with `role="status"` and `aria-live="polite"`.
- Error states must expose `role="alert"` and readable messages.

**Content & tone standards**
- Concise, confident, implementation-focused copy when labeling controls: e.g., "Center", "Reset view".
- Use imperative verbs for actions.
- Keep paragraphs short (one line max in hero).

**Anti-patterns (prohibited)**
- Do not hide focus styles.
- Do not use low-contrast text on white backgrounds.
- Do not create one-off typography sizes outside the token scale.

**QA checklist**
- [ ] `h1` present and uses Times family.
- [ ] Canvas loads and `aria-live` announces progress.
- [ ] All actions keyboard operable (Tab/Enter/Space).
- [ ] Focus-visible ring present and meets contrast.
- [ ] Mobile layout stacks properly and remains usable.

---

Notes: This file provides implementation-ready tokens and component rules to adapt the Campus Guide 3D explore experience to a Jesse's Ramen-inspired minimal documentation layout. Use this as a living file — adjust tokens as needed for final branding choices.
