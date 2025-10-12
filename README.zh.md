# vtzac

> **Vite + NestJS 全栈开发工具** - 类型安全、零样板代码的前后端调用方案

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

中文 | [English](./README.md)

vtzac 是一个面向 Vite + NestJS 的全栈开发工具，让前端以"类型安全、零样板代码"的方式直接调用后端控制器（HTTP 与 WebSocket），并为服务端事件发送提供简洁的封装。

## ✨ 核心特性

- **🔗 HTTP 调用语法糖** - 前端直接以控制器类为入口进行方法调用，自动生成请求代码与类型提示
- **🔄 WebSocket 双向通信** - 前端创建"发送器"和"监听器"，按方法名与事件名一一对应，具备完整类型约束与 ACK 支持
- **📡 服务端事件发送封装** - 通过装饰器定义事件，结合 emit 路由器在服务端以统一方式发送到客户端、房间或全局
- **⚡ 零配置即用** - 在 pnpm 工作区中前端直接引用后端工程，实现真正的"前后端同构类型"
- **🚀 5分钟上手** - 最少步骤完成配置，便于跳转至后端代码

## 🚀 快速开始

### 1. 创建工作区

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
pnpm init

# 创建前端（以 React + TS 为例）
pnpm create vite frontend -- --template react-ts

# 创建后端（NestJS 示例）
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - frontend
  - nestjs-example
```

### 2. 安装与配置

```bash
cd frontend
pnpm add vtzac
```

在 `vite.config.ts` 中添加插件：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

将后端项目作为依赖加入前端 `package.json`：

```json
{
  "dependencies": {
    "nestjs-example": "workspace:*"
  }
}
```

## 📖 功能演示

### HTTP：类型安全的控制器调用

**后端控制器：**

```ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }

  @Post('user/:id')
  createUser(@Param('id') id: string, @Body() userData: { name: string }) {
    return { id, name: userData.name, created: true };
  }
}
```

**前端调用：**

```ts
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

const api = _http(AppController, {
  ofetchOptions: { baseURL: 'http://localhost:3001', timeout: 5000 },
});

async function demo() {
  // GET /api/hello
  const res1 = await api.getHello();
  console.log(res1._data); // 输出：'Hello World!'

  // POST /api/user/123
  const res2 = await api.createUser('123', { name: 'Alice' });
  console.log(res2._data); // 输出：{ id: '123', name: 'Alice', created: true }
}
```

### WebSocket：发送器与监听器的双向通信

**前端 WebSocket 调用：**

```ts
import { _socket } from 'vtzac/hook';
import { WebSocketTestGateway } from 'nestjs-example/src/websocket.gateway';
import { WebSocketEventEmitter } from 'nestjs-example/src/websocket.emitter';

const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3001',
  WebSocketTestGateway,
  { socketIoOptions: { transports: ['websocket'] } }
);

// 发送（自动映射事件名）
emitter.handleJoinChat({ nickname: 'Alice' });
emitter.handlePublicMessage({ text: 'Hello everyone!' });

// 带返回值的调用（自动使用 ACK）
const counter = await emitter.handleGetOnlineCount();
console.log('在线人数:', counter.count); // 输出：在线人数: 5

// 监听（类型安全）
const listener = createListener(WebSocketEventEmitter);
listener.publicMessage(msg => {
  console.log('公共消息:', msg); // 输出：公共消息: { text: 'Hello everyone!' }
});
listener.error(data => {
  console.error('错误:', data); // 输出：错误: { message: 'Connection failed' }
});

// 断开连接
disconnect();
```

### 服务端：事件定义与发送

**事件定义：**

```ts
import { Emit } from 'vtzac/typed-emit';

export class WebSocketEventEmitter {
  @Emit('publicMessage')
  publicMessage(message: { text: string }) {
    return message;
  }

  @Emit('error')
  error(message: string) {
    return { message };
  }
}
```

**服务端发送：**

```ts
import { emitWith } from 'vtzac/typed-emit';
import { WebSocketEventEmitter } from './websocket.emitter';

// 广播到房间
emitWith(
  new WebSocketEventEmitter().publicMessage,
  new WebSocketEventEmitter()
)({ text: 'Hello!' }).toRoomAll(server, 'public');
// 输出：向房间 'public' 中的所有客户端发送 'publicMessage' 事件
```

## 🎯 适用场景

- **单体项目或工作区** - pnpm workspace 中前端直接引用后端工程
- **减少维护成本** - 无需手写 API 客户端代码，自动生成类型安全的调用代码
- **提升开发效率** - 保证类型安全与一致性，便于代码跳转和重构

## 📚 文档

- **[快速开始](https://vtzac.opss.dev/zh/getting-started)** - 零配置完成最小可用流程
- **[项目介绍](https://vtzac.opss.dev/zh/intro)** - 详细了解 vtzac 的核心能力
- **[配置指南](https://vtzac.opss.dev/zh/guide/configuration)** - Vite 插件选项与用法
- **[使用指南](https://vtzac.opss.dev/zh/guide/)** - 参数使用、文件上传、WebSocket 等进阶功能

## 📦 安装

```bash
pnpm add vtzac
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
