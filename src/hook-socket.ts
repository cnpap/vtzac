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
      // 判断传入的是构造函数还是实例
      const instance = (typeof controller === 'function' ? new (controller as Constructor<T>)() : controller) as ExtractInstance<T>

      // 构造一个方法直调的发送器对象：_emit.handleJoinChat(payload)
      const proto = Object.getPrototypeOf(instance)
      const keys = Object.getOwnPropertyNames(proto) as (keyof ExtractInstance<T>)[]
      const emitter: Partial<SocketWrappedInstance<ExtractInstance<T>>> = {}

      for (const key of keys) {
        if (key === 'constructor' || key === 'handleConnection' || key === 'handleDisconnect')
          continue

        const methodName = String(key)
        // 将 "handleXxx" 映射为事件名 "xxx"（首字母小写）
        const eventCore = methodName.startsWith('handle') ? methodName.slice('handle'.length) : methodName
        const eventName = eventCore.charAt(0).toLowerCase() + eventCore.slice(1)

        ;(emitter as any)[key] = (...args: any[]) => {
          if (!args || args.length === 0)
            socket.emit(eventName)
          else if (args.length === 1)
            socket.emit(eventName, args[0])
          else
            socket.emit(eventName, ...args)
        }
      }

      return emitter as ZacSocketEmitter<ExtractInstance<T>>
    },
  }
}
