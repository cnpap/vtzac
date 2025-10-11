import type { ManagerOptions, SocketOptions } from 'socket.io-client'
import type { Constructor, ExtractInstance, SocketWrappedInstance } from './types'
import { io, Socket } from 'socket.io-client'

// ZAC Socket 配置选项类型
export interface ZacSocketOptions {
  socketIoOptions?: Partial<ManagerOptions & SocketOptions>
}

// Socket 发送器接口（方法直调）：返回与控制器方法同名的调用器
export type ZacSocketEmitter<T> = SocketWrappedInstance<T>

// Socket 初始化返回接口
export interface ZacSocketInstance {
  createEmitter: <T>(controller: Constructor<T> | T) => ZacSocketEmitter<ExtractInstance<T>>
  socket: Socket
  disconnect: () => void
}

// 全局 socket 实例缓存
const socketInstances = new Map<string, Socket>()

// 主函数：初始化 socket 连接
export function _socket(uri: string, options?: ZacSocketOptions): ZacSocketInstance {
  const cacheKey = `${uri}_${JSON.stringify(options?.socketIoOptions || {})}`
  // 检查是否已有相同配置的连接
  let socket = socketInstances.get(cacheKey)
  if (!socket) {
    // 创建新的 socket 连接
    socket = io(uri, options?.socketIoOptions)
    socketInstances.set(cacheKey, socket)
  }
  return {
    socket,
    disconnect: () => {
      socket?.disconnect()
      socketInstances.delete(cacheKey)
    },
    createEmitter: <T>(controller: Constructor<T> | T): ZacSocketEmitter<ExtractInstance<T>> => {
      let instance: ExtractInstance<T> = undefined as ExtractInstance<T>
      // 判断传入的是构造函数还是实例
      if (typeof controller === 'function') {
        instance = new (controller as Constructor<T>)(socket) as ExtractInstance<T>
      }
      else {
        (controller as any).__socket__(socket)
        instance = controller as ExtractInstance<T>
      }
      // Socket 方法不需要 options 参数，直接返回原始实例
      return instance as ZacSocketEmitter<ExtractInstance<T>>
    },
  }
}
