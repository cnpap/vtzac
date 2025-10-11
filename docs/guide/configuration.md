# Configuration

This guide covers how to configure vtzac for optimal performance and customization.

## API Configuration

### Basic Usage

The `zac` function accepts two parameters: a controller class or instance, and optional configuration options.

```typescript
import { _http, setGlobalZacOfetchOptions } from 'vtzac/hook'
import { UserController } from './controllers/user.controller'

// Method 1: Pass controller class with options
const api = _http(UserController, {
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
})

// Method 2: Pass controller instance
const api2 = _http(new UserController())
```

### Configuration Options

#### ZacHttpOptions Interface

```typescript
interface ZacHttpOptions {
  ofetchOptions?: FetchOptions<any>
}
```

The `ofetchOptions` field accepts all standard ofetch configuration options.

::: tip
For complete documentation on all available options and interceptors, please refer to the [official ofetch documentation](https://github.com/unjs/ofetch).
:::

## Global Configuration

### Setting Global Options

Use `setGlobalZacOfetchOptions` to set default configuration for all API calls:

```typescript
import { setGlobalZacOfetchOptions } from 'vtzac/hook'

setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
})
```

### Runtime Configuration

You can override configuration at runtime using the `setOptions` method:

```typescript
const result = await api
  .setOptions({
    ofetchOptions: {
      baseURL: 'https://api-staging.example.com',
      timeout: 10000,
    },
  })
  .call('getUser', userId)
```

## Configuration Priority

Configuration options are merged in the following order (later options override earlier ones):

1. **Global configuration** - Options set via `setGlobalZacOfetchOptions()` (base layer)
2. **Instance configuration** - Options passed to `_http()` function (overrides global)
3. **Runtime configuration** - Options passed to `setOptions()` (highest priority)

The merging follows JavaScript object spread syntax: `{ ...globalOptions, ...instanceOptions, ...runtimeOptions }`

## Interceptors

vtzac supports all ofetch interceptors for hooking into the request/response lifecycle.

### Available Interceptors

- **`onRequest`** - Called before sending the request
- **`onRequestError`** - Called when request fails
- **`onResponse`** - Called after receiving response
- **`onResponseError`** - Called when response has an error status

### Interceptor Parameters

Each interceptor receives different parameters based on its type. For detailed information about interceptor usage, parameters, and advanced patterns, see the [ofetch interceptors documentation](https://github.com/unjs/ofetch#interceptors).

## Common Use Cases

vtzac supports various configuration scenarios through ofetch options:

- **Development Environment** - Configure local development settings with extended timeouts and request/response logging
- **Production Environment** - Set production API endpoints with appropriate timeouts and retry policies
- **Authentication** - Add authentication tokens through request interceptors
- **Error Handling** - Handle different error scenarios using response error interceptors

For specific implementation examples and patterns, please refer to the [ofetch documentation](https://github.com/unjs/ofetch).
