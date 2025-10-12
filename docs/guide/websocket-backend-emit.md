# WebSocket: Backend Message Emit

## Overview

Send WebSocket messages to different targets in a **type-safe** manner using `vtzac/typed-emit`, supporting scenarios like single client, rooms, global broadcast, etc.

## Core Features

### Event Definition

Use the `@Emit` decorator to define events, with method return values as the data structure to be sent:

**Event Definition Example:**

```ts
import { Emit } from 'vtzac/typed-emit';

class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return { text: `Welcome ${nickname}!`, timestamp: Date.now() };
  }

  @Emit('message')
  message(text: string) {
    return { text, timestamp: Date.now() };
  }
}
```

### Message Sending

Use the `emitWith` method to select sending targets:

**Target Selection:**

```ts
import { emitWith } from 'vtzac/typed-emit';

const events = new ChatEvents();

// Send to single client
emitWith(events.welcome, events)('Alice').toClient(client);

// Send to room (excluding current client)
emitWith(events.message, events)('Hello room').toRoom(client, 'room1');

// Send to room (including current client)
emitWith(events.message, events)('Hello all').toRoomAll(server, 'room1');

// Broadcast to entire server
emitWith(events.message, events)('Global message').toServer(server);
```

## Gateway Integration

### Complete Example

**Backend Gateway Example:**

```ts
import type { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { emitWith } from 'vtzac/typed-emit';

class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return { text: `Welcome ${nickname}!`, timestamp: Date.now() };
  }

  @Emit('message')
  message(text: string) {
    return { text, timestamp: Date.now() };
  }
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  private readonly events = new ChatEvents();

  @WebSocketServer()
  server!: Server;

  // Send welcome message when new client connects
  handleConnection(client: Socket) {
    const nickname = `User${client.id.slice(-4)}`;
    emitWith(this.events.welcome, this.events)(nickname).toClient(client);
    // Actual event sent:
    // emit 'welcome' { text: 'Welcome User1234!', timestamp: 1703123456789 }
  }

  // Handle client message and broadcast
  @SubscribeMessage('say')
  handleSay(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client?: Socket
  ) {
    emitWith(this.events.message, this.events)(data.text).toServer(this.server);
    // Actual event sent:
    // Broadcast 'message' { text: 'Hello everyone!', timestamp: 1703123456789 } to all clients
  }

  // Join room and notify
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room); // Join room first
    emitWith(
      this.events.message,
      this.events
    )(`Joined room ${room}`).toRoomAll(this.server, room);
    // Actual event sent:
    // Send 'message' event to all clients in room 'room1'
  }
}
```

## Quick Start

**Minimal Example:**

```ts
import { Emit, emitWith } from 'vtzac/typed-emit';
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';

class PingEvents {
  @Emit('pong')
  pong() {
    return { message: 'pong', timestamp: Date.now() };
  }
}

@WebSocketGateway({ cors: { origin: '*' } })
export class PingGateway {
  private readonly events = new PingEvents();

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket) {
    emitWith(this.events.pong, this.events)().toClient(client!);
    console.log('Sent pong response'); // Output: Sent pong response
  }
}
```

```
// Actual WebSocket events:
// Client sends: emit 'ping'
// Server responds: emit 'pong' { message: 'pong', timestamp: 1703123456789 }
```

## Summary

- **Event Definition**: Use `@Emit` decorator to define event names and data structures
- **Message Sending**: Select sending targets (client, room, global) through `emitWith` method
- **Type Safety**: Maintain type inference throughout, avoiding manual string and object errors
