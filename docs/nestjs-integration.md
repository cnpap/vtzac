# NestJS + Vite Full-Stack Integration

Before using vtzac, you need to integrate NestJS into your Vite project.

## Project Structure

The integrated project structure is as follows:

```
project-root/
├── src/
│   ├── backend/           # NestJS backend code
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── main.ts
│   │   └── package.json   # Specify CommonJS module system
│   ├── App.tsx           # React frontend code
│   ├── main.tsx
│   └── ...
├── package.json          # Main project configuration
├── tsconfig.json         # Main TypeScript configuration
├── tsconfig.app.json     # Frontend TypeScript configuration
├── tsconfig.server.json  # Backend TypeScript configuration
├── nest-cli.json         # NestJS CLI configuration
├── eslint.config.js      # ESLint configuration
└── vite.config.ts        # Vite configuration
```

## Getting Started with Integration

### 1. Install Dependencies

First, install NestJS core dependencies:

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
```

Install file upload support (if needed):

```bash
pnpm add multer @types/multer
```

Install development dependencies:

```bash
pnpm add -D @nestjs/cli tsx concurrently
```

### 2. Create Backend Directory Structure

Create a `backend` folder under the `src` directory and create the following files:

#### src/backend/package.json
```json
{
  "type": "commonjs"
}
```

#### src/backend/main.ts
```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS to support frontend access
  app.enableCors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true,
  })

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Backend server is running on http://localhost:${port}`)
}

void bootstrap()
```

#### src/backend/app.module.ts
```typescript
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### src/backend/app.controller.ts
```typescript
import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('echo')
  echo(@Body() body: any): any {
    return {
      message: 'Echo from backend',
      data: body,
      timestamp: new Date().toISOString(),
    }
  }
}
```

#### src/backend/app.service.ts
```typescript
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from NestJS Backend!'
  }
}
```

### 3. Configure TypeScript

#### tsconfig.server.json (Backend Configuration)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist/backend",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/backend/**/*"],
  "exclude": ["node_modules", "dist", "src/frontend", "src/*.tsx", "src/*.ts", "src/assets"]
}
```

#### Update tsconfig.json (Main Configuration)
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

#### Update tsconfig.app.json (Frontend Configuration)
Add decorator support to the existing configuration:
```json
{
  "compilerOptions": {
    // ... other configurations
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["vite/client", "multer"]
  },
  "include": ["src"]
}
```

> **Important Note**: `experimentalDecorators` and `emitDecoratorMetadata` are necessary configurations for using NestJS decorators. The `types` array needs to include `multer` to support file upload functionality.

### 4. Configure NestJS CLI

#### nest-cli.json
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src/backend",
  "compilerOptions": {
    "deleteOutDir": true,
    "tsConfigPath": "tsconfig.server.json"
  }
}
```

### 5. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "tsx watch --tsconfig ./tsconfig.server.json src/backend/main.ts",
    "dev:server": "tsx watch --tsconfig ./tsconfig.server.json src/backend/main.ts",
    "build": "pnpm build:frontend && pnpm build:backend",
    "build:frontend": "tsc -b && vite build",
    "build:backend": "nest build",
    "start": "concurrently \"pnpm preview\" \"pnpm start:backend\"",
    "start:backend": "node dist/backend/main",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## Development Mode

### Start Both Frontend and Backend
```bash
pnpm dev
```

### Start Frontend Only
```bash
pnpm dev:frontend
```

### Start Backend Only
```bash
pnpm dev:backend
```

## Build and Deployment

### Build Frontend and Backend
```bash
pnpm build
```

### Production Start
```bash
pnpm start
```

## API Access

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API endpoint examples:
  - GET http://localhost:3001/api/hello
  - POST http://localhost:3001/api/echo

## Troubleshooting

If you encounter issues during the integration process, please refer to the [NestJS Troubleshooting Documentation](./troubleshooting.md), which contains detailed solutions for common problems.
