# AI Agent：三种流式格式支持与统一调用

vtzac 针对 AI 应用中的三种主流流式传输格式（SSE、Text、Data）提供统一的前端调用方式，避免开发者在不同协议间切换时修改业务代码。

核心能力：

- 统一的协议抽象：通过 `protocol: 'sse' | 'text' | 'data'` 切换，无需改动核心逻辑
- 与 Vercel AI SDK 服务端能力对齐：支持 `pipeTextStreamToResponse` 与 `pipeUIMessageStreamToResponse`
- 完成模式与多轮对话模式均可使用三种协议

适用场景：

- 你的后端同时暴露不同协议的流式接口（如 SSE 与 Text），前端希望以统一方式调用
- 使用 Vercel AI SDK 但又需要兼容 SSE（例如 AI Agent 代理）

## 流式格式说明与对应接口

以下接口来自后端示例 `AiSdkController`，三种格式分别对应：

- SSE（Server-Sent Events）：基于 `text/event-stream`，事件式推送
- Text：纯文本分片（`text/plain` + `transfer-encoding: chunked`）
- Data：基于 NDJSON 的 UI Message 数据流（适配 `@ai-sdk/react` 默认 `streamProtocol: 'data'`）

### 完成模式：单次生成响应

**SSE：**

```ts
import { _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// 创建控制器实例（指定后端地址 + 流式响应类型）
const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
});
const api = controller(AiSdkController);

// SSE 完成模式（GET，通过 message 查询参数）
await api.chatStream('介绍一下成都');
```

```
// 实际会发起的请求：
// GET /api/ai-sdk/chat/stream?message=%E4%BB%8B%E7%BB%8D%E4%B8%80%E4%B8%8B%E6%88%90%E9%83%BD
// 返回的内容：
// text/event-stream（SSE 事件流，逐片推送）
```

**Text：**

```ts
// 纯文本分片流（POST）
await api.aiSdkCompletion({ prompt: '介绍一下成都' });
```

```
// 实际会发起的请求：
// POST /api/ai-sdk/completion
// 请求体：{ "prompt": "介绍一下成都" }
// 返回的内容：
// text/plain（chunked 文本流）
```

**Data：**

```ts
// NDJSON 数据协议流（POST）
await api.aiSdkCompletionData({ prompt: '介绍一下成都' });
```

```
// 实际会发起的请求：
// POST /api/ai-sdk/completion-data
// 请求体：{ "prompt": "介绍一下成都" }
// 返回的内容：
// text/event-stream（NDJSON 事件流，适配 @ai-sdk/react 的 data 协议）
```

### 多轮对话模式：支持上下文与历史消息

**SSE：**

```ts
import type { UIMessage } from 'ai';

const messages: UIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    parts: [{ type: 'text', text: '你好！我是 AI 助手。' }],
  },
];

// 通过查询参数传递完整的 messages（GET）
await api.chatSSE(JSON.stringify(messages));
```

```
// 实际会发起的请求：
// GET /api/ai-sdk/chat/sse?messages=%5B...%5D
// 返回的内容：
// text/event-stream（SSE 文本分片或事件数据）
```

**Text：**

```ts
// 以文本分片形式返回（POST）
await api.multiChat({ messages });
```

```
// 实际会发起的请求：
// POST /api/ai-sdk/chat/multi
// 请求体：{ "messages": [ ... ] }
// 返回的内容：
// text/plain（chunked 文本流）
```

**Data：**

```ts
// 以 UI Message 数据协议返回（POST）
await api.aiSdkCompletionDataMessages({ messages });
```

```
// 实际会发起的请求：
// POST /api/ai-sdk/completion-data/messages
// 请求体：{ "messages": [ ... ] }
// 返回的内容：
// text/event-stream（NDJSON 事件流）
```

## 统一前端调用：为什么需要三种格式

原因与场景说明：

- AI SDK（Vercel）默认在 React 侧用 Data 协议（NDJSON）驱动 UI Message 流，更适合组件化渲染
- 传统文本流（Text）更轻量，常用于纯文本生成或后端直连
- SSE 在更广泛的事件推送场景中使用，很多 Agent 系统或工具链习惯输出 SSE

因此，vtzac 将三种格式都进行适配，并提供统一的前端调用抽象：

- 同一套业务代码，可自由切换 `protocol` 来适配不同服务端实现
- 在 React 场景下继续保持 `@ai-sdk/react` 的最佳实践（详见「React 助手函数」）

## 配置示例：按协议选择不同接口

下例展示如何根据协议选择不同的后端方法。实际 UI 交互可参考 Playground 中的 StreamTest。

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';
import type { UIMessage } from 'ai';

const { controller } = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
});
const api = controller(AiSdkController);

// 完成模式
const getCompletion = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'sse':
      return (prompt: string) => api.chatStream(prompt);
    case 'text':
      return (prompt: string) => api.aiSdkCompletion({ prompt });
    case 'data':
      return (prompt: string) => api.aiSdkCompletionData({ prompt });
  }
};

// 对话模式
const getChat = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'sse':
      return (messages: UIMessage[]) => api.chatSSE(JSON.stringify(messages));
    case 'text':
      return (messages: UIMessage[]) => api.multiChat({ messages });
    case 'data':
      return (messages: UIMessage[]) =>
        api.aiSdkCompletionDataMessages({ messages });
  }
};
```

## 下一步

- React 场景请阅读「React 助手函数：useAIChat / useAICompletion」，了解如何在组件中以统一方式驱动三种协议
- 参考「快速开始」完成本地运行与联调
