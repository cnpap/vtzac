# Best Practices

## Parameter Order: Required First, Optional Last

### Parameter Order Rules

1. **Required parameters first**: `@Param`, `@Body`, `@Query` and other business parameters
2. **Optional parameters last**: `@Headers`, `@Res`, `@Req` and other framework parameters

**Backend Controller Example:**

```typescript
@Controller('api/test')
export class TestController {
  // ✅ Recommended: Headers parameter is optional and placed last
  @Get('user/:id')
  getUser(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Headers('authorization') auth?: string // Optional, placed last
  ) {
    return { id, include, auth };
  }
}
```

**Frontend Usage Example:**

```typescript
import { _http } from 'vtzac';
import { TestController } from './backend/test.controller';

const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000' },
}).controller(TestController);

// Only pass required parameters, Headers handled by interceptor
const res = await api.getUser('123', 'profile');
console.log(res._data); // Output: { id: '123', include: 'profile', auth: 'Bearer token' }
```

```
// Actual request sent:
// GET /api/test/user/123?include=profile
// Headers: { authorization: 'Bearer token' }
```

## Response Object: Use passthrough for Type Safety

### Correct Usage

**Backend Controller Example:**

```typescript
@Controller('api/test')
export class TestController {
  // ✅ Correct: Use passthrough: true and set as optional parameter
  @Post('create')
  createItem(
    @Body() data: any,
    @Res({ passthrough: true }) response?: Response
  ) {
    // Set status code
    response!.status(201);

    // Must use return to ensure type safety
    return { success: true, data };
  }
}
```

**Frontend Usage Example:**

```typescript
// Response object doesn't need to be passed from frontend
const res = await api.createItem({ name: 'New Project' });
console.log(res._data); // Output: { success: true, data: { name: 'New Project' } }
```

```
// Actual request sent:
// POST /api/test/create
// Body: { name: 'New Project' }
// Response status: 201
```

### Incorrect Usage

```typescript
// ❌ Wrong: Not using passthrough: true
@Post('create-bad')
createItemBad(
  @Body() data: any,
  @Res() response?: Response // Missing passthrough: true
) {
  response!.status(201).json({ success: true, data })
  // This loses type safety, frontend cannot get correct type inference
}
```

## Request Object: Getting Request Information

**Backend Controller Example:**

```typescript
@Controller('api/test')
export class TestController {
  @Get('info')
  getInfo(
    @Query('type') type?: string,
    @Req() request?: Request // Optional parameter, placed last
  ) {
    const userAgent = request?.headers['user-agent'];
    return { type, userAgent };
  }
}
```

**Frontend Usage Example:**

```typescript
const res = await api.getInfo('mobile');
console.log(res._data); // Output: { type: 'mobile', userAgent: 'Mozilla/5.0...' }
```

## Headers Parameters: Handle via Interceptors

### Recommended Approach

Set `@Headers` parameters as optional and inject automatically via interceptors:

**Backend Controller Example:**

```typescript
@Controller('api/user')
export class UserController {
  @Get('profile')
  getProfile(
    @Headers('authorization') auth?: string // Optional, injected by interceptor
  ) {
    // auth will be automatically passed by interceptor
    return { profile: 'user data', auth };
  }
}
```

**Frontend Configuration Example:**

```typescript
const api = _http({
  ofetchOptions: {
    onRequest({ options }) {
      // Automatically add auth token
      const token = localStorage.getItem('auth-token');
      if (token) {
        options.headers = {
          ...options.headers,
          authorization: `Bearer ${token}`,
        };
      }
    },
  },
}).controller(UserController);

// Frontend call doesn't need to pass Headers
const res = await api.getProfile();
console.log(res._data); // Output: { profile: 'user data', auth: 'Bearer token123' }
```

## Type Safety Key Points

### Importance of passthrough: true

Using `@Res({ passthrough: true })` enables:

1. **Maintain response flow**: NestJS handles response normally
2. **Support return statements**: Can return data to frontend
3. **Ensure type inference**: Frontend gets correct type information

### Benefits of Optional Parameters

Setting framework parameters as optional (`?`) provides:

1. **Simplified frontend calls**: No need to pass framework-related parameters
2. **Flexible injection**: Backend can inject values via interceptors
3. **Better maintainability**: Reduces frontend-backend coupling
