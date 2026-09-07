# mico23.site homepage

A lightweight personal homepage for Mico Kelice. The site is plain HTML, CSS, and JavaScript, so it has no build step and no runtime dependencies.

## Run locally

Open `index.html` directly in a browser, or serve the folder with Python:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Customize

- Personal copy and project descriptions: `index.html`
- Colors, typography, spacing, and responsive layout: the variables and media queries in `styles.css`
- Hero artwork: `assets/biomedical-hero.png`
- Mobile menu and dynamic footer year: `script.js`

## Deploy

Upload the folder to a static host such as Cloudflare Pages. No build command is required; the output directory is the project root.
