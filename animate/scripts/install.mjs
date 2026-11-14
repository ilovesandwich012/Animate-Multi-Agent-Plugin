#!/usr/bin/env node
// Cross-platform installer for Animate across Antigravity, OpenCode, Codex, and Claude Code.
// Usage:
//   node scripts/install.mjs --target all --scope project --dest /path/to/repo
//   node scripts/install.mjs --target antigravity --scope global
//   node scripts/install.mjs --target opencode --scope project --dest .
//   node scripts/install.mjs --target codex --scope global
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'plugins', 'animate', 'skills', 'animate');

const args = process.argv.slice(2);
function getOpt(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

const target = getOpt('target', 'all').toLowerCase();
const scope = getOpt('scope', 'global').toLowerCase();
const dest = path.resolve(getOpt('dest', process.cwd()));

const VALID_TARGETS = ['antigravity', 'opencode', 'codex', 'claude', 'all'];
if (!VALID_TARGETS.includes(target)) {
  console.error(`Invalid --target "${target}". Choose: ${VALID_TARGETS.join(', ')}`);
  process.exit(2);
}
if (!['global', 'project'].includes(scope)) {
  console.error(`Invalid --scope "${scope}". Choose: global, project`);
  process.exit(2);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

const home = os.homedir();
const plan = [];

const selected = target === 'all' ? ['antigravity', 'opencode', 'codex', 'claude'] : [target];

for (const t of selected) {
  if (t === 'antigravity') {
    const skillDest =
      scope === 'global'
        ? path.join(home, '.gemini', 'antigravity', 'skills', 'animate')
        : path.join(dest, '.agents', 'skills', 'animate');
    plan.push({ platform: 'antigravity', kind: 'skill', dst: skillDest });
  }
  if (t === 'opencode') {
    const skillDest =
      scope === 'global'
        ? path.join(home, '.config', 'opencode', 'skills', 'animate')
        : path.join(dest, '.opencode', 'skills', 'animate');
    const pluginDest =
      scope === 'global'
        ? path.join(home, '.config', 'opencode', 'plugins', 'opencode-animate')
        : path.join(dest, 'plugins', 'opencode-animate');
    plan.push({ platform: 'opencode', kind: 'skill', dst: skillDest });
    plan.push({
      platform: 'opencode',
      kind: 'plugin',
      src: path.join(ROOT, 'plugins', 'opencode-animate'),
      dst: pluginDest,
    });
  }
  if (t === 'codex') {
    const skillDest =
      scope === 'global'
        ? path.join(home, '.codex', 'skills', 'animate')
        : path.join(dest, '.codex', 'skills', 'animate');
    plan.push({ platform: 'codex', kind: 'skill', dst: skillDest });
  }
  if (t === 'claude') {
    const skillDest =
      scope === 'global'
        ? path.join(home, '.claude', 'skills', 'animate')
        : path.join(dest, '.claude', 'skills', 'animate');
    plan.push({ platform: 'claude', kind: 'skill', dst: skillDest });
  }
}

for (const item of plan) {
  const src = item.src || SOURCE;
  fs.rmSync(item.dst, { recursive: true, force: true });
  copyDir(src, item.dst);
  console.log(`[${item.platform}] installed ${item.kind} -> ${item.dst}`);
}

if (selected.includes('opencode') && scope === 'project') {
  const ocConfigPath = path.join(dest, 'opencode.json');
  if (!fs.existsSync(ocConfigPath)) {
    fs.writeFileSync(
      ocConfigPath,
      JSON.stringify(
        {
          $schema: 'https://opencode.ai/config.json',
          plugin: ['./plugins/opencode-animate/src/index.ts'],
          skills: ['.opencode/skills'],
          permission: { skill: { '*': 'allow' } },
        },
        null,
        2
      ) + '\n'
    );
    console.log(`[opencode] wrote ${ocConfigPath}`);
  }
}
