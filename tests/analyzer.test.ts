import { describe, it, expect } from 'vitest';
import { buildAnalysisPrompt, SYSTEM_PROMPT } from '../src/analyzer/prompts.js';

describe('SYSTEM_PROMPT', () => {
  it('should contain all four pillars', () => {
    expect(SYSTEM_PROMPT).toContain('PILLAR 1');
    expect(SYSTEM_PROMPT).toContain('PILLAR 2');
    expect(SYSTEM_PROMPT).toContain('PILLAR 3');
    expect(SYSTEM_PROMPT).toContain('PILLAR 4');
  });

  it('should reference C++ Core Guidelines', () => {
    expect(SYSTEM_PROMPT).toContain('C++ Core Guidelines');
    expect(SYSTEM_PROMPT).toContain('R.1');
    expect(SYSTEM_PROMPT).toContain('R.11');
    expect(SYSTEM_PROMPT).toContain('CP.2');
  });

  it('should reference sanitizers', () => {
    expect(SYSTEM_PROMPT).toContain('ASan');
    expect(SYSTEM_PROMPT).toContain('TSan');
    expect(SYSTEM_PROMPT).toContain('MSan');
    expect(SYSTEM_PROMPT).toContain('UBSan');
  });

  it('should reference Scott Meyers Effective Modern C++', () => {
    expect(SYSTEM_PROMPT).toContain('Scott Meyers');
    expect(SYSTEM_PROMPT).toContain('Effective Modern C++');
    expect(SYSTEM_PROMPT).toContain('noexcept');
    expect(SYSTEM_PROMPT).toContain('make_unique');
  });

  it('should reference Jason Turner', () => {
    expect(SYSTEM_PROMPT).toContain('Jason Turner');
    expect(SYSTEM_PROMPT).toContain('[[nodiscard]]');
    expect(SYSTEM_PROMPT).toContain('structured bindings');
  });

  it('should reference Abseil', () => {
    expect(SYSTEM_PROMPT).toContain('Abseil');
    expect(SYSTEM_PROMPT).toContain('string_view');
    expect(SYSTEM_PROMPT).toContain('unordered_map');
  });

  it('should reference Fedor Pikus hardware optimizations', () => {
    expect(SYSTEM_PROMPT).toContain('Fedor Pikus');
    expect(SYSTEM_PROMPT).toContain('Cache line');
    expect(SYSTEM_PROMPT).toContain('CRTP');
    expect(SYSTEM_PROMPT).toContain('SIMD');
  });

  it('should reference Clang-Tidy checks', () => {
    expect(SYSTEM_PROMPT).toContain('bugprone-');
    expect(SYSTEM_PROMPT).toContain('cppcoreguidelines-');
  });

  it('should specify JSON output format', () => {
    expect(SYSTEM_PROMPT).toContain('JSON array');
    expect(SYSTEM_PROMPT).toContain('severity');
    expect(SYSTEM_PROMPT).toContain('codeSnippet');
    expect(SYSTEM_PROMPT).toContain('fix');
  });

  it('should include severity categories', () => {
    expect(SYSTEM_PROMPT).toContain('"critical"');
    expect(SYSTEM_PROMPT).toContain('"warning"');
    expect(SYSTEM_PROMPT).toContain('"suggestion"');
    expect(SYSTEM_PROMPT).toContain('"good"');
  });

  it('should reference memory safety concepts', () => {
    expect(SYSTEM_PROMPT).toContain('RAII');
    expect(SYSTEM_PROMPT).toContain('use-after-free');
    expect(SYSTEM_PROMPT).toContain('dangling');
    expect(SYSTEM_PROMPT).toContain('Buffer overflow');
  });
});

describe('buildAnalysisPrompt', () => {
  it('should include file content in cpp code blocks', () => {
    const prompt = buildAnalysisPrompt(
      [{ relativePath: 'src/main.cpp', content: 'int main() {}', category: 'main' }],
      'C++17',
      [],
    );
    expect(prompt).toContain('```cpp');
    expect(prompt).toContain('int main() {}');
  });

  it('should include relative path and category', () => {
    const prompt = buildAnalysisPrompt(
      [{ relativePath: 'src/server.cpp', content: 'void run() {}', category: 'concurrency' }],
      'C++20',
      [],
    );
    expect(prompt).toContain('src/server.cpp');
    expect(prompt).toContain('concurrency');
  });

  it('should include C++ standard', () => {
    const prompt = buildAnalysisPrompt([], 'C++17', []);
    expect(prompt).toContain('C++17');
  });

  it('should include dependencies when present', () => {
    const prompt = buildAnalysisPrompt([], 'C++17', ['Boost', 'Threads']);
    expect(prompt).toContain('Boost');
    expect(prompt).toContain('Threads');
  });

  it('should handle no dependencies', () => {
    const prompt = buildAnalysisPrompt([], 'C++17', []);
    expect(prompt).toContain('none detected');
  });

  it('should handle multiple files', () => {
    const prompt = buildAnalysisPrompt(
      [
        { relativePath: 'a.cpp', content: 'void a() {}', category: 'implementation' },
        { relativePath: 'b.hpp', content: 'class B {};', category: 'header' },
      ],
      'C++17',
      [],
    );
    expect(prompt).toContain('a.cpp');
    expect(prompt).toContain('b.hpp');
  });
});
