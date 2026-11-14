import { useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import type { OverviewResponse, TargetId } from '../types';

interface TargetsSectionProps {
  data: OverviewResponse;
  activeTarget: TargetId;
  onChangeTarget: (id: TargetId) => void;
  onInspectFile: (path: string) => void;
}

export function TargetsSection({
  data,
  activeTarget,
  onChangeTarget,
  onInspectFile,
}: TargetsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const current = data.targets.find((t) => t.id === activeTarget) || data.targets[0];

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const targetFiles: Record<TargetId, { path: string; role: string }[]> = {
    antigravity: [
      { path: '.antigravity-plugin/plugin.json', role: 'Antigravity plugin manifest with suggested prompts and skills path' },
      { path: 'plugin.json', role: 'Root portable plugin manifest for agy plugin validate / install' },
      { path: '.agents/skills/animate/SKILL.md', role: 'Workspace-scoped skill entry point discovered automatically' },
      { path: 'AGENTS.md', role: 'Shared repository rules and CLI tool conventions' },
    ],
    opencode: [
      { path: 'opencode.json', role: 'Registers ./plugins/opencode-animate/src/index.ts and .opencode/skills' },
      { path: 'plugins/opencode-animate/src/index.ts', role: '@opencode-ai/plugin implementation exposing 12 typed tools' },
      { path: 'plugins/opencode-animate/package.json', role: 'Plugin package manifest declaring @opencode-ai/plugin' },
      { path: '.opencode/plugins/animate.ts', role: 'Local .opencode/plugins auto-discovery entry point' },
      { path: '.opencode/skills/animate/SKILL.md', role: 'Synchronized OpenCode skill instructions' },
    ],
    codex: [
      { path: '.codex-plugin/plugin.json', role: 'Codex plugin manifest pointing to .codex/skills and AGENTS.md' },
      { path: '.codex/skills/animate/SKILL.md', role: 'Codex CLI skill folder invoked via $animate or /skills' },
      { path: '.agents/skills/animate/SKILL.md', role: 'Open Agent Skills standard fallback path' },
      { path: 'AGENTS.md', role: 'Persistent Codex repository workflow and verification contract' },
    ],
    claude: [
      { path: '.claude-plugin/marketplace.json', role: 'Upstream Claude Code marketplace definition (preserved)' },
      { path: 'plugins/animate/.claude-plugin/plugin.json', role: 'Upstream Claude Code plugin metadata' },
      { path: 'plugins/animate/skills/animate/SKILL.md', role: 'Canonical skill source synchronized to all other targets' },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Target Platform Adapters
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect the generated manifests, discovery directories, and downloadable archives for each agent runtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
          {data.targets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => onChangeTarget(target.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTarget === target.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {target.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Platform Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  {current.manifestPath} · <span className="font-mono tabular-nums">{current.syncedFiles}</span> synced files
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{current.name}</h2>
              </div>
              <a
                href={`/api/download/${current.id}`}
                download={`animate-${current.id}.tar.gz`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download {current.id} Bundle
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
              <div>
                <div className="text-slate-500 mb-1">Project Skill Path</div>
                <div className="font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  {current.skillPath}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Global User Skill Path</div>
                <div className="font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  {current.globalPath}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-500 mb-1">Primary Install Command</div>
                <div className="flex items-center justify-between gap-2 bg-slate-900 text-slate-100 rounded-lg px-3.5 py-2.5 font-mono text-xs">
                  <span className="truncate">{current.installCmd}</span>
                  <button
                    type="button"
                    onClick={() => copyText('primary', current.installCmd)}
                    className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    aria-label="Copy primary install command"
                  >
                    {copiedKey === 'primary' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Cross-Platform Installer Script</div>
                <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 font-mono text-xs">
                  <span className="truncate">{current.cliScriptCmd}</span>
                  <button
                    type="button"
                    onClick={() => copyText('cli', current.cliScriptCmd)}
                    className="p-1 text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                    aria-label="Copy CLI installer command"
                  >
                    {copiedKey === 'cli' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Invocation: <span className="font-mono text-slate-800">{current.invokeHint}</span>
              </p>
            </div>
          </div>

          {/* Packaged Files Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 text-sm font-semibold text-slate-900">
              Platform Adapter Files
            </div>
            <div className="divide-y divide-slate-200">
              {targetFiles[current.id].map((file) => (
                <div
                  key={file.path}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-medium text-slate-900 truncate">
                      {file.path}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{file.role}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectFile(file.path)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shrink-0 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manifest Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {current.manifestPath}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText('manifest', JSON.stringify(current.manifest, null, 2))
                }
                className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'manifest' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-800 bg-slate-50/60 overflow-x-auto leading-relaxed max-h-[380px]">
              {JSON.stringify(current.manifest, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* OpenCode Plugin Tool Registry */}
      {activeTarget === 'opencode' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registered OpenCode Plugin Tools (plugins/opencode-animate)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Typed tools exposed directly to OpenCode via @opencode-ai/plugin alongside the Markdown skill.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onInspectFile('plugins/opencode-animate/src/index.ts')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Plugin Source
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-2.5 px-4">Tool Name</th>
                  <th className="py-2.5 px-4">CLI Script Wrapped</th>
                  <th className="py-2.5 px-4">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.opencodeTools.map((tool) => (
                  <tr key={tool.name} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {tool.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tool.wraps}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{tool.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
