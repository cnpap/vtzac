# Project Introduction: vtzac Overview

vtzac is a full-stack development tool for Vite + NestJS, aimed at enabling frontend to directly call backend controllers (HTTP & WebSocket) in a "type-safe, zero boilerplate code" manner, while providing clean encapsulation for server-side event emission.

Core Capabilities:

- HTTP call syntax sugar: Frontend directly calls controller classes as entry points for method invocation, automatically generating request code and type hints.
- WebSocket call syntax sugar: Frontend creates "emitters" and "listeners" with one-to-one correspondence by method names and event names, featuring complete type constraints and ACK support.
- Server-side event emission encapsulation: Define events through decorators, combined with emit router to send to clients, rooms, or globally in a unified way on the server side.

Use Cases:

- Monolithic projects or workspaces (pnpm workspace) where frontend directly references backend projects, achieving true "frontend-backend isomorphic types".
- Reducing manual API client code writing and maintenance costs while ensuring type safety and consistency.

## HTTP: Type-Safe Controller Method Calls

Simply import backend controller classes in the frontend and create instances through `_http` to directly call them. All parameters and return values have type hints, and return values need to be accessed through `res._data` to read actual results. vtzac automatically concatenates request paths and parameters based on decorators on controllers and methods.

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
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

const api = _http(AppController, {
  ofetchOptions: { baseURL: 'http://localhost:3000', timeout: 5000 },
});

async function demo() {
  const res = await api.getHello();
  console.log(res._data); // Output: 'Hello World!'
}
```

```
// Actual request made:
// GET /api/hello
// Returned content:
// 'Hello World!'
```

With the Vite plugin, vtzac automatically generates frontend call code during build time, eliminating the need for manual API client writing. The above `getHello()` call will be transformed into standard HTTP request code during build time, ensuring type safety from parameters to return values.

## WebSocket: Bidirectional Type Safety with Emitters and Listeners

Frontend initializes connection once through `_socket(url, GatewayClass, options)` to get:

- `emitter`: Call by method names, automatically mapping to corresponding event names; methods with return values automatically use ACK.
- `createListener(EventEmitterClass)`: Create type-safe listeners in frontend based on server-defined events.

**Frontend WebSocket Call Example:**

```ts
import { _socket } from 'vtzac/hook';
import { WebSocketTestGateway } from 'nestjs-example/src/websocket.gateway';
import { WebSocketEventEmitter } from 'nestjs-example/src/websocket.emitter';

const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3000',
  WebSocketTestGateway,
  { socketIoOptions: { transports: ['websocket'] } }
);

// Emit (automatic event name mapping)
emitter.handleJoinChat({ nickname: 'Alice' });
emitter.handlePublicMessage({ text: 'Hello everyone!' });
const counter = await emitter.handleGetOnlineCount();
console.log('Online count:', counter.count); // Output: Online count: 5

// Listen (type-safe)
const listener = createListener(WebSocketEventEmitter);
listener.publicMessage(msg => console.log('Public message:', msg)); // Output: Public message: { text: 'Hello everyone!' }
listener.error(data => console.error('Error:', data)); // Output: Error: { message: 'Connection failed' }

// Disconnect
disconnect();
```

```
// Actual WebSocket events emitted:
// emit 'handleJoinChat' { nickname: 'Alice' }
// emit 'handlePublicMessage' { text: 'Hello everyone!' }
// emit 'handleGetOnlineCount' (with ACK)
// Listening events: 'publicMessage', 'error'
```

## Server-side: Event Definition and Emission Encapsulation (typed-emit)

Use `@Emit` decorator on server-side to define all events, and use `emitWith` to route to different targets (clients, rooms, global). Events and parameters have complete type constraints.

**Event Definition Example:**

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

**Server-side Emission Example:**

```ts
import { emitWith } from 'vtzac/typed-emit';
import { WebSocketEventEmitter } from './websocket.emitter';

// Broadcast to room
emitWith(
  new WebSocketEventEmitter().publicMessage,
  new WebSocketEventEmitter()
)({ text: 'Hello!' }).toRoomAll(server, 'public');
```

```
// Actual event sent:
// Send 'publicMessage' event to all clients in room 'public'
// Event data: { text: 'Hello!' }
```

## Next Steps

- Quick Start: Zero-configuration completion of minimal viable process, see "Getting Started".
- Advanced Configuration: Check Vite plugin options and usage.
- FAQ: Refer to troubleshooting documentation.
