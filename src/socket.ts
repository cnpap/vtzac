import type { ManagerOptions, SocketOptions } from 'socket.io-client'
import { io, Socket } from 'socket.io-client'

/**
 * Socket.IO 配置接口
 */
export interface SocketConfig {
  eventName: string
  namespace?: string
  parameters: ParameterMapping[]
  socketIoOptions?: Partial<ManagerOptions & SocketOptions>
}

/**
 * 参数映射接口
 */
export interface ParameterMapping {
  name: string
  decorator: string
  key?: string
}

// 全局 Socket.IO 选项
let globalSocketOptions: Partial<ManagerOptions & SocketOptions> = {}

export function setGlobalSocketOptions(options: Partial<ManagerOptions & SocketOptions>): void {
  globalSocketOptions = options
}

// Socket 实例缓存
const socketInstances = new Map<string, Socket>()

/**
 * _socket 函数 - 构建并发送 Socket.IO 事件
 *
 * @param config Socket 配置对象
 * @param args 传入的参数数组
 * @returns Promise<any> Socket.IO 的事件发送结果
 */
export default function _socket(config: SocketConfig, args: any[]): Promise<any> {
  const { eventName, namespace, parameters } = config

  // 构建 Socket.IO 连接
  const socket = getOrCreateSocket(namespace, config.socketIoOptions)

  // 处理参数
  const eventData = processParameters(parameters, args)

  // 发送事件并返回 Promise
  return new Promise((resolve, reject) => {
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error(`Socket event '${eventName}' timeout`))
    }, 30000) // 30秒超时

    // 发送事件
    socket.emit(eventName, eventData, (response: any) => {
      clearTimeout(timeout)
      if (response && response.error) {
        reject(new Error(response.error))
      }
      else {
        resolve(response)
      }
    })
  })
}

/**
 * 获取或创建 Socket 连接
 */
function getOrCreateSocket(namespace?: string, options?: Partial<ManagerOptions & SocketOptions>): Socket {
  const uri = namespace ? `/${namespace}` : '/'
  const cacheKey = `${uri}_${JSON.stringify(options || {})}`

  let socket = socketInstances.get(cacheKey)
  if (!socket || socket.disconnected) {
    const mergedOptions = { ...globalSocketOptions, ...options }
    socket = io(uri, mergedOptions)
    socketInstances.set(cacheKey, socket)
  }

  return socket
}

/**
 * 处理所有参数，构建事件数据
 */
function processParameters(parameters: ParameterMapping[], args: any[]): any {
  if (parameters.length === 0) {
    return args.length === 1 ? args[0] : args
  }

  const eventData: any = {}
  let hasData = false

  parameters.forEach((param, index) => {
    const value = args[index]
    if (value === undefined)
      return

    switch (param.decorator) {
      case 'MessageBody':
        if (param.key) {
          // 具名消息体参数
          eventData[param.key] = value
          hasData = true
        }
        else {
          // 整个消息体
          if (typeof value === 'object' && value !== null) {
            Object.assign(eventData, value)
            hasData = true
          }
          else {
            eventData.data = value
            hasData = true
          }
        }
        break

      case 'ConnectedSocket':
        // Socket 参数在客户端忽略
        break

      default:
        // 其他装饰器作为普通数据处理
        eventData[param.name] = value
        hasData = true
        break
    }
  })

  // 如果没有处理任何数据，返回原始参数
  if (!hasData) {
    return args.length === 1 ? args[0] : args
  }

  return eventData
}

/**
 * 断开所有 Socket 连接
 */
export function disconnectAllSockets(): void {
  socketInstances.forEach((socket) => {
    socket.disconnect()
  })
  socketInstances.clear()
}

/**
 * 断开特定命名空间的 Socket 连接
 */
export function disconnectSocket(namespace?: string): void {
  const uri = namespace ? `/${namespace}` : '/'
  socketInstances.forEach((socket, key) => {
    if (key.startsWith(uri)) {
      socket.disconnect()
      socketInstances.delete(key)
    }
  })
}

/**
 * 获取 Socket 实例（用于监听事件）
 */
export function getSocket(namespace?: string, options?: Partial<ManagerOptions & SocketOptions>): Socket {
  return getOrCreateSocket(namespace, options)
}
