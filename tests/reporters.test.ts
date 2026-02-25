import { describe, it, expect } from 'vitest';
import { generateMarkdownReport } from '../src/reporter/markdown-reporter.js';
import { generateHtmlReport } from '../src/reporter/html-reporter.js';
import type { AnalysisReport } from '../src/types/index.js';

function createMockReport(overrides?: Partial<AnalysisReport>): AnalysisReport {
  return {
    project: {
      name: 'TestProject',
      path: '/test',
      cppStandard: 'C++17',
      buildSystem: 'cmake',
      projectFiles: ['/test/CMakeLists.txt'],
      dependencies: [],
    },
    files: [],
    findings: [
      {
        severity: 'critical',
        category: 'memory',
        title: 'Raw owning pointer detected',
        file: 'src/main.cpp',
        line: 10,
        description: 'Using raw new without RAII wrapper.',
        codeSnippet: 'int* p = new int(42);',
        fix: 'auto p = std::make_unique<int>(42);',
        source: 'C++ Core Guidelines R.11',
      },
      {
        severity: 'warning',
        category: 'performance',
        title: 'Copy in range-for loop',
        file: 'src/main.cpp',
        line: 5,
        description: 'Copying elements in range-for loop.',
        codeSnippet: 'for (auto item : items)',
        fix: 'for (const auto& item : items)',
      },
      {
        severity: 'good',
        category: 'moderncpp',
        title: 'Proper RAII with unique_ptr',
        file: 'src/utils.h',
        description: 'Good use of std::unique_ptr for resource management.',
      },
    ],
    summary: {
      critical: 1,
      warning: 1,
      suggestion: 0,
      good: 1,
      filesAnalyzed: 3,
      score: 80,
    },
    timestamp: '2026-01-01T00:00:00.000Z',
    duration: 5.2,
    ...overrides,
  };
}

describe('generateMarkdownReport', () => {
  it('should include project name', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('TestProject');
  });

  it('should include C++ standard', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('C++17');
  });

  it('should include build system', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('cmake');
  });

  it('should include safety score', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('80/100');
  });

  it('should include critical findings section', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('Critical Issues');
    expect(md).toContain('Raw owning pointer');
  });

  it('should include warning findings section', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('Warnings');
    expect(md).toContain('Copy in range-for');
  });

  it('should include good patterns section', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('Good Patterns');
    expect(md).toContain('Proper RAII');
  });

  it('should include code snippets as cpp blocks', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('```cpp');
    expect(md).toContain('int* p = new int(42)');
  });

  it('should include fix code', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('std::make_unique<int>(42)');
  });

  it('should include source attribution', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('C++ Core Guidelines R.11');
  });

  it('should include severity counts in summary', () => {
    const report = createMockReport();
    const md = generateMarkdownReport(report);
    expect(md).toContain('Critical');
    expect(md).toContain('Warning');
    expect(md).toContain('Good');
  });

  it('should show trophy emoji for score >= 90', () => {
    const report = createMockReport({ summary: { critical: 0, warning: 0, suggestion: 0, good: 5, filesAnalyzed: 3, score: 95 } });
    const md = generateMarkdownReport(report);
    expect(md).toContain('🏆');
  });

  it('should show warning emoji for score < 75', () => {
    const report = createMockReport({ summary: { critical: 2, warning: 3, suggestion: 1, good: 0, filesAnalyzed: 3, score: 55 } });
    const md = generateMarkdownReport(report);
    expect(md).toContain('⚠️');
  });
});

describe('generateHtmlReport', () => {
  it('should generate valid HTML', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('should include project name', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('TestProject');
  });

  it('should include cpp-perf-audit branding', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('cpp-perf-audit');
  });

  it('should include finding data', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('Raw owning pointer');
    expect(html).toContain('critical');
  });

  it('should include score', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('80');
  });

  it('should include filter buttons', async () => {
    const report = createMockReport();
    const html = await generateHtmlReport(report);
    expect(html).toContain('filter-btn');
    expect(html).toContain('data-filter');
  });
});
