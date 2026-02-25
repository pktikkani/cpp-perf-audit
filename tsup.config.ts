import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'bin/cli.ts',
  },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  treeshake: true,
});
