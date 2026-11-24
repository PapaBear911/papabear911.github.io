# Masterplan: Ver Sangil Portfolio — From AI-Default to Engineering Craft

**Goal:** Convert `papabear911.github.io` from a clean-but-generic dark portfolio into a distinctive "engineering craft" Experience-mode site that passes WCAG AA, reads zero on AI-slop detectors, and ships a smooth, capability-detected WebGL/WebGPU depth layer without breaking the static GitHub Pages delivery.

**Mode:** Experience (portfolio / showcase — the artifact leads, the interface recedes).

**Spec sources:** `README.md`, `index.html`, `style.css`, `brand-silhouette.png`, and the 2026-11-24 audit report (Web Interface Guidelines, design-system 10-dimension, AI-slop, impeccable detect, portfolio trend research).

**Complexity:** Large — 6 phases, 23 microtasks.

**Execution mode:** git + gh are available (`origin = https://github.com/PapaBear911/papabear911.github.io.git`, branch `main`). Recommended: one short-lived branch + one PR **per phase**, squash-merged. Direct mode (edit-in-place on `main`) is acceptable for Phases 0–1 if the user prefers fewer PRs. No code has been written by this plan.

**Global Constraints (apply to every task):**
- Static site remains static: GitHub Pages serves the repo root; no required build step, no bundler, no runtime dependencies to ship.
- `index.html`, `style.css`, and any new `js/` files must work over `file://` and `https://` without CORS-specific config.
- `prefers-reduced-motion: reduce` must fully disable parallax, reveal, magnetic, and canvas motion — content stays visible and readable.
- JS budget: ≤200 KB total shipped; canvas layer is progressive enhancement only, never required for content.
- WCAG 2.2 AA is the floor: body text ≥4.5:1, large text ≥3:1, body font ≥14px (target 16px), visible `:focus-visible` on every interactive element.
- Preserve product truth: name, roles, projects (MEDIX-MCP, HIS Modernization, SENTINEL, VerCoder), philosophy ("Audit → Act → Persist → Repeat"), and all existing links. Do not invent claims or metrics.
- Copy rules from Web Interface Guidelines: title case headings/buttons, curly quotes, `…` not `...`, active voice, second person, numerals for counts.
- After any UI edit, run the detector once: `C:\Users\Ver\.agents\skills\impeccable\scripts\impeccable.cmd detect index.html --json` (findings → exit 1; clean → `[]` + exit 0).

**Review Focus (failure modes no single task's tests cover; each pinned to a task):**
- Long/translated copy overflowing a card or hero → Task 2.4 (min-width:0, break-words).
- Reduced-motion users seeing invisible content because `.js .reveal` stays at opacity 0 → Task 3.1 and Task 4.4.
- WebGPU/WebGL context failure or low-power device leaving a blank hero → Task 4.1 fallback chain.
- Fixed nav covering a focused anchor target → Task 1.2.
- Canvas stealing pointer events or focus from real content → Task 4.2.
- Font swap causing layout shift (CLS) → Task 2.2.
- Offscreen canvas burning battery → Task 4.4.

---

## Architecture Decisions

1. **Keep a single stylesheet with a token block at the top** rather than splitting into many CSS files. The site is four files; a token layer plus component sections in `style.css` is sufficient and avoids a build step.
2. **Extract the inline `<script>` into `js/main.js`** so motion code is reviewable and the canvas layer can be a separate opt-in module. `index.html` becomes markup + one deferred script tag.
3. **Capability chain: WebGPU → WebGL2 → CSS fallback.** WebGPU is attempted only when `navigator.gpu` exists; any failure degrades to WebGL2, then to the existing CSS radial layers. No feature is gated behind WebGPU.
4. **Canvas is decorative and `aria-hidden="true"`.** All meaningful content remains DOM text. The canvas never receives pointer or keyboard focus.
5. **Verification harness is a zero-dependency Node script** (`scripts/verify.mjs`) that checks structure, tokens, and anti-patterns. It replaces a test framework the site does not have; if the user declines tooling, detector + manual browser pass is the substitute.
6. **PRODUCT.md is captured before the redesign.** Audit context reported `NO_PRODUCT_MD` and `BUILD_INIT_REQUIRED` for redesign flows. Product truth was inferred from `README.md` + `index.html` for this plan; Task 0.1 is the human confirmation gate.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `index.html` | Modify | Semantic markup, meta tags, font links, copy, script tag |
| `style.css` | Modify | Token block + component styles + motion rules |
| `brand-silhouette.png` | Keep / decide | Watermark asset — visibility decision in Task 2.5 |
| `README.md` | Modify | Product truth seed + final ship notes |
| `PRODUCT.md` | Create | Durable product truth (impeccable init artifact) |
| `DESIGN.md` | Create | Visual world rationale (Experience mode) |
| `design-tokens.json` | Create | Machine-readable token set |
| `design-preview.html` | Create | Self-contained token/component preview |
| `js/main.js` | Create | Reveal + motion controller (extracted inline JS) |
| `js/hero-canvas.js` | Create | Capability-detected WebGPU/WebGL2 hero layer |
| `scripts/verify.mjs` | Create | Zero-dependency structural + slop verification |
| `CHANGELOG.md` | Create | Phase-by-phase ship record |
| `plans/portfolio-masterplan.md` | Create | This document |

---

## Dependency Graph

```
0.1 PRODUCT.md ──> 0.2 baseline+verify ──> 0.3 DESIGN.md + tokens
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    v                         v                         v
                 1.1 contrast            1.2 meta/anchor           1.3 typography
                    │                         │                         │
                    └──────────────┬──────────┴─────────────────────────┘
                                   v
                                1.4 touch/focus
                                   │
                    ┌──────────────┼──────────────┐
                    v              v              v
                 2.1 hero     2.2 fonts      2.3 token cleanup
                    └──────────────┼──────────────┘
                                   v
                          2.4 components   ──>  2.5 watermark
                                   │
                                   v
                                3.1 extract JS
                           ┌───────┴───────┐
                           v               v
                        3.2 stagger     3.3 magnetic+terminals
                           └───────┬───────┘
                                   v
                                3.4 focus mgmt
                                   │
                                   v
                                4.1 capability layer
                           ┌───────┴───────┐
                           v               v
                        4.2 hero field  4.3 scroll displacement
                           └───────┬───────┘
                                   v
                                4.4 budget + kill switch
                                   │
                                   v
                5.1 re-audit ──> 5.2 browser pass ──> 5.3 ship
```

Parallelism: Tasks 1.1/1.2/1.3 are independent; 2.1/2.2/2.3 are independent; 3.2/3.3 are independent; 4.2/4.3 are independent. Everything else is sequential.

---

## Task List

### Phase 0 — Foundation & Truth Capture

#### Task 0.1: Capture PRODUCT.md
**Files:** Create `PRODUCT.md`; Read `README.md`, `index.html` (no code changes).
**Interfaces:** Consumes — README philosophy line, hero copy, project names. Produces — confirmed product truth consumed by Task 0.3 and every copy task.
**Description:** Seal the non-negotiable product facts before any visual decision. This is the impeccable `init` gate that the audit flagged as missing.
**Acceptance criteria:**
- [ ] `PRODUCT.md` states name, roles, audience, project truth, and philosophy verbatim from source files.
- [ ] User explicitly confirms or corrects the inferred truth (one structured question; proceed with stated substitution if unanswered).
**Steps:**
- [ ] Step 1: Draft `PRODUCT.md` from `README.md:1-11` and `index.html:37-39,115-159` — no invented claims.
- [ ] Step 2: Ask the user once to confirm or edit the draft.
- [ ] Step 3: If no answer, adopt the draft and record "inferred from source, unconfirmed" in the file.
**Verification:** `grep -n "Audit → Act → Persist → Repeat" PRODUCT.md` returns the line.
**Dependencies:** None
**Estimated scope:** S

#### Task 0.2: Baseline + verification harness
**Files:** Create `scripts/verify.mjs`, `CHANGELOG.md`; Modify nothing else.
**Interfaces:** Produces — `node scripts/verify.mjs` used by every subsequent task.
**Description:** Capture the "before" state and create a zero-dependency checker so each later task has a concrete green/red signal without a test framework.
**Acceptance criteria:**
- [ ] `node scripts/verify.mjs` runs with no dependencies and exits 0 on the current tree (with baseline checks recorded as known-failing assertions printed but not fatal).
- [ ] Baseline detector output and score table are recorded in `CHANGELOG.md`.
**Steps:**
- [ ] Step 1: Snapshot current `impeccable detect index.html --json` into `CHANGELOG.md` (7 findings from audit).
- [ ] Step 2: Write `scripts/verify.mjs` with checks: skip link present, all `<img>` have alt+width+height, no `transition: all`, no `outline: none`, token block present, no hero-eyebrow class, no `inter`/`space grotesk` font reference, `color-scheme: dark` present, `scroll-padding-top` present.
- [ ] Step 3: Run `node scripts/verify.mjs` and confirm baseline failures are listed as "known-baseline" not errors.
- [ ] Step 4: `git diff --check`.
**Verification:** `node scripts/verify.mjs` prints a summarized PASS/KNOWN-BASELINE table; `git diff --check` silent.
**Dependencies:** 0.1
**Estimated scope:** M

#### Task 0.3: Visual world + design tokens
**Files:** Create `DESIGN.md`, `design-tokens.json`, `design-preview.html`; Modify `style.css` (add token block only).
**Interfaces:** Consumes — PRODUCT.md truth. Produces — CSS custom properties `--accent*`, `--gray-*`, `--space-*`, and their JSON twins used by Tasks 1.1, 1.3, 2.3.
**Description:** Choose the "engineering craft" world explicitly and make it machine-readable before editing components. Per design-system Mode 1 + impeccable new-work.
**Acceptance criteria:**
- [ ] `DESIGN.md` names the world, mode (Experience), font pair, palette, card treatment, and motion law with rationale tied to healthcare IT + AI engineering.
- [ ] `design-tokens.json` and `:root` in `style.css` agree on every value.
- [ ] `design-preview.html` renders tokens without external dependencies.
**Steps:**
- [ ] Step 1: Write token block in `style.css:6-10` expanded to full gray/space/type scale from the audit (replace the 3-line block).
- [ ] Step 2: Mirror identical values into `design-tokens.json`.
- [ ] Step 3: Write `DESIGN.md` with the de-slop decisions (editorial hero, brutalist cards, amber + deep cyan, engineering-paper grid).
- [ ] Step 4: Build self-contained `design-preview.html` showing swatches, type scale, spacing steps, and card samples.
**Verification:** `node -e "const t=require('./design-tokens.json'); console.log(Object.keys(t).length)"` prints >0; `node scripts/verify.mjs` reports "token block present".
**Dependencies:** 0.2
**Estimated scope:** M

### Checkpoint 0
- [ ] PRODUCT.md confirmed; token block and JSON agree; preview page renders; `git diff --check` clean.
- [ ] Human reviews `DESIGN.md` before Phase 1.

---

### Phase 1 — Compliance (WCAG AA + Web Interface Guidelines)

#### Task 1.1: Contrast, text size, letter-spacing
**Files:** Modify `style.css:25-34,441-449,464-469,502-505`.
**Interfaces:** Consumes — `--gray-400`, `--gray-300`, `--gray-500` from Task 0.3. Produces — AA-compliant text styles.
**Description:** Fix the three detector findings on quality: low contrast (3.6:1), tiny body text (11.2px), and wide body tracking (0.08em).
**Acceptance criteria:**
- [ ] All body text ≥4.5:1 against its background; `#6b7280` no longer used for text.
- [ ] Base font ≥16px; smallest rendered text ≥12px (only decorative labels may be smaller).
- [ ] Body letter-spacing ≤0.01em; wide tracking only on uppercase labels.
**Steps:**
- [ ] Step 1: Replace `#6b7280` with `--gray-400` (#9ca3af) in `.project-tech li`, `.footer-links a`.
- [ ] Step 2: Set `body { font-size: 1rem; letter-spacing: 0; }`.
- [ ] Step 3: Raise `.project-tech li` and `.footer-links a` to ≥0.875rem.
- [ ] Step 4: Run detector; confirm low-contrast, tiny-text, wide-tracking findings are gone.
**Verification:** `impeccable.cmd detect index.html --json` output contains no `low-contrast`, `tiny-text`, or `wide-tracking` entries.
**Dependencies:** 0.3
**Estimated scope:** S

#### Task 1.2: Dark-mode meta + anchor offsets
**Files:** Modify `index.html:2,6`, `style.css:19-22,130-146`.
**Interfaces:** Consumes — none. Produces — `color-scheme`, `theme-color`, `scroll-padding-top`, heading `scroll-margin-top`.
**Description:** Make the dark theme native and stop the fixed nav from covering focused anchors.
**Acceptance criteria:**
- [ ] `<html>` carries `color-scheme="dark"` and `<meta name="theme-color" content="#0a0a0a">` exists.
- [ ] `html { scroll-padding-top: 5rem; }` and `.section h2 { scroll-margin-top: 6rem; }` present.
**Steps:**
- [ ] Step 1: Add attributes/meta in `<head>`.
- [ ] Step 2: Add scroll offsets in CSS.
- [ ] Step 3: Click each nav link in browser; confirm heading clears the nav bar.
**Verification:** `node scripts/verify.mjs` reports dark-mode + scroll-offset checks PASS.
**Dependencies:** 0.3
**Estimated scope:** XS

#### Task 1.3: Typography micro-copy
**Files:** Modify `index.html:55-58,267`, `style.css:101-107,279-285`.
**Interfaces:** Consumes — token type scale from 0.3. Produces — guideline-compliant copy and wrapping.
**Description:** Apply curly quotes, ellipsis, text-wrap, and tabular numerals; tighten first-person/passive copy where it does not alter product truth.
**Acceptance criteria:**
- [ ] No ASCII `"` or `...` in visible copy; `…` used where truncation/loading appears.
- [ ] `text-wrap: balance` on `h1,h2,h3`; `text-wrap: pretty` on paragraph classes.
- [ ] `font-variant-numeric: tabular-nums` on `.stack-list` and `.project-tech`.
**Steps:**
- [ ] Step 1: Replace straight quote in `index.html:58` (`Don't` → `Don’t`) and any `...` with `…`.
- [ ] Step 2: Add `text-wrap` declarations to headings and paragraph classes.
- [ ] Step 3: Add `font-variant-numeric` to list styles.
- [ ] Step 4: Rewrite passive/opening sentence to active/second person without changing facts.
**Verification:** `grep -n '"\|\.\.\.' index.html` returns no visible-copy matches; `node scripts/verify.mjs` typography check PASS.
**Dependencies:** 0.3
**Estimated scope:** S

#### Task 1.4: Touch + focus affordances
**Files:** Modify `style.css:59-62,196-235,653-659`.
**Interfaces:** Consumes — focus color `--accent-light`. Produces — intentional touch behavior and compound focus.
**Description:** Add the interaction affordances the WIG audit flagged as missing.
**Acceptance criteria:**
- [ ] `.btn, .nav-links a, .footer-links a` have `touch-action: manipulation` and `-webkit-tap-highlight-color`.
- [ ] Compound controls group with `:focus-within`; no focus ring removed without replacement.
- [ ] Hover/focus states visibly increase contrast over rest state.
**Steps:**
- [ ] Step 1: Add touch properties to interactive selectors.
- [ ] Step 2: Add `:focus-within` on `.nav` and `.hero-actions`.
- [ ] Step 3: Verify tab order reaches all 8 links with visible ring.
**Verification:** `node scripts/verify.mjs` checks no `outline: none` present; manual tab-through at 375px.
**Dependencies:** 1.2, 1.3
**Estimated scope:** S

### Checkpoint 1
- [ ] Detector quality findings = 0; WIG audit categories (a11y, focus, typography, dark mode, touch) clean.
- [ ] Lighthouse-style contrast spot-check passes on body, secondary, and tag text.

---

### Phase 2 — De-Slop Visual Language

#### Task 2.1: Remove hero eyebrow; restructure hero
**Files:** Modify `index.html:36-44`, `style.css:259-292`.
**Interfaces:** Consumes — hero copy from PRODUCT.md. Produces — new hero structure consumed by Task 4.2 canvas anchoring.
**Description:** Eliminate the `hero-eyebrow-chip` slop finding by integrating the kicker into the headline as an editorial subhead.
**Acceptance criteria:**
- [ ] No `.hero-eyebrow` element or class remains.
- [ ] Roles appear as a `<span class="hero-kicker">` inside or immediately after `<h1>`, not as a tracked-caps pill above it.
- [ ] Hero remains centered-on-content but text is left-aligned in the editorial layout.
**Steps:**
- [ ] Step 1: Delete the eyebrow div; move roles into an h1-adjacent span.
- [ ] Step 2: Replace `.hero-eyebrow` CSS with `.hero-kicker` (sentence case, 1rem, `--gray-400`).
- [ ] Step 3: Change `.hero-inner { text-align: left; }` and adjust max-width.
- [ ] Step 4: Detector confirms `hero-eyebrow-chip` gone.
**Verification:** `node scripts/verify.mjs` reports no `hero-eyebrow` token; `impeccable.cmd detect index.html --json` has no `hero-eyebrow-chip`.
**Dependencies:** 1.4
**Estimated scope:** S

#### Task 2.2: Distinctive font pair
**Files:** Modify `index.html:9-12`, `style.css:25,101-103,170-172,266,488-493` (`design-tokens.json` typography values).
**Interfaces:** Consumes — font decisions in `DESIGN.md`. Produces — new `--font-display`, `--font-body` tokens used everywhere.
**Description:** Replace Inter + Space Grotesk (both flagged as overused) with Syne (display) + DM Sans (body), with preconnect + `display=swap`.
**Acceptance criteria:**
- [ ] No `Inter` or `Space Grotesk` reference in HTML or CSS.
- [ ] Google Fonts link includes `family=Syne`, `family=DM+Sans`, and `&display=swap`.
- [ ] Font fallback stacks remain system-safe; no CLS on load (width/height already set on image).
**Steps:**
- [ ] Step 1: Swap font link in `<head>`, keep both `preconnect`s.
- [ ] Step 2: Rename all font-family declarations to token variables.
- [ ] Step 3: Add `<link rel="preload" as="style">` for the CSS2 URL.
- [ ] Step 4: Load page twice; confirm no visible reflow after fonts arrive.
**Verification:** `node scripts/verify.mjs` reports no overused-font references; detector `overused-font` findings = 0.
**Dependencies:** 0.3, 2.1
**Estimated scope:** S

#### Task 2.3: Token cleanup (remove raw hex)
**Files:** Modify `style.css` throughout (all remaining raw hex values outside `:root`).
**Interfaces:** Consumes — token block from 0.3. Produces — fully token-driven stylesheet.
**Description:** Replace every raw hex/rgba outside `:root` with the appropriate token, making the color system enforceable.
**Acceptance criteria:**
- [ ] Zero raw `#xxxxxx` or `rgba(...)` literals outside `:root`.
- [ ] `node scripts/verify.mjs` token-enforcement check passes.
**Steps:**
- [ ] Step 1: Add missing tokens for borders/glows used in components.
- [ ] Step 2: Replace literals with `var(--token)` across the file.
- [ ] Step 3: Run script; iterate until clean.
**Verification:** `grep -nE '#[0-9a-fA-F]{3,6}|rgba\(' style.css` matches only lines within the `:root` block.
**Dependencies:** 1.1, 0.3
**Estimated scope:** M

#### Task 2.4: Engineering-craft components
**Files:** Modify `style.css:149-235,310-449,475-510`; `index.html:49-61,68-111,118-158` (class/structure only).
**Interfaces:** Consumes — tokens from 2.3. Produces — card/nav/button components that Tasks 3.3 enhance.
**Description:** Replace glass-morphism nav, gradient buttons, and subtle-border hover-lift cards with a distinctive brutalist/engineering-paper treatment: sharp corners, thick accent borders, grid texture, no blur.
**Acceptance criteria:**
- [ ] No `backdrop-filter` or `border-radius: 10px` on cards/nav; corners are 0–2px.
- [ ] Cards use a 2px left accent border + grid/paper texture; hover changes border and background, not translateY.
- [ ] Long project text wraps safely (`min-width: 0`, `overflow-wrap: break-word`).
**Steps:**
- [ ] Step 1: Rewrite `.nav` to solid `--gray-900` with bottom accent rule.
- [ ] Step 2: Rewrite `.expertise-card`, `.project-card`, `.stack-group` with accent rule + no blur.
- [ ] Step 3: Rewrite `.btn-primary` to solid accent, `.btn-ghost` to outline.
- [ ] Step 4: Add `min-width: 0` and `overflow-wrap` to text containers.
**Verification:** `node scripts/verify.mjs` confirms no `backdrop-filter` in stylesheet; manual screenshot at 1440px and 375px reviewed.
**Dependencies:** 2.2, 2.3
**Estimated scope:** M

#### Task 2.5: Watermark decision
**Files:** Modify `style.css:42-57`; keep or delete `brand-silhouette.png`.
**Interfaces:** Consumes — final aesthetic from 2.4. Produces — resolved `buried-raster` finding.
**Description:** Resolve the detector finding: either raise the watermark to a visible texture or remove it. Do not ship a file at 0.07 opacity that no one sees.
**Acceptance criteria:**
- [ ] Detector `buried-raster` finding = 0.
- [ ] Choice is recorded in `DESIGN.md` with rationale.
**Steps:**
- [ ] Step 1: Try `opacity: 0.14` with `mix-blend-mode: soft-light`; screenshot.
- [ ] Step 2: If still invisible or muddy at 375px, delete the rule and the PNG; document removal.
- [ ] Step 3: Run detector.
**Verification:** `impeccable.cmd detect index.html --json` has no `buried-raster`.
**Dependencies:** 2.4
**Estimated scope:** XS

### Checkpoint 2
- [ ] All 7 audit findings resolved (contrast, eyebrow, raster, tiny text, tracking, 2× overused font).
- [ ] `DESIGN.md` matches shipped CSS; human approves the visual diff.

---

### Phase 3 — Experience-Mode Motion Polish

#### Task 3.1: Extract and harden motion controller
**Files:** Create `js/main.js`; Modify `index.html:212-262`.
**Interfaces:** Consumes — `.reveal`, `.section`, `.reveal-group` hooks in HTML. Produces — `window.__portfolioMotion` with `init()`, `destroy()`, `setReduced()` consumed by 3.2/3.3/4.4.
**Description:** Move inline JS to a deferred module and make reveal fail-safe: if reduced-motion is on, all content is immediately visible.
**Acceptance criteria:**
- [ ] No inline `<script>` remains in `index.html`; one `<script src="js/main.js" defer>`.
- [ ] With `prefers-reduced-motion: reduce`, `.reveal` and `.section` have computed opacity 1.
- [ ] Parallax uses rAF-batched `transform` only.
**Steps:**
- [ ] Step 1: Copy inline script into `js/main.js` as an IIFE exposing the API.
- [ ] Step 2: Add `if (prefersReduced) { document.documentElement.classList.remove('js'); return; }`.
- [ ] Step 3: Replace `<script>` block with deferred tag.
- [ ] Step 4: Emulate reduced motion in browser; verify all sections visible.
**Verification:** `node scripts/verify.mjs` confirms no inline script; reduced-motion browser check passes.
**Dependencies:** 2.5
**Estimated scope:** M

#### Task 3.2: Staggered scroll entrances
**Files:** Modify `js/main.js` (IntersectionObserver thresholds/delays), `style.css:614-640`.
**Interfaces:** Consumes — `window.__portfolioMotion` from 3.1. Produces — `--reveal-delay` variable and `is-visible` state used by 4.3.
**Description:** Smooth the reveal: lower threshold, cap stagger, ease with `cubic-bezier`, and make entrances interruptible by scroll direction.
**Acceptance criteria:**
- [ ] Stagger ≤0.5s total across a 6-card grid.
- [ ] Reveal uses only `opacity`/`transform`; no `transition: all`.
- [ ] Scrolling back up does not re-trigger or blank content.
**Steps:**
- [ ] Step 1: Tune observer to `{ threshold: 0.08, rootMargin: '0px 0px -5% 0px' }`.
- [ ] Step 2: Cap `--reveal-delay` at `i * 0.06s` max 0.5s.
- [ ] Step 3: Add `cubic-bezier(0.22, 1, 0.36, 1)` easing.
- [ ] Step 4: Scroll up/down twice; confirm stable.
**Verification:** Manual 60fps scroll check at 1440px; `node scripts/verify.mjs` confirms no `transition: all`.
**Dependencies:** 3.1
**Estimated scope:** S

#### Task 3.3: Magnetic hover + project terminals
**Files:** Modify `js/main.js`, `style.css:395-449`, `index.html:118-158`.
**Interfaces:** Consumes — card/button selectors from 2.4. Produces — `.project-card.is-open` state consumed by 3.4.
**Description:** Add restrained magnetic attraction on primary buttons and click-to-expand project detail panels (the "interactive terminal" idea), keeping keyboard parity.
**Acceptance criteria:**
- [ ] Magnetic effect uses `transform: translate3d` on mousemove, resets on mouseleave, and is disabled under reduced motion.
- [ ] Project cards expand/collapse via `<button>` (not div click), with `aria-expanded`.
- [ ] Panels are readable at 375px and do not trap focus.
**Steps:**
- [ ] Step 1: Add mousemove handler on `.btn-primary` with ≤6px offset.
- [ ] Step 2: Convert `.project-card` header to a `<button>` toggling `.is-open`.
- [ ] Step 3: Add `aria-expanded` and hidden detail block.
- [ ] Step 4: Test with keyboard only (Enter/Space toggles).
**Verification:** `node scripts/verify.mjs` confirms no div/span click handlers; keyboard toggle works.
**Dependencies:** 3.2
**Estimated scope:** M

#### Task 3.4: Focus management for expanded panels
**Files:** Modify `js/main.js`, `style.css:653-659`.
**Interfaces:** Consumes — `.project-card.is-open` from 3.3. Produces — accessible disclosure pattern.
**Description:** Ensure expanded project panels manage focus and are reachable/closable by keyboard.
**Acceptance criteria:**
- [ ] Opening a panel moves focus to its heading; Escape closes and returns focus to trigger.
- [ ] `:focus-visible` ring remains visible inside panels.
- [ ] Closed panels are removed from tab order (`hidden` or `inert`).
**Steps:**
- [ ] Step 1: Add focus move + Escape handler.
- [ ] Step 2: Toggle `inert`/`hidden` on detail blocks.
- [ ] Step 3: Tab-through test with 2 expanded panels.
**Verification:** Keyboard-only pass at 1440px and 375px.
**Dependencies:** 3.3
**Estimated scope:** S

### Checkpoint 3
- [ ] Reduced-motion parity verified; no layout thrash; keyboard path complete.
- [ ] No `transition: all`, no inline handlers, no focus traps.

---

### Phase 4 — WebGL/WebGPU Progressive Enhancement

#### Task 4.1: Capability layer
**Files:** Create `js/hero-canvas.js` (capability section only); Modify `index.html` (deferred module tag).
**Interfaces:** Produces — `detectBestRenderer()` returning `'webgpu' | 'webgl2' | 'css'`; consumed by 4.2/4.3/4.4.
**Description:** Implement the fallback chain and lifecycle guards before any shader code exists.
**Acceptance criteria:**
- [ ] WebGPU attempted only when `navigator.gpu` exists; any throw → WebGL2 → CSS.
- [ ] DPR capped at 2; `visibilitychange` pauses rendering; offscreen via IntersectionObserver pauses.
- [ ] Canvas element is `aria-hidden="true"` and `pointer-events: none`.
**Steps:**
- [ ] Step 1: Write `detectBestRenderer()` with try/catch around `navigator.gpu.requestAdapter()`.
- [ ] Step 2: Add `matchMedia('(prefers-reduced-motion: reduce)')` early exit to `'css'`.
- [ ] Step 3: Add visibility + intersection pause logic.
- [ ] Step 4: Stub-render a clear color and verify fallback path in a browser without WebGPU.
**Verification:** `node scripts/verify.mjs` confirms aria-hidden on canvas; two-browser check (WebGPU-on, WebGPU-off) shows no console errors.
**Dependencies:** 3.4
**Estimated scope:** M

#### Task 4.2: Hero depth field
**Files:** Modify `js/hero-canvas.js` (renderer), `style.css:582-612` (fallback layers retained).
**Interfaces:** Consumes — renderer from 4.1. Produces — `#hero-canvas` mounted behind hero content, never above it.
**Description:** Render a subtle noise/dot field that reacts slightly to pointer and scroll — the artistic "as smooth as possible" layer, still decorative.
**Acceptance criteria:**
- [ ] Field is visible but subtle (≤8% luminance variation); text contrast unaffected.
- [ ] Renders at 60fps on a mid-tier device; frame budget measured with `performance.now()`.
- [ ] CSS fallback radial layers look intentional when canvas is absent.
**Steps:**
- [ ] Step 1: Implement WebGL2 fullscreen quad with noise fragment shader.
- [ ] Step 2: Add pointer/scroll uniforms with damping (lerp 0.05).
- [ ] Step 3: Add WebGPU variant behind the same interface, or explicitly route WebGPU→WebGL2 if shader port is deferred.
- [ ] Step 4: Screenshot with and without canvas; compare readability.
**Verification:** 60fps check via DevTools Performance; screenshot review at 1440px.
**Dependencies:** 4.1
**Estimated scope:** M

#### Task 4.3: Scroll-driven displacement
**Files:** Modify `js/hero-canvas.js`, `js/main.js` (expose scroll progress via `window.__portfolioMotion`).
**Interfaces:** Consumes — `is-visible` state from 3.2 and scroll progress from motion API. Produces — scroll-linked canvas uniform.
**Description:** Tie a gentle vertex displacement to section reveal state so the canvas feels connected to the page rather than idling.
**Acceptance criteria:**
- [ ] Displacement responds to scroll within one frame; no idle wobble when page is still.
- [ ] Motion stops entirely under reduced motion.
- [ ] No layout reads inside the render loop (use cached values from motion API).
**Steps:**
- [ ] Step 1: Add `setScrollProgress(p)` to motion API writing to a cached property.
- [ ] Step 2: Read cached value in render loop; apply to shader uniform.
- [ ] Step 3: Confirm no `getBoundingClientRect`/`offsetHeight` in render path.
- [ ] Step 4: Verify stillness when scroll stops.
**Verification:** `node scripts/verify.mjs` layout-read check PASS; visual stillness check.
**Dependencies:** 4.2
**Estimated scope:** S

#### Task 4.4: Budget + kill switch
**Files:** Modify `js/hero-canvas.js`, `js/main.js`, `scripts/verify.mjs`.
**Interfaces:** Consumes — all prior motion/canvas APIs. Produces — final shipped behavior.
**Description:** Enforce the performance budget and provide a single global kill switch for motion/canvas on weak devices or reduced motion.
**Acceptance criteria:**
- [ ] Total JS ≤200 KB; canvas JS ≤20 KB minified equivalent.
- [ ] One `window.__portfolioMotion.destroy()` disables all motion and removes canvas.
- [ ] `prefers-reduced-motion` results in zero canvas creation.
**Steps:**
- [ ] Step 1: Add byte-size check to `scripts/verify.mjs`.
- [ ] Step 2: Wire destroy to reduced-motion change listener.
- [ ] Step 3: Measure total JS size; trim if over budget.
- [ ] Step 4: Final fallback test with JavaScript partially disabled.
**Verification:** `node scripts/verify.mjs` reports JS size PASS; reduced-motion browser test shows no `<canvas>` in DOM.
**Dependencies:** 4.3
**Estimated scope:** S

### Checkpoint 4
- [ ] All three renderer paths tested; 60fps; ≤200 KB JS; reduced-motion produces zero canvas.

---

### Phase 5 — Verify, Document, Ship

#### Task 5.1: Full re-audit
**Files:** Modify `CHANGELOG.md` (record results).
**Interfaces:** Consumes — all phases. Produces — final score table.
**Description:** Re-run every audit instrument and record before/after.
**Acceptance criteria:**
- [ ] Impeccable detect: 0 findings.
- [ ] Design-system 10-dimension score recorded (target ≥9.0).
- [ ] WIG audit: no open findings in checked categories.
**Steps:**
- [ ] Step 1: Run `impeccable.cmd detect index.html --json`; capture output.
- [ ] Step 2: Run design-system Mode 2 audit per skill; record 10 scores.
- [ ] Step 3: Re-run WIG rule checklist manually; close each item.
- [ ] Step 4: Write before/after table to `CHANGELOG.md`.
**Verification:** Detector exit 0; `CHANGELOG.md` contains both score rows.
**Dependencies:** 4.4
**Estimated scope:** S

#### Task 5.2: Responsive + accessibility browser pass
**Files:** No source changes unless defects found (loop back to owning task).
**Interfaces:** Consumes — shipped tree. Produces — sign-off evidence.
**Description:** Verify the three target widths and full keyboard/screen-reader path.
**Acceptance criteria:**
- [ ] 375px, 768px, 1440px screenshots reviewed; no horizontal scroll, no clipped text.
- [ ] All 8 links reachable by keyboard; focus ring visible; skip link works.
- [ ] Canvas decorative and hidden from assistive tech.
**Steps:**
- [ ] Step 1: Open local page at each width; screenshot and inspect.
- [ ] Step 2: Tab from top; verify order and skip link.
- [ ] Step 3: Toggle reduced motion; verify content parity.
- [ ] Step 4: Log any defect to `CHANGELOG.md` and loop back.
**Verification:** Screenshot set + keyboard log attached to `CHANGELOG.md`.
**Dependencies:** 5.1
**Estimated scope:** S

#### Task 5.3: Ship
**Files:** Modify `README.md`, `CHANGELOG.md`; git branch/PR/merge.
**Interfaces:** Consumes — signed-off tree. Produces — live GitHub Pages deployment.
**Description:** Document the final state and deliver through the existing GitHub Pages pipeline.
**Acceptance criteria:**
- [ ] `README.md` describes final structure and local preview command.
- [ ] One PR per phase squash-merged (or approved direct commits on `main`).
- [ ] Live URL `https://papabear911.github.io` verified after deployment.
**Steps:**
- [ ] Step 1: Update README with file map + `python -m http.server 8000` preview command.
- [ ] Step 2: For each phase: `git checkout -b phase-N`, commit, push, open PR, squash-merge.
- [ ] Step 3: After merge to `main`, wait for Pages build; open live URL.
- [ ] Step 4: Post-deploy smoke: detector against live URL + one keyboard pass.
**Verification:** Live URL loads with no console errors; `git status` clean on `main`.
**Dependencies:** 5.2
**Estimated scope:** M

### Checkpoint 5 — Ship Gate
- [ ] All detectors green; three-width browser pass signed off; live URL verified.
- [ ] `CHANGELOG.md` holds before/after evidence.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| No test framework makes "green" subjective | Medium | `scripts/verify.mjs` + detector give deterministic signals; every task names its command |
| WebGPU shader port delays Phase 4 | Medium | Route WebGPU→WebGL2 initially; ship WebGPU variant separately without blocking |
| Font swap changes layout (CLS) | Medium | `display=swap`, preconnect, explicit image dimensions; two-load visual check in 2.2 |
| Magnetic/terminal interactions alienate a minimal portfolio | Low | Keep effects ≤6px and opt-in; reduced-motion kills them; 3.4 keeps keyboard parity |
| Detector still flags "centered hero" after 2.1 | Low | Editorial left-align in 2.1; re-run detector at Checkpoint 2 |
| GitHub Pages build lag after merge | Low | 5.3 explicitly waits and re-smokes the live URL |
| PRODUCT.md inference wrong | High | Task 0.1 is a human confirmation gate; all copy tasks consume confirmed file |

## Open Questions

1. **PRODUCT.md truth** — Confirm the inferred roles/projects/philosophy, or provide corrections (Task 0.1).
2. **Branch-per-phase vs. direct edits** — git/gh support PRs; confirm the user wants 6 PRs rather than a single direct sequence.
3. **Verification tooling** — Accept `scripts/verify.mjs` in the repo, or prefer detector + manual checks only?
4. **WebGPU depth** — Ship WebGPU as a real second renderer in Phase 4, or intentionally route WebGPU→WebGL2 and defer the native path?
5. **Watermark asset** — Raise visibility or delete `brand-silhouette.png`? (Task 2.5 decides with a screenshot; confirm if the brand mark is sacred.)

---

## Execution Readiness

This document is a plan only. No implementation code has been written. Per the planning skills, execution begins after the user reviews and approves these phases — then route to `discipline-execute` (task-by-task with review gates) or `discipline-build` (full run), with `discipline-tdd` governing each task's verify cycle.
