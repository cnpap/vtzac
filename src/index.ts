import type { Plugin } from 'vite'
import { cwd } from 'node:process'
import fg from 'fast-glob'
import { analyzeNestJSControllerFromCode } from './ast'
import { generateHttpJavaScriptClass } from './generate-http'
import { generateListenerJavaScriptClass, generateSocketJavaScriptClass } from './generate-socket'

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
        : ['**/*controller.ts', '**/*.gateway.ts', '**/*.emitter.ts']
      matchedFiles = fg.sync(patterns, {
        cwd: cwd(),
        absolute: true,
        ignore: ['**/node_modules/**'],
      })
    },
    transform(code, id) {
      // 检查是否是 glob 匹配的文件
      if (matchedFiles.includes(id)) {
        // 分析控制器代码
        const analysisResult = analyzeNestJSControllerFromCode(code, id)

        // 根据文件类型生成相应的 JavaScript 代码
        let generatedCode: string
        if (id.endsWith('.gateway.ts')) {
          // WebSocket Gateway 文件
          generatedCode = generateSocketJavaScriptClass(analysisResult)
        }
        else if (id.endsWith('.emitter.ts')) {
          // EventEmitter 文件
          generatedCode = generateListenerJavaScriptClass(analysisResult)
        }
        else {
          // HTTP Controller 文件
          generatedCode = generateHttpJavaScriptClass(analysisResult)
        }

        return {
          code: generatedCode,
          map: null,
        }
      }
    },
  }
}

export default vtzac
