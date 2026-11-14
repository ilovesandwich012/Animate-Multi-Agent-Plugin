import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  Search,
} from 'lucide-react';
import type { FileResponse, TreeNode } from '../types';

interface ExplorerSectionProps {
  selectedPath: string;
  onSelectPath: (path: string) => void;
}

function formatBytes(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  const out: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.path.toLowerCase().includes(q)) out.push(node);
    } else if (node.children) {
      const filtered = filterTree(node.children, query);
      if (filtered.length > 0 || node.name.toLowerCase().includes(q)) {
        out.push({ ...node, children: filtered });
      }
    }
  }
  return out;
}

export function ExplorerSection({
  selectedPath,
  onSelectPath,
}: ExplorerSectionProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    '.agents': true,
    '.agents/skills': true,
    '.agents/skills/animate': true,
    '.opencode': true,
    '.codex': true,
    'plugins': true,
    'plugins/opencode-animate': true,
    'scripts': true,
  });
  const [fileData, setFileData] = useState<FileResponse | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/tree')
      .then((r) => r.json())
      .then((res) => {
        setTree(res.tree || []);
        setLoadingTree(false);
      })
      .catch(() => setLoadingTree(false));
  }, []);

  useEffect(() => {
    if (!selectedPath) return;
    setLoadingFile(true);
    fetch(`/api/file?path=${encodeURIComponent(selectedPath)}`)
      .then((r) => r.json())
      .then((res) => {
        setFileData(res);
        setLoadingFile(false);
      })
      .catch(() => setLoadingFile(false));
  }, [selectedPath]);

  const visibleTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const toggleDir = (dirPath: string) => {
    setExpanded((prev) => ({ ...prev, [dirPath]: !prev[dirPath] }));
  };

  const copyContent = async () => {
    if (!fileData?.content) return;
    try {
      await navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const renderNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      if (node.type === 'dir') {
        const isOpen = search.trim() ? true : !!expanded[node.path];
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleDir(node.path)}
              style={{ paddingLeft: `${12 + depth * 14}px` }}
              className="w-full flex items-center gap-1.5 py-1.5 pr-3 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{node.name}</span>
            </button>
            {isOpen && node.children && renderNodes(node.children, depth + 1)}
          </div>
        );
      }

      const active = selectedPath === node.path;
      return (
        <button
          key={node.path}
          type="button"
          onClick={() => onSelectPath(node.path)}
          style={{ paddingLeft: `${26 + depth * 14}px` }}
          className={`w-full flex items-center justify-between gap-2 py-1.5 pr-3 text-xs text-left transition-colors cursor-pointer ${
            active
              ? 'bg-orange-50 text-orange-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate font-mono">{node.name}</span>
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
            {formatBytes(node.size)}
          </span>
        </button>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Repository Explorer</h1>
          <p className="text-sm text-slate-600">
            Live file tree of the adapted <span className="font-mono text-xs">animate/</span> directory on disk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[640px]">
        {/* Sidebar Tree */}
        <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col max-h-[680px]">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter files by path..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {loadingTree ? (
              <div className="p-4 text-xs text-slate-500">Loading repository tree...</div>
            ) : visibleTree.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">No files matched "{search}".</div>
            ) : (
              renderNodes(visibleTree)
            )}
          </div>
        </aside>

        {/* File Viewer */}
        <div className="lg:col-span-8 flex flex-col max-h-[680px]">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
            <div className="min-w-0">
              <div className="font-mono text-xs font-medium text-slate-900 truncate">
                {selectedPath}
              </div>
              {fileData && (
                <div className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                  {formatBytes(fileData.size)}
                </div>
              )}
            </div>
            {fileData && !fileData.isBinary && fileData.content != null && (
              <button
                type="button"
                onClick={copyContent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {loadingFile ? (
              <div className="p-6 text-xs text-slate-500">Loading file contents...</div>
            ) : fileData?.isBinary && fileData.assetUrl ? (
              <div className="p-6 flex items-center justify-center bg-slate-900 min-h-full">
                <img
                  src={fileData.assetUrl}
                  alt={fileData.path}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[560px] rounded border border-slate-700"
                />
              </div>
            ) : (
              <pre className="p-5 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                {fileData?.content ?? 'Select a file from the left tree to inspect its source.'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
