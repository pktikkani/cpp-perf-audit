import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { scanFiles } from '../src/scanner/file-scanner.js';

const FIXTURES_PATH = resolve(import.meta.dirname, 'fixtures');

describe('scanFiles', () => {
  it('should discover C++ files in fixtures', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should find .cpp files', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    const cppFiles = files.filter((f) => f.relativePath.endsWith('.cpp'));
    expect(cppFiles.length).toBeGreaterThan(0);
  });

  it('should find .hpp files', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    const hppFiles = files.filter((f) => f.relativePath.endsWith('.hpp'));
    expect(hppFiles.length).toBeGreaterThan(0);
  });

  it('should find .h files', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    const hFiles = files.filter((f) => f.relativePath.endsWith('.h'));
    expect(hFiles.length).toBeGreaterThan(0);
  });

  it('should include file content', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    for (const f of files) {
      expect(f.content.length).toBeGreaterThan(0);
    }
  });

  it('should compute line counts', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    for (const f of files) {
      expect(f.lineCount).toBeGreaterThan(0);
    }
  });

  it('should assign categories to files', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    const categories = files.map((f) => f.category);
    expect(categories).toContain('main');
    expect(categories).toContain('concurrency');
  });

  it('should set relative paths', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    for (const f of files) {
      expect(f.relativePath).not.toContain(FIXTURES_PATH);
      expect(f.relativePath.startsWith('/')).toBe(false);
    }
  });

  it('should sort by priority (concurrency before test)', async () => {
    const files = await scanFiles(FIXTURES_PATH);
    const concIdx = files.findIndex((f) => f.category === 'concurrency');
    const mainIdx = files.findIndex((f) => f.category === 'main');
    if (concIdx !== -1 && mainIdx !== -1) {
      expect(concIdx).toBeLessThan(mainIdx);
    }
  });
});
