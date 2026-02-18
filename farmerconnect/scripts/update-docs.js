/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..'); // farmerconnect/
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const META_PATH = path.join(DOCS_DIR, '.docmeta.json');

const BACKEND_DIR = path.join(REPO_ROOT, 'krishiconnect-backend');
const WEB_DIR = path.join(REPO_ROOT, 'krishiconnect-web');

const BACKEND_PKG = path.join(BACKEND_DIR, 'package.json');
const WEB_PKG = path.join(WEB_DIR, 'package.json');
const BACKEND_ENV_EXAMPLE = path.join(BACKEND_DIR, '.env.example');
const WEB_ENV_EXAMPLE = path.join(WEB_DIR, '.env.example');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function listFilesRecursive(dirPath, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dirPath)) return out;

  const stack = [dirPath];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build' || ent.name === '.git') continue;
        stack.push(full);
      } else if (ent.isFile() && predicate(full)) {
        out.push(full);
      }
    }
  }
  return out;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function bumpPatch(version) {
  const parts = String(version || '0.0.0').split('.').map((n) => parseInt(n, 10));
  const [maj = 0, min = 0, pat = 0] = parts.map((n) => (Number.isFinite(n) ? n : 0));
  return `${maj}.${min}.${pat + 1}`;
}

function nowIso() {
  return new Date().toISOString();
}

function rel(p) {
  return path.relative(REPO_ROOT, p).replaceAll('\\', '/');
}

function parseMountedPrefixes(appJsText) {
  const re = /app\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z0-9_]+)\s*\)/g;
  const map = new Map();
  let m;
  while ((m = re.exec(appJsText)) !== null) {
    map.set(m[2], m[1]);
  }
  return map;
}

function parseRoutesFile(fileText) {
  const re = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,([^;]+)\);/gi;
  const endpoints = [];
  let m;
  while ((m = re.exec(fileText)) !== null) {
    endpoints.push({
      method: m[1].toUpperCase(),
      path: m[2],
      handlers: m[3].trim().replace(/\s+/g, ' '),
    });
  }
  return endpoints;
}

function summarizeEnv(envText) {
  const lines = envText.split(/\r?\n/);
  const vars = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars.push({ key: trimmed.slice(0, eq).trim(), value: trimmed.slice(eq + 1).trim() });
  }
  return vars;
}

function mdTable(rows) {
  if (!rows.length) return '_None._\n';
  const headers = Object.keys(rows[0]);
  const headerLine = `| ${headers.join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${headers.map((h) => String(r[h] ?? '')).join(' | ')} |`)
    .join('\n');
  return `${headerLine}\n${sepLine}\n${body}\n`;
}

function generateDocs(context) {
  const {
    generatedAt,
    docsVersion,
    sourceHash,
    backendPkg,
    webPkg,
    backendEnv,
    backendAppRoutes,
    backendEndpoints,
    backendModels,
    frontendRoutes,
    frontendPages,
  } = context;

  const apiUrl = backendEnv.find((v) => v.key === 'API_URL')?.value || 'http://localhost:5000';
  const mongoUri = backendEnv.find((v) => v.key === 'MONGODB_URI')?.value || 'mongodb://localhost:27017/krishiconnect';

  return {
    'INDEX.md': `# Documentation Index

**Last generated:** ${generatedAt}  
**Docs version:** ${docsVersion}

- [Project Overview](./PROJECT_OVERVIEW.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Backend Guide](./BACKEND_GUIDE.md)
- [Frontend Guide](./FRONTEND_GUIDE.md)
- [Features](./FEATURES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Deployment](./DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Glossary](./GLOSSARY.md)
`,

    'PROJECT_OVERVIEW.md': `# Project Overview — KrishiConnect

**Last generated:** ${generatedAt}  
**Docs version:** ${docsVersion}  
**Source hash:** \`${sourceHash.slice(0, 12)}\`

## Packages
- Backend: \`${backendPkg.name}@${backendPkg.version}\`
- Web: \`${webPkg.name}@${webPkg.version}\`

## Tech stack

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Redis (optional)
- JWT (access + refresh)
- Nodemailer (SMTP email OTP)
- Twilio (optional SMS OTP)
- Socket.IO

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Zustand
- React Query
- React Hook Form + Zod
`,

    'SETUP_GUIDE.md': `# Setup Guide

**Last generated:** ${generatedAt}

## Prerequisites
- Node.js 18+
- MongoDB 7+
- Redis 7+ (optional)

## Backend

\`\`\`bash
cd farmerconnect/krishiconnect-backend
npm install
cp .env.example .env
npm run dev
\`\`\`

API base: \`${apiUrl}/api/v1\`

## Frontend

\`\`\`bash
cd farmerconnect/krishiconnect-web
npm install
cp .env.example .env
npm run dev
\`\`\`

## Docs auto-update

Run from backend folder:

\`\`\`bash
npm run update-docs
npm run docs:watch
npm run verify-docs
\`\`\`
`,

    'ARCHITECTURE.md': `# Architecture

**Last generated:** ${generatedAt}

## High-level

\`\`\`
React (Vite)  --->  Express API (/api/v1)  ---> MongoDB (Mongoose)
                     |        |
                     |        +--> Redis (optional)
                     +--> Socket.IO
                     +--> Nodemailer (SMTP)
                     +--> Twilio (optional)
\`\`\`

## Auth flows
- Phone registration: \`POST /auth/register\` → SMS OTP → \`POST /auth/verify-otp\`
- Email registration: \`POST /auth/register\` (with email) → Email OTP → \`POST /auth/verify-registration-otp\`
- Forgot password (email OTP): \`POST /auth/forgot-password\` → \`POST /auth/reset-password\`
`,

    'API_DOCUMENTATION.md': `# API Documentation

**Last generated:** ${generatedAt}

## Base URL
- \`${apiUrl}/api/v1\`

## Route prefixes (from backend \`src/app.js\`)
${mdTable(
  backendAppRoutes.map((r) => ({
    module: r.module,
    prefix: r.prefix,
    file: `\`${r.file}\``,
  }))
)}

## Endpoints (parsed from \`*.routes.js\`)
${backendEndpoints
  .map(
    (mod) => `### ${mod.module} (\`${mod.prefix}\`)

${mdTable(
  mod.endpoints.map((e) => ({
    method: e.method,
    path: `\`${mod.prefix}${e.path.startsWith('/') ? e.path : `/${e.path}`}\``,
    handlers: `\`${e.handlers}\``,
  }))
)}
`
  )
  .join('\n')}

## Response envelope
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "string",
  "data": {},
  "meta": {},
  "timestamp": "ISO-8601"
}
\`\`\`
`,

    'DATABASE_SCHEMA.md': `# Database Schema (MongoDB / Mongoose)

**Last generated:** ${generatedAt}

## Connection
- \`${mongoUri}\`

## Collections / Models
${mdTable(
  backendModels.map((m) => ({
    model: `\`${m.name}\``,
    file: `\`${m.file}\``,
  }))
)}

## OTP storage
- Phone OTP: Redis keys like \`otp:<phoneNumber>\`
- Email OTP: MongoDB collection \`otps\`
`,

    'BACKEND_GUIDE.md': `# Backend Guide

**Last generated:** ${generatedAt}

## Entry points
- \`src/server.js\`: starts DB/Redis + HTTP server + Socket.IO
- \`src/app.js\`: middleware + routes

## Modules
${backendAppRoutes.map((r) => `- \`${r.prefix}\` → \`${r.file}\``).join('\n')}

## Email/OTP
- \`src/config/nodemailer.js\`
- \`src/services/emailService.js\`
- \`src/services/otpService.js\`
`,

    'FRONTEND_GUIDE.md': `# Frontend Guide

**Last generated:** ${generatedAt}

## Routes (from \`src/App.jsx\`)
${mdTable(frontendRoutes.map((r) => ({ path: `\`${r.path}\``, component: `\`${r.component}\`` })))}

## Pages
${frontendPages.map((p) => `- \`${p}\``).join('\n')}

## API client
- \`src/services/api.js\`: axios baseURL = \`VITE_API_URL + /api/v1\`
`,

    'FEATURES.md': `# Features

**Last generated:** ${generatedAt}

## Backend
- Auth, users, posts, chat (Socket.IO), Q&A, notifications, market, weather
- Email OTP (Nodemailer) for registration/login and forgot password

## Frontend
- Home, Login, Register, Forgot Password
- Feed, Profile, Chat, Q&A, Market, Weather
`,

    'TROUBLESHOOTING.md': `# Troubleshooting

**Last generated:** ${generatedAt}

## Email not sending
- Check \`SMTP_HOST\`, \`SMTP_PORT\`, \`SMTP_USER\`, \`SMTP_PASSWORD\` in backend \`.env\`.

## Phone OTP not verifying
- Ensure Redis is reachable if you rely on strict OTP verification.
`,

    'DEPLOYMENT.md': `# Deployment

**Last generated:** ${generatedAt}

- Configure MongoDB (Atlas) and optionally Redis
- Configure SMTP provider for Nodemailer
- Lock down CORS (\`CLIENT_URL\`)
`,

    'CONTRIBUTING.md': `# Contributing

**Last generated:** ${generatedAt}

- Run \`npm run lint\` and \`npm test\` in backend where applicable.
- Update docs with \`npm run update-docs\`.
`,

    'GLOSSARY.md': `# Glossary

- **OTP**: One-time password (6-digit code)
- **Access token**: JWT used for API requests
- **Refresh token**: JWT used to mint new access tokens
`,
  };
}

function buildContext() {
  const backendPkg = readJson(BACKEND_PKG);
  const webPkg = readJson(WEB_PKG);

  const backendEnv = summarizeEnv(safeRead(BACKEND_ENV_EXAMPLE));
  const webEnv = summarizeEnv(safeRead(WEB_ENV_EXAMPLE)); // reserved for future use

  const appJsPath = path.join(BACKEND_DIR, 'src', 'app.js');
  const appJsText = safeRead(appJsPath);
  const mountMap = parseMountedPrefixes(appJsText); // variableName -> prefix

  const routeFiles = listFilesRecursive(path.join(BACKEND_DIR, 'src', 'modules'), (p) => p.endsWith('.routes.js'));
  const backendAppRoutes = routeFiles.map((file) => {
    const base = path.basename(file);
    const varMatch = new RegExp(
      `const\\s+([A-Za-z0-9_]+)\\s*=\\s*require\\(['"\`]\\.\\/modules\\/.+\\/${base.replace('.', '\\.')}'\\)`
    ).exec(appJsText);
    const variable = varMatch?.[1] || base.replace('.routes.js', 'Routes');
    const prefix = mountMap.get(variable) || '(unknown prefix)';
    return { module: base.replace('.routes.js', ''), file: rel(file), prefix };
  });

  const backendEndpoints = backendAppRoutes
    .map((r) => {
      const abs = path.join(REPO_ROOT, r.file);
      return { ...r, endpoints: parseRoutesFile(safeRead(abs)) };
    })
    .sort((a, b) => a.prefix.localeCompare(b.prefix));

  const modelFiles = listFilesRecursive(path.join(BACKEND_DIR, 'src', 'modules'), (p) => p.endsWith('.model.js'));
  const backendModels = modelFiles.map((file) => ({ name: path.basename(file).replace('.model.js', ''), file: rel(file) }));

  const appJsxPath = path.join(WEB_DIR, 'src', 'App.jsx');
  const appJsxText = safeRead(appJsxPath);
  const frontendRoutes = [];
  const routeRe = /<Route\s+path="([^"]+)"\s+element={<([A-Za-z0-9_]+)\s*\/>}/g;
  let m;
  while ((m = routeRe.exec(appJsxText)) !== null) {
    frontendRoutes.push({ path: `/${m[1]}`.replaceAll('//', '/'), component: m[2] });
  }
  if (appJsxText.includes('<Route index element={<Home />}')) {
    frontendRoutes.unshift({ path: '/', component: 'Home' });
  }

  const pageFiles = listFilesRecursive(path.join(WEB_DIR, 'src', 'pages'), (p) => p.endsWith('.jsx'));
  const frontendPages = pageFiles.map((f) => rel(f));

  const sources = [
    BACKEND_PKG,
    WEB_PKG,
    BACKEND_ENV_EXAMPLE,
    WEB_ENV_EXAMPLE,
    appJsPath,
    appJsxPath,
    ...routeFiles,
    ...modelFiles,
    ...pageFiles,
  ];
  const hashInput = sources
    .filter((p) => fs.existsSync(p))
    .sort()
    .map((p) => `${rel(p)}\n${fs.statSync(p).mtimeMs}\n${sha256(safeRead(p))}\n`)
    .join('\n');
  const sourceHash = sha256(hashInput);

  let prevMeta = null;
  if (fs.existsSync(META_PATH)) {
    try {
      prevMeta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    } catch {
      prevMeta = null;
    }
  }
  const docsVersion =
    prevMeta && prevMeta.sourceHash === sourceHash ? prevMeta.docsVersion : bumpPatch(prevMeta?.docsVersion || '1.0.0');

  return {
    generatedAt: nowIso(),
    docsVersion,
    sourceHash,
    backendPkg,
    webPkg,
    backendEnv,
    webEnv,
    backendAppRoutes,
    backendEndpoints,
    backendModels,
    frontendRoutes,
    frontendPages,
  };
}

function writeDocs(context) {
  ensureDir(DOCS_DIR);
  const docs = generateDocs(context);
  for (const [name, content] of Object.entries(docs)) {
    fs.writeFileSync(path.join(DOCS_DIR, name), content, 'utf8');
  }

  // Changelog (prepend)
  const changelogPath = path.join(DOCS_DIR, 'CHANGELOG.md');
  const prev = safeRead(changelogPath);
  const header = '# Changelog\n\n';
  const entry = `## ${context.docsVersion} — ${context.generatedAt}\n\n- Automated documentation update.\n- Source hash: \`${context.sourceHash.slice(0, 12)}\`\n\n`;
  const next = prev.startsWith('# Changelog') ? `${header}${entry}${prev.slice(header.length)}` : `${header}${entry}${prev}`;
  fs.writeFileSync(changelogPath, next.trimEnd() + '\n', 'utf8');

  fs.writeFileSync(
    META_PATH,
    JSON.stringify(
      {
        docsVersion: context.docsVersion,
        generatedAt: context.generatedAt,
        sourceHash: context.sourceHash,
        backend: { name: context.backendPkg.name, version: context.backendPkg.version },
        web: { name: context.webPkg.name, version: context.webPkg.version },
      },
      null,
      2
    ),
    'utf8'
  );
}

function updateReadmes(context) {
  const farmerReadme = path.join(REPO_ROOT, 'README.md');
  const content = `# 🌾 KrishiConnect

Production-grade social platform for Indian farmers.

**Last docs update:** ${context.generatedAt}  
**Docs version:** ${context.docsVersion}

## Project structure

- \`krishiconnect-backend/\`: Node.js + Express API
- \`krishiconnect-web/\`: React (Vite) frontend
- \`docs/\`: Generated project documentation

## Quick start

### Backend

\`\`\`bash
cd krishiconnect-backend
npm install
cp .env.example .env
npm run dev
\`\`\`

### Frontend

\`\`\`bash
cd krishiconnect-web
npm install
cp .env.example .env
npm run dev
\`\`\`

## Documentation

- Docs index: \`docs/INDEX.md\`

From backend folder:

\`\`\`bash
npm run update-docs
npm run docs:watch
npm run verify-docs
\`\`\`
`;
  fs.writeFileSync(farmerReadme, content, 'utf8');

  // Workspace root has a lowercase readme.md; keep as a pointer
  const rootReadme = path.resolve(REPO_ROOT, '..', 'readme.md');
  if (fs.existsSync(rootReadme)) {
    fs.writeFileSync(
      rootReadme,
      `# KrishiConnect\n\nDocumentation and setup live in \`farmerconnect/README.md\`.\n\nLast docs update: ${context.generatedAt}\n`,
      'utf8'
    );
  }
}

function main() {
  const context = buildContext();
  writeDocs(context);
  updateReadmes(context);
  console.log(`✅ docs generated at ${rel(DOCS_DIR)} (v${context.docsVersion})`);
}

main();

