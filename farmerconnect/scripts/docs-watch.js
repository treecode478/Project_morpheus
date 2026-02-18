/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

const WATCH_PATHS = [
  path.join(REPO_ROOT, 'krishiconnect-backend', 'src'),
  path.join(REPO_ROOT, 'krishiconnect-backend', 'package.json'),
  path.join(REPO_ROOT, 'krishiconnect-backend', '.env.example'),
  path.join(REPO_ROOT, 'krishiconnect-web', 'src'),
  path.join(REPO_ROOT, 'krishiconnect-web', 'package.json'),
  path.join(REPO_ROOT, 'krishiconnect-web', '.env.example'),
];

function runUpdate() {
  const child = spawn(process.execPath, [path.join(__dirname, 'update-docs.js')], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    if (code !== 0) console.error(`update-docs exited with code ${code}`);
  });
}

function watchDirRecursive(dirPath, onChange) {
  if (!fs.existsSync(dirPath)) return [];

  const watchers = [];
  const stack = [dirPath];
  while (stack.length) {
    const current = stack.pop();
    try {
      const w = fs.watch(current, { persistent: true }, (eventType, filename) => {
        if (!filename) return;
        onChange(eventType, path.join(current, filename.toString()));
      });
      watchers.push(w);
    } catch {
      // ignore folders that can't be watched
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist' || ent.name === 'build') continue;
      stack.push(path.join(current, ent.name));
    }
  }
  return watchers;
}

function main() {
  console.log('📚 docs:watch started');
  console.log('Watching:');
  WATCH_PATHS.forEach((p) => console.log(`- ${p}`));

  let pending = false;
  let lastRun = 0;
  const debounceMs = 600;

  const schedule = () => {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      lastRun = Date.now();
      console.log('\n🔄 change detected → updating docs...\n');
      runUpdate();
    }, debounceMs);
  };

  runUpdate();

  const watchers = [];
  for (const p of WATCH_PATHS) {
    if (!fs.existsSync(p)) continue;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      watchers.push(...watchDirRecursive(p, schedule));
    } else {
      try {
        watchers.push(
          fs.watch(path.dirname(p), { persistent: true }, () => {
            const now = Date.now();
            if (now - lastRun < 300) return;
            schedule();
          })
        );
      } catch {
        // ignore
      }
    }
  }

  process.on('SIGINT', () => {
    watchers.forEach((w) => w.close());
    process.exit(0);
  });
}

main();

