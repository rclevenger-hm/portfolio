# Roger Clevenger — Principal SRE Portfolio

A dependency-light GitHub Pages portfolio focused on inspectable engineering evidence rather than résumé-template styling.

## Local preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Validation

```bash
node scripts/validate.mjs
```

The site validates required accessibility hooks and a small core HTML/CSS performance budget.

## Deployment

GitHub Actions validates pull requests and publishes `main` to GitHub Pages after merge.
