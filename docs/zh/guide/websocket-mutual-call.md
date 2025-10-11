# WebSocket 前后端相互调用

目标：让你快速掌握"怎么用"——前端如何调用后端、后端如何推送到前端，并保持类型安全。原理性讲解不展开，直接给清晰可复用的用法范式。

## 用法总览

- 后端事件类：用 `@Emit('event')` 声明事件与数据结构（后端→前端）。
- 后端网关：用 `@SubscribeMessage('event')` 声明可被前端调用的行为（前端→后端）。
- 前端连接与 API：用 `_socket(url, GatewayClass, options)` 直接获取 `emitter` 实例和 `createListener` 方法，对应"调用后端"和"监听事件"。
- 派发语法糖：用 `emitWith(fn, ctx)(...args)` 获取事件名与数据，再选择 `.toClient .toServer .toRoom .toRoomAll`。

## 接入步骤（后端）

1. 定义事件类（给前端的消息、结构清晰、可复用）：

```ts
import { Emit } from 'vtzac/typed-emit'

export class ServerEvents {
  @Emit('welcome')
  welcome(nickname: string) {
    return {
      message: `欢迎 ${nickname}!`,
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

2. 定义网关（前端可调用的行为、派发目标明确）：

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

  // 新连接欢迎：仅发给当前客户端
  handleConnection(client: Socket): void {
    const nick = `用户${client.id.slice(-4)}`
    emitWith(this.events.welcome, this.events)(nick).toClient(client)
  }

  // 心跳：前端发起 'ping'，后端回复 'pong'
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket): void {
    emitWith(this.events.pong, this.events)().toClient(client!)
  }

  // 广播消息：前端发起 'say'，后端广播给所有在线用户
  @SubscribeMessage('say')
  handleSay(@MessageBody() data: { text: string }): void {
    emitWith(
      this.events.welcome,
      this.events
    )(`系统：${data.text}`).toServer(this.server)
  }

  // 加入房间并通知所有房间成员（含自己）
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client?: Socket
  ) {
    client!.join(room)
    emitWith(
      this.events.welcome,
      this.events
    )(`加入房间 ${room}`).toRoomAll(this.server, room)
  }
}
```

## 接入步骤（前端）

```ts
import { _socket } from 'vtzac/hook'
import { ActionGateway } from './action.gateway'
import { ServerEvents } from './server-events'

// 建立连接，直接传入网关类
const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3001',
  ActionGateway,
  {
    socketIoOptions: { transports: ['websocket'] },
  }
)

// emitter 就是网关实例，可直接调用方法
// 调用后端行为
emitter.handlePing()
emitter.handleSay({ text: '大家好！' })
emitter.handleJoinRoom('room-1')

// 创建事件监听器
const events = createListener(ServerEvents) // 后端 -> 前端（监听事件）

// 监听后端事件
events.pong(data => console.log('心跳响应:', data))
events.welcome(data => console.log('欢迎消息:', data))

// 演示完成后断开
setTimeout(() => disconnect(), 10_000)
```

## 常见场景与技巧

- 请求-响应（带 Ack）：后端网关方法如果 `return` 值，前端会走 `emitWithAck`，返回 `Promise<类型>`。

```ts
// 后端
@WebSocketGateway()
class ActionGateway {
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount() {
    return { count: this.onlineUsers.size }
  }
}

// 前端
const { emitter } = _socket('http://localhost:3001', ActionGateway)
const result = await emitter.handleGetOnlineCount() // 返回 Promise<{ count: number }>
console.log('在线人数:', result.count)
```

- 广播与房间：选择合适目标；房间发送前先 `client.join(room)`。

```ts
emitWith(events.welcome, events)('全站公告').toServer(server)
emitWith(events.welcome, events)('房间公告').toRoomAll(server, 'room-1')
```

- 点对点发送：拿到目标客户端后使用 `.toClient(client)`；常见做法是维护 `userId -> Socket` 映射。

```ts
// 伪代码：私聊
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
        '对方不在线'
      ).toClient(client!)
    }
    emitWith(
      this.events.welcome,
      this.events
    )(`私聊：${data.text}`).toClient(target)
  }
}
```

- 错误处理：统一事件结构，配合前端集中监听。

```ts
try {
  /* ... */
}
catch (e) {
  emitWith(this.events.error, this.events)('SERVER_ERROR', '发生错误').toClient(
    client!
  )
}

events.error((data) => {
  /* 前端集中提示 */
})
```

- 命名空间：网关支持 `namespace`，前端传入网关类即可自动识别命名空间。

```ts
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ask' })
export class AskGateway {
  getNamespace() {
    return '/ask'
  } // 库会自动调用此方法获取命名空间
}

// 前端：_socket('http://localhost:3001', AskGateway) 会自动连接到 /ask 命名空间
const { emitter } = _socket('http://localhost:3001', AskGateway)
```

## 获取原生 Socket（等价说明）

`_socket(...).socket` 与 `io(url, options)` 返回值等价，均为 `socket.io-client` 的 `Socket`；可直接使用 `.on/.emit/.emitWithAck`，随时回退到原生用法。

```ts
import { io, Socket } from 'socket.io-client'
import { _socket } from 'vtzac/hook'

const { socket } = _socket('http://localhost:3001', ActionGateway, {
  socketIoOptions: { transports: ['websocket'] },
})
const raw: Socket = io('http://localhost:3001', { transports: ['websocket'] })

// 两者等价，可直接使用原生API
socket.on('connect', () => console.log('连接成功'))
socket.emit('customEvent', { data: 'test' })
```

## 术语与映射（一目了然）

- `_socket(url, GatewayClass, options)`：返回 `{ emitter, createListener, socket, disconnect }`。
- `emitter`：网关类的实例，`@SubscribeMessage('xxx')` 映射为前端 `handleXxx(...)`。
- `createListener(EventsClass)`：把 `@Emit('xxx')` 映射为前端 `xxx(callback)`，回调入参类型等于该方法返回类型。
- Ack 映射：网关方法有返回值 → 前端 `emitter.handleXxx` 返回 `Promise<返回值>`。

## 小结

- 先定义事件类，再在网关中挑选派发目标；前后职责清晰，类型安全。
- 前端只面向类与方法，避免手写字符串事件名与裸对象，开发效率更高。
