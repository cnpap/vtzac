# 注意事项

## 参数顺序最佳实践

在使用 vtzac 时，为了获得最佳的开发体验和类型安全，建议遵循以下参数顺序规范：

### 参数顺序规则

1. **必需参数在前**：`@Param`、`@Body`、`@Query` 等业务必需参数
2. **可选参数在后**：`@Headers`、`@Res`、`@Req` 等框架相关参数

### Headers 参数处理

由于 Headers 通常可以通过中间件或全局配置写入，因此建议将 `@Headers` 参数放在最后，并设为可选参数：

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
    return { id, include, auth }
  }

  // ❌ 不推荐：Headers 参数在前面
  @Get('user/:id')
  getUserBad(
    @Headers('authorization') auth: string, // 不推荐的位置，因为有可能合格 header 是由拦截器传递，而不是函数调用传递
    @Param('id') id: string,
    @Query('include') include?: string
  ) {
    return { id, include, auth }
  }
}
```

### Response 和 Request 对象

当需要使用 `@Res` 或 `@Req` 时，必须遵循以下规则：

#### Response 对象使用

```typescript
@Controller('api/test')
export class TestController {
  // ✅ 正确：使用 passthrough: true 并设为可选参数
  @Post('create')
  createItem(
    @Body() data: any,
    @Res({ passthrough: true }) response?: Response
  ) {
    // 可以使用 response 对象设置状态码
    response!.status(201)

    // 必须使用 return 返回数据以保证类型安全
    return { success: true, data }
  }

  // ❌ 错误：没有使用 passthrough: true
  @Post('create-bad')
  createItemBad(
    @Body() data: any,
    @Res() response?: Response // 缺少 passthrough: true
  ) {
    response!.status(201).json({ success: true, data })
    // 这样会失去类型安全
  }
}
```

#### Request 对象使用

```typescript
@Controller('api/test')
export class TestController {
  @Get('info')
  getInfo(
    @Query('type') type?: string,
    @Req() request?: Request // 可选参数，放在最后
  ) {
    const userAgent = request?.headers['user-agent']
    return { type, userAgent }
  }
}
```

### 前端调用示例

遵循参数顺序规则后，前端调用会更加直观：

```tsx
import { zac } from 'vtzac/hook'
import { TestController } from './backend/test.controller'

const testController = zac(TestController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
})

async function handleGetUser() {
  // 只传递必需参数，Headers 通过中间件处理
  const res = await testController
    .call('getUser', '123', 'profile')
    .catch(error => console.error('请求失败:', error))

  console.log(res._data)
}

async function handleCreateItem() {
  // Response 对象不需要在前端传递
  const res = await testController
    .call('createItem', { name: '新项目' })
    .catch(error => console.error('请求失败:', error))

  console.log(res._data) // 类型安全的返回数据
}
```

## 类型安全要点

### 使用 passthrough: true

当使用 `@Res` 装饰器时，必须设置 `{ passthrough: true }`，这样可以：

1. 保持 NestJS 的正常响应处理流程
2. 允许使用 `return` 语句返回数据
3. 确保前端能够获得正确的类型推断

### 可选参数的使用

将框架相关参数设为可选（`?`）的好处：

1. 前端调用时不需要传递这些参数
2. 后端可以通过拦截器或其他方式注入这些值
3. 提高代码的灵活性和可维护性

## 总结

遵循这些最佳实践可以：

- 提高代码的可读性和维护性
- 确保类型安全
- 简化前端调用逻辑
- 提供更好的开发体验
