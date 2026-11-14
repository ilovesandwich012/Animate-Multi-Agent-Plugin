import { useState } from 'react';
import { FileCode2, Play, RefreshCw, X } from 'lucide-react';
import type { OverviewResponse } from '../types';

interface StylesSectionProps {
  data: OverviewResponse;
  activeDemo: string | null;
  onSelectDemo: (id: string | null) => void;
  onInspectFile: (path: string) => void;
}

export function StylesSection({
  data,
  activeDemo,
  onSelectDemo,
  onInspectFile,
}: StylesSectionProps) {
  const [format, setFormat] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [cacheBust, setCacheBust] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const demoSrc = activeDemo
    ? `/api/demo/${activeDemo}?format=${encodeURIComponent(format)}&v=${cacheBust}`
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Drawing Kits &amp; Live Canvas Demos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Every style kit from <span className="font-mono text-xs">cth9191/animate</span> runs deterministically in a single compiled HTML file. Click any demo to build and play it live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectDemo('history-of-ai')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          Play 60s History of AI
        </button>
      </div>

      {/* Live Canvas Player */}
      {activeDemo && demoSrc && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">
                Live Built Canvas · {activeDemo}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Click canvas to start Web Audio score
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(['9:16', '1:1', '16:9'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                      format === fmt
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCacheBust((n) => n + 1)}
                aria-label="Rebuild and reload canvas demo"
                className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectDemo(null)}
                aria-label="Close live canvas preview"
                className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-6 flex items-center justify-center">
            <iframe
              key={`${activeDemo}-${format}-${cacheBust}`}
              src={demoSrc}
              title={`Live canvas demo for ${activeDemo}`}
              className={`border border-slate-800 rounded-lg bg-black transition-all ${
                format === '9:16'
                  ? 'w-[340px] h-[604px]'
                  : format === '1:1'
                    ? 'w-[500px] h-[500px]'
                    : 'w-full max-w-[860px] aspect-video'
              }`}
            />
          </div>
        </div>
      )}

      {/* Style Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.styles.map((style) => (
          <div
            key={style.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[9/16] max-h-[320px] w-full bg-slate-900 overflow-hidden border-b border-slate-200">
                {style.sampleUrl && !failedImages[style.id] ? (
                  <img
                    src={style.sampleUrl}
                    alt={`${style.id} style sample frame`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [style.id]: true }))
                    }
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-mono">
                    {style.id}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{style.id}</h3>
                  <span className="text-xs font-mono text-slate-500">
                    {style.demoFormats.join(' · ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {style.summary || style.title}
                </p>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectDemo(style.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Play Live Demo
              </button>
              <button
                type="button"
                onClick={() =>
                  onInspectFile(`plugins/animate/skills/animate/styles/${style.id}/STYLE.md`)
                }
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                STYLE.md
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
