# Configuration

## HTTP: Instance Configuration and Global Configuration

### Basic Configuration

**Frontend Configuration Example:**

```typescript
import { _http, setGlobalZacOfetchOptions } from 'vtzac';
import { UserController } from './controllers/user.controller';

// Create controller instance (specify backend URL and timeout)
const api = _http({
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
}).controller(UserController);

// Call backend method
const user = await api.getUser('123');
console.log(user._data); // Output: { id: '123', name: 'Alice' }
```

```
// Actual request sent:
// GET https://api.example.com/api/user/123
// Timeout: 5000ms
```

### Global Configuration

**Global Configuration Example:**

```typescript
import { setGlobalZacOfetchOptions } from 'vtzac';

// Set global default configuration
setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
});

// All subsequent _http calls will use these default configurations
const api = _http().controller(UserController); // Automatically uses global configuration
```

## Configuration Priority

Configuration options are merged in the following order:

1. **Global configuration**: Set via `setGlobalZacOfetchOptions()`
2. **Instance configuration**: Passed to `_http()` function (overrides global configuration)

**Configuration Merging Example:**

```typescript
// Global configuration
setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 3000,
  retry: 1,
});

// Instance configuration (overrides global timeout and retry)
const api = _http({
  ofetchOptions: {
    timeout: 8000,
    retry: 5,
  },
}).controller(UserController);

// Final effective configuration:
// baseURL: 'https://api.example.com' (from global)
// timeout: 8000 (from instance, overrides global)
// retry: 5 (from instance, overrides global)
```

## Interceptors

### Request Interceptor

**Authentication Interceptor Example:**

```typescript
const api = _http({
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    onRequest({ request, options }) {
      // Automatically add auth token
      const token = localStorage.getItem('auth-token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      console.log('Sending request:', request); // Output: Sending request: https://api.example.com/api/user/123
    },
  },
}).controller(UserController);
```

### Response Interceptor

**Error Handling Interceptor Example:**

```typescript
const api = _http({
  ofetchOptions: {
    onResponseError({ response }) {
      if (response.status === 401) {
        // Automatically redirect to login page
        window.location.href = '/login';
        console.log('Authentication failed, redirecting to login'); // Output: Authentication failed, redirecting to login
      }
    },
    onResponse({ response }) {
      console.log('Response status:', response.status); // Output: Response status: 200
    },
  },
}).controller(UserController);
```

## Common Configuration Scenarios

### Development Environment Configuration

```typescript
setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3000',
  timeout: 10000, // Extend timeout for development environment
  onRequest({ request }) {
    console.log('Development request:', request); // Output: Development request: http://localhost:3000/api/user
  },
});
```

### Production Environment Configuration

```typescript
setGlobalZacOfetchOptions({
  baseURL: 'https://api.production.com',
  timeout: 5000,
  retry: 3, // Enable retry in production environment
  onRequestError({ error }) {
    console.error('Request failed:', error.message); // Output: Request failed: Network Error
  },
});
```
