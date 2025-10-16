# SSE 流式响应

本指南介绍如何在 vtzac 中实现 Server-Sent Events (SSE) 流式响应，实现实时数据推送和流式内容传输。

vtzac 提供了完整的 SSE 支持，包括后端的 `@Sse` 装饰器和前端的 `consumeStream` 函数，实现类型安全的流式数据传输。

核心功能：

- 类型安全：前端调用后端 SSE 接口时享有完整的类型提示和检查
- 自动处理：`consumeStream` 自动处理 SSE 协议细节，无需手动解析
- 错误处理：提供完整的错误处理机制，包括网络错误和业务错误
- 流控制：支持通过 `AbortController` 随时中断流式传输
- 零配置：无需额外配置，直接使用控制器方法即可

> **重要说明**：`consumeStream` 会自动处理 SSE 协议格式，`onMessage` 回调函数接收的 `ev.data` 是已解析的纯净数据内容，而不是原始的 SSE 格式数据。

## 配置示例

通过「控制器方法」连接后端，实现类型安全的 SSE 流式传输：

```ts
import { consumeStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// 初始化 HTTP 客户端
const api = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
}).controller(AiSdkController);
```

## 后端 SSE 接口实现

**后端控制器示例：**

```ts
import { Controller, Sse, Query } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  // SSE 流式接口
  @Sse('chat/stream')
  async chatStream(
    @Query('message') message: string
  ): Promise<Observable<MessageEvent>> {
    // 获取流式数据源
    const stream = await this.aiSdkService.streamWeatherAgent(message);
    // 转换为 SSE 格式
    return from(stream).pipe(map((data): MessageEvent => ({ data })));
  }
}
```

```
// 实际会创建的 SSE 端点：
// GET /api/ai-sdk/chat/stream?message=你好
// 响应头：content-type: text/event-stream
// 响应体：流式 SSE 事件数据
```

## 基本使用示例

**前端 SSE 消费实现：**

```ts
// SSE 流式处理函数
const startStream = async () => {
  const message = '介绍一下成都';
  const abortController = new AbortController();

  try {
    // 使用 consumeStream 消费 SSE 流
    await consumeStream(api.chatStream(message), {
      signal: abortController.signal,
      onMessage(ev) {
        // 处理每个流式数据片段
        console.log('接收到数据:', ev.data); // 输出：接收到数据: 成都
        setOutput(prev => prev + ev.data);
      },
      onError(err) {
        console.error('流式错误:', err.message); // 输出：流式错误: Network error
        setError(err.message);
      },
      onClose() {
        console.log('流式连接已关闭'); // 输出：流式连接已关闭
      },
    });
  } catch (err) {
    console.error('请求失败:', err.message); // 输出：请求失败: Request timeout
  }
};

// 停止流式传输
const stopStream = () => {
  abortController.abort();
};
```

```
// 实际会发起的请求：
// GET /api/ai-sdk/chat/stream?message=介绍一下成都

// 服务端返回的 SSE 格式：
// id: 1
// data: 成都
//
// id: 2
// data: ，
//
// id: 3
// data: 简称
// ...

// onMessage 回调接收到的数据（已解析的原始内容）：
// ev.data = "成都"
// ev.data = "，"
// ev.data = "简称"
// ...
```

**React 集成示例：**

```ts
import React, { useRef, useState } from 'react';

export const SseStreamDemo: React.FC = () => {
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const startStream = async () => {
    if (!message.trim()) return;

    // 重置状态
    setLoading(true);
    setError(null);
    setOutput('');

    // 创建新的控制器
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      // 开始流式传输
      await consumeStream(api.chatStream(message), {
        signal: controllerRef.current.signal,
        onMessage(ev) {
          // 逐字追加输出内容
          setOutput(prev => prev + ev.data);
        },
        onError(err) {
          setError(err.message);
        },
        onClose() {
          console.log('流式传输完成'); // 输出：流式传输完成
        },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  // UI 渲染逻辑...
};
```

## 最佳实践

- **响应类型设置**：确保设置 `responseType: 'stream'`，让前端能以流方式消费响应
- **错误处理**：始终提供 `onError` 回调处理网络错误和业务错误
- **流控制**：使用 `AbortController` 实现流的暂停和取消功能
- **状态管理**：合理管理加载状态、错误状态和输出内容
- **内存管理**：长时间流式传输时注意及时清理不需要的数据

## 与传统 SSE 方案的对比

**传统方案：**

```ts
// 需要手动处理 SSE 协议
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = event => {
  // 手动解析数据
  // 解析其中 id、data 等字段
  const data = JSON.parse(event.data);
};
```

**vtzac 方案：**

```ts
// 类型安全的方法调用
await consumeStream(controller.streamMethod(params), {
  onMessage: ev => {
    // 自动处理的数据
    console.log(ev.data);
  },
});
```

## 实际应用场景

- **AI 对话**：实现流式 AI 对话，逐字显示回复内容
- **实时日志**：推送服务器日志到前端实时显示
- **进度更新**：长时间任务的进度实时推送
- **数据监控**：实时数据指标的推送和展示

## 下一步

- 若需要了解其他流式协议，请阅读「AI Agent：三种流式格式支持与统一调用」
- 参照「React：AI 流式助手函数」章节，了解更高级的流式交互方法

## API 说明

### consumeStream

**函数签名：** `consumeStream(response: Promise<Response>, options: ConsumeStreamOptions): Promise<void>`

**参数说明：**

| 参数       | 类型                    | 必填 | 说明                                     |
| ---------- | ----------------------- | ---- | ---------------------------------------- |
| `response` | `Promise<Response>`     | ✅   | HTTP 响应 Promise，通常来自控制器方法调用 |
| `options`  | `ConsumeStreamOptions`  | ✅   | 流消费配置选项                           |

**ConsumeStreamOptions 配置项：**

| 属性        | 类型                               | 必填 | 说明                                 |
| ----------- | ---------------------------------- | ---- | ------------------------------------ |
| `signal`    | `AbortSignal`                      | ❌   | 用于取消流式传输的信号               |
| `onMessage` | `(ev: EventSourceMessage) => void` | ✅   | 流式消息回调，接收每个数据片段       |
| `onError`   | `(err: Error) => void`             | ❌   | 错误回调，处理网络错误和业务错误     |
| `onClose`   | `() => void`                       | ❌   | 连接关闭回调，流式传输完成时触发     |

## 类型定义

### EventSourceMessage

事件源消息对象，用于流式传输：

| 属性              | 类型     | 必填 | 说明                                               |
| ----------------- | -------- | ---- | -------------------------------------------------- |
| `[key: string]`   | `string` | ❌   | 消息中的自定义字段                             |

### MessageEvent

来自 `@nestjs/common` 包的消息事件对象类型，用于后端 SSE 响应。详细结构请参考 [NestJS 官方文档](https://docs.nestjs.com/techniques/server-sent-events)。

### SSE 数据处理流程

1. **服务端发送**：`id: 1\ndata: 成都\n\n`
2. **协议解析**：vtzac 自动解析 SSE 格式
3. **回调接收**：`onMessage` 接收 `ev.data = "成都"`（纯净数据）

通过 vtzac 的 SSE 支持，您可以轻松实现高性能的实时数据传输，同时保持代码的类型安全和简洁性。
