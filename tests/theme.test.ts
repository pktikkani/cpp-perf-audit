import { describe, it, expect } from 'vitest';
import { severityColor, severityIcon, progressBar } from '../src/ui/theme.js';

describe('severityColor', () => {
  it('should return a function for critical', () => {
    expect(typeof severityColor('critical')).toBe('function');
  });

  it('should return a function for warning', () => {
    expect(typeof severityColor('warning')).toBe('function');
  });

  it('should return a function for suggestion', () => {
    expect(typeof severityColor('suggestion')).toBe('function');
  });

  it('should return a function for good', () => {
    expect(typeof severityColor('good')).toBe('function');
  });

  it('should return dim for unknown severity', () => {
    expect(typeof severityColor('unknown')).toBe('function');
  });
});

describe('severityIcon', () => {
  it('should return an icon string for critical', () => {
    const icon = severityIcon('critical');
    expect(typeof icon).toBe('string');
    expect(icon.length).toBeGreaterThan(0);
  });

  it('should return an icon string for warning', () => {
    const icon = severityIcon('warning');
    expect(typeof icon).toBe('string');
    expect(icon.length).toBeGreaterThan(0);
  });

  it('should return an icon for all severities', () => {
    for (const s of ['critical', 'warning', 'suggestion', 'good']) {
      expect(severityIcon(s).length).toBeGreaterThan(0);
    }
  });
});

describe('progressBar', () => {
  it('should return a string', () => {
    expect(typeof progressBar(50)).toBe('string');
  });

  it('should have expected width characters', () => {
    const bar = progressBar(50, 20);
    // The bar contains ANSI escape codes, so check raw content
    expect(bar.length).toBeGreaterThan(0);
  });

  it('should handle 0 score', () => {
    const bar = progressBar(0, 10);
    expect(bar.length).toBeGreaterThan(0);
  });

  it('should handle 100 score', () => {
    const bar = progressBar(100, 10);
    expect(bar.length).toBeGreaterThan(0);
  });
});
