export interface DependencyRef {
  name: string;
  version: string;
}

export type BuildSystem = 'cmake' | 'meson' | 'bazel' | 'makefile' | 'vcxproj' | 'unknown';

export interface ProjectInfo {
  name: string;
  path: string;
  cppStandard: string;
  buildSystem: BuildSystem;
  projectFiles: string[];
  dependencies: DependencyRef[];
}

export type FileCategory =
  | 'header'
  | 'implementation'
  | 'main'
  | 'test'
  | 'concurrency'
  | 'allocator'
  | 'template'
  | 'utility'
  | 'other';

export interface AnalysisFile {
  path: string;
  relativePath: string;
  category: FileCategory;
  content: string;
  lineCount: number;
}

export type Severity = 'critical' | 'warning' | 'suggestion' | 'good';

export interface Finding {
  severity: Severity;
  category: string;
  title: string;
  file: string;
  line?: number;
  description: string;
  codeSnippet?: string;
  fix?: string;
  source?: string;
}

export interface AnalysisSummary {
  critical: number;
  warning: number;
  suggestion: number;
  good: number;
  filesAnalyzed: number;
  score: number;
}

export interface AnalysisReport {
  project: ProjectInfo;
  files: AnalysisFile[];
  findings: Finding[];
  summary: AnalysisSummary;
  timestamp: string;
  duration: number;
}

export interface CliOptions {
  format: 'terminal' | 'markdown' | 'html' | 'json';
  output?: string;
  severity: 'critical' | 'warning' | 'suggestion';
  stream: boolean;
  ci: boolean;
}
