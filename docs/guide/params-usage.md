# 参数处理用例

## 无参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  @Get('hello')
  getHello() {
    return { message: 'Hello World!' }
  }
}
```

### 前端调用

```tsx
import { zac } from 'vtzac/hook'
import { TestController } from './backend/test.controller'

const testController = zac(TestController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  }
})

async function handleHello() {
  const res = await testController.call('getHello')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data) // { message: 'Hello World!' }
}
```

## 具名参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  // Query 具名参数
  @Get('query/named')
  testNamedQuery(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return { success: true, page, limit }
  }

  // Path 具名参数
  @Get('param/named/:userId/:postId')
  testNamedParam(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ) {
    return { success: true, userId, postId }
  }

  // Headers 具名参数
  @Get('headers/named')
  testNamedHeaders(
    @Headers('authorization') auth?: string,
  ) {
    return { success: true, auth }
  }
}
```

### 前端调用

```tsx
// Query 具名参数调用
async function handleNamedQuery() {
  const res = await testController.call('testNamedQuery', '1', '10')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data) // { success: true, page: '1', limit: '10' }
}

// Path 具名参数调用
async function handleNamedParam() {
  const res = await testController.call('testNamedParam', '123', '456')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data) // { success: true, userId: '123', postId: '456' }
}

// Headers 具名参数调用
async function handleNamedHeaders() {
  const res = await testController.call('testNamedHeaders', 'Bearer token123')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data) // { success: true, auth: 'Bearer token123' }
}
```

## 混合参数接口

### 后端实现

```typescript
@Controller('api/test')
export class TestController {
  @Put('complex/:id')
  testComplex(
    @Param('id') id: string,
    @Body() body: any,
    @Query('version') version?: string,
    @Headers('authorization') auth?: string,
  ) {
    return { success: true, id, body, version, auth }
  }

  // 参数对象形式
  @Get('param/object/:type/:id/:action')
  testParamObject(@Param() params: any) {
    return { success: true, params }
  }

  @Get('query/object')
  testQueryObject(@Query() query: any) {
    return { success: true, query }
  }
}
```

### 前端调用

```tsx
// 复杂混合参数调用
async function handleComplex() {
  const res = await testController.call(
    'testComplex',
    '123', // @Param('id')
    { name: '更新的名称', status: 'active' }, // @Body()
    'v1.0', // @Query('version')
    'Bearer token123' // @Headers('authorization')
  ).catch(error => console.error('请求失败:', error))

  console.log(res._data)
}

// 参数对象调用
async function handleParamObject() {
  const res = await testController.call('testParamObject', {
    type: 'user',
    id: '123',
    action: 'edit'
  }).catch(error => console.error('请求失败:', error))

  console.log(res._data) // { success: true, params: { type: 'user', id: '123', action: 'edit' } }
}

async function handleQueryObject() {
  const res = await testController.call('testQueryObject', {
    page: '1',
    limit: '10',
    search: 'test'
  }).catch(error => console.error('请求失败:', error))

  console.log(res._data) // { success: true, query: { page: '1', limit: '10', search: 'test' } }
}
```
