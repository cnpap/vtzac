# 最佳实践

## 参数顺序：必需参数在前，可选参数在后

### 参数顺序规则

1. **必需参数在前**：`@Param`、`@Body`、`@Query` 等业务参数
2. **可选参数在后**：`@Headers`、`@Res`、`@Req` 等框架参数

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  // ✅ 推荐：Headers 参数放在最后且为可选
  @Get('user/:id')
  getUser(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Headers('authorization') auth?: string // 可选，放在最后
  ) {
    return { id, include, auth };
  }
}
```

**前端调用示例：**

```typescript
import { _http } from 'vtzac/hook';
import { TestController } from './backend/test.controller';

const api = _http(TestController, {
  ofetchOptions: { baseURL: 'http://localhost:3001' },
});

// 只传递必需参数，Headers 通过拦截器处理
const res = await api.getUser('123', 'profile');
console.log(res._data); // 输出：{ id: '123', include: 'profile', auth: 'Bearer token' }
```

```
// 实际会发起的请求：
// GET /api/test/user/123?include=profile
// Headers: { authorization: 'Bearer token' }
```

## Response 对象：使用 passthrough 保持类型安全

### 正确使用方式

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  // ✅ 正确：使用 passthrough: true 并设为可选参数
  @Post('create')
  createItem(
    @Body() data: any,
    @Res({ passthrough: true }) response?: Response
  ) {
    // 设置状态码
    response!.status(201);

    // 必须使用 return 返回数据以保证类型安全
    return { success: true, data };
  }
}
```

**前端调用示例：**

```typescript
// Response 对象不需要在前端传递
const res = await api.createItem({ name: '新项目' });
console.log(res._data); // 输出：{ success: true, data: { name: '新项目' } }
```

```
// 实际会发起的请求：
// POST /api/test/create
// Body: { name: '新项目' }
// 响应状态码：201
```

### 错误用法

```typescript
// ❌ 错误：没有使用 passthrough: true
@Post('create-bad')
createItemBad(
  @Body() data: any,
  @Res() response?: Response // 缺少 passthrough: true
) {
  response!.status(201).json({ success: true, data })
  // 这样会失去类型安全，前端无法获得正确的类型推断
}
```

## Request 对象：获取请求信息

**后端控制器示例：**

```typescript
@Controller('api/test')
export class TestController {
  @Get('info')
  getInfo(
    @Query('type') type?: string,
    @Req() request?: Request // 可选参数，放在最后
  ) {
    const userAgent = request?.headers['user-agent'];
    return { type, userAgent };
  }
}
```

**前端调用示例：**

```typescript
const res = await api.getInfo('mobile');
console.log(res._data); // 输出：{ type: 'mobile', userAgent: 'Mozilla/5.0...' }
```

## Headers 参数：通过拦截器处理

### 推荐做法

将 `@Headers` 参数设为可选，通过拦截器自动注入：

**后端控制器示例：**

```typescript
@Controller('api/user')
export class UserController {
  @Get('profile')
  getProfile(
    @Headers('authorization') auth?: string // 可选，由拦截器注入
  ) {
    // auth 会通过拦截器自动传入
    return { profile: 'user data', auth };
  }
}
```

**前端配置示例：**

```typescript
const api = _http(UserController, {
  ofetchOptions: {
    onRequest({ options }) {
      // 自动添加认证令牌
      const token = localStorage.getItem('auth-token');
      if (token) {
        options.headers = {
          ...options.headers,
          authorization: `Bearer ${token}`,
        };
      }
    },
  },
});

// 前端调用时不需要传递 Headers
const res = await api.getProfile();
console.log(res._data); // 输出：{ profile: 'user data', auth: 'Bearer token123' }
```

## 类型安全要点

### passthrough: true 的重要性

使用 `@Res({ passthrough: true })` 可以：

1. **保持响应流程**：NestJS 正常处理响应
2. **支持 return 语句**：可以返回数据给前端
3. **确保类型推断**：前端获得正确的类型信息

### 可选参数的优势

将框架参数设为可选（`?`）的好处：

1. **简化前端调用**：不需要传递框架相关参数
2. **灵活注入**：后端可以通过拦截器注入值
3. **提高可维护性**：减少前后端耦合
