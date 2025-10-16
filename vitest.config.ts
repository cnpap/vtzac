import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  // 加载 examples/nestjs-example/.env 环境变量
  const env = loadEnv(mode, path.resolve(__dirname, 'examples/nestjs-example'), '')

  return {
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
      env,
    },
  }
})
