# WebSocket: Bidirectional Communication

## Overview

Implement **type-safe** bidirectional communication between frontend and backend, supporting frontend calling backend methods, backend pushing messages to frontend, with complete type inference.

## Core Features

- **Frontend calls backend**: Call backend gateway methods directly through `emitter`
- **Backend pushes to frontend**: Use `emitWith` to send type-safe messages to different targets
- **Event listening**: Frontend listens to backend-pushed events through `createListener`
- **Request-response**: Support request-response pattern with ACK

## Backend Implementation

### Event Definition

**Event Definition Example:**

```ts
import { Emit } from 'vtzac/typed-emit';

export class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return {
      message: `Welcome ${nickname}!`,
      timestamp: Date.now(),
    };
  }

  @Emit('message')
  message(text: string) {
    return { text, timestamp: Date.now() };
  }

  @Emit('pong')
  pong() {
    return { message: 'pong', timestamp: Date.now() };
  }
}
```

### Gateway Implementation

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
import { ChatEvents } from './chat-events';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  private readonly events = new ChatEvents();

  @WebSocketServer()
  server!: Server;

  // Send welcome message when new client connects
  handleConnection(client: Socket): void {
    const nickname = `User${client.id.slice(-4)}`;
    emitWith(this.events.welcome, this.events)(nickname).toClient(client);
    // Actual event sent:
    // emit 'welcome' { message: 'Welcome User1234!', timestamp: 1703123456789 }
  }

  // Heartbeat detection
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket): void {
    emitWith(this.events.pong, this.events)().toClient(client!);
    // Actual event sent:
    // emit 'pong' { message: 'pong', timestamp: 1703123456789 }
  }

  // Broadcast message
  @SubscribeMessage('say')
  handleSay(@MessageBody() data: { text: string }): void {
    emitWith(this.events.message, this.events)(data.text).toServer(this.server);
    // Actual event sent:
    // Broadcast 'message' { text: 'Hello everyone!', timestamp: 1703123456789 } to all clients
  }

  // Join room
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
    // Send 'message' event to all clients in the room
  }
}
```

## Frontend Implementation

**Frontend Usage Example:**

```ts
import { _socket } from 'vtzac/hook';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat-events';

// Establish connection
const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3001',
  ChatGateway,
  {
    socketIoOptions: { transports: ['websocket'] },
  }
);

// Call backend methods
emitter.handlePing();
console.log('Sent heartbeat'); // Output: Sent heartbeat

emitter.handleSay({ text: 'Hello everyone!' });
console.log('Sent message'); // Output: Sent message

emitter.handleJoinRoom('room1');
console.log('Joined room'); // Output: Joined room

// Create event listener
const events = createListener(ChatEvents);

// Listen to backend-pushed events
events.pong(data => {
  console.log('Received heartbeat response:', data);
  // Output: Received heartbeat response: { message: 'pong', timestamp: 1703123456789 }
});

events.welcome(data => {
  console.log('Received welcome message:', data);
  // Output: Received welcome message: { message: 'Welcome User1234!', timestamp: 1703123456789 }
});

events.message(data => {
  console.log('Received message:', data);
  // Output: Received message: { text: 'Hello everyone!', timestamp: 1703123456789 }
});

// Disconnect
setTimeout(() => disconnect(), 10000);
```

```
// Actual WebSocket events:
// emit 'ping' (no data)
// emit 'say' { text: 'Hello everyone!' }
// emit 'joinRoom' 'room1'
// Listen to events: 'pong', 'welcome', 'message'
```

## Advanced Features

### Request-Response Pattern

When backend methods return values, frontend calls will return `Promise`:

**Backend ACK Response Example:**

```ts
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount() {
    return { count: 42 }; // Return online count
  }
}
```

**Frontend ACK Call Example:**

```ts
const { emitter } = _socket('http://localhost:3001', ChatGateway);
// If there's a return value, it will automatically adjust to emitWithAck call
const result = await emitter.handleGetOnlineCount();
console.log('Online count:', result.count); // Output: Online count: 42
```

### Room Management

**Room Broadcast Example:**

```ts
// Send to all clients
emitWith(events.message, events)('Site-wide announcement').toServer(server);

// Send to specific room
emitWith(
  events.message,
  events
)('Room announcement').toRoomAll(server, 'room1');
```

### Namespace

**Namespace Gateway Example:**

```ts
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway {}
```

**Frontend Connect to Namespace:**

```ts
// Automatically connect to /chat namespace
const { emitter } = _socket('http://localhost:3001', ChatGateway);
```

## Native Socket Access

You can directly access the native Socket instance for custom operations:

**Native Socket Usage Example:**

```ts
import { _socket } from 'vtzac/hook';

const { socket } = _socket('http://localhost:3001', ChatGateway);

// Use native Socket API
socket.on('connect', () => {
  console.log('Connected successfully'); // Output: Connected successfully
});

socket.emit('customEvent', { data: 'test' });
console.log('Sent custom event'); // Output: Sent custom event
```

## Summary

- **Type Safety**: Full type inference and checking throughout frontend-backend communication
- **Simplified Development**: Avoid manual event names and data structures, reduce errors
- **Bidirectional Communication**: Support complete scenarios of frontend calling backend and backend pushing to frontend
