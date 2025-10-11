# WebSocket Backend Message Sending

This document explains how to send WebSocket messages from the backend using `vtzac/typed-emit` in a type-safe and concise manner to different targets (individual clients, rooms, global). All examples use decorators within `class` for intuitive understanding and reusability.

## Core Concepts

- `@Emit(eventName)`: Declares an event name for a class method, with the method's return value being the data to send.
- `emitWith(fn, ctx)`: A method-first approach to send messages, automatically reading event names and return data, then selecting dispatch targets:
  - `toClient(client)` sends to a single client
  - `toRoom(client, room)` sends to a room (excluding current client)
  - `toRoomAll(server, room)` sends to a room (including current client)
  - `toServer(server)` broadcasts to the entire server

## Defining Events (Backend)

Use decorators in classes to define events and return the data structure to send. Event names should be short and semantically clear.

```typescript
import { Emit } from 'vtzac/typed-emit'

class ChatEmitter {
  // Welcome event: send welcome message
  @Emit('greet')
  greet(nickname: string) {
    return { text: `Welcome ${nickname}` }
  }

  // Regular message event: send text content
  @Emit('message')
  message(text: string) {
    return { text }
  }
}
```

Notes:

- Event names are primarily taken from `@Emit('...')`, if not annotated, the method name is used as the event name.
- The method's return value is the final data sent to the frontend, with types controlled and inferable throughout.

## Sending Messages in Gateway

After instantiating the event class, dispatch to different targets as needed in the NestJS gateway. Examples include: connection welcome, global broadcast, room join notification.

```typescript
import type { Server, Socket } from 'socket.io'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { emitWith } from 'vtzac/typed-emit'

class ChatEmitter {
  @Emit('greet')
  greet(nickname: string) {
    return { text: `Welcome ${nickname}` }
  }

  @Emit('message')
  message(text: string) {
    return { text }
  }
}

@WebSocketGateway({ cors: { origin: '*' } })
class ChatGateway {
  private readonly emitter = new ChatEmitter()

  @WebSocketServer()
  server!: Server

  // Send welcome message to new client connection
  handleConnection(client: Socket) {
    const nickname = `User${client.id.slice(-4)}`
    emitWith(this.emitter.greet, this.emitter)(nickname).toClient(client)
  }

  // Client sends message: broadcast to all online users
  @SubscribeMessage('say')
  handleSay(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client?: Socket
  ) {
    emitWith(
      this.emitter.message,
      this.emitter
    )(data.text).toServer(this.server)
  }

  // Join room and notify all users in the room (including self)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room)
    emitWith(
      this.emitter.message,
      this.emitter
    )(`Joined room ${room}`).toRoomAll(this.server, room)
  }
}
```

### Quick Reference for Different Targets

```typescript
// Send to current client
emitWith(emitter.message, emitter)('hello').toClient(client)

// Send to room (excluding current client)
emitWith(emitter.message, emitter)('room only').toRoom(client, 'roomA')

// Send to room (including current client)
emitWith(emitter.message, emitter)('room all').toRoomAll(server, 'roomA')

// Broadcast to entire server (all online clients)
emitWith(emitter.message, emitter)('broadcast').toServer(server)
```

## Minimal Working Example

Place the following two code segments in your backend project (e.g., NestJS gateway) to run:

```typescript
// Import statements
import type { Server, Socket } from 'socket.io'
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Emit, emitWith } from 'vtzac/typed-emit'

// 1) Define events

class SimpleEmitter {
  @Emit('ping')
  ping() {
    return { message: 'pong' }
  }
}

@WebSocketGateway({ cors: { origin: '*' } })
class SimpleGateway {
  private readonly emitter = new SimpleEmitter()

  @WebSocketServer()
  server!: Server

  // When client initiates 'ping', backend replies 'pong' (to that client only)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket) {
    emitWith(this.emitter.ping, this.emitter)().toClient(client!)
  }
}
```

## Summary and Recommendations

- Decouple "event definition" from "dispatch location": event classes only care about data structure and event names, gateways are responsible for selecting targets and sending.
- Always use `emitWith(fn, ctx)(...args)` to get type-safe data and event names, then select dispatch targets, avoiding errors from hand-written strings and objects.
- Room-related sending requires `client.join(room)` first, choose `toRoom` or `toRoomAll` depending on whether to include the current client.

For more flexible custom dispatch logic, you can use the dispatcher constructor provided by this library:

```typescript
import { dispatch } from 'vtzac/typed-emit'

const sendTo = dispatch.client(client) // or dispatch.server(server), dispatch.room(client, room)
sendTo('message', { text: 'hello' })
```

This covers the core usage of sending WebSocket messages from the backend. You can freely extend event classes and gateway handling logic according to your business needs while maintaining type safety for events and data.
