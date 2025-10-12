# vtzac

> **Vite + NestJS Full-Stack Development Tool** - Type-safe, zero-boilerplate frontend-backend communication

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

[中文](./README.zh.md) | English

vtzac is a full-stack development tool for Vite + NestJS that enables frontend to call backend controllers (HTTP & WebSocket) in a "type-safe, zero-boilerplate" manner, while providing clean abstractions for server-side event emission.

## ✨ Core Features

- **🔗 HTTP Call Syntax Sugar** - Frontend directly calls controller methods with automatic request code generation and type hints
- **🔄 WebSocket Bidirectional Communication** - Frontend creates "emitters" and "listeners" with method-to-event name mapping, complete type constraints and ACK support
- **📡 Server-side Event Emission Wrapper** - Define events through decorators, combined with emit router for unified server-side emission to clients, rooms, or globally
- **⚡ Zero Configuration** - Frontend directly references backend projects in pnpm workspace, achieving true "frontend-backend isomorphic types"
- **🚀 5-Minute Setup** - Minimal steps to complete configuration with easy backend code navigation

## 🚀 Quick Start

### 1. Create Workspace

```bash
mkdir my-vtzac-demo && cd my-vtzac-demo
pnpm init

# Create frontend (React + TS example)
pnpm create vite frontend -- --template react-ts

# Create backend (NestJS example)
pnpm dlx @nestjs/cli new nestjs-example --package-manager pnpm
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - frontend
  - nestjs-example
```

### 2. Installation & Configuration

```bash
cd frontend
pnpm add vtzac
```

Add plugin to `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vtzac from 'vtzac';

export default defineConfig({
  plugins: [vtzac(), react()],
});
```

Add backend project as dependency in frontend `package.json`:

```json
{
  "dependencies": {
    "nestjs-example": "workspace:*"
  }
}
```

## 📖 Feature Demonstrations

### HTTP: Type-Safe Controller Calls

**Backend Controller:**

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

**Frontend Calls:**

```ts
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

const api = _http(AppController, {
  ofetchOptions: { baseURL: 'http://localhost:3001', timeout: 5000 },
});

async function demo() {
  // GET /api/hello
  const res1 = await api.getHello();
  console.log(res1._data); // Output: 'Hello World!'

  // POST /api/user/123
  const res2 = await api.createUser('123', { name: 'Alice' });
  console.log(res2._data); // Output: { id: '123', name: 'Alice', created: true }
}
```

### WebSocket: Bidirectional Communication with Emitters and Listeners

**Frontend WebSocket Calls:**

```ts
import { _socket } from 'vtzac/hook';
import { WebSocketTestGateway } from 'nestjs-example/src/websocket.gateway';
import { WebSocketEventEmitter } from 'nestjs-example/src/websocket.emitter';

const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3001',
  WebSocketTestGateway,
  { socketIoOptions: { transports: ['websocket'] } }
);

// Emit (automatic event name mapping)
emitter.handleJoinChat({ nickname: 'Alice' });
emitter.handlePublicMessage({ text: 'Hello everyone!' });

// Calls with return values (automatic ACK usage)
const counter = await emitter.handleGetOnlineCount();
console.log('Online count:', counter.count); // Output: Online count: 5

// Listen (type-safe)
const listener = createListener(WebSocketEventEmitter);
listener.publicMessage(msg => {
  console.log('Public message:', msg); // Output: Public message: { text: 'Hello everyone!' }
});
listener.error(data => {
  console.error('Error:', data); // Output: Error: { message: 'Connection failed' }
});

// Disconnect
disconnect();
```

### Server-side: Event Definition and Emission

**Event Definition:**

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

**Server-side Emission:**

```ts
import { emitWith } from 'vtzac/typed-emit';
import { WebSocketEventEmitter } from './websocket.emitter';

// Broadcast to room
emitWith(
  new WebSocketEventEmitter().publicMessage,
  new WebSocketEventEmitter()
)({ text: 'Hello!' }).toRoomAll(server, 'public');
// Output: Send 'publicMessage' event to all clients in room 'public'
```

## 🎯 Use Cases

- **Monolithic Projects or Workspaces** - Frontend directly references backend projects in pnpm workspace
- **Reduce Maintenance Costs** - No need to write API client code manually, automatically generate type-safe call code
- **Improve Development Efficiency** - Ensure type safety and consistency, facilitate code navigation and refactoring

## 📚 Documentation

- **[Getting Started](https://vtzac.opss.dev/getting-started)** - Zero-configuration minimal viable setup
- **[Introduction](https://vtzac.opss.dev/intro)** - Detailed understanding of vtzac's core capabilities
- **[Configuration Guide](https://vtzac.opss.dev/guide/configuration)** - Vite plugin options and usage
- **[Usage Guide](https://vtzac.opss.dev/guide/)** - Advanced features like parameters, file uploads, WebSocket, etc.

## 📦 Installation

```bash
pnpm add vtzac
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
