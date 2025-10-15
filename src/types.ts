import type { UIMessage } from 'ai'
import type { FetchResponse } from 'ofetch'

interface ResponseMap {
  blob: Blob
  text: string
  arrayBuffer: ArrayBuffer
  stream: ReadableStream<Uint8Array>
}
export type ResponseType = keyof ResponseMap | 'json'

// 类型工具：检测是否为构造函数
export type Constructor<T = object> = new (...args: any[]) => T

// 类型工具：从构造函数中提取实例类型
export type ExtractInstance<T> = T extends Constructor<infer U> ? U : T

// NestJS WebSocket 生命周期方法名称（这些方法不应该被客户端调用）
export type NestJSLifecycleMethods = 'handleConnection' | 'handleDisconnect'

// 类型工具：排除 NestJS 生命周期方法的类型
export type ExcludeLifecycleMethods<T> = Omit<T, NestJSLifecycleMethods>

// 类型工具：提取类的方法名（排除生命周期方法）
export type MethodNames<T> = {
  [K in keyof ExcludeLifecycleMethods<T>]: ExcludeLifecycleMethods<T>[K] extends (...args: any[]) => any ? K : never
}[keyof ExcludeLifecycleMethods<T>]

// 类型工具：提取方法的参数类型（基于过滤后的方法）
export type MethodParameters<T, M extends MethodNames<T>> = ExcludeLifecycleMethods<T>[M] extends (...args: infer P) => any ? P : never

// 类型工具：提取方法的返回类型（基于过滤后的方法）
export type MethodReturnType<T, M extends MethodNames<T>> = ExcludeLifecycleMethods<T>[M] extends (...args: any[]) => infer R ? R : never

// 类型工具：将返回类型包装为 Promise<FetchResponse<...>>，自动解包原本的 Promise
export type OfetchWrappedReturn<R> = R extends Promise<infer U>
  ? Promise<FetchResponse<U>>
  : Promise<FetchResponse<R>>

// 类型工具：对实例进行深加工，使所有方法返回 Promise<FetchResponse<原类型>>
export type OfetchWrappedInstance<T> = {
  [K in keyof ExcludeLifecycleMethods<T>]: ExcludeLifecycleMethods<T>[K] extends (...args: infer A) => infer R
    ? (...args: A) => OfetchWrappedReturn<R>
    : ExcludeLifecycleMethods<T>[K]
}

// 类型工具：对实例进行轻量包装，使所有方法直接发送 Socket 消息（返回 void）
// 类型工具：将返回类型包装为 Promise<...>，只对有返回值的方法进行包装
// void 返回值保持不变，其他返回值包装为 Promise
export type SocketWrappedReturn<R> = R extends void
  ? void
  : R extends Promise<infer U>
    ? Promise<U>
    : Promise<R>

// 类型工具：对实例进行轻量包装，只对有返回值的方法包装为 Promise<原类型>，void 方法保持不变
export type SocketWrappedInstance<T> = {
  [K in keyof ExcludeLifecycleMethods<T>]: ExcludeLifecycleMethods<T>[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => SocketWrappedReturn<R>
    : ExcludeLifecycleMethods<T>[K]
}

// EventSource 相关类型定义
export interface EventSourceMessage {
  /** The event ID to set the EventSource object's last event ID value. */
  id: string
  /** A string identifying the type of event described. */
  event: string
  /** The event data */
  data: string
  /** The reconnection interval (in milliseconds) to wait before retrying the connection */
  retry?: number
}

// 流式消费选项
export interface ConsumeEventStreamOptions {
  /**
   * Called when a response is received. Use this to validate that the response
   * actually matches what you expect (and throw if it doesn't.)
   */
  onOpen?: (response: Response) => Promise<void> | void

  /**
   * Called when a message is received. NOTE: Unlike the default browser
   * EventSource.onmessage, this callback is called for _all_ events,
   * even ones with a custom `event` field.
   */
  onMessage?: (ev: EventSourceMessage) => void

  /**
   * Called when a response finishes.
   */
  onClose?: () => void

  /**
   * Called when the stream finishes successfully (after onClose).
   */
  onFinish?: () => void

  /**
   * Called when there is any error processing messages / handling callbacks etc.
   */
  onError?: (err: Error) => void

  /**
   * AbortController signal to control the stream consumption
   */
  signal?: AbortSignal

  /**
   * 是否跳过自动过滤 [DONE] 消息的检查
   * 默认为 false，即默认会自动过滤掉 data 为 '[DONE]' 的消息
   * 设置为 true 时，所有消息都会传递给 onMessage 回调
   */
  skipDoneCheck?: boolean
}

// React hooks 相关类型定义

// 流式协议类型定义
export type StreamProtocol = 'sse' | 'text' | 'data'

// useAICompletion hook 的选项
export interface UseAICompletionOptions {
  /** 流式消息回调 */
  onMessage?: ConsumeEventStreamOptions['onMessage']
  /** 完成回调 */
  onFinish?: (completion: string) => void
  /** 错误回调 */
  onError?: ConsumeEventStreamOptions['onError']
  /** 指定所使用的流式协议，默认 'sse' */
  protocol?: StreamProtocol
}

// useAICompletion hook 的返回值
export interface UseAICompletionReturn {
  /** 当前生成的文本内容 */
  completion: string
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  /** 发起文本生成 */
  complete: (prompt: string) => Promise<void>
  /** 停止生成 */
  stop: () => void
  /** 重置状态 */
  reset: () => void
}

// useAIChat hook 的选项
export interface UseAIChatOptions {
  /** 初始消息列表 */
  initialMessages?: UIMessage[]
  /** 流式消息回调 */
  onMessage?: ConsumeEventStreamOptions['onMessage']
  /** 完成回调 */
  onFinish?: (message: UIMessage) => void
  /** 错误回调 */
  onError?: ConsumeEventStreamOptions['onError']
  /** 指定所使用的流式协议，默认 'sse' */
  protocol?: StreamProtocol
}

// useAIChat hook 的返回值
export interface UseAIChatReturn {
  /** 消息列表 */
  messages: UIMessage[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  /** 发送消息 */
  append: (content: string) => Promise<void>
  /** 重新生成最后一条消息 */
  reload: () => Promise<void>
  /** 停止生成 */
  stop: () => void
  /** 重置聊天 */
  reset: () => void
}
