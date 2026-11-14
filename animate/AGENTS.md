# AGENTS.md — Animate Multi-Agent Procedural Animation Plugin

This repository provides **Animate**, a procedural `<canvas>` + Web Audio animation engine and skill packaged for **Google Antigravity**, **OpenCode**, **OpenAI Codex CLI**, and **Claude Code**.

## Where the Skill Lives

- **Antigravity & Shared Agent Skills Standard:** `.agents/skills/animate/SKILL.md`
- **OpenCode:** `.opencode/skills/animate/SKILL.md` (plus custom tools registered via `opencode.json` and `plugins/opencode-animate/src/index.ts`)
- **OpenAI Codex CLI:** `.codex/skills/animate/SKILL.md` (and `.agents/skills/animate/SKILL.md`)
- **Claude Code:** `plugins/animate/skills/animate/SKILL.md`

All target directories are synchronized from `plugins/animate/skills/animate/` via `node scripts/sync-targets.mjs`.

## Core Workflow (Enforced Across All Agents)

1. **Intake (`intake.md`):** Ask only missing questions using the host's structured question tool or concise numbered options. Run `node <SKILL>/tools/gallery.mjs gallery.png` when the user needs to pick a style.
2. **Story Check:** Select a story format from `grammar/FORMATS.md`, verify every factual claim with web search, and present the beat table for approval before drawing.
3. **Look Check:** Build 2–4 key frames in `pieces/<name>/`, render side-by-side stills with `node <SKILL>/tools/still.mjs`, and get approval.
4. **Storyboard Check:** Populate `TIMELINE.board` and render `node <SKILL>/tools/storyboard.mjs pieces/<name>`. Do not animate full motion until the storyboard is approved.
5. **Build, Export & Review:**
   - `node <SKILL>/tools/build.mjs pieces/<name>`
   - `node <SKILL>/tools/tile.mjs pieces/<name> tile.png <frames...>`
   - `node <SKILL>/tools/export.mjs pieces/<name> --share`
   - `node <SKILL>/tools/review.mjs pieces/<name>`

## Non-Negotiables

- Deterministic rendering only (`RNG(...)`, boil index `B`). Never use `Math.random()` or `Date.now()`.
- Single-file self-contained `index.html` output (only `<piece>/assets/` screenshots/logos and exported music/voice tracks are permitted external inputs).
- Report measured `review.mjs` numbers (cut grid error, loudness LUFS, text check, dead beats) when delivering.
