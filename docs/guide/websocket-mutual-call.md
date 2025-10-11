# WebSocket Frontend-Backend Mutual Calls

Goal: Help you quickly master "how to use" - how frontend calls backend, how backend pushes to frontend, while maintaining type safety. We'll skip theoretical explanations and provide clear, reusable usage patterns directly.

## Usage Overview

- Backend Event Classes: Use `@Emit('event')` to declare events and data structures (backend → frontend).
- Backend Gateway: Use `@SubscribeMessage('event')` to declare behaviors that can be called by frontend (frontend → backend).
- Frontend Connection & API: Use `_socket(url, GatewayClass, options)` to directly get `emitter` instance and `createListener` method, corresponding to "calling backend" and "listening to events".
- Dispatch Syntax Sugar: Use `emitWith(fn, ctx)(...args)` to get event name and data, then choose `.toClient .toServer .toRoom .toRoomAll`.

## Integration Steps (Backend)

1. Define event classes (messages for frontend, clear structure, reusable):

```ts
import { Emit } from 'vtzac/typed-emit'

export class ServerEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return {
      message: `Welcome ${nickname}!`,
      timestamp: new Date().toISOString(),
    }
  }

  @Emit('pong')
  pong() {
    return { message: 'pong', timestamp: new Date().toISOString() }
  }

  @Emit('error')
  error(code: string, msg: string) {
    return { code, message: msg, timestamp: new Date().toISOString() }
  }
}
```

2. Define gateway (behaviors callable by frontend, clear dispatch targets):

```ts
import type { Server, Socket } from 'socket.io'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { emitWith } from 'vtzac/typed-emit'
import { ServerEvents } from './server-events'

@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway {
  private readonly events = new ServerEvents()

  @WebSocketServer()
  server!: Server

  // New connection welcome: send only to current client
  handleConnection(client: Socket): void {
    const nick = `User${client.id.slice(-4)}`
    emitWith(this.events.welcome, this.events)(nick).toClient(client)
  }

  // Heartbeat: frontend sends 'ping', backend replies 'pong'
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket): void {
    emitWith(this.events.pong, this.events)().toClient(client!)
  }

  // Broadcast message: frontend sends 'say', backend broadcasts to all online users
  @SubscribeMessage('say')
  handleSay(@MessageBody() data: { text: string }): void {
    emitWith(
      this.events.welcome,
      this.events
    )(`System: ${data.text}`).toServer(this.server)
  }

  // Join room and notify all room members (including self)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room)
    emitWith(
      this.events.welcome,
      this.events
    )(`Joined room ${room}`).toRoomAll(this.server, room)
  }
}
```

## Integration Steps (Frontend)

```ts
import { _socket } from 'vtzac/hook'
import { ActionGateway } from './action.gateway'
import { ServerEvents } from './server-events'

// Establish connection, directly pass in gateway class
const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3001',
  ActionGateway,
  {
    socketIoOptions: { transports: ['websocket'] },
  }
)

// emitter is the gateway instance, can directly call methods
// Call backend behaviors
emitter.handlePing()
emitter.handleSay({ text: 'Hello everyone!' })
emitter.handleJoinRoom('room-1')

// Create event listener
const events = createListener(ServerEvents) // backend -> frontend (listen to events)

// Listen to backend events
events.pong(data => console.log('Heartbeat response:', data))
events.welcome(data => console.log('Welcome message:', data))

// Disconnect after demo
setTimeout(() => disconnect(), 10_000)
```

## Common Scenarios & Tips

- Request-Response (with Ack): If backend gateway method `return`s a value, frontend will use `emitWithAck`, returning `Promise<Type>`.

```ts
// Backend
@WebSocketGateway()
class ActionGateway {
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount() {
    return { count: this.onlineUsers.size }
  }
}

// Frontend
const { emitter } = _socket('http://localhost:3001', ActionGateway)
const result = await emitter.handleGetOnlineCount() // Returns Promise<{ count: number }>
console.log('Online users:', result.count)
```

- Broadcasting & Rooms: Choose appropriate targets; join room with `client.join(room)` before sending to room.

```ts
emitWith(events.welcome, events)('Site-wide announcement').toServer(server)
emitWith(
  events.welcome,
  events
)('Room announcement').toRoomAll(server, 'room-1')
```

- Point-to-point sending: Use `.toClient(client)` after getting target client; common approach is maintaining `userId -> Socket` mapping.

```ts
// Pseudo code: private chat
class Xxx {
  @SubscribeMessage('private')
  sendPrivate(
    @MessageBody() data: { toUserId: string, text: string },
    @ConnectedSocket() client?: Socket
  ) {
    const target = this.userSockets.get(data.toUserId)
    if (!target) {
      return emitWith(this.events.error, this.events)(
        'NOT_FOUND',
        'User is offline'
      ).toClient(client!)
    }
    emitWith(
      this.events.welcome,
      this.events
    )(`Private: ${data.text}`).toClient(target)
  }
}
```

- Error handling: Unified event structure, combined with centralized frontend listening.

```ts
try {
  /* ... */
}
catch (e) {
  emitWith(this.events.error, this.events)(
    'SERVER_ERROR',
    'An error occurred'
  ).toClient(client!)
}

events.error((data) => {
  /* Frontend centralized alerts */
})
```

- Namespaces: Gateway supports `namespace`, frontend passing gateway class automatically recognizes namespace.

```ts
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ask' })
export class AskGateway {
  getNamespace() {
    return '/ask'
  } // Library will automatically call this method to get namespace
}

// Frontend: _socket('http://localhost:3001', AskGateway) will automatically connect to /ask namespace
const { emitter } = _socket('http://localhost:3001', AskGateway)
```

## Getting Native Socket (Equivalence Explanation)

`_socket(...).socket` is equivalent to `io(url, options)` return value, both are `socket.io-client`'s `Socket`; can directly use `.on/.emit/.emitWithAck`, fallback to native usage anytime.

```ts
import { io, Socket } from 'socket.io-client'
import { _socket } from 'vtzac/hook'

const { socket } = _socket('http://localhost:3001', ActionGateway, {
  socketIoOptions: { transports: ['websocket'] },
})
const raw: Socket = io('http://localhost:3001', { transports: ['websocket'] })

// Both are equivalent, can directly use native APIs
socket.on('connect', () => console.log('Connected'))
socket.emit('customEvent', { data: 'test' })
```

## Terminology & Mapping (At a Glance)

- `_socket(url, GatewayClass, options)`: Returns `{ emitter, createListener, socket, disconnect }`.
- `emitter`: Gateway class instance, `@SubscribeMessage('xxx')` maps to frontend `handleXxx(...)`.
- `createListener(EventsClass)`: Maps `@Emit('xxx')` to frontend `xxx(callback)`, callback parameter type equals method return type.
- Ack mapping: Gateway method has return value → frontend `emitter.handleXxx` returns `Promise<ReturnValue>`.

## Summary

- Define event classes first, then select dispatch targets in gateway; clear separation of concerns, type safety.
- Frontend only deals with classes and methods, avoiding manual string event names and bare objects, higher development efficiency.
