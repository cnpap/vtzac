# WebSocket：前后端双向通信

## 概述

实现前端与后端的**类型安全**双向通信，支持前端调用后端方法、后端推送消息到前端，并提供完整的类型推断。

## 核心功能

- **前端调用后端**：通过 `emitter` 直接调用后端网关方法
- **后端推送前端**：使用 `emitWith` 向不同目标发送类型安全的消息
- **事件监听**：前端通过 `createListener` 监听后端推送的事件
- **请求响应**：支持带 ACK 的请求-响应模式

## 后端实现

### 事件定义

**事件定义示例：**

```ts
import { Emit } from 'vtzac/typed-emit';

export class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return {
      message: `欢迎 ${nickname}!`,
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

### 网关实现

**后端网关示例：**

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

  // 新客户端连接时发送欢迎消息
  handleConnection(client: Socket): void {
    const nickname = `用户${client.id.slice(-4)}`;
    emitWith(this.events.welcome, this.events)(nickname).toClient(client);
    // 实际会发送的事件：
    // emit 'welcome' { message: '欢迎 用户1234!', timestamp: 1703123456789 }
  }

  // 心跳检测
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket): void {
    emitWith(this.events.pong, this.events)().toClient(client!);
    // 实际会发送的事件：
    // emit 'pong' { message: 'pong', timestamp: 1703123456789 }
  }

  // 广播消息
  @SubscribeMessage('say')
  handleSay(@MessageBody() data: { text: string }): void {
    emitWith(this.events.message, this.events)(data.text).toServer(this.server);
    // 实际会发送的事件：
    // 向所有客户端广播 'message' { text: 'Hello everyone!', timestamp: 1703123456789 }
  }

  // 加入房间
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room); // 先加入房间
    emitWith(
      this.events.message,
      this.events
    )(`已加入房间 ${room}`).toRoomAll(this.server, room);
    // 实际会发送的事件：
    // 向房间中的所有客户端发送 'message' 事件
  }
}
```

## 前端实现

**前端调用示例：**

```ts
import { _socket } from 'vtzac';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat-events';

// 建立连接
const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3000',
  ChatGateway,
  {
    socketIoOptions: { transports: ['websocket'] },
  }
);

// 调用后端方法
emitter.handlePing();
console.log('发送心跳'); // 输出：发送心跳

emitter.handleSay({ text: 'Hello everyone!' });
console.log('发送消息'); // 输出：发送消息

emitter.handleJoinRoom('room1');
console.log('加入房间'); // 输出：加入房间

// 创建事件监听器
const events = createListener(ChatEvents);

// 监听后端推送的事件
events.pong(data => {
  console.log('收到心跳响应:', data);
  // 输出：收到心跳响应: { message: 'pong', timestamp: 1703123456789 }
});

events.welcome(data => {
  console.log('收到欢迎消息:', data);
  // 输出：收到欢迎消息: { message: '欢迎 用户1234!', timestamp: 1703123456789 }
});

events.message(data => {
  console.log('收到消息:', data);
  // 输出：收到消息: { text: 'Hello everyone!', timestamp: 1703123456789 }
});

// 断开连接
setTimeout(() => disconnect(), 10000);
```

```
// 实际会发起的 WebSocket 事件：
// emit 'ping' (无数据)
// emit 'say' { text: 'Hello everyone!' }
// emit 'joinRoom' 'room1'
// 监听事件：'pong', 'welcome', 'message'
```

## 高级功能

### 请求响应模式

后端方法返回值时，前端调用会返回 `Promise`：

**后端 ACK 响应示例：**

```ts
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount() {
    return { count: 42 }; // 返回在线人数
  }
}
```

**前端 ACK 调用示例：**

```ts
const { emitter } = _socket('http://localhost:3000', ChatGateway);
// 如果有返回值则会自动调整为 emitWithAck 调用
const result = await emitter.handleGetOnlineCount();
console.log('在线人数:', result.count); // 输出：在线人数: 42
```

### 房间管理

**房间广播示例：**

```ts
// 发送到所有客户端
emitWith(events.message, events)('全站公告').toServer(server);

// 发送到指定房间
emitWith(events.message, events)('房间公告').toRoomAll(server, 'room1');
```

### 命名空间

**命名空间网关示例：**

```ts
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway {}
```

**前端连接命名空间：**

```ts
// 自动连接到 /chat 命名空间
const { emitter } = _socket('http://localhost:3000', ChatGateway);
```

## 原生 Socket 访问

可以直接访问原生 Socket 实例进行自定义操作：

**原生 Socket 使用示例：**

```ts
import { _socket } from 'vtzac';

const { socket } = _socket('http://localhost:3000', ChatGateway);

// 使用原生 Socket API
socket.on('connect', () => {
  console.log('连接成功'); // 输出：连接成功
});

socket.emit('customEvent', { data: 'test' });
console.log('发送自定义事件'); // 输出：发送自定义事件
```

## 小结

- **类型安全**：前后端通信全程保持类型推断和检查
- **简化开发**：避免手写事件名和数据结构，减少错误
- **双向通信**：支持前端调用后端、后端推送前端的完整场景
