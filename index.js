#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const name = process.argv[2] || 'my-gamvio-game';
const dest = path.resolve(name);

if (fs.existsSync(dest)) {
  console.error(`\x1b[31mError: Directory "${name}" already exists.\x1b[0m`);
  process.exit(1);
}

console.log(`
\x1b[36m  ╔═══════════════════════════════════════╗
  ║       🎮 Create Gamvio Game 🎮        ║
  ╚═══════════════════════════════════════╝\x1b[0m
`);

console.log(`Creating \x1b[32m${name}\x1b[0m...`);
console.log();

// Clone template
try {
  execSync(
    `git clone --depth 1 https://github.com/gamv-io/create-gamvio-game.git "${dest}"`,
    { stdio: 'pipe' }
  );
} catch {
  console.error('\x1b[31mFailed to clone template.\x1b[0m');
  process.exit(1);
}

// Clean up git and CLI files
fs.rmSync(path.join(dest, '.git'), { recursive: true, force: true });
fs.rmSync(path.join(dest, 'index.js'), { force: true });

// Update package.json
const pkgPath = path.join(dest, 'template', 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Move template contents to root
  const templateDir = path.join(dest, 'template');
  for (const file of fs.readdirSync(templateDir)) {
    fs.renameSync(path.join(templateDir, file), path.join(dest, file));
  }
  fs.rmdirSync(templateDir);
} else {
  // Fallback: package.json might be at root already
  const rootPkg = path.join(dest, 'package.json');
  if (fs.existsSync(rootPkg)) {
    const pkg = JSON.parse(fs.readFileSync(rootPkg, 'utf8'));
    pkg.name = name;
    delete pkg.bin;
    delete pkg.keywords;
    pkg.private = true;
    fs.writeFileSync(rootPkg, JSON.stringify(pkg, null, 2) + '\n');
  }
}

// Remove CLI-specific files
for (const f of ['index.js', 'LICENSE']) {
  const fp = path.join(dest, f);
  if (fs.existsSync(fp)) fs.rmSync(fp);
}

console.log(`\x1b[32m✅ Done!\x1b[0m

  cd ${name}
  cp .env.example .env.local    # Add your SDK credentials
  npm install
  npm run dev

  📖 Docs: https://gamv.io/developers/docs
  🔑 Get SDK keys: https://dev.gamv.io
`);
