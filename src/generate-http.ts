import type { AnalysisResult, ControllerInfo, HttpMethodInfo, MethodParameter } from './ast'
import { getFileParameterInfo, getFileUploadInfo } from './ast'

/**
 * HTTP 方法配置接口
 */
interface HttpMethodConfig {
  method: string
  path: string
  parameters: ParameterMapping[]
  fileUpload?: FileUploadConfig
  isSSE?: boolean
}

/**
 * 参数映射接口
 */
interface ParameterMapping {
  name: string
  decorator: string
  key?: string
  fileInfo?: FileInfo
}

/**
 * 文件信息接口
 */
interface FileInfo {
  uploadType: 'single' | 'multiple' | 'named-multiple'
  fileFields: {
    fieldName: string
    isArray: boolean
    maxCount?: number
  }[]
}

/**
 * 文件上传配置接口
 */
interface FileUploadConfig {
  type: 'single' | 'multiple' | 'named-multiple' | 'none'
  fieldNames?: string[]
  maxCount?: number
  details?: Record<string, { maxCount: number }>
}

/**
 * 生成JavaScript类代码
 */
export function generateHttpJavaScriptClass(analysisResult: AnalysisResult): string {
  const controllers = analysisResult.controllers

  if (controllers.length === 0) {
    return ''
  }

  // 生成导入语句
  const importStatement = 'import _api from \'vtzac/fetch\';'

  // 生成所有控制器的代码
  const classesCode = controllers.map(controller => generateControllerClass(controller)).join('\n\n')

  return `${importStatement}\n\n${classesCode}`
}

/**
 * 生成单个控制器类的代码
 */
function generateControllerClass(controller: ControllerInfo): string {
  const className = controller.name
  const methods = controller.methods.map(method => generateMethod(method, controller)).join('\n\n')

  return `export class ${className} {
${methods}
}`
}

/**
 * 生成方法代码
 */
function generateMethod(method: HttpMethodInfo, controller: ControllerInfo): string {
  const methodName = method.name
  const zacOfetchCall = generatezacOfetchCall(method, controller)

  return `  ${methodName}(options, ...args) {
    const input = ${zacOfetchCall};
    input.ofetchOptions = options.ofetchOptions
    return _api(input, args);
  }`
}

/**
 * 生成 zacOfetch 函数调用参数
 */
function generatezacOfetchCall(method: HttpMethodInfo, controller: ControllerInfo): string {
  const httpMethod = method.httpMethod
  const methodPath = method.path || ''
  const controllerPrefix = controller.prefix || ''

  // 组合控制器前缀和方法路径
  let path = ''
  if (controllerPrefix && methodPath) {
    path = `${controllerPrefix}/${methodPath}`
  }
  else if (controllerPrefix) {
    path = controllerPrefix
  }
  else if (methodPath) {
    path = methodPath
  }

  const parameterMappings = method.parameters
    .map(param => generateParameterMapping(param, method))
    .filter((mapping): mapping is ParameterMapping => mapping !== null)

  // 获取文件上传信息
  const fileUploadInfo = getFileUploadInfo(method)

  const config: HttpMethodConfig = {
    method: httpMethod,
    path,
    parameters: parameterMappings,
  }

  // 如果是 SSE 方法，添加 SSE 标记
  if (httpMethod === 'SSE') {
    config.isSSE = true
  }

  // 如果有文件上传，添加文件上传配置
  if (fileUploadInfo.type !== 'none') {
    config.fileUpload = fileUploadInfo as FileUploadConfig
  }

  return JSON.stringify(config, null, 2).replace(/"/g, '\'')
}

/**
 * 生成参数映射信息
 */
function generateParameterMapping(parameter: MethodParameter, method: HttpMethodInfo): ParameterMapping | null {
  const paramName = parameter.name
  const decorators = parameter.decorators

  if (decorators.length === 0) {
    return null
  }

  const decorator = decorators[0] // 取第一个装饰器
  const decoratorName = decorator.name
  const decoratorArgs = decorator.arguments

  const mapping: ParameterMapping = {
    name: paramName,
    decorator: decoratorName,
  }

  // 处理装饰器参数
  if (decoratorArgs.length > 0) {
    const firstArg = decoratorArgs[0]
    if (firstArg.type === 'string' && typeof firstArg.value === 'string') {
      mapping.key = firstArg.value
    }
  }

  // 处理文件上传相关的特殊信息
  if (decoratorName === 'UploadedFile' || decoratorName === 'UploadedFiles') {
    const fileInfo = getFileParameterInfo(method)
    if (fileInfo) {
      mapping.fileInfo = {
        uploadType: fileInfo.uploadType,
        fileFields: fileInfo.fileFields,
      }
    }
  }

  return mapping
}
