# Getting Started with vtzac (Quick Setup)

Goal: Use minimal steps to enable Vite frontend to directly call NestJS controller code in a pnpm workspace, with zero additional configuration and easy navigation to backend code.

## 1. Create Vite + NestJS with pnpm

Execute in an empty directory:

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
# pnpm init does not support -y, so it is not needed
pnpm init

# Create frontend (using React + TS as example)
pnpm create vite frontend --no-rolldown --no-interactive --template react-ts

# Create backend (NestJS example)
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

Create pnpm workspace configuration file `pnpm-workspace.yaml` in the root directory:

```yaml
packages:
  - frontend
  - nestjs-example
```

**Recommended Configuration:** Add startup scripts to the root `package.json` for convenient frontend and backend startup:

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter nestjs-example start"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install concurrently dependency:

```bash
pnpm add -D concurrently
```

## 2. Install vtzac in Vite Project

```bash
cd frontend
pnpm add vtzac
```

Add plugin to `vite.config.ts` using default configuration:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

### Frontend TypeScript config (tsconfig.app.json)

Because the frontend directly imports NestJS controller classes that use decorators, enable legacy decorators and disable class field define semantics.

Default setup uses `react-ts` (non-SWC). If you use SWC (`@vitejs/plugin-react-swc` or template `react-swc-ts`), also set `erasableSyntaxOnly: false` under `compilerOptions`.

Update `frontend/tsconfig.app.json` (non-SWC) to include at least:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

When using SWC, add:

```json
{
  "compilerOptions": {
    "erasableSyntaxOnly": false
  }
}
```

Note: If your tsconfig is layered, ensure these options are applied in the effective config for the app.

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

## 4. Configure Backend CORS Support

To enable frontend to properly call backend APIs, you need to configure CORS support in the NestJS project.

Add CORS configuration in `nestjs-example/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS support
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ], // Support both localhost and 127.0.0.1
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

## 5. Example: Zero-Configuration Direct Backend Controller Calls

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
import { _http } from 'vtzac';
import { AppController } from 'nestjs-example/src/app.controller';

// Create controller instance (specify backend address)
const defaultController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 5000,
  },
}).controller(AppController);

// Directly call backend methods in a type-safe manner
const res = await defaultController.getHello();
console.log(res._data!); // Output: 'Hello World!'
```

```
// Actual request made:
// GET /api/hello
// Returned content:
// 'Hello World!'
```

No need to write any additional API client code; vtzac automatically generates corresponding frontend call code and type bindings during build time. The `getHello()` call you see in the frontend will be transformed into the above HTTP request, providing type-safe return value access through `res._data`.

## 6. Start and Verify

### Method 1: Using Root Directory Startup Scripts (Recommended)

If you have configured the root directory startup scripts as described in step 1, you can start both frontend and backend with one command:

```bash
# Execute in root directory to start both frontend and backend
pnpm dev
```

### Method 2: Start Separately

You can also start backend and frontend separately:

```bash
# Start NestJS backend (default port 3000)
pnpm --filter nestjs-example start

# Start Vite frontend (default port 5173)
pnpm --filter frontend dev
```

### Verify Functionality

Access the frontend page in browser (usually `http://localhost:5173`) and trigger the example call. If the backend returns `Hello World!`, the basic setup is complete.

At this point, we have completed the most basic usage. You can refer to the example code in the project to learn more about additional features.
