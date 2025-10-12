# Getting Started with vtzac (Quick Setup)

Goal: Use minimal steps to enable Vite frontend to directly call NestJS controller code in a pnpm workspace, with zero additional configuration and easy navigation to backend code.

## 1. Create Vite + NestJS with pnpm

Execute in an empty directory:

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
pnpm init

# Create frontend (using React + TS as example)
pnpm create vite frontend -- --template react-ts

# Create backend (NestJS example)
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

Create pnpm workspace configuration file `pnpm-workspace.yaml` in the root directory:

```yaml
packages:
  - frontend
  - nestjs-example
```

## 2. Install vtzac in Vite Project

```bash
cd frontend
pnpm add vtzac
```

Add plugin to `vite.config.ts` using default configuration:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

## 3. Reference Backend Example in Frontend Project

Add backend project as workspace dependency to frontend `package.json`:

```json
{
  "dependencies": {
    "nestjs-example": "workspace:*"
  }
}
```

At this point, frontend can directly import backend controller types and make type-safe calls.

## 4. Example: Zero-Configuration Direct Backend Controller Calls

**Backend Controller Example:**

```ts
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }
}
```

**Frontend Call Example:**

```ts
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

// Create controller instance (specify backend address)
const defaultController = _http(AppController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
    timeout: 5000,
  },
});

// Directly call backend methods in a type-safe manner
const res = await defaultController.getHello();
console.log(res._data); // Output: 'Hello World!'
```

```
// Actual request made:
// GET /api/hello
// Returned content:
// 'Hello World!'
```

No need to write any additional API client code; vtzac automatically generates corresponding frontend call code and type bindings during build time. The `getHello()` call you see in the frontend will be transformed into the above HTTP request, providing type-safe return value access through `res._data`.

## 5. Start and Verify

Start backend and frontend separately:

```bash
# Start NestJS backend (default port 3001)
pnpm --filter nestjs-example start

# Start Vite frontend
pnpm --filter frontend dev
```

Access the frontend page in browser and trigger the example call. If the backend returns `Hello World!`, the basic setup is complete.

At this point, we have completed the most basic usage. You can refer to the example code in the project to learn more about additional features.
