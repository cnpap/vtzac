import type { FetchOptions } from 'ofetch'
import type { Constructor, OfetchWrappedInstance } from './types'

// ZAC 配置选项类型，与 ofetch.create 参数保持一致
export interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<any>
}

// 主函数：只接受构造函数，返回包装后的实例（直接方法调用）
export function _http<T>(input: Constructor<T>, _options?: ZacHttpOptions): OfetchWrappedInstance<T> {
  const instance = new (input as Constructor<T>)() as T
  const options = _options ?? {}

  // 使用 Proxy 进行按需注入：不改写实例，只在调用时把 options 作为首参插入
  const proxy = new Proxy(instance as any, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      return (...args: any[]) => (value as (...args: any[]) => any).call(target, options, ...args)
    },
  })

  return proxy as any
}

export { setGlobalZacOfetchOptions } from './fetch'
