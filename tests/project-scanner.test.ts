import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { scanProjects } from '../src/scanner/project-scanner.js';

const FIXTURES_PATH = resolve(import.meta.dirname, 'fixtures');

describe('scanProjects', () => {
  it('should find CMake project in fixtures directory', async () => {
    const projects = await scanProjects(FIXTURES_PATH);
    expect(projects.length).toBeGreaterThanOrEqual(1);
  });

  it('should extract project name from CMakeLists.txt', async () => {
    const projects = await scanProjects(FIXTURES_PATH);
    const cmake = projects.find((p) => p.buildSystem === 'cmake');
    expect(cmake).toBeDefined();
    expect(cmake!.name).toBe('TestProject');
  });

  it('should extract C++ standard from CMakeLists.txt', async () => {
    const projects = await scanProjects(FIXTURES_PATH);
    const cmake = projects.find((p) => p.buildSystem === 'cmake');
    expect(cmake!.cppStandard).toBe('C++17');
  });

  it('should extract dependencies from find_package', async () => {
    const projects = await scanProjects(FIXTURES_PATH);
    const cmake = projects.find((p) => p.buildSystem === 'cmake');
    const depNames = cmake!.dependencies.map((d) => d.name);
    expect(depNames).toContain('Threads');
    expect(depNames).toContain('Boost');
  });

  it('should extract dependency version when specified', async () => {
    const projects = await scanProjects(FIXTURES_PATH);
    const cmake = projects.find((p) => p.buildSystem === 'cmake');
    const boost = cmake!.dependencies.find((d) => d.name === 'Boost');
    expect(boost?.version).toBe('1.80');
  });

  it('should throw when no C++ project files exist', async () => {
    await expect(scanProjects('/tmp/nonexistent-cpp-project-12345')).rejects.toThrow();
  });
});
