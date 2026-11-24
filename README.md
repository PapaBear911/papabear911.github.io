# papabear911.github.io

Personal animated landing page for Ver (PapaBear). Served by GitHub Pages from `main`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site - markup, CSS, and ~40 lines of JS in one file |
| `404.html` | Custom not-found page |
| `favicon.svg` | Scalable icon |
| `robots.txt`, `sitemap.xml` | Crawler hints |

## Design notes

- Semantic HTML5 landmarks, one `h1`, labelled sections, skip link, visible focus rings.
- Fluid type with `clamp()`, Grid/Flexbox layout, container queries on cards, light/dark via `prefers-color-scheme` plus a manual toggle stored in `localStorage`.
- Animation is CSS-only except an `IntersectionObserver` reveal. Everything is gated behind `prefers-reduced-motion: reduce`, and reveals stay visible when JS is off.
- Only transform/opacity animate, keeping work on the compositor.

## Local preview

```powershell
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Push to `main`; Pages serves the repository root.
