import { describe, it, expect } from 'vitest';
import { categorizeFile, sortByPriority } from '../src/scanner/file-categorizer.js';

describe('categorizeFile', () => {
  describe('content-based categorization', () => {
    it('should categorize files with std::thread as concurrency', () => {
      const content = '#include <thread>\nstd::thread t(func);';
      expect(categorizeFile('src/worker.cpp', content)).toBe('concurrency');
    });

    it('should categorize files with std::mutex as concurrency', () => {
      const content = '#include <mutex>\nstd::mutex m;';
      expect(categorizeFile('src/lock.cpp', content)).toBe('concurrency');
    });

    it('should categorize files with std::atomic as concurrency', () => {
      const content = '#include <atomic>\nstd::atomic<int> counter;';
      expect(categorizeFile('src/counter.cpp', content)).toBe('concurrency');
    });

    it('should categorize files with operator new as allocator', () => {
      const content = 'void* operator new(size_t size) { return malloc(size); }';
      expect(categorizeFile('src/alloc.cpp', content)).toBe('allocator');
    });

    it('should categorize files with std::pmr as allocator', () => {
      const content = '#include <memory_resource>\nstd::pmr::vector<int> v;';
      expect(categorizeFile('src/pool.cpp', content)).toBe('allocator');
    });

    it('should categorize files with TEST() as test', () => {
      const content = 'TEST(MyTest, Works) { EXPECT_TRUE(true); }';
      expect(categorizeFile('test/my_test.cpp', content)).toBe('test');
    });

    it('should categorize files with TEST_CASE as test', () => {
      const content = 'TEST_CASE("it works") { REQUIRE(true); }';
      expect(categorizeFile('tests/test.cpp', content)).toBe('test');
    });

    it('should categorize files with int main as main', () => {
      const content = '#include <iostream>\nint main() { return 0; }';
      expect(categorizeFile('src/app.cpp', content)).toBe('main');
    });

    it('should categorize template-heavy files as template', () => {
      const content = 'template<typename T>\nclass Container { T value; };';
      expect(categorizeFile('src/container.hpp', content)).toBe('template');
    });
  });

  describe('path-based categorization', () => {
    it('should categorize .h files as header', () => {
      const content = '#pragma once\nclass Foo {};';
      expect(categorizeFile('include/foo.h', content)).toBe('header');
    });

    it('should categorize .hpp files as header', () => {
      const content = '#pragma once\nclass Bar {};';
      expect(categorizeFile('include/bar.hpp', content)).toBe('header');
    });

    it('should categorize .cpp files as implementation', () => {
      const content = '#include "foo.h"\nvoid doStuff() {}';
      expect(categorizeFile('src/foo.cpp', content)).toBe('implementation');
    });

    it('should categorize .cc files as implementation', () => {
      const content = '#include "bar.h"\nvoid doMore() {}';
      expect(categorizeFile('src/bar.cc', content)).toBe('implementation');
    });

    it('should categorize .ipp files as template', () => {
      const content = 'template<typename T>\nvoid Foo<T>::bar() {}';
      expect(categorizeFile('include/detail/foo.ipp', content)).toBe('template');
    });

    it('should categorize test paths as test', () => {
      const content = 'void testHelper() {}';
      expect(categorizeFile('test/helper.cpp', content)).toBe('test');
    });

    it('should categorize main.cpp by path as main', () => {
      const content = '// entry point';
      expect(categorizeFile('src/main.cpp', content)).toBe('main');
    });
  });

  describe('fallback', () => {
    it('should return other for unrecognized files', () => {
      const content = 'struct Config { int x; };';
      expect(categorizeFile('src/config.xyz', content)).toBe('other');
    });
  });
});

describe('sortByPriority', () => {
  it('should rank concurrency before implementation', () => {
    expect(sortByPriority('concurrency', 'implementation')).toBeLessThan(0);
  });

  it('should rank allocator before header', () => {
    expect(sortByPriority('allocator', 'header')).toBeLessThan(0);
  });

  it('should rank implementation before test', () => {
    expect(sortByPriority('implementation', 'test')).toBeLessThan(0);
  });

  it('should rank test after main', () => {
    expect(sortByPriority('test', 'main')).toBeGreaterThan(0);
  });

  it('should return 0 for same categories', () => {
    expect(sortByPriority('header', 'header')).toBe(0);
  });
});
