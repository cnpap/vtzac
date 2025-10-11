# WebSocket 后端消息发送

本文介绍如何在后端通过 `vtzac/typed-emit` 以类型安全、简洁的方式向不同目标（单个客户端、房间、全局）发送 WebSocket 消息。所有示例均使用装饰器并放在 `class` 中，便于直观理解与复用。

## 核心概念

- `@Emit(eventName)`: 为类方法声明事件名，方法返回值即为要发送的数据。
- `emitWith(fn, ctx)`: 以方法优先的方式发送消息，自动读取事件名与返回数据，然后选择派发目标：
  - `toClient(client)` 发送给单个客户端
  - `toRoom(client, room)` 发送到房间（不含当前客户端）
  - `toRoomAll(server, room)` 发送到房间（含当前客户端）
  - `toServer(server)` 广播到整个服务端

## 定义事件（后端）

使用装饰器在类中定义事件，并返回要发送的数据结构。事件名建议简短、语义清晰。

```typescript
import { Emit } from 'vtzac/typed-emit'

class ChatEmitter {
  // 欢迎事件：发送欢迎文案
  @Emit('greet')
  greet(nickname: string) {
    return { text: `欢迎 ${nickname}` }
  }

  // 普通消息事件：发送文本内容
  @Emit('message')
  message(text: string) {
    return { text }
  }
}
```

说明：

- 事件名来源优先取自 `@Emit('...')`，未标注时会使用方法名作为事件名。
- 方法返回值就是最终发送到前端的数据，类型全程受控、可推断。

## 在网关中发送消息

将事件类实例化后，在 NestJS 网关中按需派发到不同目标。示例包含：连接欢迎、全局广播、加入房间通知。

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
    return { text: `欢迎 ${nickname}` }
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

  // 新客户端连接时，向该客户端发送欢迎消息
  handleConnection(client: Socket) {
    const nickname = `用户${client.id.slice(-4)}`
    emitWith(this.emitter.greet, this.emitter)(nickname).toClient(client)
  }

  // 客户端发消息：向所有在线用户广播
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

  // 加入房间并通知房间内所有用户（包含自己）
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room)
    emitWith(
      this.emitter.message,
      this.emitter
    )(`已加入房间 ${room}`).toRoomAll(this.server, room)
  }
}
```

### 发送到不同目标的用法速览

```typescript
// 发送给当前客户端
emitWith(emitter.message, emitter)('hello').toClient(client)

// 发送到房间（不包含当前客户端）
emitWith(emitter.message, emitter)('room only').toRoom(client, 'roomA')

// 发送到房间（包含当前客户端）
emitWith(emitter.message, emitter)('room all').toRoomAll(server, 'roomA')

// 广播到整个服务端（所有在线客户端）
emitWith(emitter.message, emitter)('broadcast').toServer(server)
```

## 最小可用示例

将以下两段代码放入你的后端项目（例如 NestJS 网关），即可运行：

```typescript
// 2) 网关发送
import type { Server, Socket } from 'socket.io'

import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
// 1) 定义事件
import { Emit, emitWith } from 'vtzac/typed-emit'

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

  // 客户端主动发起 'ping' 时，后端回复 'pong'（仅该客户端）
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket) {
    emitWith(this.emitter.ping, this.emitter)().toClient(client!)
  }
}
```

## 小结与建议

- 将“事件定义”与“派发位置”解耦：事件类只关心数据结构与事件名，网关负责选择目标并发送。
- 始终通过 `emitWith(fn, ctx)(...args)` 获取类型安全的数据与事件名，再选择派发目标，避免手写字符串与对象导致的错误。
- 房间相关的发送需要先 `client.join(room)`，选择 `toRoom` 或 `toRoomAll` 取决于是否包含当前客户端。

如需更灵活的自定义派发逻辑，可使用本库提供的派发器构造器：

```typescript
import { dispatch } from 'vtzac/typed-emit'

const sendTo = dispatch.client(client) // or dispatch.server(server), dispatch.room(client, room)
sendTo('message', { text: 'hello' })
```

以上即为后端发送 WebSocket 消息的核心用法。你可以根据业务自由扩展事件类与网关处理逻辑，同时保持事件与数据的类型安全。
