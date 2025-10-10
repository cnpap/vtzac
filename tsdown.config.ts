import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/hook.ts',
    'src/fetch.ts',
    'src/typed-emit.ts',
  ],
  dts: {
    build: true,
  },
  // 明确指定外部依赖，避免打包进最终文件
  external: [
    // Node.js 内置模块
    /^node:/,
    // npm 包名（不以 . 或 / 开头，也不是 Windows 路径）
    /^(?![./]|[A-Z]:)[^/]+/i,
  ],
  // 确保平台设置为 node
  platform: 'node',
  // 禁用 shims 避免 __filename 等 CommonJS 变量的问题
  shims: false,
})
