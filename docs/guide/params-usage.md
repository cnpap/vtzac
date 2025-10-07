# Parameter Handling Use Cases

## No Parameter Interface

### Backend Implementation

```typescript
@Controller('api/test')
export class TestController {
  @Get('hello')
  getHello() {
    return { message: 'Hello World!' }
  }
}
```

### Frontend Usage

```tsx
import { zac } from 'vtzac/hook'
import { TestController } from './backend/test.controller'

const testController = zac(TestController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
})

async function handleHello() {
  const res = await testController
    .call('getHello')
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { message: 'Hello World!' }
}
```

## Named Parameter Interface

### Backend Implementation

```typescript
@Controller('api/test')
export class TestController {
  // Query named parameters
  @Get('query/named')
  testNamedQuery(@Query('page') page?: string, @Query('limit') limit?: string) {
    return { success: true, page, limit }
  }

  // Path named parameters
  @Get('param/named/:userId/:postId')
  testNamedParam(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ) {
    return { success: true, userId, postId }
  }

  // Headers named parameters
  @Get('headers/named')
  testNamedHeaders(@Headers('authorization') auth?: string) {
    return { success: true, auth }
  }
}
```

### Frontend Usage

```tsx
// Query named parameter call
async function handleNamedQuery() {
  const res = await testController
    .call('testNamedQuery', '1', '10')
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { success: true, page: '1', limit: '10' }
}

// Path named parameter call
async function handleNamedParam() {
  const res = await testController
    .call('testNamedParam', '123', '456')
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { success: true, userId: '123', postId: '456' }
}

// Headers named parameter call
async function handleNamedHeaders() {
  const res = await testController
    .call('testNamedHeaders', 'Bearer token123')
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { success: true, auth: 'Bearer token123' }
}
```

## Mixed Parameter Interface

### Backend Implementation

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

  // Parameter object form
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

### Frontend Usage

```tsx
// Complex mixed parameter call
async function handleComplex() {
  const res = await testController
    .call(
      'testComplex',
      '123', // @Param('id')
      { name: 'Updated name', status: 'active' }, // @Body()
      'v1.0', // @Query('version')
      'Bearer token123', // @Headers('authorization')
    )
    .catch(error => console.error('Request failed:', error))

  console.log(res._data)
}

// Parameter object call
async function handleParamObject() {
  const res = await testController
    .call('testParamObject', {
      type: 'user',
      id: '123',
      action: 'edit',
    })
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { success: true, params: { type: 'user', id: '123', action: 'edit' } }
}

async function handleQueryObject() {
  const res = await testController
    .call('testQueryObject', {
      page: '1',
      limit: '10',
      search: 'test',
    })
    .catch(error => console.error('Request failed:', error))

  console.log(res._data) // { success: true, query: { page: '1', limit: '10', search: 'test' } }
}
```
