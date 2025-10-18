# Parameter Handling

vtzac supports multiple parameter passing methods, allowing you to call backend methods in a **type-safe** manner.

## No Parameters: Direct Method Call

**Backend Controller Example:**

```typescript
@Controller('api/test')
export class TestController {
  @Get('hello')
  sayHello() {
    return { message: 'Hello World!' };
  }
}
```

**Frontend Usage Example:**

```ts
import { _http } from 'vtzac';
import { TestController } from './backend/test.controller';

// Create controller instance (specify backend URL)
const testController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
}).controller(TestController);

async function handleSayHello() {
  // Direct call to parameterless method
  const res = await testController.sayHello();

  console.log(res._data); // Output: { message: 'Hello World!' }
}
```

```
// Actual request sent:
// GET /api/test/hello
// Response content:
// { message: 'Hello World!' }
```

## Named Parameters: Using call Method

**Backend Controller Example:**

```typescript
@Controller('api/test')
export class TestController {
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return { keyword, results: ['Result 1', 'Result 2'] };
  }

  @Get('user/:id')
  getUser(@Param('id') id: string) {
    return { id, name: `User ${id}` };
  }

  @Get('profile')
  getProfile(@Headers('authorization') auth: string) {
    return { auth, profile: 'User Profile' };
  }
}
```

**Frontend Usage Example:**

```ts
async function handleSearch() {
  // Query parameter call
  const res = await testController.call('search', 'vtzac');

  console.log(res._data); // Output: { keyword: 'vtzac', results: ['Result 1', 'Result 2'] }
}

async function handleGetUser() {
  // Path parameter call
  const res = await testController.call('getUser', '123');

  console.log(res._data); // Output: { id: '123', name: 'User 123' }
}

async function handleGetProfile() {
  // Headers parameter call
  const res = await testController.call('getProfile', 'Bearer token123');

  console.log(res._data); // Output: { auth: 'Bearer token123', profile: 'User Profile' }
}
```

```
// Actual requests sent:
// GET /api/test/search?keyword=vtzac
// GET /api/test/user/123
// GET /api/test/profile (with Authorization header)
```

## Mixed Parameters: Multiple Parameter Combinations

**Backend Controller Example:**

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

**Frontend Usage Example:**

```ts
async function handleUpdateUser() {
  // Pass parameters in order: Path, Body, Query, Headers
  const res = await testController.call(
    'updateUser',
    '123',
    { name: 'New Name', email: 'new@example.com' },
    true,
    'Bearer token123'
  );

  console.log(res._data);
  // Output: { id: '123', data: { name: 'New Name', email: 'new@example.com' }, notify: true, auth: 'Bearer token123', updated: true }
}

async function handleCreateUser() {
  // Parameter object form call
  const res = await testController.call(
    'createUser',
    { id: '456' },
    { type: 'admin', active: true }
  );

  console.log(res._data);
  // Output: { params: { id: '456' }, query: { type: 'admin', active: true }, created: true }
}
```

```
// Actual requests sent:
// POST /api/test/user/123/update?notify=true
// Body: { name: 'New Name', email: 'new@example.com' }
// Headers: { authorization: 'Bearer token123' }
//
// POST /api/test/create?type=admin&active=true
// Body: { id: '456' }
```

vtzac automatically handles parameter passing based on the backend method's parameter decorators (`@Param`, `@Query`, `@Body`, `@Headers`) to ensure **type safety** and correct request formatting.
