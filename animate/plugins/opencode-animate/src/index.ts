import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { type Plugin, tool } from "@opencode-ai/plugin";

const execFileAsync = promisify(execFile);

function resolveSkillDir(worktree: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(worktree, ".opencode", "skills", "animate"),
    path.join(worktree, ".agents", "skills", "animate"),
    path.join(worktree, "plugins", "animate", "skills", "animate"),
    path.resolve(here, "../../animate/skills/animate"),
    path.resolve(here, "../../../.opencode/skills/animate"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "tools", "build.mjs"))) {
      return dir;
    }
  }
  throw new Error(
    `Could not locate animate skill tools directory. Checked: ${candidates.join(", ")}`
  );
}

async function runTool(
  worktree: string,
  toolRelPath: string,
  args: string[]
): Promise<string> {
  const skillDir = resolveSkillDir(worktree);
  const scriptPath = path.join(skillDir, "tools", toolRelPath);
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [scriptPath, ...args],
    {
      cwd: worktree,
      maxBuffer: 10 * 1024 * 1024,
    }
  );
  return [stdout.trim(), stderr.trim()].filter(Boolean).join("\n");
}

export const AnimatePlugin: Plugin = async (ctx) => {
  const worktree = ctx.worktree || ctx.directory || process.cwd();

  return {
    tool: {
      animate_gallery: tool({
        description:
          "Render the intake style gallery image (all built-in styles + project custom styles) so the user can choose a visual style.",
        args: {
          outPath: tool.schema
            .string()
            .describe("Output PNG path, e.g. gallery.png"),
          extraStylesDir: tool.schema
            .string()
            .optional()
            .describe("Optional project styles directory, e.g. styles"),
        },
        execute: async ({ outPath, extraStylesDir }) => {
          const args = [outPath];
          if (extraStylesDir) args.push(extraStylesDir);
          return await runTool(worktree, "gallery.mjs", args);
        },
      }),

      animate_build: tool({
        description:
          "Assemble a single self-contained <piece>/index.html from src/, kit/, style kit, beats.json, voice.json, and assets/.",
        args: {
          pieceDir: tool.schema
            .string()
            .describe("Piece directory path, e.g. pieces/my-piece"),
        },
        execute: async ({ pieceDir }) => {
          return await runTool(worktree, "build.mjs", [pieceDir]);
        },
      }),

      animate_still: tool({
        description:
          "Render 1 to 4 key timestamps side-by-side as a PNG for Look Check inspection.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          times: tool.schema
            .string()
            .describe("Comma-separated timestamps in seconds, e.g. 2.25,9.75,16.5"),
          outPath: tool.schema.string().describe("Output PNG path"),
          scale: tool.schema
            .number()
            .optional()
            .describe("Optional scale factor such as 0.5"),
          format: tool.schema
            .string()
            .optional()
            .describe("Optional aspect format override such as 9:16, 1:1, 16:9"),
        },
        execute: async ({ pieceDir, times, outPath, scale, format }) => {
          const args = [pieceDir, times, outPath];
          if (scale != null) args.push("--scale", String(scale));
          if (format) args.push("--format", format);
          return await runTool(worktree, "still.mjs", args);
        },
      }),

      animate_tile: tool({
        description:
          "Render a frame contact tile sheet across frame numbers and verify deterministic rendering.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          outPath: tool.schema.string().describe("Output PNG path"),
          frames: tool.schema
            .array(tool.schema.number())
            .describe("Frame indices to tile, e.g. [24, 48, 96]"),
          format: tool.schema.string().optional(),
        },
        execute: async ({ pieceDir, outPath, frames, format }) => {
          const args = [pieceDir, outPath, ...frames.map(String)];
          if (format) args.push("--format", format);
          return await runTool(worktree, "tile.mjs", args);
        },
      }),

      animate_storyboard: tool({
        description:
          "Render the full beat-by-beat storyboard panel sheet from TIMELINE.board.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          format: tool.schema.string().optional(),
        },
        execute: async ({ pieceDir, format }) => {
          const args = [pieceDir];
          if (format) args.push("--format", format);
          return await runTool(worktree, "storyboard.mjs", args);
        },
      }),

      animate_export: tool({
        description:
          "Export deterministic frames, synthesized/mixed WAV audio + stems, and MP4 renders via Playwright and ffmpeg.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          formats: tool.schema
            .string()
            .optional()
            .describe("Comma-separated formats, e.g. 9:16,1:1,16:9"),
          share: tool.schema
            .boolean()
            .optional()
            .describe("Also encode CRF 24 renders/share.mp4"),
          onlyAudio: tool.schema
            .boolean()
            .optional()
            .describe("Re-render audio score and remux without re-rendering frames"),
          blur: tool.schema
            .number()
            .optional()
            .describe("Sub-frame motion blur count for on-1s styles (e.g. 4)"),
        },
        execute: async ({ pieceDir, formats, share, onlyAudio, blur }) => {
          const args = [pieceDir];
          if (formats) args.push("--formats", formats);
          if (share) args.push("--share");
          if (onlyAudio) args.push("--only-audio");
          if (blur != null) args.push("--blur", String(blur));
          return await runTool(worktree, "export.mjs", args);
        },
      }),

      animate_review: tool({
        description:
          "Run measured QA checks (cut grid, morph grid, story arc loudness, anchor tracking, text overflow/overlap, LUFS, dead beats) and generate review contact sheets.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          format: tool.schema.string().optional(),
        },
        execute: async ({ pieceDir, format }) => {
          const args = [pieceDir];
          if (format) args.push("--format", format);
          return await runTool(worktree, "review.mjs", args);
        },
      }),

      animate_beats: tool({
        description:
          "Analyze an audio track (WAV/MP3/M4A) into beats.json with tempo, downbeats, drops, and loudest hit.",
        args: {
          audioPath: tool.schema.string().describe("Path to audio file"),
          pieceDir: tool.schema.string().describe("Piece directory path"),
          start: tool.schema.number().optional().describe("Start offset in seconds"),
          dur: tool.schema.number().optional().describe("Duration in seconds"),
          bpm: tool.schema.number().optional().describe("Known BPM override"),
        },
        execute: async ({ audioPath, pieceDir, start, dur, bpm }) => {
          const args = [audioPath, pieceDir];
          if (start != null) args.push("--start", String(start));
          if (dur != null) args.push("--dur", String(dur));
          if (bpm != null) args.push("--bpm", String(bpm));
          return await runTool(worktree, "beats.mjs", args);
        },
      }),

      animate_capture: tool({
        description:
          "Capture a clean screenshot of a user-owned product URL into <piece>/assets/ for embedding in the video.",
        args: {
          url: tool.schema.string().describe("Target URL to screenshot"),
          outPath: tool.schema
            .string()
            .describe("Output asset path, e.g. pieces/my-piece/assets/home.png"),
          selector: tool.schema.string().optional(),
          full: tool.schema.boolean().optional(),
          dark: tool.schema.boolean().optional(),
        },
        execute: async ({ url, outPath, selector, full, dark }) => {
          const args = [url, outPath];
          if (selector) args.push("--selector", selector);
          if (full) args.push("--full");
          if (dark) args.push("--dark");
          return await runTool(worktree, "capture.mjs", args);
        },
      }),

      animate_voice: tool({
        description:
          "Assemble voice/script.json takes (or --scratch timing voice) into voice/voice.wav and word-level voice.json.",
        args: {
          pieceDir: tool.schema.string().describe("Piece directory path"),
          scratch: tool.schema.boolean().optional(),
        },
        execute: async ({ pieceDir, scratch }) => {
          const args = [pieceDir];
          if (scratch) args.push("--scratch");
          return await runTool(worktree, "voice.mjs", args);
        },
      }),

      animate_measure_refs: tool({
        description:
          "Measure palette, aspect ratios, and accent colours from reference stills in a directory.",
        args: {
          refsDir: tool.schema.string().describe("Reference images directory"),
        },
        execute: async ({ refsDir }) => {
          return await runTool(worktree, path.join("measure", "refs.mjs"), [
            refsDir,
          ]);
        },
      }),

      animate_compare: tool({
        description:
          "Render a side-by-side comparison sheet between a reference image and a piece frame.",
        args: {
          refImage: tool.schema.string().describe("Path to reference image"),
          pieceDir: tool.schema.string().describe("Piece directory path"),
          time: tool.schema.number().describe("Frame time in seconds"),
          outPath: tool.schema.string().describe("Output PNG path"),
          autoTrim: tool.schema.boolean().optional(),
        },
        execute: async ({ refImage, pieceDir, time, outPath, autoTrim }) => {
          const args = [refImage, pieceDir, String(time), outPath];
          if (autoTrim) args.push("--auto-trim");
          return await runTool(worktree, "compare.mjs", args);
        },
      }),
    },
  };
};

export default AnimatePlugin;
