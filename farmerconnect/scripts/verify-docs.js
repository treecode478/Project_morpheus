/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const REQUIRED = [
  'INDEX.md',
  'PROJECT_OVERVIEW.md',
  'SETUP_GUIDE.md',
  'API_DOCUMENTATION.md',
  'DATABASE_SCHEMA.md',
  'ARCHITECTURE.md',
  'FRONTEND_GUIDE.md',
  'BACKEND_GUIDE.md',
  'FEATURES.md',
  'TROUBLESHOOTING.md',
  'DEPLOYMENT.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'GLOSSARY.md',
  '.docmeta.json',
];

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('❌ docs directory missing. Run: npm run update-docs');
    process.exit(1);
  }

  let ok = true;
  for (const f of REQUIRED) {
    const p = path.join(DOCS_DIR, f);
    if (!fs.existsSync(p)) {
      console.error(`❌ missing: docs/${f}`);
      ok = false;
      continue;
    }
    const size = fs.statSync(p).size;
    if (size < 10) {
      console.error(`❌ empty/too small: docs/${f}`);
      ok = false;
    } else {
      console.log(`✅ docs/${f} (${size} bytes)`);
    }
  }

  if (!ok) process.exit(1);
  console.log('✨ docs verification passed');
}

main();

