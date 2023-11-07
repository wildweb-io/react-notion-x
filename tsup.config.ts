import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.tsx',
    'src/third-party/code.tsx',
    'src/third-party/collection.tsx',
    'src/third-party/equation.tsx',
    'src/third-party/modal.tsx',
    'src/third-party/pdf.tsx'
  ],
  outDir: 'build',
  target: 'es2017',
  platform: 'browser',
  format: ['esm'],
  splitting: true,
  sourcemap: true,
  minify: true,
  dts: true,
  shims: false,
  external: ['fsevents.node']
})
