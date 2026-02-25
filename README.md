# cpp-perf-audit

A beautiful C++ performance & safety analysis CLI powered by Claude AI.

Point it at any C++ project and get actionable findings across four pillars — memory safety, performance, modern C++ idioms, and architecture.

## Quick Start

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run against a C++ project
npx cpp-perf-audit ./path/to/cpp-project
```

## Usage

```
Usage: cpp-perf-audit [path] [options]

Arguments:
  path                    Path to C++ project directory (default: ".")

Options:
  -f, --format <format>   Output format: terminal, markdown, html, json (default: "terminal")
  -o, --output <file>     Output file path (for markdown/html/json)
  --severity <level>      Minimum severity: critical, warning, suggestion (default: "suggestion")
  --no-stream             Disable streaming output
  --ci                    CI mode: exit code 1 if critical findings, minimal output
  -V, --version           Show version
  -h, --help              Show help
```

## Examples

```bash
# Terminal output with beautiful formatting
cpp-perf-audit ./MyEngine

# Generate HTML report
cpp-perf-audit ./MyEngine -f html -o report.html

# Markdown for PR comments
cpp-perf-audit ./MyEngine -f markdown -o findings.md

# CI pipeline (exits 1 if critical issues found)
cpp-perf-audit ./MyEngine --ci --severity critical

# JSON for programmatic consumption
cpp-perf-audit ./MyEngine -f json -o results.json
```

## Shell Integration (fzf)

Add these to your `.zshrc` for interactive project selection:

### Commands

| Command | What it does |
|---------|-------------|
| `cppaudit` | fzf picks a C++ project from your dirs, runs audit |
| `cppaudit /path/to/project` | Audit a specific C++ project |
| `cppaudit /path -f html` | Pass any extra flags through |
| `dotnetaudit` | fzf picks a .NET project from your dirs, runs audit |
| `dotnetaudit /path/to/project` | Audit a specific .NET project |

### Quick Aliases

| Alias | Expands to |
|-------|-----------|
| `cppaudit-html` | fzf pick + HTML report |
| `cppaudit-ci` | fzf pick + CI mode |
| `cppaudit-md` | fzf pick + Markdown output |
| `dotnetaudit-html` | fzf pick + HTML report |
| `dotnetaudit-ci` | fzf pick + CI mode |
| `dotnetaudit-md` | fzf pick + Markdown output |

### Setup

Requires `fzf` and `fd` installed (`brew install fzf fd`). Add to `~/.zshrc`:

```bash
# C++ Performance Audit (fzf project picker)
cppaudit() {
  local target="$1"
  shift 2>/dev/null
  local extra_args=("$@")
  if [[ -z "$target" ]]; then
    target=$(fd -t f '(CMakeLists\.txt|Makefile|meson\.build|BUILD|\.vcxproj)$' \
      ~/Documents ~/Projects ~/code ~/repos ~/src ~/dev ~/Work 2>/dev/null \
      | sed 's|/[^/]*$||' | sort -u \
      | fzf --prompt="⚡ Select C++ project to audit: " \
            --preview 'ls -la {} 2>/dev/null | head -20' \
            --preview-window=right:40%)
    [[ -z "$target" ]] && echo "No project selected." && return 1
  fi
  echo "⚡ Running cpp-perf-audit on: $target"
  cpp-perf-audit "$target" "${extra_args[@]}"
}

alias cppaudit-html='cppaudit "" -f html'
alias cppaudit-ci='cppaudit "" --ci'
alias cppaudit-md='cppaudit "" -f markdown'
```

## The Four Pillars

### Pillar 1: Bugs / Critical (Memory Safety & Undefined Behavior)

| Issue | Examples |
|-------|----------|
| **Raw pointer misuse** | Owning raw pointers, missing nullptr checks, use-after-free, double-free |
| **Missing RAII** | Resources not wrapped in RAII types (memory, file handles, mutexes) |
| **Buffer overflows** | Array out-of-bounds, unchecked operator[], C-style arrays |
| **Undefined behavior** | Signed integer overflow, null dereference, strict aliasing violations |
| **Data races** | Shared mutable state without synchronization |
| **Object lifetime** | Use-after-move, dangling references, iterator invalidation |

Sources: [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines), [Google Sanitizers](https://github.com/google/sanitizers/wiki), [Clang-Tidy](https://clang.llvm.org/extra/clang-tidy/)

### Pillar 2: Performance Issues

| Issue | Examples |
|-------|----------|
| **Unnecessary copies** | Pass-by-value of large objects, copy in range-for loops |
| **Allocation waste** | shared_ptr where unique_ptr suffices, missing vector::reserve() |
| **Cache misses** | Pointer chasing, virtual calls in tight loops, std::map overuse |
| **String waste** | Concatenation in loops, std::string where string_view works |
| **I/O overhead** | std::endl in loops (forces flush), unbuffered I/O |

Sources: [Abseil Performance Guide](https://abseil.io/fast/), [Abseil Tips](https://abseil.io/tips/), [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)

### Pillar 3: Modern C++ Improvements

| Improvement | Examples |
|-------------|----------|
| **Smart pointers** | make_unique/make_shared over raw new |
| **Type safety** | enum class, nullptr, override, [[nodiscard]] |
| **Move semantics** | noexcept on moves, pass-by-value + move for sinks |
| **Compile-time** | constexpr, if constexpr, structured bindings |
| **Standard library** | std::optional over sentinels, std::variant over unions |

Sources: [Effective Modern C++](https://www.aristeia.com/EMC++.html) (Scott Meyers), [C++ Best Practices](https://github.com/cpp-best-practices/cppbestpractices) (Jason Turner)

### Pillar 4: Architecture

| Concern | Examples |
|---------|----------|
| **Header hygiene** | Include-what-you-use, forward declarations, #pragma once |
| **Build system** | Sanitizer integration, warning flags (-Wall -Wextra -Werror) |
| **Class design** | Rule of Zero/Five, composition over inheritance |
| **Error handling** | Consistent exceptions or error codes, std::expected |
| **Concurrency** | Thread pool usage, clear ownership, synchronization hierarchy |

Sources: [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines), [The Art of Writing Efficient Programs](https://github.com/PacktPublishing/The-Art-of-Writing-Efficient-Programs) (Fedor Pikus)

## Supported Build Systems

- CMake (`CMakeLists.txt`)
- Meson (`meson.build`)
- Bazel (`BUILD`)
- Visual Studio (`*.vcxproj`)
- Make (`Makefile`)
- No build system (scans for C++ files directly)

## Safety Score

Each project gets a score from 0-100:
- **Critical** findings: -15 points each
- **Warning** findings: -5 points each
- **Suggestion** findings: -1 point each
- **Good patterns** are recognized and highlighted

## Requirements

- Node.js 20+
- Anthropic API key (`ANTHROPIC_API_KEY` environment variable)

## Development

```bash
npm install
npm run build
npm test
node dist/cli.js ./test-project
```

## License

MIT
