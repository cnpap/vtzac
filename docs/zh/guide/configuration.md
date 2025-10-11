# 配置说明

本指南介绍如何配置 vtzac 以获得最佳性能和自定义体验。

## API 配置

### 基本用法

`zac` 函数接受两个参数：控制器类或实例，以及可选的配置选项。

```typescript
import { _http, setGlobalZacOfetchOptions } from 'vtzac/hook'
import { UserController } from './controllers/user.controller'

// 方法 1：传递控制器类和配置选项
const api = _http(UserController, {
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
})

// 方法 2：传递控制器实例
const api2 = _http(new UserController())
```

### 配置选项

#### ZacHttpOptions 接口

```typescript
interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<any>
}
```

`ofetchOptions` 字段接受所有标准的 ofetch 配置选项。

::: tip
有关所有可用选项和拦截器的完整文档，请参考 [ofetch 官方文档](https://github.com/unjs/ofetch)。
:::

## 全局配置

### 设置全局选项

使用 `setGlobalZacOfetchOptions` 为所有 API 调用设置默认配置：

```typescript
import { setGlobalZacOfetchOptions } from 'vtzac/hook'

setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
})
```

## 配置优先级

配置选项按以下顺序合并（后面的选项会覆盖前面的选项）：

1. **全局配置** - 通过 `setGlobalZacOfetchOptions()` 设置的选项（基础层）
2. **实例配置** - 传递给 `_http()` 函数的选项（覆盖全局配置）

合并遵循 JavaScript 对象展开语法：`{ ...globalOptions, ...instanceOptions }`

## 拦截器

vtzac 支持所有 ofetch 拦截器，用于在请求/响应生命周期中进行钩子操作。

### 可用拦截器

- **`onRequest`** - 在发送请求前调用
- **`onRequestError`** - 当请求失败时调用
- **`onResponse`** - 在接收到响应后调用
- **`onResponseError`** - 当响应状态为错误时调用

### 拦截器参数

每个拦截器根据其类型接收不同的参数。有关拦截器使用、参数和高级模式的详细信息，请参阅 [ofetch 拦截器文档](https://github.com/unjs/ofetch#interceptors)。

## 常见用例

vtzac 通过 ofetch 选项支持各种配置场景：

- **开发环境** - 配置本地开发设置，包括扩展超时和请求/响应日志记录
- **生产环境** - 设置生产 API 端点，包括适当的超时和重试策略
- **身份验证** - 通过请求拦截器添加身份验证令牌
- **错误处理** - 使用响应错误拦截器处理不同的错误场景

有关具体的实现示例和模式，请参考 [ofetch 文档](https://github.com/unjs/ofetch)。
