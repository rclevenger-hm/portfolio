import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,".."); let bad=false;
const required=["index.html","styles.css","data/profile.json","llms.txt","admin/github/index.html","admin/github/app.js","admin/github/analytics.css","analytics-worker/index.js","analytics-worker/schema.sql","analytics-worker/wrangler.toml"];
for(const f of required) if(!existsSync(resolve(root,f))){console.error("missing",f);bad=true;}
const html=readFileSync(resolve(root,"index.html"),"utf8");
const css=readFileSync(resolve(root,"styles.css"),"utf8");
const llms=readFileSync(resolve(root,"llms.txt"),"utf8");
const admin=readFileSync(resolve(root,"admin/github/index.html"),"utf8");
const worker=readFileSync(resolve(root,"analytics-worker/index.js"),"utf8");
let profile={}; try{profile=JSON.parse(readFileSync(resolve(root,"data/profile.json"),"utf8"));}catch(e){console.error("profile JSON invalid",e.message);bad=true;}
for(const t of ["Skip to main content","application/ld+json","rel=\"alternate\" type=\"application/json\"","Public engineering evidence","Reliability decision model","Evidence & machine readability"]) if(!html.includes(t)){console.error("index missing",t);bad=true;}
for(const t of ["prefers-reduced-motion","focus-visible","@media print","section-light","featured-project"]) if(!css.includes(t)){console.error("css missing",t);bad=true;}
for(const t of ["noindex,nofollow","GitHub Analytics","__ANALYTICS_API_BASE__","Attention is a directional"]) if(!admin.includes(t)){console.error("admin missing",t);bad=true;}
for(const t of ["GITHUB_ANALYTICS_TOKEN","traffic/views","traffic/clones","actor_state","GITHUB_OWNER"]) if(!worker.includes(t)){console.error("worker missing",t);bad=true;}
for(const t of ["Principal Site Reliability Engineer","Sports Gamecast","OCI Resource Cleanup","Kafka on OCI"]) if(!llms.includes(t)){console.error("llms.txt missing",t);bad=true;}
if(profile.name!=="Roger Clevenger"||profile.title!=="Principal Site Reliability Engineer"||!Array.isArray(profile.publicProjects)||profile.publicProjects.length<4){console.error("structured profile missing required identity/project evidence");bad=true;}
for(const p of profile.publicProjects||[]) if(!p.repository||!p.engineeringDecision||!p.boundary){console.error("structured project missing repository/decision/boundary",p.name);bad=true;}
if(/ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+/.test(worker+admin+html+llms)){console.error("possible GitHub token embedded in source");bad=true;}
const bytes=statSync(resolve(root,"index.html")).size+statSync(resolve(root,"styles.css")).size;
if(bytes>60000){console.error("core budget exceeded",bytes);bad=true}else console.log(`core assets: ${bytes}/60000 bytes`);
if(bad)process.exit(1); console.log("portfolio validation passed");
