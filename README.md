# Roger Clevenger — Principal SRE Portfolio

A dependency-light GitHub Pages portfolio focused on inspectable engineering evidence rather than résumé-template styling.

## Architecture atlas

The public systems architecture page is available at [`architecture/`](architecture/). It compares four projects through data flow, control boundaries, failure surfaces, verification, and explicit evidence boundaries.

## Local preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Validation

```bash
node scripts/validate.mjs
node scripts/validate-architecture.mjs
```

The site validates required accessibility hooks and small HTML/CSS performance budgets. The architecture atlas has an additional dependency-light validation check for accessible diagrams and public evidence links.

## Deployment

GitHub Actions validates pull requests and publishes `main` to GitHub Pages after merge.
