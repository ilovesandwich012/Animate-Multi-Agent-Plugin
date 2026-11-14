export type TargetId = 'antigravity' | 'opencode' | 'codex' | 'claude';

export interface TargetInfo {
  id: TargetId;
  name: string;
  skillPath: string;
  globalPath: string;
  manifestPath: string;
  syncedFiles: number;
  installCmd: string;
  cliScriptCmd: string;
  invokeHint: string;
  manifest: Record<string, unknown> | null;
}

export interface StyleInfo {
  id: string;
  title: string;
  summary: string;
  motion: string;
  hasSample: boolean;
  hasDemo: boolean;
  sampleUrl: string | null;
  demoFormats: string[];
}

export interface OpenCodeToolInfo {
  name: string;
  wraps: string;
  purpose: string;
}

export interface OverviewResponse {
  repo: {
    upstream: string;
    version: string;
    canonicalFiles: number;
    totalRepoFiles: number;
  };
  targets: TargetInfo[];
  styles: StyleInfo[];
  example: {
    id: string;
    title: string;
    piece: Record<string, unknown> | null;
  };
  opencodeTools: OpenCodeToolInfo[];
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  children?: TreeNode[];
}

export interface FileResponse {
  path: string;
  size: number;
  isBinary: boolean;
  assetUrl?: string;
  content: string | null;
}
