#!/usr/bin/env node
// Synchronize the canonical animate skill (plugins/animate/skills/animate/)
// into the multi-agent discovery directories:
//   - .agents/skills/animate   (Antigravity & Open Agent Skills standard)
//   - .opencode/skills/animate (OpenCode project skills)
//   - .codex/skills/animate    (OpenAI Codex CLI project skills)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'plugins', 'animate', 'skills', 'animate');

const TARGETS = [
  path.join(ROOT, '.agents', 'skills', 'animate'),
  path.join(ROOT, '.opencode', 'skills', 'animate'),
  path.join(ROOT, '.codex', 'skills', 'animate'),
];

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(path.join(SOURCE, 'SKILL.md'))) {
  console.error(`Canonical skill not found at ${SOURCE}`);
  process.exit(1);
}

for (const target of TARGETS) {
  fs.rmSync(target, { recursive: true, force: true });
  copyDir(SOURCE, target);
  console.log(`Synced -> ${path.relative(ROOT, target)}`);
}
