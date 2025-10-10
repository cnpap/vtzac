import type { FetchOptions, FetchResponse } from 'ofetch'

// 类型工具：检测是否为构造函数
type Constructor<T = object> = new (...args: any[]) => T

// 类型工具：从构造函数中提取实例类型
type ExtractInstance<T> = T extends Constructor<infer U> ? U : T

// 类型工具：提取类的方法名
type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

// 类型工具：提取方法的参数类型
type MethodParameters<T, M extends MethodNames<T>> = T[M] extends (...args: infer P) => any ? P : never

// 类型工具：提取方法的返回类型
type MethodReturnType<T, M extends MethodNames<T>> = T[M] extends (...args: any[]) => infer R ? R : never

// 类型工具：提取 ofetch.create 的参数类型
// type OfetchCreateParameters = Parameters<typeof ofetch.create>

// ZAC 配置选项类型，与 ofetch.create 参数保持一致
interface ZacOptions {
  ofetchOptions?: FetchOptions<any>
}

// API 接口类型
interface ZacAPI<T> {
  setOptions: (newOptions: ZacOptions) => ZacAPI<T>
  call: (<M extends MethodNames<T>>(
    _method: M,
    ..._args: MethodParameters<T, M>
  ) => Promise<FetchResponse<MethodReturnType<T, M>>>) & (<F extends (...args: any[]) => any>(
    selector: (c: T) => ReturnType<F>
  ) => Promise<FetchResponse<ReturnType<F>>>)
}

// 主函数：统一处理构造函数和实例
export function zac<T>(input: Constructor<T> | T, options?: ZacOptions): ZacAPI<ExtractInstance<T>> {
  // 判断传入的是构造函数还是实例
  const instance = (typeof input === 'function' ? new (input as Constructor<T>)() : input) as ExtractInstance<T>
  if (!options) {
    options = {}
  }
  return {
    setOptions(newOptions: ZacOptions): ZacAPI<ExtractInstance<T>> {
      const newNestOptions = { ...options, ...newOptions }
      return zac(instance as T, newNestOptions)
    },
    async call(
      ...allArgs: any[]
    ): Promise<any> {
      const first = allArgs[0]
      if (typeof first === 'function') {
        let methodKey: keyof ExtractInstance<T> | undefined
        let capturedArgs: any[] = []
        const proxy = new Proxy({}, {
          get(_target, prop) {
            methodKey = prop as keyof ExtractInstance<T>
            return (...args: any[]) => {
              capturedArgs = args
            }
          },
        }) as ExtractInstance<T>

        ;(first as (c: ExtractInstance<T>) => any)(proxy)

        if (!methodKey) {
          throw new Error('无法解析方法名，请使用形如 c => c.method(args) 的选择器')
        }

        return await (instance as any)[methodKey!](options, ...capturedArgs)
      }

      const _method = first as keyof ExtractInstance<T>
      const _args = allArgs.slice(1)
      return await (instance as any)[_method](options, ..._args)
    },
  }
}

export { setGlobalZacOfetchOptions } from './fetch'
