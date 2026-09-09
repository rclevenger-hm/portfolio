import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,".."); let bad=false;
const required=["index.html","styles.css","experience.css","case-study-discovery.css","data/profile.json","llms.txt","sitemap.xml","case-studies/case-study.css","case-studies/oci-ephemeral-resource-janitor/index.html","projects/kafka-oci/index.html","projects/kafka-oci/case-study.css","admin/github/index.html","admin/github/app.js","admin/github/analytics.css","analytics-worker/index.js","analytics-worker/schema.sql","analytics-worker/wrangler.toml"];
for(const f of required) if(!existsSync(resolve(root,f))){console.error("missing",f);bad=true;}
const html=readFileSync(resolve(root,"index.html"),"utf8");
const css=readFileSync(resolve(root,"styles.css"),"utf8");
const experienceCss=readFileSync(resolve(root,"experience.css"),"utf8");
const discoveryCss=readFileSync(resolve(root,"case-study-discovery.css"),"utf8");
const llms=readFileSync(resolve(root,"llms.txt"),"utf8");
const sitemap=readFileSync(resolve(root,"sitemap.xml"),"utf8");
const caseStudy=readFileSync(resolve(root,"case-studies/oci-ephemeral-resource-janitor/index.html"),"utf8");
const caseCss=readFileSync(resolve(root,"case-studies/case-study.css"),"utf8");
const kafkaCaseStudy=readFileSync(resolve(root,"projects/kafka-oci/index.html"),"utf8");
const kafkaCaseCss=readFileSync(resolve(root,"projects/kafka-oci/case-study.css"),"utf8");
const admin=readFileSync(resolve(root,"admin/github/index.html"),"utf8");
const worker=readFileSync(resolve(root,"analytics-worker/index.js"),"utf8");
let profile={}; try{profile=JSON.parse(readFileSync(resolve(root,"data/profile.json"),"utf8"));}catch(e){console.error("profile JSON invalid",e.message);bad=true;}
for(const t of ["Skip to main content","application/ld+json","rel=\"alternate\" type=\"application/json\"","Public engineering evidence","Selected experience","Principal Site Reliability Engineer","Happy Money","NextVR","Local Corporation","Reliability decision model","Evidence & machine readability","Employer-proprietary systems","case-studies/oci-ephemeral-resource-janitor/","projects/kafka-oci/","project-actions"]) if(!html.includes(t)){console.error("index missing",t);bad=true;}
if(html.includes("oci-automated-resource-cleanup")){console.error("index contains retired OCI janitor repository path");bad=true;}
for(const t of ["prefers-reduced-motion","focus-visible","@media print","section-light","featured-project"]) if(!css.includes(t)){console.error("css missing",t);bad=true;}
for(const t of ["career-timeline","career-item","@media print"]) if(!experienceCss.includes(t)){console.error("experience CSS missing",t);bad=true;}
for(const t of ["project-actions","project-link-primary","project-link-secondary","@media print"]) if(!discoveryCss.includes(t)){console.error("discovery CSS missing",t);bad=true;}
for(const t of ["Automating resource cleanup without automating a bad day","Explicit ownership","Second interlock","Two-phase delete","Policy before mutation","Why this is SRE work","Boundary:"]) if(!caseStudy.includes(t)){console.error("OCI case study missing",t);bad=true;}
for(const t of ["prefers-reduced-motion","focus-visible","@media print","guardrail-flow","decision-diagram"]) if(!caseCss.includes(t)){console.error("case-study CSS missing",t);bad=true;}
for(const t of ["Kafka is only highly available when the recovery envelope is designed with the cluster","KRaft","Reference topology","Case study boundary"]) if(!kafkaCaseStudy.includes(t)){console.error("Kafka case study missing",t);bad=true;}
for(const t of ["prefers-reduced-motion","focus-visible","@media print"]) if(!kafkaCaseCss.includes(t)){console.error("Kafka case-study CSS missing",t);bad=true;}
for(const t of ["noindex,nofollow","GitHub Analytics","__ANALYTICS_API_BASE__","Attention is a directional"]) if(!admin.includes(t)){console.error("admin missing",t);bad=true;}
for(const t of ["GITHUB_ANALYTICS_TOKEN","traffic/views","traffic/clones","actor_state","GITHUB_OWNER"]) if(!worker.includes(t)){console.error("worker missing",t);bad=true;}
for(const t of ["Principal Site Reliability Engineer","Oracle","Happy Money","NextVR","Local Corporation","Sports Gamecast","OCI Ephemeral Resource Janitor","Kafka on OCI","case-studies/oci-ephemeral-resource-janitor","projects/kafka-oci/","Public portfolio boundary"]) if(!llms.includes(t)){console.error("llms.txt missing",t);bad=true;}
for(const t of ["/portfolio/case-studies/oci-ephemeral-resource-janitor/","/portfolio/projects/kafka-oci/","/portfolio/data/profile.json","/portfolio/llms.txt"]) if(!sitemap.includes(t)){console.error("sitemap missing",t);bad=true;}
if(profile.name!=="Roger Clevenger"||profile.title!=="Principal Site Reliability Engineer"||!Array.isArray(profile.publicProjects)||profile.publicProjects.length<4){console.error("structured profile missing required identity/project evidence");bad=true;}
if(!Array.isArray(profile.experience)||profile.experience.length<4||profile.experience[0]?.organization!=="Oracle"){console.error("structured profile missing required career trajectory");bad=true;}
for(const e of profile.experience||[]) if(!e.role||!e.organization||!Array.isArray(e.focus)){console.error("structured experience missing role/organization/focus",e.organization);bad=true;}
for(const p of profile.publicProjects||[]) if(!p.repository||!p.engineeringDecision||!p.boundary){console.error("structured project missing repository/decision/boundary",p.name);bad=true;}
const janitor=(profile.publicProjects||[]).find(p=>p.name==="OCI Ephemeral Resource Janitor"); if(!janitor?.caseStudy||!janitor.repository.endsWith("/oci-ephemeral-resource-janitor")){console.error("structured OCI janitor case-study evidence missing");bad=true;}
const kafka=(profile.publicProjects||[]).find(p=>p.name==="Kafka on OCI"); if(!kafka?.caseStudy||!kafka.repository.endsWith("/kafka-oci-deployment")){console.error("structured Kafka case-study evidence missing");bad=true;}
if(/ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+/.test(worker+admin+html+llms+caseStudy+kafkaCaseStudy+sitemap)){console.error("possible GitHub token embedded in source");bad=true;}
const bytes=statSync(resolve(root,"index.html")).size+statSync(resolve(root,"styles.css")).size+statSync(resolve(root,"experience.css")).size+statSync(resolve(root,"case-study-discovery.css")).size;
if(bytes>67000){console.error("core budget exceeded",bytes);bad=true}else console.log(`core assets: ${bytes}/67000 bytes`);
const caseBytes=statSync(resolve(root,"case-studies/oci-ephemeral-resource-janitor/index.html")).size+statSync(resolve(root,"case-studies/case-study.css")).size;
if(caseBytes>40000){console.error("OCI case-study budget exceeded",caseBytes);bad=true}else console.log(`OCI case-study assets: ${caseBytes}/40000 bytes`);
const kafkaBytes=statSync(resolve(root,"projects/kafka-oci/index.html")).size+statSync(resolve(root,"projects/kafka-oci/case-study.css")).size;
if(kafkaBytes>45000){console.error("Kafka case-study budget exceeded",kafkaBytes);bad=true}else console.log(`Kafka case-study assets: ${kafkaBytes}/45000 bytes`);
if(bad)process.exit(1); console.log("portfolio validation passed");
