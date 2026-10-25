import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const FRONT = fs.existsSync(path.resolve(ROOT, '../frontend/server/component-bench-search.mjs')) ? path.resolve(ROOT, '../frontend') : path.resolve(ROOT, '..')
const { jevSearchPlugin } = await import(pathToFileURL(path.join(FRONT, 'server/component-bench-search.mjs')))
const { componentBenchPlugin } = await import(pathToFileURL(path.join(FRONT, 'server/component-bench.mjs')))

export default defineConfig({
  base: '/component-bench/',
  plugins: [
    react(),
    babel({ include: /[\\/]vendor[\\/]turntwogg[\\/]react-ui[\\/].*\.[jt]sx?$/, plugins: ['styled-jsx/babel'] }),
    tailwindcss(),
    componentBenchPlugin({ serveBench: false }),
    jevSearchPlugin(),
  ],
  resolve: {
    alias: [
      { find: /^\.\.\/dist\/index\.esm\.js$/, replacement: path.join(ROOT, 'src/vendor/turntwogg/react-ui/storybook-export.ts') },
      { find: '@paradise-ui/common', replacement: path.join(ROOT, 'src/vendor/paradise-ui/packages/common/src/index.ts') },
      { find: '@/lib/utils', replacement: path.join(ROOT, 'src/vendor/atxp/design-system/src/lib/utils.ts') },
      // Magic UI and shadcn import their helper as @/lib/utils or "cn".
      { find: /^@\//, replacement: path.join(ROOT, 'src/vendor') + '/' },
      { find: /^cn$/, replacement: path.join(ROOT, 'src/vendor/lib/utils.ts') },
    ],
  },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
})
