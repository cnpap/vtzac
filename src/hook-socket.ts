import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import type { Constructor, ExcludeLifecycleMethods, SocketWrappedInstance } from './types'
import { io } from 'socket.io-client'

// Gateway 实例接口，定义生成的 Gateway 类必须实现的方法
export interface GatewayInstance {
  getNamespace: () => string
  __setSocket: (socket: Socket) => void
}

// ZAC Socket 配置选项类型
export interface ZacSocketOptions {
  socketIoOptions?: Partial<ManagerOptions & SocketOptions>
}

// Socket 发送器接口（方法直调）：返回与控制器方法同名的调用器
export type ZacSocketEmitter<T> = SocketWrappedInstance<T>

// Socket 监听器接口：将事件发送器的方法转换为监听器
export type ZacSocketListener<T> = {
  [K in keyof ExcludeLifecycleMethods<T>]: ExcludeLifecycleMethods<T>[K] extends (
    ...args: any[]
  ) => infer R
    ? (callback: (data: R) => void) => void
    : never
}

// Socket 初始化返回接口
export interface ZacSocketInstance<E> {
  emitter: ZacSocketEmitter<E>
  createListener: <T>(eventEmitter: Constructor<T>) => ZacSocketListener<T>
  socket: Socket
  disconnect: () => void
}

// 全局 socket 实例缓存
const socketInstances = new Map<string, Socket>()

function joinUrl(baseurl: string, namespace?: string): string {
  const base = (baseurl || '').replace(/\/+$/, '')
  const ns = (namespace || '').replace(/^\/+/, '')
  if (!ns)
    return base || '/'
  return `${base}/${ns}`
}

// 主函数：初始化 socket 连接
export function _socket<T>(baseurl: string, Gateway: Constructor<T>, options?: ZacSocketOptions): ZacSocketInstance<T> {
  const instance = new Gateway()
  const gatewayInstance = instance as unknown as GatewayInstance
  const namespace = gatewayInstance.getNamespace()
  const uri = joinUrl(baseurl, namespace)
  const cacheKey = `${uri}_${JSON.stringify(options?.socketIoOptions || {})}`
  // 检查是否已有相同配置的连接
  let socket = socketInstances.get(cacheKey)
  if (!socket) {
    // 创建新的 socket 连接
    socket = io(uri, options?.socketIoOptions)
    socketInstances.set(cacheKey, socket)
  }
  gatewayInstance.__setSocket(socket)
  return {
    socket,
    emitter: instance as ZacSocketEmitter<T>,
    disconnect: () => {
      socket?.disconnect()
      socketInstances.delete(cacheKey)
    },
    createListener: <U>(EventEmitter: Constructor<U>): ZacSocketListener<U> =>
      new EventEmitter(socket) as ZacSocketListener<U>,
  }
}
