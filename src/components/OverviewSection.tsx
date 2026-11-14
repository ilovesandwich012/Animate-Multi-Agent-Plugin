import { useState } from 'react';
import { Check, Copy, Download, Play } from 'lucide-react';
import type { OverviewResponse, TargetId } from '../types';

interface OverviewSectionProps {
  data: OverviewResponse;
  onSelectTarget: (id: TargetId) => void;
  onOpenDemo: (id: string) => void;
  onInspectFile: (path: string) => void;
}

export function OverviewSection({
  data,
  onSelectTarget,
  onOpenDemo,
  onInspectFile,
}: OverviewSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState(false);

  const copyCommand = async (id: string, cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Clipboard API unavailable in restricted frame
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-slate-200 pb-10">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Cloned from cth9191/animate · Adapted for Antigravity, OpenCode, Codex CLI &amp; Claude Code
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] [text-wrap:balance]">
              Procedural canvas animation skill across four coding agents
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Every built-in drawing kit, story grammar, beat-grid audio synthesizer, and Playwright
              review check from <span className="font-mono text-sm text-slate-800">cth9191/animate</span> is
              preserved and packaged with native plugin manifests, synchronized skill directories,
              and typed OpenCode tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenDemo('history-of-ai')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Preview 60s Cut-Paper Example
            </button>
            <button
              type="button"
              onClick={() => onInspectFile('plugins/animate/skills/animate/SKILL.md')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Inspect Adapted SKILL.md
            </button>
            <a
              href="/api/download/all"
              download="animate-multi-agent.tar.gz"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              Full Repository (.tar.gz)
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
          {!bannerError ? (
            <img
              src="/api/asset/docs/styles.png"
              alt="Seven built-in Animate visual styles rendered side by side"
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className="w-full h-full min-h-[240px] object-cover bg-slate-900"
            />
          ) : (
            <div className="w-full h-full min-h-[240px] bg-slate-900 text-slate-200 flex items-center justify-center p-6 text-sm">
              Animate Built-In Style Gallery
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-4">
            <span>Cut paper, crosshatch, riso, sketchbook, math, pixel, isometric</span>
            <span className="font-mono tabular-nums text-slate-700 shrink-0">
              {data.styles.length} styles
            </span>
          </div>
        </div>
      </section>

      {/* Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-5 space-y-1">
          <div className="text-xs text-slate-500">Agent Targets</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {data.targets.length}
          </div>
          <div className="text-xs text-slate-500">Antigravity · OpenCode · Codex · Claude</div>
        </div>
        <div className="p-5 space-y-1">
          <div className="text-xs text-slate-500">Canonical Skill Files</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {data.repo.canonicalFiles}
          </div>
          <div className="text-xs text-slate-500">Synced across all target folders</div>
        </div>
        <div className="p-5 space-y-1">
          <div className="text-xs text-slate-500">OpenCode Custom Tools</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {data.opencodeTools.length}
          </div>
          <div className="text-xs text-slate-500">Typed via @opencode-ai/plugin</div>
        </div>
        <div className="p-5 space-y-1">
          <div className="text-xs text-slate-500">Built-In Drawing Kits</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {data.styles.length}
          </div>
          <div className="text-xs text-slate-500">Plus reference-matched custom styles</div>
        </div>
      </section>

      {/* Platform Distribution Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Platform Distribution Matrix
            </h2>
            <p className="text-sm text-slate-600">
              Each platform receives a synchronized copy of the skill directory plus its native manifest or plugin entry point.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Workspace Skill Path</th>
                <th className="py-3 px-4">Manifest / Config</th>
                <th className="py-3 px-4 text-right">Files</th>
                <th className="py-3 px-4">Quick Install</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {data.targets.map((target) => (
                <tr key={target.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {target.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {target.skillPath}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectFile(target.manifestPath)}
                      className="hover:text-orange-600 underline decoration-slate-300 underline-offset-2 cursor-pointer"
                    >
                      {target.manifestPath}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-700 text-right">
                    {target.syncedFiles}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <code className="text-xs font-mono text-slate-700 truncate">
                        {target.installCmd}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCommand(target.id, target.installCmd)}
                        aria-label={`Copy install command for ${target.name}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedId === target.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectTarget(target.id)}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Check-in Workflow */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            01–05. Check-In Production Workflow
          </h2>
          <p className="text-sm text-slate-600">
            Updated in SKILL.md and intake.md to work across Antigravity, OpenCode, Codex CLI, and Claude Code without vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 border border-slate-200 bg-white rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {[
            {
              step: '01. Intake',
              detail: 'Ask missing questions via host picker (ask_question / question / request_user_input) and render gallery.png.',
            },
            {
              step: '02. Story Check',
              detail: 'Select format from FORMATS.md, web-verify factual claims, and approve the beat table before drawing.',
            },
            {
              step: '03. Look Check',
              detail: 'Render 2–4 key timestamps side-by-side via still.mjs or match user references with compare.mjs.',
            },
            {
              step: '04. Storyboard',
              detail: 'Populate TIMELINE.board and run storyboard.mjs so every beat panel is approved before animation.',
            },
            {
              step: '05. Build & Review',
              detail: 'Assemble index.html, export MP4 + stems via Playwright and ffmpeg, and verify cut grid + LUFS.',
            },
          ].map((item) => (
            <div key={item.step} className="p-5 space-y-2">
              <div className="text-sm font-semibold text-slate-900">{item.step}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
