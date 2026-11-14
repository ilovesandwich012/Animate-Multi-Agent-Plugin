import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import express from 'express';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANIMATE_ROOT = path.resolve(__dirname, 'animate');
const CANONICAL_SKILL = path.join(ANIMATE_ROOT, 'plugins', 'animate', 'skills', 'animate');

const STYLE_ORDER = [
  'cut-paper',
  'crosshatch',
  'riso',
  'sketchbook',
  'math',
  'pixel',
  'isometric',
];

function safeResolveAnimate(relPath: string): string | null {
  const cleaned = relPath.replace(/^\/+/, '');
  const resolved = path.resolve(ANIMATE_ROOT, cleaned);
  if (resolved !== ANIMATE_ROOT && !resolved.startsWith(ANIMATE_ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  children?: TreeNode[];
}

function buildTree(dirPath: string, relBase = ''): TreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const nodes: TreeNode[] = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: rel,
        type: 'dir',
        children: buildTree(full, rel),
      });
    } else if (entry.isFile()) {
      const stat = fs.statSync(full);
      nodes.push({
        name: entry.name,
        path: rel,
        type: 'file',
        size: stat.size,
      });
    }
  }
  return nodes;
}

function countFiles(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) count += countFiles(full);
    else if (entry.isFile()) count += 1;
  }
  return count;
}

function readJsonSafe(relPath: string): unknown {
  const full = safeResolveAnimate(relPath);
  if (!full || !fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function extractStyleSummary(styleMdPath: string): {
  title: string;
  summary: string;
  motion: string;
} {
  if (!fs.existsSync(styleMdPath)) {
    return { title: '', summary: '', motion: '' };
  }
  const text = fs.readFileSync(styleMdPath, 'utf8');
  const lines = text.split('\n').map((l) => l.trim());
  const heading = lines.find((l) => l.startsWith('# '))?.replace(/^#\s+/, '') || '';
  const bodyLines = lines.filter(
    (l) => l && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('```') && !l.startsWith('-')
  );
  const summary = bodyLines[0] || '';
  const motionLine =
    lines.find((l) => /on\s+[12]s/i.test(l) && l.length < 120) || '';
  return { title: heading, summary, motion: motionLine };
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.get('/api/overview', (_req, res) => {
    try {
      const stylesDir = path.join(CANONICAL_SKILL, 'styles');
      const styles = STYLE_ORDER.filter((name) =>
        fs.existsSync(path.join(stylesDir, name, 'kit.js'))
      ).map((name) => {
        const styleDir = path.join(stylesDir, name);
        const demoPiece = readJsonSafe(
          `plugins/animate/skills/animate/styles/${name}/demo/piece.json`
        ) as Record<string, unknown> | null;
        const meta = extractStyleSummary(path.join(styleDir, 'STYLE.md'));
        const hasSample = fs.existsSync(path.join(styleDir, 'sample.png'));
        const hasDemo = fs.existsSync(path.join(styleDir, 'demo', 'piece.json'));
        return {
          id: name,
          title: meta.title || name,
          summary: meta.summary,
          motion: meta.motion,
          hasSample,
          hasDemo,
          sampleUrl: hasSample
            ? `/api/asset/plugins/animate/skills/animate/styles/${name}/sample.png`
            : null,
          demoFormats: Array.isArray(demoPiece?.formats)
            ? demoPiece.formats
            : ['9:16'],
        };
      });

      const examplePiece = readJsonSafe(
        'plugins/animate/skills/animate/examples/history-of-ai/piece.json'
      );

      const targets = [
        {
          id: 'antigravity',
          name: 'Google Antigravity',
          skillPath: '.agents/skills/animate/',
          globalPath: '~/.gemini/antigravity/skills/animate/',
          manifestPath: '.antigravity-plugin/plugin.json',
          syncedFiles: countFiles(path.join(ANIMATE_ROOT, '.agents', 'skills', 'animate')),
          installCmd: 'agy plugin install .',
          cliScriptCmd: 'node scripts/install.mjs --target antigravity --scope global',
          invokeHint: '/animate a 45s history of the bicycle, cut paper',
          manifest: readJsonSafe('.antigravity-plugin/plugin.json'),
        },
        {
          id: 'opencode',
          name: 'OpenCode',
          skillPath: '.opencode/skills/animate/',
          globalPath: '~/.config/opencode/skills/animate/',
          manifestPath: 'opencode.json',
          syncedFiles: countFiles(path.join(ANIMATE_ROOT, '.opencode', 'skills', 'animate')),
          installCmd: 'node scripts/install.mjs --target opencode --scope project --dest .',
          cliScriptCmd: 'node scripts/install.mjs --target opencode --scope global',
          invokeHint: 'Uses .opencode/skills/animate/SKILL.md + 12 @opencode-ai/plugin tools',
          manifest: readJsonSafe('opencode.json'),
        },
        {
          id: 'codex',
          name: 'OpenAI Codex CLI',
          skillPath: '.codex/skills/animate/',
          globalPath: '~/.codex/skills/animate/',
          manifestPath: '.codex-plugin/plugin.json',
          syncedFiles: countFiles(path.join(ANIMATE_ROOT, '.codex', 'skills', 'animate')),
          installCmd: 'node scripts/install.mjs --target codex --scope global',
          cliScriptCmd: 'node scripts/install.mjs --target codex --scope project --dest .',
          invokeHint: '$animate or /skills inside Codex CLI (paired with AGENTS.md)',
          manifest: readJsonSafe('.codex-plugin/plugin.json'),
        },
        {
          id: 'claude',
          name: 'Claude Code',
          skillPath: 'plugins/animate/skills/animate/',
          globalPath: '~/.claude/skills/animate/',
          manifestPath: '.claude-plugin/marketplace.json',
          syncedFiles: countFiles(CANONICAL_SKILL),
          installCmd: '/plugin install animate@animate',
          cliScriptCmd: 'node scripts/install.mjs --target claude --scope global',
          invokeHint: '/animate (original upstream plugin path preserved)',
          manifest: readJsonSafe('.claude-plugin/marketplace.json'),
        },
      ];

      const opencodeTools = [
        { name: 'animate_gallery', wraps: 'tools/gallery.mjs', purpose: 'Render the 7-style intake sheet' },
        { name: 'animate_build', wraps: 'tools/build.mjs', purpose: 'Compile src/, kit/, style, and assets into index.html' },
        { name: 'animate_still', wraps: 'tools/still.mjs', purpose: 'Render 2-4 key timestamps side-by-side for Look Check' },
        { name: 'animate_tile', wraps: 'tools/tile.mjs', purpose: 'Render frame strips and verify determinism' },
        { name: 'animate_storyboard', wraps: 'tools/storyboard.mjs', purpose: 'Render beat-by-beat TIMELINE.board sheet' },
        { name: 'animate_export', wraps: 'tools/export.mjs', purpose: 'Render deterministic frames, WAV stems, and MP4s' },
        { name: 'animate_review', wraps: 'tools/review.mjs', purpose: 'Run cut grid, LUFS, text clipping, and dead-beat QA' },
        { name: 'animate_beats', wraps: 'tools/beats.mjs', purpose: 'Extract BPM, downbeats, and drops into beats.json' },
        { name: 'animate_capture', wraps: 'tools/capture.mjs', purpose: 'Screenshot real product UI into piece assets/' },
        { name: 'animate_voice', wraps: 'tools/voice.mjs', purpose: 'Assemble script takes and faster-whisper word timings' },
        { name: 'animate_measure_refs', wraps: 'tools/measure/refs.mjs', purpose: 'Measure palette and accents from reference stills' },
        { name: 'animate_compare', wraps: 'tools/compare.mjs', purpose: 'Compare reference frame side-by-side against render' },
      ];

      res.json({
        repo: {
          upstream: 'https://github.com/cth9191/animate',
          version: '0.5.0',
          canonicalFiles: countFiles(CANONICAL_SKILL),
          totalRepoFiles: countFiles(ANIMATE_ROOT),
        },
        targets,
        styles,
        example: {
          id: 'history-of-ai',
          title: 'History of AI (60s Cut-Paper Example)',
          piece: examplePiece,
        },
        opencodeTools,
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/tree', (_req, res) => {
    try {
      res.json({ root: 'animate', tree: buildTree(ANIMATE_ROOT) });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/file', (req, res) => {
    const rel = typeof req.query.path === 'string' ? req.query.path : '';
    if (!rel) return res.status(400).json({ error: 'Missing path query parameter' });
    const full = safeResolveAnimate(rel);
    if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      return res.status(404).json({ error: 'File not found' });
    }
    const ext = path.extname(full).toLowerCase();
    const isBinary = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.wav', '.mp3'].includes(ext);
    const stat = fs.statSync(full);
    if (isBinary) {
      return res.json({
        path: rel,
        size: stat.size,
        isBinary: true,
        assetUrl: `/api/asset/${rel.replace(/^\/+/, '')}`,
        content: null,
      });
    }
    const content = fs.readFileSync(full, 'utf8');
    res.json({
      path: rel,
      size: stat.size,
      isBinary: false,
      content,
    });
  });

  app.get('/api/asset/*', (req, res) => {
    const rel = (req.params as Record<string, string>)[0] || '';
    const full = safeResolveAnimate(rel);
    if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      return res.status(404).send('Not found');
    }
    res.sendFile(full);
  });

  app.get('/api/demo/:id', async (req, res) => {
    const id = req.params.id;
    let pieceDir: string | null = null;
    if (id === 'history-of-ai') {
      pieceDir = path.join(CANONICAL_SKILL, 'examples', 'history-of-ai');
    } else if (STYLE_ORDER.includes(id)) {
      pieceDir = path.join(CANONICAL_SKILL, 'styles', id, 'demo');
    }
    if (!pieceDir || !fs.existsSync(path.join(pieceDir, 'piece.json'))) {
      return res.status(404).send('Demo not found');
    }
    try {
      const outHtml = path.join(pieceDir, 'index.html');
      if (!fs.existsSync(outHtml) || req.query.rebuild === '1') {
        await execFileAsync(
          process.execPath,
          [path.join(CANONICAL_SKILL, 'tools', 'build.mjs'), pieceDir],
          { cwd: ANIMATE_ROOT }
        );
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(fs.readFileSync(outHtml, 'utf8'));
    } catch (err) {
      res.status(500).send(`Failed to build demo: ${(err as Error).message}`);
    }
  });

  app.get('/api/download/:bundle', (req, res) => {
    const bundle = req.params.bundle;
    const bundlePaths: Record<string, string[]> = {
      all: ['.'],
      antigravity: [
        '.antigravity-plugin',
        'plugin.json',
        '.agents',
        'AGENTS.md',
        'README.md',
        'LICENSE',
      ],
      opencode: [
        'opencode.json',
        '.opencode',
        'plugins/opencode-animate',
        'AGENTS.md',
        'README.md',
        'LICENSE',
      ],
      codex: [
        '.codex-plugin',
        '.codex',
        '.agents',
        'AGENTS.md',
        'README.md',
        'LICENSE',
      ],
      claude: [
        '.claude-plugin',
        'plugins/animate',
        'README.md',
        'LICENSE',
      ],
    };

    const items = bundlePaths[bundle];
    if (!items) {
      return res.status(400).json({ error: 'Unknown bundle target' });
    }
    const existing = items.filter((item) =>
      fs.existsSync(path.join(ANIMATE_ROOT, item))
    );

    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="animate-${bundle}.tar.gz"`
    );

    const tar = spawn(
      'tar',
      [
        '--exclude=.git',
        '--exclude=node_modules',
        '--exclude=*/demo/index.html',
        '--exclude=*/examples/*/index.html',
        '-czf',
        '-',
        ...existing,
      ],
      { cwd: ANIMATE_ROOT }
    );

    tar.stdout.pipe(res);
    tar.stderr.on('data', (chunk) => {
      console.error('tar stderr:', chunk.toString());
    });
    tar.on('error', (err) => {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Animate Multi-Agent Plugin Studio listening on http://0.0.0.0:${port}`);
  });
}

startServer();
