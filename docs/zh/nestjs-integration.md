# NestJS + Vite 前后端一体化集成

本指南将帮助您将 NestJS 与 Vite 集成，创建一个完整的全栈应用程序。

## 项目结构

```
your-project/
├── src/
│   ├── backend/          # NestJS 后端代码
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   └── frontend/         # 前端代码 (React/Vue/等)
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.server.json
└── nest-cli.json
```

## 开始集成

### 1. 安装依赖

```bash
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata
pnpm add -D @nestjs/cli @types/express
```

### 2. 创建后端目录结构

#### src/backend/main.ts
```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 启用 CORS 以支持前端访问
  app.enableCors({
    origin: 'http://localhost:5173', // Vite 默认端口
    credentials: true,
  })

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Backend server is running on http://localhost:${port}`)
}

bootstrap()
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
      message: '收到数据',
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
    return 'Hello from NestJS backend!'
  }
}
```

### 3. 配置 TypeScript

#### tsconfig.server.json (后端配置)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./dist/backend",
    "rootDir": "./src/backend",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "declaration": false
  },
  "include": ["src/backend/**/*"],
  "exclude": ["node_modules", "dist", "src/frontend"]
}
```

#### 更新 tsconfig.json (主配置)
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

#### 更新 tsconfig.app.json (前端配置)
在现有配置基础上添加装饰器支持：
```json
{
  "compilerOptions": {
    // ... 其他配置
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["vite/client", "multer"]
  },
  "include": ["src"]
}
```

> **重要提示**：`experimentalDecorators` 和 `emitDecoratorMetadata` 是使用 NestJS 装饰器的必要配置。`types` 数组中需要包含 `multer` 以支持文件上传功能。

### 4. 配置 NestJS CLI

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

### 5. 更新 package.json 脚本

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "nest start --watch",
    "build": "pnpm build:frontend && pnpm build:backend",
    "build:frontend": "vite build",
    "build:backend": "nest build",
    "start": "node dist/backend/main.js",
    "preview": "vite preview"
  }
}
```

## 开发模式

### 同时启动前后端
```bash
pnpm dev
```

### 单独启动前端
```bash
pnpm dev:frontend
```

### 单独启动后端
```bash
pnpm dev:backend
```

## 构建和部署

### 构建前后端
```bash
pnpm build
```

### 生产环境启动
```bash
pnpm start
```

## API 访问

- 前端：http://localhost:5173
- 后端：http://localhost:3001
- API 端点示例：
  - GET http://localhost:3001/api/hello
  - POST http://localhost:3001/api/echo

## 故障排除

如果在集成过程中遇到问题，请参考 [NestJS 故障排除文档](./troubleshooting.md)，其中包含了常见问题的详细解决方案。
