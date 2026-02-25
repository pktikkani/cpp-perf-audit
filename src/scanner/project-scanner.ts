import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import type { BuildSystem, DependencyRef, ProjectInfo } from '../types/index.js';

export async function scanProjects(rootPath: string): Promise<ProjectInfo[]> {
  // Look for build system files in priority order
  const cmakeFiles = await fg('**/CMakeLists.txt', {
    cwd: rootPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/build/**', '**/cmake-build-*/**', '**/third_party/**', '**/vendor/**'],
    deep: 2,
  });

  const mesonFiles = await fg('**/meson.build', {
    cwd: rootPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/build/**', '**/subprojects/**'],
    deep: 2,
  });

  const makeFiles = await fg('**/Makefile', {
    cwd: rootPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/build/**'],
    deep: 1,
  });

  const vcxprojFiles = await fg('**/*.vcxproj', {
    cwd: rootPath,
    absolute: true,
    ignore: ['**/node_modules/**'],
    deep: 2,
  });

  const bazelFiles = await fg('**/BUILD', {
    cwd: rootPath,
    absolute: true,
    ignore: ['**/node_modules/**'],
    deep: 1,
  });

  const allBuildFiles = [
    ...cmakeFiles.map((f) => ({ path: f, type: 'cmake' as BuildSystem })),
    ...mesonFiles.map((f) => ({ path: f, type: 'meson' as BuildSystem })),
    ...bazelFiles.map((f) => ({ path: f, type: 'bazel' as BuildSystem })),
    ...vcxprojFiles.map((f) => ({ path: f, type: 'vcxproj' as BuildSystem })),
    ...makeFiles.map((f) => ({ path: f, type: 'makefile' as BuildSystem })),
  ];

  if (allBuildFiles.length === 0) {
    // Check if there are C++ files even without a build system
    const cppFiles = await fg('**/*.{cpp,cc,cxx,h,hpp,hxx}', {
      cwd: rootPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/build/**'],
      deep: 3,
    });

    if (cppFiles.length === 0) {
      throw new Error(`No C++ project found in ${rootPath}`);
    }

    return [{
      name: basename(rootPath),
      path: rootPath,
      cppStandard: 'unknown',
      buildSystem: 'unknown',
      projectFiles: [],
      dependencies: [],
    }];
  }

  const projects: ProjectInfo[] = [];

  for (const buildFile of allBuildFiles) {
    const project = await parseBuildFile(buildFile.path, buildFile.type);
    if (project) {
      projects.push(project);
    }
  }

  // Deduplicate by project directory
  const seen = new Set<string>();
  return projects.filter((p) => {
    const dir = dirname(p.path);
    if (seen.has(dir)) return false;
    seen.add(dir);
    return true;
  });
}

async function parseBuildFile(filePath: string, buildSystem: BuildSystem): Promise<ProjectInfo | null> {
  const content = await readFile(filePath, 'utf-8');

  let cppStandard = 'unknown';
  const dependencies: DependencyRef[] = [];

  if (buildSystem === 'cmake') {
    // Extract C++ standard
    const stdMatch = content.match(/CMAKE_CXX_STANDARD\s+(\d+)/);
    if (stdMatch) cppStandard = `C++${stdMatch[1]}`;

    const cxxStdMatch = content.match(/cxx_std_(\d+)/);
    if (cxxStdMatch && cppStandard === 'unknown') cppStandard = `C++${cxxStdMatch[1]}`;

    // Extract find_package dependencies
    const findPkgRegex = /find_package\s*\(\s*(\w+)(?:\s+([^\s)]+))?\s*/g;
    let match;
    while ((match = findPkgRegex.exec(content)) !== null) {
      dependencies.push({ name: match[1], version: match[2] ?? '' });
    }

    // Extract FetchContent dependencies
    const fetchRegex = /FetchContent_Declare\s*\(\s*(\w+)/g;
    while ((match = fetchRegex.exec(content)) !== null) {
      dependencies.push({ name: match[1], version: 'fetched' });
    }

    // Extract target_link_libraries
    const linkRegex = /target_link_libraries\s*\([^)]*\b(\w+(?:::\w+)?)\b/g;
    while ((match = linkRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.match(/^\$/) && !dependencies.some((d) => d.name === dep)) {
        dependencies.push({ name: dep, version: '' });
      }
    }

    // Extract project name
    const projectMatch = content.match(/project\s*\(\s*(\w+)/i);
    const name = projectMatch ? projectMatch[1] : basename(dirname(filePath));

    return {
      name,
      path: filePath,
      cppStandard,
      buildSystem,
      projectFiles: [filePath],
      dependencies,
    };
  }

  if (buildSystem === 'meson') {
    const stdMatch = content.match(/cpp_std\s*[=:]\s*'?c\+\+(\d+)'?/);
    if (stdMatch) cppStandard = `C++${stdMatch[1]}`;

    const depRegex = /dependency\s*\(\s*'([^']+)'(?:\s*,\s*version\s*:\s*'([^']+)')?\)/g;
    let match;
    while ((match = depRegex.exec(content)) !== null) {
      dependencies.push({ name: match[1], version: match[2] ?? '' });
    }

    const projectMatch = content.match(/project\s*\(\s*'([^']+)'/);
    const name = projectMatch ? projectMatch[1] : basename(dirname(filePath));

    return {
      name,
      path: filePath,
      cppStandard,
      buildSystem,
      projectFiles: [filePath],
      dependencies,
    };
  }

  // For Makefile, vcxproj, and Bazel — extract what we can
  const stdFlags = content.match(/-std=c\+\+(\d+)/);
  if (stdFlags) cppStandard = `C++${stdFlags[1]}`;

  const name = buildSystem === 'vcxproj'
    ? basename(filePath, '.vcxproj')
    : basename(dirname(filePath));

  return {
    name,
    path: filePath,
    cppStandard,
    buildSystem,
    projectFiles: [filePath],
    dependencies,
  };
}
