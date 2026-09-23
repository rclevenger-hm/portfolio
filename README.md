# Roger Clevenger — Principal SRE Portfolio

A dependency-light GitHub Pages portfolio focused on inspectable engineering evidence rather than résumé-template styling.

## Capability evidence map

The public capability map is available at [`skills/`](skills/). It connects cloud, reliability, delivery, observability, and distributed-systems skills to operating concerns and labels each claim as public implementation, public design, or career experience.

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
node scripts/validate-capabilities.mjs
node scripts/validate-architecture.mjs
```

The site validates required accessibility hooks and small HTML/CSS performance budgets. The capability map additionally verifies evidence labeling, discovery links, and public repository grounding. The architecture atlas has a dependency-light validation check for accessible diagrams and public evidence links.

## Deployment

GitHub Actions validates pull requests and publishes `main` to GitHub Pages after merge.
