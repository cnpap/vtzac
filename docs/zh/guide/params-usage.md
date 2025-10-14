# 参数传递

vtzac 支持多种参数传递方式，让你能够以类型安全的方式调用后端方法。

## 无参数：直接方法调用

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  @Get('hello')
  sayHello() {
    return { message: 'Hello World!' };
  }
}
```

**前端调用示例：**

```tsx
import { _http } from 'vtzac';
import { TestController } from './backend/test.controller';

// 创建控制器实例（指定后端地址）
const testController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
}).controller(TestController);

async function handleSayHello() {
  // 直接调用无参数方法
  const res = await testController.sayHello();

  console.log(res._data); // 输出：{ message: 'Hello World!' }
}
```

```
// 实际会发起的请求：
// GET /api/test/hello
// 返回的内容：
// { message: 'Hello World!' }
```

## 具名参数：使用 call 方法

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return { keyword, results: ['结果1', '结果2'] };
  }

  @Get('user/:id')
  getUser(@Param('id') id: string) {
    return { id, name: `用户${id}` };
  }

  @Get('profile')
  getProfile(@Headers('authorization') auth: string) {
    return { auth, profile: '用户资料' };
  }
}
```

**前端调用示例：**

```tsx
async function handleSearch() {
  // Query 参数调用
  const res = await testController.call('search', 'vtzac');

  console.log(res._data); // 输出：{ keyword: 'vtzac', results: ['结果1', '结果2'] }
}

async function handleGetUser() {
  // Path 参数调用
  const res = await testController.call('getUser', '123');

  console.log(res._data); // 输出：{ id: '123', name: '用户123' }
}

async function handleGetProfile() {
  // Headers 参数调用
  const res = await testController.call('getProfile', 'Bearer token123');

  console.log(res._data); // 输出：{ auth: 'Bearer token123', profile: '用户资料' }
}
```

```
// 实际会发起的请求：
// GET /api/test/search?keyword=vtzac
// GET /api/test/user/123
// GET /api/test/profile (with Authorization header)
```

## 混合参数：多种参数组合

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  @Post('user/:id/update')
  updateUser(
    @Param('id') id: string,
    @Body() data: { name: string; email: string },
    @Query('notify') notify?: boolean,
    @Headers('authorization') auth?: string
  ) {
    return { id, data, notify, auth, updated: true };
  }

  @Post('create')
  createUser(
    @Param() params: { id: string },
    @Query() query: { type: string; active: boolean }
  ) {
    return { params, query, created: true };
  }
}
```

**前端调用示例：**

```tsx
async function handleUpdateUser() {
  // 按参数顺序传递：Path、Body、Query、Headers
  const res = await testController.call(
    'updateUser',
    '123',
    { name: '新名称', email: 'new@example.com' },
    true,
    'Bearer token123'
  );

  console.log(res._data);
  // 输出：{ id: '123', data: { name: '新名称', email: 'new@example.com' }, notify: true, auth: 'Bearer token123', updated: true }
}

async function handleCreateUser() {
  // 参数对象形式调用
  const res = await testController.call(
    'createUser',
    { id: '456' },
    { type: 'admin', active: true }
  );

  console.log(res._data);
  // 输出：{ params: { id: '456' }, query: { type: 'admin', active: true }, created: true }
}
```

```
// 实际会发起的请求：
// POST /api/test/user/123/update?notify=true
// Body: { name: '新名称', email: 'new@example.com' }
// Headers: { authorization: 'Bearer token123' }
//
// POST /api/test/create?type=admin&active=true
// Body: { id: '456' }
```

vtzac 会自动根据后端方法的参数装饰器（`@Param`、`@Query`、`@Body`、`@Headers`）来正确处理参数传递，确保**类型安全**和请求格式的正确性。
