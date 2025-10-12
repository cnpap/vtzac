import type { Server, Socket } from 'socket.io'

// 事件名元数据的 Symbol，避免字符串键冲突
const EVENT_SYMBOL = Symbol.for('vtzac.emit.event')

/**
 * 带有事件名元数据的函数类型
 */
interface EventFunction {
  (...args: unknown[]): unknown
  [EVENT_SYMBOL]?: string
}

/**
 * 为方法声明事件名的装饰器。
 * 事件名会被挂载到方法本身上，后续由 emitWith 读取。
 */
export function Emit(eventName: string) {
  return <T extends object, K extends string | symbol, F extends (...args: unknown[]) => unknown>(
    _target: T,
    _key: K,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor.value && typeof descriptor.value === 'function') {
      (descriptor.value as EventFunction)[EVENT_SYMBOL] = eventName
    }
    return descriptor
  }
}

type InferArgs<T> = T extends (...args: infer A) => unknown ? A : never
type InferReturn<T> = T extends (...args: unknown[]) => infer R ? R : never

/**
 * 通用派发器类型
 */
export type Dispatcher<E extends string, D> = (event: E, data: D) => void

/**
 * 事件发射器返回类型
 */
interface EmitResult<T> {
  /** 使用自定义派发器 */
  to: (dispatch: Dispatcher<string, T>) => void
  /** 派发到整个 server（广播） */
  toServer: (server: Server) => void
  /** 派发到指定客户端 */
  toClient: (client: Socket) => void
  /** 派发到指定房间（不包含当前 client） */
  toRoom: (client: Socket, room: string) => void
  /** 派发到指定房间（包含当前 client） */
  toRoomAll: (server: Server, room: string) => void
}

function getEventName<T extends (...args: unknown[]) => unknown>(fn: T): string {
  return (fn as EventFunction)[EVENT_SYMBOL] ?? fn.name
}

/**
 * 使用方法优先、参数类型安全的调用方式：
 * 1) 先选择被装饰的方法（可携带 this 上下文）
 * 2) 填写方法的业务参数（获得完整类型提示）
 * 3) 链式选择派发目标（server/client/room 或自定义 dispatcher）
 *
 * 使用示例：
 *   emitWith(this.demoEmiter.sayAAA, this.demoEmiter)('yangweijie', 18)
 *     .toClient(client)
 *
 *   emitWith(this.demoEmiter.sayAAA, this.demoEmiter)('yangweijie', 18)
 *     .toRoom(client, 'public')
 *
 *   emitWith(this.demoEmiter.sayAAA, this.demoEmiter)('yangweijie', 18)
 *     .toServer(this.server)
 */
export function emitWith<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ctx?: object,
): (...args: InferArgs<T>) => EmitResult<InferReturn<T>> {
  type Payload = InferReturn<T>
  const event = getEventName(fn)

  return (...args: InferArgs<T>): EmitResult<Payload> => {
    const data = fn.apply(ctx, args) as Payload

    return {
      /** 使用自定义派发器 */
      to: (dispatch: Dispatcher<string, Payload>) => dispatch(event, data),

      /** 派发到整个 server（广播） */
      toServer: (server: Server) => server.emit(event, data),

      /** 派发到指定客户端 */
      toClient: (client: Socket) => client.emit(event, data),

      /** 派发到指定房间（不包含当前 client） */
      toRoom: (client: Socket, room: string) => client.to(room).emit(event, data),

      /** 派发到指定房间（包含当前 client） */
      toRoomAll: (server: Server, room: string) => server.to(room).emit(event, data),
    }
  }
}

/**
 * 可选：派发器辅助构造，便于复用自定义派发逻辑
 */
export const dispatch = {
  /** 广播到整个 server */
  server: <T = unknown>(server: Server): Dispatcher<string, T> =>
    (event, data) => server.emit(event, data),

  /** 发送到指定客户端 */
  client: <T = unknown>(client: Socket): Dispatcher<string, T> =>
    (event, data) => client.emit(event, data),

  /** 发送到指定房间（不包含当前 client） */
  room: <T = unknown>(client: Socket, room: string): Dispatcher<string, T> =>
    (event, data) => client.to(room).emit(event, data),

  /** 发送到指定房间（包含当前 client） */
  roomAll: <T = unknown>(server: Server, room: string): Dispatcher<string, T> =>
    (event, data) => server.to(room).emit(event, data),
}
