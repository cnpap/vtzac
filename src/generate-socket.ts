import type { AnalysisResult, GatewayInfo, MethodParameter, SocketEventInfo } from './ast'

/**
 * 生成 Socket.IO JavaScript 类代码
 */
export function generateSocketJavaScriptClass(analysisResult: AnalysisResult): string {
  const gateways = analysisResult.gateways

  if (gateways.length === 0) {
    return ''
  }

  // 生成导入语句
  const importStatement = 'import _socket from \'vtzac/socket\';'

  // 生成所有 Gateway 的代码
  const classesCode = gateways.map(gateway => generateGatewayClass(gateway)).join('\n\n')

  return `${importStatement}\n\n${classesCode}`
}

/**
 * 生成单个 Gateway 类的代码
 */
function generateGatewayClass(gateway: GatewayInfo): string {
  const className = gateway.name
  const methods = gateway.events.map(event => generateEventMethod(event, gateway)).join('\n\n')

  return `export class ${className} {
${methods}
}`
}

/**
 * 生成事件方法代码
 */
function generateEventMethod(event: SocketEventInfo, gateway: GatewayInfo): string {
  const methodName = event.name // 使用原始方法名作为函数名
  const socketCall = generateSocketCall(event, gateway)

  return `  ${methodName}(options, ...args) {
    const input = ${socketCall};
    input.socketIoOptions = options.socketIoOptions
    return _socket(input, args);
  }`
}

/**
 * 生成 Socket.IO 函数调用参数
 */
function generateSocketCall(event: SocketEventInfo, gateway: GatewayInfo): string {
  const eventName = event.eventName
  const namespace = gateway.namespace || ''

  const parameterMappings = event.parameters.map(param => generateParameterMapping(param)).filter(Boolean)

  const config: any = {
    eventName,
    namespace,
    parameters: parameterMappings,
  }

  return JSON.stringify(config, null, 2).replace(/"/g, '\'')
}

/**
 * 生成参数映射信息
 */
function generateParameterMapping(parameter: MethodParameter): any {
  const paramName = parameter.name
  const decorators = parameter.decorators

  if (decorators.length === 0) {
    return {
      name: paramName,
      decorator: 'MessageBody',
    }
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

  return mapping
}
