# vtzac

> **Vite + NestJS Full-Stack Development Tool** - Type-safe, zero-boilerplate frontend-backend communication

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

English | [中文](./README.zh.md)

vtzac is a full-stack development tool for Vite + NestJS that enables frontend to directly call backend controllers (HTTP & WebSocket) in a "type-safe, zero-boilerplate" manner, while providing clean abstractions for server-side event emission.

## ✨ Core Features

- **🔗 HTTP Call Syntax Sugar** - Frontend directly calls controller methods with automatic request code generation and type hints
- **🔄 WebSocket Bidirectional Communication** - Frontend creates "emitters" and "listeners" with method-to-event name mapping, complete type constraints and ACK support
- **📡 Server-side Event Emission Wrapper** - Define events through decorators and use emit router for unified server-side emission to clients, rooms, or globally

## 🚀 Quick Start

### 1. Installation

```bash
pnpm add vtzac
```

### 2. Configure Vite Plugin

```ts
import { defineConfig } from 'vite';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac()],
});
```

### 3. Start Using

Frontend can directly reference backend project to achieve type-safe calls.

## 📖 Feature Demonstrations

### HTTP Calls

```ts
import { _http } from 'vtzac/hook';
import { AppController } from 'backend/src/app.controller';

const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000' },
}).controller(AppController);

// Type-safe method calls
const res = await api.getHello();
console.log(res._data); // Output: 'Hello World!'
```

### WebSocket Communication

```ts
import { _socket } from 'vtzac/hook';
import { WebSocketGateway } from 'backend/src/websocket.gateway';

const { emitter, createListener } = _socket(
  'http://localhost:3000',
  WebSocketGateway
);

// Send messages
emitter.handleMessage({ text: 'Hello!' });

// Listen to events
const listener = createListener(EventEmitter);
listener.message(data => console.log(data));
```

## 🎯 Use Cases

- **Reduce Maintenance Costs** - No need to manually write API client code, automatically generates type-safe call code
- **Improve Development Efficiency** - Ensures type safety and consistency, facilitates code navigation and refactoring

## 📚 Documentation

- **[Getting Started](https://vtzac.opss.dev/getting-started)** - Zero-configuration minimal viable workflow
- **[Introduction](https://vtzac.opss.dev/intro)** - Detailed understanding of vtzac's core capabilities
- **[Configuration Guide](https://vtzac.opss.dev/guide/configuration)** - Vite plugin options and usage
- **[Usage Guide](https://vtzac.opss.dev/guide/)** - Advanced features like parameter usage, file uploads, WebSocket, etc.

## 📦 Installation

```bash
pnpm add vtzac
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
