import { Options, defineConfig } from 'tsup'

const baseConfig: Options = {
  entry: [
    'src/index.tsx',
  ],
  outDir: 'build',
  target: 'es2015',
  platform: 'browser',
  format: ['esm'],
  splitting: false,
  shims: false,
  external: ['fsevents.node']
}

export default defineConfig([
  {
    ...baseConfig,
    outDir: 'build',
    minify: true,
    sourcemap: true
  }
])
