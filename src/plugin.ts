import type { AnalysisResult, ControllerInfo, HttpMethodInfo, MethodParameter } from './ast'
import { getFileParameterInfo, getFileUploadInfo } from './ast'

/**
 * 生成JavaScript类代码
 */
export function generateJavaScriptClass(analysisResult: AnalysisResult): string {
  const controllers = analysisResult.controllers

  if (controllers.length === 0) {
    return ''
  }

  // 生成导入语句
  const importStatement = 'import httpZac from \'virtual:http-zac\';'

  // 生成所有控制器的代码
  const classesCode = controllers.map(controller => generateControllerClass(controller)).join('\n\n')

  return `${importStatement}\n\n${classesCode}`
}

/**
 * 生成单个控制器类的代码
 */
function generateControllerClass(controller: ControllerInfo): string {
  const className = controller.name
  const methods = controller.methods.map(method => generateMethod(method)).join('\n\n')

  return `export class ${className} {
${methods}
}`
}

/**
 * 生成方法代码
 */
function generateMethod(method: HttpMethodInfo): string {
  const methodName = method.name
  const httpZacCall = generateHttpZacCall(method)

  return `  ${methodName}(...args) {
    return httpZac(${httpZacCall}, args);
  }`
}

/**
 * 生成 httpZac 函数调用参数
 */
function generateHttpZacCall(method: HttpMethodInfo): string {
  const httpMethod = method.httpMethod
  const path = method.path || ''
  const parameterMappings = method.parameters.map(param => generateParameterMapping(param, method)).filter(Boolean)

  // 获取文件上传信息
  const fileUploadInfo = getFileUploadInfo(method)

  const config: any = {
    method: httpMethod,
    path,
    parameters: parameterMappings,
  }

  // 如果有文件上传，添加文件上传配置
  if (fileUploadInfo.type !== 'none') {
    config.fileUpload = fileUploadInfo
  }

  return JSON.stringify(config, null, 2).replace(/"/g, '\'')
}

/**
 * 生成参数映射信息
 */
function generateParameterMapping(parameter: MethodParameter, method: HttpMethodInfo): any {
  const paramName = parameter.name
  const decorators = parameter.decorators

  if (decorators.length === 0) {
    return null
  }

  const decorator = decorators[0] // 取第一个装饰器
  const decoratorName = decorator.name
  const decoratorArgs = decorator.arguments

  const mapping: any = {
    name: paramName,
    decorator: decoratorName,
  }

  // 处理装饰器参数
  if (decoratorArgs.length > 0) {
    const firstArg = decoratorArgs[0]
    if (firstArg.type === 'string') {
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
