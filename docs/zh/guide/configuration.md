# 配置

## HTTP：实例配置与全局配置

### 基本配置

**前端配置示例：**

```typescript
import { _http, setGlobalZacOfetchOptions } from 'vtzac/hook';
import { UserController } from './controllers/user.controller';

// 创建控制器实例（指定后端地址和超时时间）
const api = _http(UserController, {
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
});

// 调用后端方法
const user = await api.getUser('123');
console.log(user._data); // 输出：{ id: '123', name: 'Alice' }
```

```
// 实际会发起的请求：
// GET https://api.example.com/api/user/123
// 超时时间：5000ms
```

### 全局配置

**全局配置示例：**

```typescript
import { setGlobalZacOfetchOptions } from 'vtzac/hook';

// 设置全局默认配置
setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
});

// 所有后续的 _http 调用都会使用这些默认配置
const api = _http(UserController); // 自动使用全局配置
```

## 配置优先级

配置选项按以下顺序合并：

1. **全局配置**：通过 `setGlobalZacOfetchOptions()` 设置
2. **实例配置**：传递给 `_http()` 函数的选项（会覆盖全局配置）

**配置合并示例：**

```typescript
// 全局配置
setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 3000,
  retry: 1,
});

// 实例配置（会覆盖全局的 timeout 和 retry）
const api = _http(UserController, {
  ofetchOptions: {
    timeout: 8000,
    retry: 5,
  },
});

// 最终生效的配置：
// baseURL: 'https://api.example.com' (来自全局)
// timeout: 8000 (来自实例，覆盖全局)
// retry: 5 (来自实例，覆盖全局)
```

## 拦截器

### 请求拦截器

**身份验证拦截器示例：**

```typescript
const api = _http(UserController, {
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    onRequest({ request, options }) {
      // 自动添加认证令牌
      const token = localStorage.getItem('auth-token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      console.log('发送请求:', request); // 输出：发送请求: https://api.example.com/api/user/123
    },
  },
});
```

### 响应拦截器

**错误处理拦截器示例：**

```typescript
const api = _http(UserController, {
  ofetchOptions: {
    onResponseError({ response }) {
      if (response.status === 401) {
        // 自动跳转到登录页
        window.location.href = '/login';
        console.log('认证失败，跳转登录'); // 输出：认证失败，跳转登录
      }
    },
    onResponse({ response }) {
      console.log('响应状态:', response.status); // 输出：响应状态: 200
    },
  },
});
```

## 常见配置场景

### 开发环境配置

```typescript
setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3001',
  timeout: 10000, // 开发环境延长超时时间
  onRequest({ request }) {
    console.log('开发环境请求:', request); // 输出：开发环境请求: http://localhost:3001/api/user
  },
});
```

### 生产环境配置

```typescript
setGlobalZacOfetchOptions({
  baseURL: 'https://api.production.com',
  timeout: 5000,
  retry: 3, // 生产环境启用重试
  onRequestError({ error }) {
    console.error('请求失败:', error.message); // 输出：请求失败: Network Error
  },
});
```
