import type { FetchOptions, FetchResponse } from 'ofetch'

// import { TestInputController } from './backend/test-input.controller'
// import { setGlobalZacOfetchOptions } from './fetch'

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
  call: <TMethod extends MethodNames<T>>(
    _method: TMethod,
    ..._args: MethodParameters<T, TMethod>
  ) => Promise<FetchResponse<MethodReturnType<T, TMethod>>>
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
    async call<TMethod extends MethodNames<ExtractInstance<T>>>(
      _method: TMethod,
      ..._args: MethodParameters<ExtractInstance<T>, TMethod>
    ): Promise<FetchResponse<MethodReturnType<ExtractInstance<T>, TMethod>>> {
      // 这里可以使用 createOfetchOptions 来创建自定义的 ofetch 实例
      // 例如：const customFetch = createOfetchOptions ? ofetch.create(...createOfetchOptions) : ofetch
      return await (instance as any)[_method](options, ..._args)
    },
  }
}

export { setGlobalZacOfetchOptions } from './fetch'

// setGlobalZacOfetchOptions({
//   baseURL: 'https://api.example.com',
//   timeout: 5000,
// })

// // 现在两种方式都支持了！
// const api1 = zac(TestInputController, {
//   // 可以在这里传递 options
//   ofetchOptions: {
//     baseURL: 'https://api.example.com',
//     timeout: 5000,
//   },
// }) // 直接传递类
// const api2 = zac(new TestInputController()) // 传递实例

// async function demo(): Promise<boolean> {
//   // 两种 API 都有完整的类型支持，不管是输入函数名称还是函数参数，都有完整的类型提示。
//   // 返回值也有完整的类型提示。
//   const result1 = await api1
//     // 可以在这里调用 setOptions 来覆盖全局配置
//     .setOptions({
//       ofetchOptions: {
//         baseURL: 'https://api.example.com',
//         timeout: 5000,
//       },
//     })
//     .call('testComplex', '123', { name: 'test' }, 'v1.0', 'Bearer token')
//   const result2 = await api2.call('testComplex', '123', { name: 'test' }, 'v1.0', 'Bearer token')
//   const data = result1._data!
//   const data2 = result2._data!

//   return data.success && data2.success
// }

// demo()

// 配置优先级：
// 1. 调用时配置（call 方法的参数）
// 2. 实例配置（setOptions）
// 3. 调用时配置（call 方法的参数）
