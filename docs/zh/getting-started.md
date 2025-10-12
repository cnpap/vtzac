# 开始使用 vtzac（快速上手）

目标：用最少的步骤，在一个 pnpm 工作区中让 Vite 前端直接调用 NestJS 控制器代码，零额外配置即可使用，并且便于跳转至后端代码。

## 1. pnpm 创建 Vite + NestJS

在空目录中执行：

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
pnpm init

# 创建前端（以 React + TS 为例）
pnpm create vite frontend -- --template react-ts

# 创建后端（NestJS 示例）
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

在根目录创建 pnpm 工作区配置文件 `pnpm-workspace.yaml`：

```yaml
packages:
  - frontend
  - nestjs-example
```

## 2. 在 Vite 项目中安装 vtzac

```bash
cd frontend
pnpm add vtzac
```

在 `vite.config.ts` 中添加插件，使用默认配置即可：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

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

## 4. 示例：零配置直接调用后端控制器

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
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

// 创建控制器实例（指定后端地址）
const defaultController = _http(AppController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
    timeout: 5000,
  },
});

// 直接以类型安全的方式调用后端方法
const res = await defaultController.getHello();
console.log(res._data); // 输出：'Hello World!'
```

```
// 实际会发起的请求：
// GET /api/hello
// 返回的内容：
// 'Hello World!'
```

无需编写任何额外的 API 客户端代码；vtzac 会在构建期为你自动生成对应的前端调用代码与类型绑定。你在前端看到的 `getHello()` 调用，会被转换为上述的 HTTP 请求，并通过 `res._data` 提供类型安全的返回值读取。

## 5. 启动与验证

分别启动后端与前端：

```bash
# 启动 NestJS 后端（默认端口 3001）
pnpm --filter nestjs-example start

# 启动 Vite 前端
pnpm --filter frontend dev
```

在浏览器访问前端页面并触发示例调用，若后端返回 `Hello World!`，说明最基本的使用已经完成。

到此为止，我们就完成了最基本的使用。你可以参考项目中的示例代码进一步了解更多功能。
