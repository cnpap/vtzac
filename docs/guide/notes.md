# Important Notes

## Parameter Order Best Practices

When using vtzac, to achieve the best development experience and type safety, it is recommended to follow these parameter order conventions:

### Parameter Order Rules

1. **Required parameters first**: `@Param`, `@Body`, `@Query` and other business-required parameters
2. **Optional parameters last**: `@Headers`, `@Res`, `@Req` and other framework-related parameters

### Headers Parameter Handling

Since Headers can usually be injected through middleware or global configuration, it is recommended to place `@Headers` parameters last and make them optional:

```typescript
@Controller('api/test')
export class TestController {
  // ✅ Recommended: Headers parameter last and optional
  @Get('user/:id')
  getUser(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Headers('authorization') auth?: string // Optional, placed last
  ) {
    return { id, include, auth }
  }

  // ❌ Not recommended: Headers parameter in front
  @Get('user/:id')
  getUserBad(
    @Headers('authorization') auth: string, // Not recommended position, as valid headers might be passed by interceptors rather than function calls
    @Param('id') id: string,
    @Query('include') include?: string
  ) {
    return { id, include, auth }
  }
}
```

### Response and Request Objects

When you need to use `@Res` or `@Req`, you must follow these rules:

#### Response Object Usage

```typescript
@Controller('api/test')
export class TestController {
  // ✅ Correct: Use passthrough: true and make it optional
  @Post('create')
  createItem(
    @Body() data: any,
    @Res({ passthrough: true }) response?: Response
  ) {
    // Can use response object to set status code
    response!.status(201)

    // Must use return to return data to ensure type safety
    return { success: true, data }
  }

  // ❌ Wrong: Not using passthrough: true
  @Post('create-bad')
  createItemBad(
    @Body() data: any,
    @Res() response?: Response // Missing passthrough: true
  ) {
    response!.status(201).json({ success: true, data })
    // This will lose type safety
  }
}
```

#### Request Object Usage

```typescript
@Controller('api/test')
export class TestController {
  @Get('info')
  getInfo(
    @Query('type') type?: string,
    @Req() request?: Request // Optional parameter, placed last
  ) {
    const userAgent = request?.headers['user-agent']
    return { type, userAgent }
  }
}
```

### Frontend Usage Example

Following the parameter order rules, frontend calls become more intuitive:

```tsx
import { _http } from 'vtzac/hook'
import { TestController } from './backend/test.controller'

const testController = _http(TestController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
})

async function handleGetUser() {
  // Only pass required parameters, Headers handled by middleware
  const res = await testController
    .getUser('123', 'profile')
    .catch(error => console.error('Request failed:', error))

  console.log(res._data)
}

async function handleCreateItem() {
  // Response object doesn't need to be passed from frontend
  const res = await testController
    .createItem({ name: 'New project' })
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // Type-safe return data
}
```

## Type Safety Key Points

### Using passthrough: true

When using the `@Res` decorator, you must set `{ passthrough: true }`, which allows:

1. Maintaining NestJS's normal response handling flow
2. Using `return` statements to return data
3. Ensuring the frontend gets correct type inference

### Using Optional Parameters

Benefits of making framework-related parameters optional (`?`):

1. Frontend doesn't need to pass these parameters when calling
2. Backend can inject these values through interceptors or other means
3. Improves code flexibility and maintainability

## Summary

Following these best practices can:

- Improve code readability and maintainability
- Ensure type safety
- Simplify frontend calling logic
- Provide better development experience
