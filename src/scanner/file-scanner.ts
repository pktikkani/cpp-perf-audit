import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import type { AnalysisFile } from '../types/index.js';
import { categorizeFile, sortByPriority } from './file-categorizer.js';

const MAX_FILE_SIZE = 50_000;
const MAX_FILES = 100;

export async function scanFiles(rootPath: string): Promise<AnalysisFile[]> {
  const cppFiles = await fg('**/*.{cpp,cc,cxx,c,h,hpp,hxx,hh,ipp,tpp}', {
    cwd: rootPath,
    absolute: true,
    ignore: [
      '**/build/**',
      '**/cmake-build-*/**',
      '**/node_modules/**',
      '**/third_party/**',
      '**/vendor/**',
      '**/external/**',
      '**/deps/**',
      '**/.git/**',
      '**/out/**',
      '**/Debug/**',
      '**/Release/**',
      '**/x64/**',
      '**/x86/**',
      '**/*.pb.h',
      '**/*.pb.cc',
      '**/*.generated.*',
      '**/*_test_helpers*',
      '**/moc_*',
      '**/ui_*',
    ],
  });

  const files: AnalysisFile[] = [];

  for (const filePath of cppFiles) {
    const content = await readFile(filePath, 'utf-8');

    if (content.length > MAX_FILE_SIZE) continue;

    const relativePath = relative(rootPath, filePath);
    const category = categorizeFile(relativePath, content);
    const lineCount = content.split('\n').length;

    files.push({
      path: filePath,
      relativePath,
      category,
      content,
      lineCount,
    });
  }

  files.sort((a, b) => sortByPriority(a.category, b.category));

  return files.slice(0, MAX_FILES);
}
