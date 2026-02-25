import type { FileCategory } from '../types/index.js';

interface CategoryPattern {
  category: FileCategory;
  patterns: RegExp[];
  pathPatterns?: RegExp[];
}

const categoryRules: CategoryPattern[] = [
  {
    category: 'concurrency',
    patterns: [
      /std::thread\b/,
      /std::mutex\b/,
      /std::atomic\b/,
      /std::condition_variable\b/,
      /std::async\b/,
      /std::future\b/,
      /std::shared_mutex\b/,
      /std::lock_guard\b/,
      /std::unique_lock\b/,
      /std::jthread\b/,
      /pthread_/,
    ],
    pathPatterns: [/thread/i, /concurren/i, /parallel/i, /async/i],
  },
  {
    category: 'allocator',
    patterns: [
      /allocator\b/,
      /memory_pool/i,
      /arena\b/i,
      /operator\s+new\b/,
      /operator\s+delete\b/,
      /std::pmr\b/,
      /malloc\b/,
      /free\b/,
    ],
    pathPatterns: [/alloc/i, /memory/i, /pool/i, /arena/i],
  },
  {
    category: 'test',
    patterns: [
      /TEST\s*\(/,
      /TEST_F\s*\(/,
      /TEST_P\s*\(/,
      /EXPECT_/,
      /ASSERT_/,
      /BOOST_AUTO_TEST/,
      /CATCH_TEST_CASE/,
      /TEST_CASE\s*\(/,
      /doctest/,
    ],
    pathPatterns: [/test/i, /spec/i, /_test\./i, /_tests\./i],
  },
  {
    category: 'main',
    patterns: [
      /int\s+main\s*\(/,
      /int\s+wmain\s*\(/,
    ],
    pathPatterns: [/main\.(cpp|cc|cxx|c)$/i],
  },
  {
    category: 'template',
    patterns: [
      /template\s*<[^>]*>\s*class/,
      /template\s*<[^>]*>\s*struct/,
    ],
    pathPatterns: [/\.ipp$/i, /\.tpp$/i, /_impl\.h/i],
  },
  {
    category: 'header',
    patterns: [],
    pathPatterns: [/\.(h|hpp|hxx|hh)$/i],
  },
  {
    category: 'implementation',
    patterns: [],
    pathPatterns: [/\.(cpp|cc|cxx|c)$/i],
  },
];

export function categorizeFile(filePath: string, content: string): FileCategory {
  // Content-based matching first (more specific)
  for (const rule of categoryRules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        return rule.category;
      }
    }
  }

  // Path-based matching second
  for (const rule of categoryRules) {
    if (rule.pathPatterns) {
      for (const pattern of rule.pathPatterns) {
        if (pattern.test(filePath)) {
          return rule.category;
        }
      }
    }
  }

  return 'other';
}

const categoryPriority: Record<FileCategory, number> = {
  concurrency: 0,
  allocator: 1,
  implementation: 2,
  header: 3,
  main: 4,
  template: 5,
  utility: 6,
  test: 7,
  other: 8,
};

export function sortByPriority(a: FileCategory, b: FileCategory): number {
  return categoryPriority[a] - categoryPriority[b];
}
