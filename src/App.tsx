/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { ExplorerSection } from './components/ExplorerSection';
import { OverviewSection } from './components/OverviewSection';
import { StylesSection } from './components/StylesSection';
import { TargetsSection } from './components/TargetsSection';
import type { OverviewResponse, TargetId } from './types';

type TabId = 'overview' | 'targets' | 'styles' | 'explorer';

export default function App() {
  const [tab, setTab] = useState<TabId>('overview');
  const [activeTarget, setActiveTarget] = useState<TargetId>('antigravity');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'plugins/animate/skills/animate/SKILL.md'
  );
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/overview')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((json: OverviewResponse) => setData(json))
      .catch((err: Error) => setError(err.message));
  }, []);

  const handleSelectTarget = (id: TargetId) => {
    setActiveTarget(id);
    setTab('targets');
  };

  const handleOpenDemo = (id: string) => {
    setActiveDemo(id);
    setTab('styles');
  };

  const handleInspectFile = (filePath: string) => {
    setSelectedFilePath(filePath);
    setTab('explorer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar: 3-zone contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Animate
          </button>

          <nav className="flex items-center gap-6 overflow-x-auto">
            {(
              [
                ['overview', 'Overview'],
                ['targets', 'Targets'],
                ['styles', 'Styles & Demos'],
                ['explorer', 'Explorer'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tab === id
                    ? 'border-orange-600 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="shrink-0">
            <a
              href="/api/download/all"
              download="animate-multi-agent.tar.gz"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Bundle
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        {error ? (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-sm text-red-700">
            Failed to load plugin metadata: {error}
          </div>
        ) : !data ? (
          <div className="space-y-6">
            <div className="h-56 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <OverviewSection
                data={data}
                onSelectTarget={handleSelectTarget}
                onOpenDemo={handleOpenDemo}
                onInspectFile={handleInspectFile}
              />
            )}
            {tab === 'targets' && (
              <TargetsSection
                data={data}
                activeTarget={activeTarget}
                onChangeTarget={setActiveTarget}
                onInspectFile={handleInspectFile}
              />
            )}
            {tab === 'styles' && (
              <StylesSection
                data={data}
                activeDemo={activeDemo}
                onSelectDemo={setActiveDemo}
                onInspectFile={handleInspectFile}
              />
            )}
            {tab === 'explorer' && (
              <ExplorerSection
                selectedPath={selectedFilePath}
                onSelectPath={setSelectedFilePath}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Upstream: cth9191/animate (MIT) · Packaged for Antigravity, OpenCode, Codex CLI &amp; Claude Code
          </span>
          <div className="flex items-center gap-4">
            <a href="/api/download/antigravity" download="animate-antigravity.tar.gz" className="hover:text-slate-900">
              Antigravity (.tar.gz)
            </a>
            <a href="/api/download/opencode" download="animate-opencode.tar.gz" className="hover:text-slate-900">
              OpenCode (.tar.gz)
            </a>
            <a href="/api/download/codex" download="animate-codex.tar.gz" className="hover:text-slate-900">
              Codex (.tar.gz)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
