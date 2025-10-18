# 流式传输

本指南介绍如何在 vtzac 中消费通用「流式传输」（包含 SSE 在内），并说明回调签名与使用方式。vtzac 并不限定 SSE；SSE 只是流式传输的一种协议/格式。我们提供两种消费函数：`consumeEventStream` 用于 SSE（`text/event-stream`），`consumeTextStream` 用于纯文本字节流（非 SSE）。在 AI 场景下，每一段数据都可以是 JSON 文本；`consumeEventStream` 提供 `onDataMessage` 以解析每段 JSON，而 `consumeTextStream` 不包含该选项。

> 使用建议：
>
> - 根据流格式选择一个回调：
>   - 纯文本流：使用 `onMessage(data: string)`。
>   - JSON 文本流：使用 `onDataMessage(parsed: Record<string,string>)`。
> - 在 AI 对接场景，很多提供方会以 JSON 片段（进度/事件）进行流式输出；此时更推荐使用 `onDataMessage`，从 `delta`/`text`/`content` 等字段读取增量并反映状态变化。
> - 同时提供两个回调是可选的：当 `onDataMessage` 存在且数据可解析为 JSON 时，两个回调都会触发——`onMessage` 收到原始字符串，`onDataMessage` 收到解析对象。
> - `onDataMessage` 仅在你提供该回调且 JSON 解析成功时触发；否则会被忽略。
> - 使用 `consumeTextStream` 时不支持 `onDataMessage`，仅处理原始文本的 `onMessage`。

## 配置示例

通过「控制器方法」连接后端，实现类型安全的 SSE 流式传输：

```ts
import { consumeEventStream, consumeTextStream, _http } from 'vtzac';
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
    const stream = await this.aiSdkService.streamWeatherAgent(message);
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

### 文本流（data 为纯文本）

```ts
const startStream = async () => {
  const message = '介绍一下成都';
  const abortController = new AbortController();

  try {
    const response = await api.chatStream(message);
    await consumeEventStream(response, {
      signal: abortController.signal,
      onMessage(data) {
        console.log('接收到文本:', data);
        setOutput(prev => prev + data);
      },
      onError(err) {
        console.error('流式错误:', err.message);
        setError(err.message);
      },
      onClose() {
        console.log('流式连接已关闭');
      },
    });
  } catch (err) {
    console.error('请求失败:', (err as Error).message);
  }
};

const stopStream = () => {
  abortController.abort();
};
```

### 纯文本流（Text）

```ts
const startTextStream = async () => {
  const message = '介绍一下成都';
  const ac = new AbortController();

  try {
    const response = await api.completion(message); // 假设为纯文本流端点
    await consumeTextStream(response, {
      signal: ac.signal,
      onMessage(data) {
        setOutput(prev => prev + data);
      },
      onError(err) {
        setError(err.message);
      },
    });
  } catch (err) {
    console.error('请求失败:', (err as Error).message);
  }
};
```

```
// 服务器返回的 SSE：
// id: 1
// data: 成都
//
// id: 2
// data: ，
// ...

// onMessage 接收到的数据：
// data = "成都"
// data = "，"
// ...
```

### JSON 数据流（data 为 JSON 文本）

当服务端以 JSON 字符串作为 `data` 返回时：

```ts
await consumeEventStream(await api.chatStream('你是谁'), {
  onDataMessage(parsed) {
    // 根据实际字段选择需要的增量文本（示例字段名：delta/text/content）
    const delta = parsed.delta || parsed.text || parsed.content;
    if (delta) {
      setOutput(prev => prev + delta);
    }
  },
  onMessage(data) {
    // 如需保留原始文本（例如日志或降级处理），仍可同时接收
    console.debug('raw:', data);
  },
});
```

> 说明：仅当你提供了 `onDataMessage` 且 `data` 可解析为 JSON 时，才会触发该回调；对于普通纯文本流，或解析失败的 JSON，`onDataMessage` 不会被调用。

## 与传统 SSE 方案的对比

```ts
// 传统：需要手动解包 SSE 协议
const es = new EventSource('/api/stream');
es.onmessage = ev => {
  // 需要自己从 ev.data 解析 JSON 或文本
  const data = ev.data;
};
```

```ts
// vtzac：统一消费函数与类型安全调用
const response = await controller.streamMethod(params);
await consumeEventStream(response, {
  onMessage: data => {
    console.log(data); // 原始文本
  },
  onDataMessage: parsed => {
    // 解析后的 JSON（Record<string,string>）
    console.log(parsed);
  },
});
```

## 实际应用场景

- AI 对话：逐字/逐段显示回复（文本或 JSON 增量）。
- 实时日志：推送服务器日志到前端实时展示。
- 进度更新：长任务进度的流式推送。
- 数据监控：实时指标的推送和可视化。

## 下一步

- 参照「[React 助手函数](/zh/guide/ai-react-helpers)」章节，构建更高级的交互体验。

## API 说明

### consumeEventStream

**函数签名：** `consumeEventStream(response: Response, options: ConsumeEventStreamOptions): Promise<void>`

### consumeTextStream

**函数签名：** `consumeTextStream(response: Response, options: Omit<ConsumeEventStreamOptions, 'onDataMessage'>): Promise<void>`

**参数说明：**

| 参数       | 类型                                               | 必填 | 说明                                         |
| ---------- | -------------------------------------------------- | ---- | -------------------------------------------- |
| `response` | `Response`                                         | Y    | HTTP 响应对象（需包含流式 body）             |
| `options`  | `Omit<ConsumeEventStreamOptions, 'onDataMessage'>` | N    | 纯文本流消费配置选项（不含 `onDataMessage`） |

### ConsumeEventStreamOptions

| 属性            | 类型                                    | 必填 | 说明                                            |
| --------------- | --------------------------------------- | ---- | ----------------------------------------------- |
| `signal`        | `AbortSignal`                           | N    | 用于取消流式传输                                |
| `onOpen`        | `(response: Response) => void`          | N    | 收到响应时触发，可用于校验                      |
| `onMessage`     | `(data: string) => void`                | N    | 原始文本消息回调（不做 JSON 解析）              |
| `onDataMessage` | `(data: Record<string,string>) => void` | N    | 提供该回调时会尝试解析 JSON，成功后传入解析结果 |
| `onClose`       | `() => void`                            | N    | 连接关闭时触发                                  |
| `onFinish`      | `() => void`                            | N    | 成功结束（在 `onClose` 之后）触发               |
| `onError`       | `(err: Error) => void`                  | N    | 发生错误时触发                                  |

## 类型定义

- `ParsedMessageData`：`Record<string, string>`，用于承载可解析的 JSON 数据。

## SSE 数据处理流程

1. 服务端发送：例如 `id: 1\ndata: {"delta":"成"}\n\n` 或 `id: 1\ndata: 成\n\n`
2. 协议解析：vtzac 自动解析 SSE 行，提取 `data` 文本。
3. 回调接收：
   - `onMessage(data)`：接收原始文本（例如 `"成"`）。
   - `onDataMessage(parsed)`：当你提供了该回调且 `data` 是合法 JSON 时接收解析对象（例如 `{ delta: "成" }`）。
