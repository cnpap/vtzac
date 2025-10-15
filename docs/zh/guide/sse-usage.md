# SSE 流式响应

本指南介绍如何在 vtzac 中实现 Server-Sent Events (SSE) 流式响应，实现实时数据推送和流式内容传输。

## SSE：服务端事件流的类型安全实现

vtzac 提供了完整的 SSE 支持，包括后端的 `@Sse` 装饰器和前端的 `consumeStream` 函数，实现类型安全的流式数据传输。

> **重要说明**：`consumeStream` 会自动处理 SSE 协议格式，`onMessage` 回调函数接收的 `ev.data` 是已解析的纯净数据内容，而不是原始的 SSE 格式数据。

### 后端 SSE 接口实现

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

### 前端 SSE 消费实现

**前端调用示例：**

```ts
import { consumeStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// 创建控制器实例
const { controller } = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
});
const aiSdkController = controller(AiSdkController);

// SSE 流式处理函数
const startStream = async () => {
  const message = '介绍一下成都';
  const abortController = new AbortController();

  try {
    // 使用 consumeStream 消费 SSE 流
    await consumeStream(aiSdkController.chatStream(message), {
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

### 完整的 React 组件示例

**React 组件示例：**

```tsx
import React, { useRef, useState } from 'react';
import { consumeStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', timeout: 30000 },
});
const aiSdkController = controller(AiSdkController);

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
      await consumeStream(aiSdkController.chatStream(message), {
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

  return (
    <div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="输入消息..."
      />
      <button onClick={startStream} disabled={loading}>
        {loading ? '传输中...' : '开始流式'}
      </button>
      <button onClick={stopStream} disabled={!loading}>
        停止
      </button>

      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      {output && (
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
          {output}
        </div>
      )}
    </div>
  );
};
```

### SSE 流式传输的核心特性

1. **类型安全**：前端调用后端 SSE 接口时享有完整的类型提示和检查
2. **自动处理**：`consumeStream` 自动处理 SSE 协议细节，无需手动解析
   - 服务端发送：`id: 1\ndata: 成都\n\n`
   - onMessage 接收：`ev.data = "成都"`（纯净的数据内容）
3. **错误处理**：提供完整的错误处理机制，包括网络错误和业务错误
4. **流控制**：支持通过 `AbortController` 随时中断流式传输
5. **零配置**：无需额外配置，直接使用控制器方法即可

### 与传统 SSE 方案的对比

**传统方案：**

```ts
// 需要手动处理 SSE 协议
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = event => {
  // 手动解析数据
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

### 实际应用场景

- **AI 对话**：实现流式 AI 对话，逐字显示回复内容
- **实时日志**：推送服务器日志到前端实时显示
- **进度更新**：长时间任务的进度实时推送
- **数据监控**：实时数据指标的推送和展示

通过 vtzac 的 SSE 支持，您可以轻松实现高性能的实时数据传输，同时保持代码的类型安全和简洁性。
