import type { Plugin } from 'vite'
import { cwd } from 'node:process'
import fg from 'fast-glob'

export interface VtzacOptions {
  glob: string | string[]
}

export function vtzac(options: VtzacOptions): Plugin {
  return {
    name: 'vtzac',
    configResolved() {
      // 插件配置解析完成后的钩子
    },
    buildStart() {
      // 构建开始时处理 glob 文件
      const patterns = Array.isArray(options.glob) ? options.glob : [options.glob]
      const files = fg.sync(patterns, {
        cwd: cwd(),
        absolute: true,
      })

      // 这里可以添加对匹配文件的处理逻辑
      console.warn(`[vtzac] Found ${files.length} files matching patterns:`, patterns)
      files.forEach(file => console.warn(`  - ${file}`))
    },
  }
}

export default vtzac
