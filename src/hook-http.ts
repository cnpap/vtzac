import type { FetchOptions } from 'ofetch'
import type { Constructor, OfetchWrappedInstance, ResponseType } from './types'
import { ofetch } from 'ofetch'

// ZAC 配置选项类型，与 ofetch.create 参数保持一致
export interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<ResponseType>
}

export function _controller<T extends object>(Input: Constructor<T>, options?: ZacHttpOptions): OfetchWrappedInstance<T> {
  const instance = new Input()
  const httpOptions = options ?? {}

  // 使用 Proxy 进行按需注入：不改写实例，只在调用时把 options 作为首参插入
  const proxy = new Proxy(instance, {
    get(target: T, prop: string | symbol, receiver: unknown): unknown {
      const value = Reflect.get(target as object, prop, receiver) as unknown

      // 如果是函数，则包装它
      if (typeof value === 'function') {
        return (...args: unknown[]): unknown => {
          return (value as (...args: unknown[]) => unknown).call(target, httpOptions, ...args)
        }
      }

      // 如果不是函数，直接返回
      return value
    },
  }) as OfetchWrappedInstance<T>

  return proxy
}

// 主函数：返回包含 controller 的对象
export function _http<T = object>(options?: ZacHttpOptions): {
  ofetch: OfetchWrappedInstance<T>
  controller: <T2 extends object>(Input: Constructor<T2>) => OfetchWrappedInstance<T2>
} {
  if (!options) {
    options = {}
  }
  if (!options.ofetchOptions) {
    options.ofetchOptions = {}
  }
  const fetch = ofetch.create(options?.ofetchOptions) as OfetchWrappedInstance<T>
  return {
    ofetch: fetch,
    controller: <T2 extends object>(Input: Constructor<T2>) => _controller(Input, options),
  }
}

export { setGlobalZacOfetchOptions } from './fetch'
export { consumeEventStream } from './stream'
