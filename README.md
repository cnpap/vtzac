# vtzac

> **Vite + NestJS Full-Stack Development Tool** - Type-safe, zero-boilerplate frontend-backend communication

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

English | [中文](./README.zh.md)

vtzac is a full-stack development tool for Vite + NestJS that enables frontend to directly call backend controllers (HTTP & WebSocket) in a "type-safe, zero-boilerplate" manner, while providing clean abstractions for server-side event emission.

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
import { _http } from 'vtzac';
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
import { _socket } from 'vtzac';
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

## 📚 Documentation

- **[Getting Started](https://vtzac.opss.dev/getting-started)** - Zero-configuration minimal viable workflow

## 📦 Installation

```bash
pnpm add vtzac
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
