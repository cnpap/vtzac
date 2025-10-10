import { TestInputController } from '../playground/src/backend/test-input.controller'
import { setGlobalZacOfetchOptions, zac } from './hook'

setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
})

// 现在两种方式都支持了！
const api1 = zac(TestInputController, {
  // 可以在这里传递 options
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
}) // 直接传递类
const api2 = zac(new TestInputController()) // 传递实例

async function demo(): Promise<boolean> {
  // 两种 API 都有完整的类型支持，不管是输入函数名称还是函数参数，都有完整的类型提示。
  // 返回值也有完整的类型提示。
  const result1 = await api1
    // 可以在这里调用 setOptions 来覆盖全局配置
    .setOptions({
      ofetchOptions: {
        baseURL: 'https://api.example.com',
        timeout: 5000,
      },
    })
    .call('testComplex', '123', { name: 'test' }, 'v1.0', 'Bearer token')
  const result2 = await api2.call('testComplex', '123', { name: 'test' }, 'v1.0', 'Bearer token')
  const data = result1._data!
  const data2 = result2._data!

  return data.success && data2.success
}

demo()

// 配置优先级：
// 1. 调用时配置（call 方法的参数）
// 2. 实例配置（setOptions）
// 3. 调用时配置（call 方法的参数）

// 额外的测试示例
api1.call(c => c.testComplex('123', { name: 'test' }, 'v1.0', 'Bearer token'))
