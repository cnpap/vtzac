import type { FetchOptions } from 'ofetch'
import type { Constructor, OfetchWrappedInstance } from './types'

// ZAC 配置选项类型，与 ofetch.create 参数保持一致
export interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<'json'>
}

// 主函数：只接受构造函数，返回包装后的实例（直接方法调用）
export function _http<T extends object>(Input: Constructor<T>, _options?: ZacHttpOptions): OfetchWrappedInstance<T> {
  const instance = new Input()
  const options = _options ?? {}

  // 使用 Proxy 进行按需注入：不改写实例，只在调用时把 options 作为首参插入
  const proxy = new Proxy(instance, {
    get(target: T, prop: string | symbol, receiver: unknown): unknown {
      const value = Reflect.get(target as object, prop, receiver) as unknown

      // 如果是函数，则包装它
      if (typeof value === 'function') {
        return (...args: unknown[]): unknown => {
          return (value as (...args: unknown[]) => unknown).call(target, options, ...args)
        }
      }

      // 如果不是函数，直接返回
      return value
    },
  }) as OfetchWrappedInstance<T>

  return proxy
}

export { setGlobalZacOfetchOptions } from './fetch'
