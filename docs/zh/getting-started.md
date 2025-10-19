# 开始使用 vtzac（快速上手）

目标：用最少的步骤，在一个 pnpm 工作区中让 Vite 前端直接调用 NestJS 控制器代码，零额外配置即可使用，并且便于跳转至后端代码。

## 1. pnpm 创建 Vite + NestJS

在空目录中执行：

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
# pnpm init 没有 -y 支持，默认就不需要手动确认
pnpm init

# 创建前端（以 React + TS 为例）
pnpm create vite frontend --no-rolldown --no-interactive --template react-ts

# 创建后端（NestJS 示例）
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

在根目录创建 pnpm 工作区配置文件 `pnpm-workspace.yaml`：

```yaml
packages:
  - frontend
  - nestjs-example
```

**推荐配置：** 在根目录的 `package.json` 中添加启动脚本，方便同时启动前后端：

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

安装 concurrently 依赖：

```bash
pnpm add -w -D concurrently
```

## 2. 在 Vite 项目中安装 vtzac

```bash
cd frontend
pnpm add -D vtzac
```

在 `vite.config.ts` 中添加插件，使用默认配置即可：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

### 前端 TypeScript 配置（tsconfig.app.json）

由于前端会直接 import 使用装饰器的 NestJS 控制器类，需要开启旧版装饰器支持，并关闭类字段的 `define` 语义。

默认使用非 SWC 的 `react-ts` 模板；若你使用 SWC（`@vitejs/plugin-react-swc` 或 `react-swc-ts` 模板），还需在 `compilerOptions` 中设置 `erasableSyntaxOnly: false`。

非 SWC 默认配置示例：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

使用 SWC 时需额外增加：

```json
{
  "compilerOptions": {
    "erasableSyntaxOnly": false
  }
}
```

提示：若你的 tsconfig 是分层合并，请确保这些选项在应用的最终配置中生效。

## 3. 在前端项目里引用后端示例

将后端项目作为 workspace 依赖加入到前端 `package.json`：

```json
{
  "dependencies": {
    "nestjs-example": "workspace:*"
  }
}
```

此时，前端可以直接 import 后端的控制器类型并进行类型安全调用。

## 4. 配置后端跨域支持

为了让前端能够正常调用后端 API，需要在 NestJS 项目中配置跨域支持。

在 `nestjs-example/src/main.ts` 中添加跨域配置：

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置跨域支持
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ], // 支持 localhost 和 127.0.0.1
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

## 5. 示例：零配置直接调用后端控制器

**后端控制器示例：**

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

**前端调用示例：**

```ts
import { _http } from 'vtzac';
import { AppController } from 'nestjs-example/src/app.controller';

// 创建控制器实例（指定后端地址）
const defaultController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 5000,
  },
}).controller(AppController);

// 直接以类型安全的方式调用后端方法
const res = await defaultController.getHello();
console.log(res._data!); // 输出：'Hello World!'
```

```
// 实际会发起的请求：
// GET /api/hello
// 返回的内容：
// 'Hello World!'
```

无需编写任何额外的 API 客户端代码；vtzac 会在构建期为你自动生成对应的前端调用代码与类型绑定。你在前端看到的 `getHello()` 调用，会被转换为上述的 HTTP 请求，并通过 `res._data` 提供类型安全的返回值读取。

## 6. 启动与验证

### 方式一：使用根目录启动脚本（推荐）

如果已按照步骤 1 配置了根目录启动脚本，可以一键启动前后端：

```bash
# 在根目录执行，同时启动前后端
pnpm dev
```

### 方式二：分别启动

也可以分别启动后端与前端：

```bash
# 启动 NestJS 后端（默认端口 3000）
pnpm --filter nestjs-example start

# 启动 Vite 前端（默认端口 5173）
pnpm --filter frontend dev
```

### 验证功能

在浏览器访问前端页面（通常是 `http://localhost:5173`）并触发示例调用，若后端返回 `Hello World!`，说明最基本的使用已经完成。

到此为止，我们就完成了最基本的使用。你可以参考项目中的示例代码进一步了解更多功能。
