import fs from 'node:fs';

const requiredFiles = [
  'skills/index.html',
  'skills/skills.css',
  'resume/index.html',
  'data/profile.json',
  'sitemap.xml',
  'llms.txt',
  'README.md'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const html = fs.readFileSync('skills/index.html', 'utf8');
const css = fs.readFileSync('skills/skills.css', 'utf8');
const resume = fs.readFileSync('resume/index.html', 'utf8');
const profile = JSON.parse(fs.readFileSync('data/profile.json', 'utf8'));
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const llms = fs.readFileSync('llms.txt', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

const requiredHtml = [
  '<main id="main">',
  '<h1>Skills in the context of operating systems.</h1>',
  'Evidence levels',
  'Public implementation',
  'Public design',
  'Career experience',
  'System operating lifecycle',
  'Capability matrix',
  'Cloud & infrastructure',
  'Reliability engineering',
  'Distributed & data systems',
  'Delivery & automation',
  'Observability',
  'Application & integration systems',
  'Evidence boundary.',
  'https://github.com/rclevenger-hm/oci-ephemeral-resource-janitor',
  'https://github.com/rclevenger-hm/driver_license_authenticity_lambda',
  'https://github.com/rclevenger-hm/kafka-oci-deployment',
  'https://github.com/rclevenger-hm/oci-hadoop-job-automation',
  'https://github.com/rclevenger-hm/sports-gamecast',
  'https://rclevenger-hm.github.io/portfolio/skills/'
];

for (const token of requiredHtml) {
  if (!html.includes(token)) throw new Error(`Capability map missing required content: ${token}`);
}

if (/<script\s+[^>]*src=/i.test(html)) throw new Error('Capability map must not load external runtime scripts');
if (/https?:\/\/[^"'\s>]+\.css/i.test(html)) throw new Error('Capability map must not load external stylesheets');
if (!css.includes(':focus-visible')) throw new Error('Capability map must define visible keyboard focus');
if (!css.includes('@media(prefers-reduced-motion:reduce)')) throw new Error('Capability map must handle reduced-motion preference');
if (!css.includes('@media print')) throw new Error('Capability map must provide print styles');
if (!css.includes('@media(max-width:720px)')) throw new Error('Capability map must include a small-screen layout');

const htmlBytes = Buffer.byteLength(html);
const cssBytes = Buffer.byteLength(css);
const budget = 48 * 1024;
if (htmlBytes + cssBytes > budget) {
  throw new Error(`Capability map asset budget exceeded: ${htmlBytes + cssBytes} bytes > ${budget}`);
}

const canonical = 'https://rclevenger-hm.github.io/portfolio/skills/';
if (!resume.includes('../skills/')) throw new Error('Resume must link to the capability map');
if (profile.capabilityMapUrl !== canonical) throw new Error('Structured profile must expose capabilityMapUrl');
if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error('Sitemap must include capability map');
if (!llms.includes(`Capability evidence map: ${canonical}`)) throw new Error('Plain-text discovery must include capability map');
if (!readme.includes('[`skills/`](skills/)')) throw new Error('README must document the capability map');

console.log(`Capability evidence map validated: ${htmlBytes + cssBytes} bytes combined`);
