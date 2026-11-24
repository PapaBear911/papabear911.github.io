# Refinement — Portfolio Hardening Pass (2026-11-24)

**Status:** active refinement. Supersedes `portfolio-masterplan.md` where they conflict.

## Why the masterplan was challenged

`portfolio-masterplan.md` describes a different repository than the one on disk:

| Masterplan assumed | Reality after `d774c85..1a7af0b` |
|---|---|
| `style.css` + `brand-silhouette.png` | Deleted; all CSS is inline in a single `index.html` |
| Dark, generic portfolio to be replaced | Working light/dark site with a coherent voice and theme toggle |
| WebGPU → WebGL2 → CSS hero field | Not present; not required by product truth |
| Six phases / 23 microtasks / one PR per phase | Several structural tasks already done; repo advances on `main` |
| Editorial-hero + brutalist cards + amber/cyan world | Would be a new visual world, discarding working truth |

**Verdict:** do not execute the stale plan linearly. Keep what it got right (WCAG AA floor, no slop, no invented claims, detector + verifier, JS extraction), drop the canvas/world rewrite, and run a focused hardening pass against the site that exists.

## Audit evidence (this refinement)

- Impeccable detector: `[]` (clean) — narrow structural rules only.
- `node scripts/verify.mjs`: 15/15 pass.
- Hallmark `sloplint` baseline (recorded in `.hallmark/before.txt` / `before.json`): **13 FAIL, 12 REFLEX, 3 WARN**.
- Render tier unavailable (`puppeteer-core` not installed); contrast and layout claims are code-level, not screenshot-verified.

### Hallmark FAILs — all to fix in this pass

1. `7a` pure `#fff` on `.btn-primary` (light + theme override) → tint toward accent.
2. `19` em dash in `<title>` → replace with colon.
3. `34` missing `overflow-x: clip` on `html` and `body`.
4. `48` literal `#f59e0b` and `#fff` outside tokens → declare as tokens (`--accent-2-glow`, `--on-accent`).
5. `50` `.hero-grid` `1.35fr` bare track holding an image → `minmax(0, 1.35fr)`.
6. `63` middle-dot meta string in VER work item → separate with line breaks / hairlines.
7. `67` caps abbreviations in body (`EMR/EHR`, `.NET / ASP.NET`) at 14px → sentence case in body face.

### Reflexes to fix or answer

- `7b` pure white theme surfaces → tokenised off-white surfaces (already themed; reflex is about literal white).
- `26b` no `:active` / `:disabled` styling → add minimal states for interactive controls.
- `38iii` accented word in heading → **waive**: the coloured phrase is the one-time signature of this site's own voice; guard is that it appears once, in the hero, and the theme names it (`signature: survive contact` in the stamp).
- `42` default nav shape → **dismiss**: 5 links + CTA in a single hairline header is appropriate for a one-page portfolio; no second-level IA to reveal.
- `58` word budget → **dismiss**: all copy is first-party product truth and the user chose focused hardening, not a copy rewrite; the "facts" are real counts, not invented metrics.

## Product truth (unchanged, from `PRODUCT.md`)

- Name: Ver Sangil / PapaBear911. Audience: hiring managers, leads, clients.
- Tagline: "Healthcare systems that survive contact with production."
- Philosophy: **Audit → Act → Persist → Repeat**.
- Projects: VER, OpenTeamQueue, MEDIX-MCP, SENTINEL, HIS modernization.
- No invented claims, metrics, testimonials, or logo walls.

## Decisions

1. **No WebGPU/WebGL2 canvas.** Decorative complexity with no product requirement.
2. **No design-system rewrite or `design-preview.html`.** The token block already exists and works across both themes.
3. **No `DESIGN.md` from inference.** The impeccable context flagged `PRODUCT.md` as schema-legacy; the user did not ask for an init, so no re-interview here.
4. **Keep the current visual world and voice.** Fix mechanics, not identity.
5. **Contact paths:** user chose "add a LinkedIn / calendar / other URL" and later supplied real values — LinkedIn `https://www.linkedin.com/in/versangil/`, email `versangil@gmail.com`, Facebook `https://www.facebook.com/verssangil/`. Added to the contact CTAs, footer nav, and JSON-LD `sameAs`. The earlier `CONTACT_URL` empty-slot idea is obsolete.
6. **Scope:** focused hardening (user-confirmed). Preserve every fact and wiring (`--kept` baseline recorded).

## Implementation checklist (bounded)

- [x] Hallmark stamp + critique line as first non-empty CSS lines (gate 20).
- [x] Tokenise `#f59e0b` and `#fff`; tint button foreground; tokenise off-white surfaces (`--surface: #fdfdff`).
- [x] `overflow-x: clip` on `html` and `body`.
- [x] Replace em dashes in copy; replace middle-dot meta with commas ("VER: Visualize, Engineer, Release", "Work, Featured", footer).
- [x] `minmax(0, 1.35fr)` / `minmax(0, .65fr)` on `.hero-grid`.
- [x] Body acronyms wrapped in `<abbr>` / `<code>` (semantic exemption, keeps real casing): `EMR/EHR`, `.NET`, `ASP.NET`, `MCP`, `RAG`, `HTML5`, `CSS`.
- [x] Add `:active` and `:disabled`/`[aria-disabled]` states for controls.
- [x] Add user-supplied contact paths (email, LinkedIn, Facebook) to contact CTAs, footer, and JSON-LD.
- [x] Add verifier checks for the new invariants (hallmark stamp, overflow-x, no literal colours outside tokens, no middle-dot meta); verify.mjs now 19/19.
- [x] Re-run Hallmark sloplint (0 FAIL / 0 REFLEX / 0 WARN, kept 10/10 links + 3/3 hooks), impeccable detect (`[]`), verifier (19/19), `git diff --check` (clean).

### Final verification result (this pass)

- Hallmark: `fails 0, reflex 0, warns 0, waived 1, dismissed 3, rejected 0`. Kept-diff: `links 10/10, script hooks 3/3; before 13 FAIL / 12 REFLEX, now 0 / 0`.
- `node scripts/verify.mjs`: **19 passed, 0 failed**.
- Impeccable detect: `[]`. `git diff --check`: clean. JSON-LD parses with all three `sameAs` profiles.
- Render tier still unavailable (no `puppeteer-core`); contrast/layout remain code-level, not screenshot-verified.

## Out of scope (deferred, with reason)

- Canvas depth layer — no product need.
- Copy rewrite / word budget — user chose focused hardening; content is product truth.
- Full Hallmark redesign — would require a theme deal and a much larger diff.
- Browser screenshot verification — no render tier / puppeteer available in this session.

## Status

Complete. Contact paths were supplied and wired. No open items from this pass. Outstanding (not requested): browser screenshot verification once a render tier is available.
