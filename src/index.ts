import type { Plugin } from 'vite'
import { cwd } from 'node:process'
import fg from 'fast-glob'
import { analyzeNestJSControllerFromCode } from './ast'
import { generateJavaScriptClass } from './plugin'

export interface VtzacOptions {
  glob?: string | string[]
  templates?: {
    fetch?: string
  }
}

export function vtzac(options: VtzacOptions = {} as VtzacOptions): Plugin {
  let matchedFiles: string[] = []

  return {
    name: 'vtzac',
    configResolved() {
      // 插件配置解析完成后获取匹配的文件
      const patterns = options.glob
        ? (Array.isArray(options.glob) ? options.glob : [options.glob])
        : ['**/*controller.ts']
      matchedFiles = fg.sync(patterns, {
        cwd: cwd(),
        absolute: true,
      })
    },
    transform(code, id) {
      // 检查是否是 glob 匹配的文件
      if (matchedFiles.includes(id)) {
        // 分析控制器代码
        const analysisResult = analyzeNestJSControllerFromCode(code, id)

        // 生成 JavaScript 代码
        const generatedCode = generateJavaScriptClass(analysisResult)

        return {
          code: generatedCode,
          map: null,
        }
      }
    },
  }
}

export default vtzac
