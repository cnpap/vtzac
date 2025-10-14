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

## 🚀 快速开始

### 1. 安装

```bash
pnpm add vtzac
```

### 2. 配置 Vite 插件

```ts
import { defineConfig } from 'vite';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac()],
});
```

### 3. 开始使用

前端直接引用后端项目即可实现类型安全调用。

## 📖 功能演示

### HTTP 调用

```ts
import { _http } from 'vtzac';
import { AppController } from 'backend/src/app.controller';

const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000' },
}).controller(AppController);

// 类型安全的方法调用
const res = await api.getHello();
console.log(res._data); // 输出：'Hello World!'
```

### WebSocket 通信

```ts
import { _socket } from 'vtzac';
import { WebSocketGateway } from 'backend/src/websocket.gateway';

const { emitter, createListener } = _socket(
  'http://localhost:3000',
  WebSocketGateway
);

// 发送消息
emitter.handleMessage({ text: 'Hello!' });

// 监听事件
const listener = createListener(EventEmitter);
listener.message(data => console.log(data));
```

## 🎯 适用场景

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
