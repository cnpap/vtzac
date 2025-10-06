import type { Plugin } from 'vite'
import path from 'node:path'
import { cwd } from 'node:process'
import fg from 'fast-glob'
import { analyzeNestJSController } from './ast'
import { generateJavaScriptClass } from './plugin'
import fetch from './templates/fetch?raw'

export interface VtzacOptions {
  glob: string | string[]
  templates?: {
    fetch?: string
  }
}

export function vtzac(options: VtzacOptions): Plugin {
  let matchedFiles: string[] = []

  return {
    name: 'vtzac',
    configResolved() {
      // 插件配置解析完成后获取匹配的文件
      const patterns = Array.isArray(options.glob) ? options.glob : [options.glob]
      matchedFiles = fg.sync(patterns, {
        cwd: cwd(),
        absolute: true,
      })
    },
    resolveId(id) {
      if (id === 'virtual:http-zac') {
        return id
      }

      // 检查是否是 glob 匹配的文件
      const resolvedPath = path.resolve(cwd(), id)
      if (matchedFiles.includes(resolvedPath)) {
        return `${id}?vtzac-processed`
      }
    },
    load(id) {
      if (id === 'virtual:http-zac') {
        return options.templates?.fetch || fetch
      }

      // 处理 glob 匹配的文件
      if (id.endsWith('?vtzac-processed')) {
        const originalId = id.replace('?vtzac-processed', '')
        const resolvedPath = path.resolve(cwd(), originalId)

        if (matchedFiles.includes(resolvedPath)) {
          // 分析控制器文件
          const analysisResult = analyzeNestJSController(resolvedPath)

          // 生成 JavaScript 代码
          const generatedCode = generateJavaScriptClass(analysisResult)

          return generatedCode
        }
      }
    },
  }
}

export default vtzac
