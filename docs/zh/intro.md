# 项目介绍：vtzac 概览

vtzac 是一个面向 Vite + NestJS 的全栈开发工具，目标是让前端以"类型安全、零样板代码"的方式直接调用后端控制器（HTTP 与 WebSocket），并为服务端事件发送提供简洁的封装。

核心能力：

- HTTP 调用语法糖：在前端直接以控制器类为入口进行方法调用，自动生成请求代码与类型提示。
- WebSocket 调用语法糖：前端创建"发送器"和"监听器"，按方法名与事件名一一对应，具备完整类型约束与 ACK 支持。
- 服务端事件发送封装：通过装饰器定义事件，结合 emit 路由器在服务端以统一方式发送到客户端、房间或全局。

适用场景：

- 单体项目或工作区（pnpm workspace）中，前端直接引用后端工程，实现真正的"前后端同构类型"。
- 希望减少手写 API 客户端代码、减少维护成本，同时保证类型安全与一致性。

## HTTP：类型安全的控制器方法调用

只需在前端引入后端控制器类，通过 `_http` 创建实例即可直接调用。所有参数与返回值都具备类型提示，返回值需要通过 `res._data` 读取实际结果。vtzac 会根据控制器与方法上的装饰器自动拼接请求路径与参数。

**后端控制器示例：**

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

**前端调用示例：**

```ts
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';

const api = _http(AppController, {
  ofetchOptions: { baseURL: 'http://localhost:3000', timeout: 5000 },
});

async function demo() {
  const res = await api.getHello();
  console.log(res._data); // 输出：'Hello World!'
}
```

```
// 实际会发起的请求：
// GET /api/hello
// 返回的内容：
// 'Hello World!'
```

配合 Vite 插件后，vtzac 会在构建阶段自动生成前端调用代码，无需手写 API 客户端。上述 `getHello()` 调用会在构建期被转换为标准的 HTTP 请求代码，并保证从参数到返回值的类型安全。

## WebSocket：发送器与监听器的双向类型安全

前端通过 `_socket(url, GatewayClass, options)` 一次性初始化连接，获得：

- `emitter`：按方法名调用，自动映射为对应事件名；有返回值的方法会自动使用 ACK。
- `createListener(EventEmitterClass)`：根据服务端定义的事件，在前端创建类型安全的监听器。

**前端 WebSocket 调用示例：**

```ts
import { _socket } from 'vtzac/hook';
import { WebSocketTestGateway } from 'nestjs-example/src/websocket.gateway';
import { WebSocketEventEmitter } from 'nestjs-example/src/websocket.emitter';

const { emitter, createListener, socket, disconnect } = _socket(
  'http://localhost:3000',
  WebSocketTestGateway,
  { socketIoOptions: { transports: ['websocket'] } }
);

// 发送（自动映射事件名）
emitter.handleJoinChat({ nickname: 'Alice' });
emitter.handlePublicMessage({ text: 'Hello everyone!' });
const counter = await emitter.handleGetOnlineCount();
console.log('在线人数:', counter.count); // 输出：在线人数: 5

// 监听（类型安全）
const listener = createListener(WebSocketEventEmitter);
listener.publicMessage(msg => console.log('公共消息:', msg)); // 输出：公共消息: { text: 'Hello everyone!' }
listener.error(data => console.error('错误:', data)); // 输出：错误: { message: 'Connection failed' }

// 断开连接
disconnect();
```

```
// 实际会发起的 WebSocket 事件：
// emit 'handleJoinChat' { nickname: 'Alice' }
// emit 'handlePublicMessage' { text: 'Hello everyone!' }
// emit 'handleGetOnlineCount' (with ACK)
// 监听事件：'publicMessage', 'error'
```

## 服务端：事件定义与发送封装（typed-emit）

在服务端使用 `@Emit` 装饰器定义所有事件，并使用 `emitWith` 路由到不同目标（客户端、房间、全局）。事件与参数都有完整类型约束。

**事件定义示例：**

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

**服务端发送示例：**

```ts
import { emitWith } from 'vtzac/typed-emit';
import { WebSocketEventEmitter } from './websocket.emitter';

// 广播到房间
emitWith(
  new WebSocketEventEmitter().publicMessage,
  new WebSocketEventEmitter()
)({ text: 'Hello!' }).toRoomAll(server, 'public');
```

```
// 实际会发送的事件：
// 向房间 'public' 中的所有客户端发送 'publicMessage' 事件
// 事件数据：{ text: 'Hello!' }
```

## 下一步

- 快速开始：零配置完成最小可用流程，见「开始使用」。
- 进阶配置：查看 Vite 插件选项与用法。
- 常见问题：参考故障排除文档。
