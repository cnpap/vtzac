import type { Plugin } from 'vite'
import path from 'node:path'
import { analyzeNestJSControllerFromCode } from './ast'
import { generateHttpJavaScriptClass } from './generate-http'
import { generateListenerJavaScriptClass, generateSocketJavaScriptClass } from './generate-socket'

export function vtzac(): Plugin {
  const normalize = (p: string): string => path.posix.normalize(p.replace(/\\/g, '/'))
  const stripQuery = (id: string): string => id.split('?')[0]

  return {
    name: 'vtzac',
    // 在构建与开发阶段都尽早运行，避免被其他插件预处理后的代码影响 AST 分析
    enforce: 'pre',
    transform(code, id) {
      // 统一 id，去掉查询参数并归一化路径，确保与 glob 结果一致
      const cleanId = normalize(stripQuery(id))
      // 检查是否是 glob 匹配的文件
      if (
        cleanId.endsWith('.gateway.ts')
        || cleanId.endsWith('.emitter.ts')
        || cleanId.endsWith('.controller.ts')
      ) {
        // 分析控制器代码
        const analysisResult = analyzeNestJSControllerFromCode(code, cleanId)

        // 根据文件类型生成相应的 JavaScript 代码
        let generatedCode: string
        if (cleanId.endsWith('.gateway.ts')) {
          // WebSocket Gateway 文件
          generatedCode = generateSocketJavaScriptClass(analysisResult)
        }
        else if (cleanId.endsWith('.emitter.ts')) {
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

export { _controller, _http, _socket, setGlobalZacOfetchOptions } from './hook'
// 导出流式处理相关功能
export { consumeEventStream, consumeStream } from './hook-http'

export type {
  ConsumeEventStreamOptions,
  EventSourceMessage,
  UseAIChatOptions,
  UseAIChatReturn,
  UseAICompletionOptions,
  UseAICompletionReturn,
} from './types'
