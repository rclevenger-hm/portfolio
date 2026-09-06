import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,".."); let bad=false;
for(const f of ["index.html","styles.css","admin/github/index.html","admin/github/app.js","admin/github/analytics.css","analytics-worker/index.js","analytics-worker/schema.sql","analytics-worker/wrangler.toml"]) if(!existsSync(resolve(root,f))){console.error("missing",f);bad=true;}
const html=readFileSync(resolve(root,"index.html"),"utf8"), css=readFileSync(resolve(root,"styles.css"),"utf8"), admin=readFileSync(resolve(root,"admin/github/index.html"),"utf8"), worker=readFileSync(resolve(root,"analytics-worker/index.js"),"utf8");
for(const t of ["Skip to content","application/ld+json","Systems map","Operating controls"]) if(!html.includes(t)){console.error("index missing",t);bad=true;}
for(const t of ["prefers-reduced-motion","focus-visible","@media print"]) if(!css.includes(t)){console.error("css missing",t);bad=true;}
for(const t of ["noindex,nofollow","GitHub Analytics","__ANALYTICS_API_BASE__","Attention is a directional"]) if(!admin.includes(t)){console.error("admin missing",t);bad=true;}
for(const t of ["GITHUB_ANALYTICS_TOKEN","traffic/views","traffic/clones","actor_state","GITHUB_OWNER"]) if(!worker.includes(t)){console.error("worker missing",t);bad=true;}
if(/ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+/.test(worker+admin)){console.error("possible GitHub token embedded in source");bad=true;}
const bytes=statSync(resolve(root,"index.html")).size+statSync(resolve(root,"styles.css")).size; if(bytes>60000){console.error("core budget exceeded",bytes);bad=true}else console.log(`core assets: ${bytes}/60000 bytes`);
if(bad)process.exit(1); console.log("portfolio validation passed");
