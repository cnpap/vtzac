# 参数使用示例

## 无参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  @Get('hello')
  sayHello() {
    return { message: 'Hello World!' }
  }
}
```

### 前端调用

```tsx
import { _http } from 'vtzac/hook'
import { TestController } from './backend/test.controller'

const testController = _http(TestController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
})

async function handleSayHello() {
  const res = await testController
    .call('sayHello')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { message: 'Hello World!' }
}
```

## 具名参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  // Query 具名参数
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return { keyword, results: [`结果1`, `结果2`] }
  }

  // Path 具名参数
  @Get('user/:id')
  getUser(@Param('id') id: string) {
    return { id, name: `用户${id}` }
  }

  // Headers 具名参数
  @Get('profile')
  getProfile(@Headers('authorization') auth: string) {
    return { auth, profile: '用户资料' }
  }
}
```

### 前端调用

```tsx
async function handleSearch() {
  // Query 具名参数调用
  const res = await testController
    .call('search', 'vtzac')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { keyword: 'vtzac', results: ['结果1', '结果2'] }
}

async function handleGetUser() {
  // Path 具名参数调用
  const res = await testController
    .call('getUser', '123')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { id: '123', name: '用户123' }
}

async function handleGetProfile() {
  // Headers 具名参数调用
  const res = await testController
    .call('getProfile', 'Bearer token123')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { auth: 'Bearer token123', profile: '用户资料' }
}
```

## 混合参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  // 复杂混合参数
  @Post('user/:id/update')
  updateUser(
    @Param('id') id: string,
    @Body() data: { name: string, email: string },
    @Query('notify') notify?: boolean,
    @Headers('authorization') auth?: string
  ) {
    return { id, data, notify, auth, updated: true }
  }

  // 参数对象形式
  @Post('create')
  createUser(
    @Param() params: { id: string },
    @Query() query: { type: string, active: boolean }
  ) {
    return { params, query, created: true }
  }
}
```

### 前端调用

```tsx
async function handleUpdateUser() {
  // 复杂混合参数调用
  const res = await testController
    .call(
      'updateUser',
      '123',
      { name: '新名称', email: 'new@example.com' },
      true,
      'Bearer token123'
    )
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { id: '123', data: { name: '新名称', email: 'new@example.com' }, notify: true, auth: 'Bearer token123', updated: true }
}

async function handleCreateUser() {
  // 参数对象调用
  const res = await testController
    .call('createUser', { id: '456' }, { type: 'admin', active: true })
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
  // 输出: { params: { id: '456' }, query: { type: 'admin', active: true }, created: true }
}
```
