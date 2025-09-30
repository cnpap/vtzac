import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/demo/**',
    ],
    server: {
      deps: {
        inline: ['vitest-package-exports'],
      },
    },
  },
})
