import type { FetchOptions } from 'ofetch'
import type { Constructor, ExtractInstance, OfetchWrappedInstance } from './types'

// ZAC 配置选项类型，与 ofetch.create 参数保持一致
export interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<any>
}

// 主函数：统一处理构造函数和实例，返回原始实例（直接方法调用）
export function _http<T>(input: Constructor<T> | T, _options?: ZacHttpOptions): OfetchWrappedInstance<ExtractInstance<T>> {
  const instance = (typeof input === 'function' ? new (input as Constructor<T>)() : input) as ExtractInstance<T>
  if (!_options) {
    _options = {}
  }

  // 运行时轻量包装：保持 this 语义，直调原方法；类型保持为原类方法，便于 IDE 跳转
  const proto = Object.getPrototypeOf(instance)
  const keys = Object.getOwnPropertyNames(proto) as (keyof ExtractInstance<T>)[]
  for (const key of keys) {
    if (key === 'constructor')
      continue
    const original = (proto as any)[key]
    if (typeof original === 'function') {
      // 包装方法：在不改变类型签名的前提下，运行时将 options 插入为首参
      ;(instance as any)[key] = (...args: any[]) => original.call(instance, _options, ...args)
    }
  }

  return instance as any
}

export { setGlobalZacOfetchOptions } from './fetch'
