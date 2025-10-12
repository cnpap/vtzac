import type { FetchResponse } from 'ofetch'

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
