import type { AnalysisResult, EventEmitterInfo, GatewayInfo, SocketEventInfo } from './ast'

/**
 * 生成 Socket.IO JavaScript 类代码
 */
export function generateSocketJavaScriptClass(analysisResult: AnalysisResult): string {
  const gateways = analysisResult.gateways

  if (gateways.length === 0) {
    return ''
  }

  // 生成所有 Gateway 的代码
  return gateways.map(gateway => generateGatewayClass(gateway)).join('\n\n')
}

/**
 * 生成单个 Gateway 类的代码
 */
function generateGatewayClass(gateway: GatewayInfo): string {
  const className = gateway.name
  const namespace = gateway.namespace || ''
  const methods = gateway.events.map(event => generateEventMethod(event, gateway)).join('\n\n')

  return `export class ${className} {
  constructor() {
    this.socket = null;
  }

  getNamespace() {
    return '${namespace}';
  }

  __setSocket(socket) {
    this.socket = socket;
  }

${methods}
}`
}

/**
 * 生成事件方法代码
 */
function generateEventMethod(event: SocketEventInfo, _gateway: GatewayInfo): string {
  const methodName = event.name // 使用原始方法名作为函数名
  const eventName = event.eventName

  // 判断是否有返回值，如果返回值不是 void，则使用 emitWithAck
  const hasReturnValue = event.returnType && event.returnType !== 'void'
  const emitMethod = hasReturnValue ? 'emitWithAck' : 'emit'

  return `  ${methodName}(...args) {
    return this.socket.${emitMethod}('${eventName}', ...args);
  }`
}

/**
 * 生成 Socket.IO Listener JavaScript 类代码
 */
export function generateListenerJavaScriptClass(analysisResult: AnalysisResult): string {
  const eventEmitters = analysisResult.eventEmitters

  if (eventEmitters.length === 0) {
    return ''
  }

  // 生成所有 EventEmitter 的代码
  const classesCode = eventEmitters.map(emitter => generateListenerClass(emitter)).join('\n\n')

  return classesCode
}

/**
 * 生成单个 Listener 类的代码
 */
function generateListenerClass(emitter: EventEmitterInfo): string {
  const className = emitter.name
  const methods = emitter.events.map(event => generateListenerMethod(event, emitter)).join('\n\n')

  return `export class ${className} {
  constructor(socket) {
    this.socket = socket;
  }

${methods}
}`
}

/**
 * 生成监听器方法代码
 */
function generateListenerMethod(event: SocketEventInfo, _emitter: EventEmitterInfo): string {
  const methodName = event.name // 使用原始方法名作为函数名
  const eventName = event.eventName

  return `  ${methodName}(callback) {
    this.socket.on('${eventName}', callback);
  }`
}
