# WebSocket：后端消息发送

## 概述

通过 `vtzac/typed-emit` 以**类型安全**的方式向不同目标发送 WebSocket 消息，支持单个客户端、房间、全局广播等场景。

## 核心功能

### 事件定义

使用 `@Emit` 装饰器定义事件，方法返回值即为发送的数据结构：

**事件定义示例：**

```ts
import { Emit } from 'vtzac/typed-emit';

class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return { text: `欢迎 ${nickname}!`, timestamp: Date.now() };
  }

  @Emit('message')
  message(text: string) {
    return { text, timestamp: Date.now() };
  }
}
```

### 消息发送

使用 `emitWith` 方法选择发送目标：

**发送目标选择：**

```ts
import { emitWith } from 'vtzac/typed-emit';

const events = new ChatEvents();

// 发送给单个客户端
emitWith(events.welcome, events)('Alice').toClient(client);

// 发送到房间（不含当前客户端）
emitWith(events.message, events)('Hello room').toRoom(client, 'room1');

// 发送到房间（含当前客户端）
emitWith(events.message, events)('Hello all').toRoomAll(server, 'room1');

// 广播到整个服务端
emitWith(events.message, events)('Global message').toServer(server);
```

## 网关集成

### 完整示例

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

class ChatEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return { text: `欢迎 ${nickname}!`, timestamp: Date.now() };
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

  // 新客户端连接时发送欢迎消息
  handleConnection(client: Socket) {
    const nickname = `用户${client.id.slice(-4)}`;
    emitWith(this.events.welcome, this.events)(nickname).toClient(client);
    // 实际会发送的事件：
    // emit 'welcome' { text: '欢迎 用户1234!', timestamp: 1703123456789 }
  }

  // 处理客户端消息并广播
  @SubscribeMessage('say')
  handleSay(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client?: Socket
  ) {
    emitWith(this.events.message, this.events)(data.text).toServer(this.server);
    // 实际会发送的事件：
    // 向所有客户端广播 'message' { text: 'Hello everyone!', timestamp: 1703123456789 }
  }

  // 加入房间并通知
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
    // 向房间 'room1' 中的所有客户端发送 'message' 事件
  }
}
```

## 快速开始

**最小示例：**

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
    console.log('发送 pong 响应'); // 输出：发送 pong 响应
  }
}
```

```
// 实际会发起的 WebSocket 事件：
// 客户端发送：emit 'ping'
// 服务端响应：emit 'pong' { message: 'pong', timestamp: 1703123456789 }
```

## 小结

- **事件定义**：使用 `@Emit` 装饰器定义事件名和数据结构
- **消息发送**：通过 `emitWith` 方法选择发送目标（客户端、房间、全局）
- **类型安全**：全程保持类型推断，避免手写字符串和对象错误
