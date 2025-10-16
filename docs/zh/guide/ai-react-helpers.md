# React：AI 流式助手函数

本章节介绍 vtzac 提供的两个 React 助手函数：`useAIChat` 与 `useAICompletion`。两者都支持三种流式协议（SSE / Text / Data），通过统一的 `protocol` 选项切换，无需更改业务逻辑。

核心功能：

- 协议统一：`protocol: 'sse' | 'text' | 'data'`
- Chat 模式：支持上下文记忆与历史消息
- Completion 模式：单次文本生成
- 便捷的控制方法：`append / complete / reload / stop / reset`
- 完整的状态与错误：`isLoading / error / messages / completion`

## 配置示例

通过「发送函数」连接后端，根据协议选择对应的控制器方法：

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// 初始化 HTTP 客户端
const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
}).controller(AiSdkController);

// 按协议选择聊天方法
const getChatSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'sse':
      return messages => api.chatSSE(JSON.stringify(messages));
    case 'text':
      return messages => api.multiChat({ messages });
    case 'data':
      return messages => api.aiSdkCompletionDataMessages({ messages });
  }
};

// 按协议选择完成方法
const getCompletionSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'sse':
      return prompt => api.chatStream(prompt);
    case 'text':
      return prompt => api.aiSdkCompletion({ prompt });
    case 'data':
      return prompt => api.aiSdkCompletionData({ prompt });
  }
};
```

## 基本使用示例

**聊天模式（useAIChat）：**

```ts
// 初始化聊天 Hook
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  initialMessages: [
    { id: '1', role: 'assistant', parts: [{ type: 'text', text: '你好！' }] },
  ],
});

// 发送消息
chat.append('你好，介绍一下成都');

// 控制操作
chat.stop(); // 停止生成
chat.reset(); // 重置对话
chat.reload(); // 重新生成最后一条消息

// 状态访问
console.log(chat.messages); // 消息列表
console.log(chat.isLoading); // 是否正在生成
console.log(chat.error); // 错误信息
```

**完成模式（useAICompletion）：**

```ts
// 初始化完成 Hook
const completion = useAICompletion(getCompletionSender('text'), {
  protocol: 'text',
});

// 生成文本
completion.complete('介绍一下成都');

// 控制操作
completion.stop(); // 停止生成
completion.reset(); // 重置内容

// 状态访问
console.log(completion.completion); // 生成的文本
console.log(completion.isLoading); // 是否正在生成
console.log(completion.error); // 错误信息
```

```
// 实际会发起的请求（可能随协议不同而变化）：
// - Data（聊天）：POST /api/ai-sdk/completion-data/messages
// - Text（聊天）：POST /api/ai-sdk/chat/multi
// - SSE（聊天）：GET /api/ai-sdk/chat/sse?messages=[...]
// - Data（完成）：POST /api/ai-sdk/completion-data
// - Text（完成）：POST /api/ai-sdk/completion
// - SSE（完成）：GET /api/ai-sdk/chat/stream?message=...
```

## 最佳实践

- 协议选择建议：
  - Data：与 `@ai-sdk/react` 默认协议一致，适合 UI Message 流驱动的聊天体验
  - Text：纯文本生成或简化传输场景
  - SSE：Agent 类场景或通用事件流
- 切换协议时，优先复用同一 Hook，只需更改 `protocol` 与发送函数的映射
- 提前设置 `responseType: 'stream'`，确保前端能以流方式消费响应

## 下一步

- 若需要了解三种协议的来源与差异，请阅读「AI Agent：三种流式格式支持与统一调用」
- 参照「使用用例」中的 SSE 章节，掌握更多流式交互方法

## API 说明

### useAIChat

**函数签名：** `useAIChat(send: (messages: UIMessage[]) => PromiseLike<any>, options?: UseAIChatOptions): UseAIChatReturn`

**参数说明：**

| 参数      | 类型                                          | 必填 | 说明                                 |
| --------- | --------------------------------------------- | ---- | ------------------------------------ |
| `send`    | `(messages: UIMessage[]) => PromiseLike<any>` | ✅   | 发送函数，接收消息列表并返回 Promise |
| `options` | `UseAIChatOptions`                            | ❌   | 配置选项                             |

**UseAIChatOptions 配置项：**

| 属性              | 类型                               | 必填 | 默认值  | 说明                                    |
| ----------------- | ---------------------------------- | ---- | ------- | --------------------------------------- |
| `protocol`        | `StreamProtocol`                   | ❌   | `'sse'` | 流式协议类型：'sse' \| 'text' \| 'data' |
| `initialMessages` | `UIMessage[]`                      | ❌   | `[]`    | 初始消息列表                            |
| `onMessage`       | `(ev: EventSourceMessage) => void` | ❌   | -       | 流式消息回调                            |
| `onFinish`        | `(message: UIMessage) => void`     | ❌   | -       | 完成回调，接收最终生成的消息            |
| `onError`         | `(err: Error) => void`             | ❌   | -       | 错误回调                                |

**UseAIChatReturn 返回值：**

| 属性        | 类型                                 | 说明                       |
| ----------- | ------------------------------------ | -------------------------- |
| `messages`  | `UIMessage[]`                        | 当前消息列表               |
| `isLoading` | `boolean`                            | 是否正在加载/生成          |
| `error`     | `Error \| null`                      | 错误信息，无错误时为 null  |
| `append`    | `(content: string) => Promise<void>` | 发送新消息                 |
| `reload`    | `() => Promise<void>`                | 重新生成最后一条消息       |
| `stop`      | `() => void`                         | 停止当前生成               |
| `reset`     | `() => void`                         | 重置聊天状态，清空消息列表 |

### useAICompletion

**函数签名：** `useAICompletion(send: (prompt: string) => PromiseLike<any>, options?: UseAICompletionOptions): UseAICompletionReturn`

**参数说明：**

| 参数      | 类型                                   | 必填 | 说明                               |
| --------- | -------------------------------------- | ---- | ---------------------------------- |
| `send`    | `(prompt: string) => PromiseLike<any>` | ✅   | 发送函数，接收提示词并返回 Promise |
| `options` | `UseAICompletionOptions`               | ❌   | 配置选项                           |

**UseAICompletionOptions 配置项：**

| 属性        | 类型                               | 必填 | 默认值  | 说明                                    |
| ----------- | ---------------------------------- | ---- | ------- | --------------------------------------- |
| `protocol`  | `StreamProtocol`                   | ❌   | `'sse'` | 流式协议类型：'sse' \| 'text' \| 'data' |
| `onMessage` | `(ev: EventSourceMessage) => void` | ❌   | -       | 流式消息回调                            |
| `onFinish`  | `(completion: string) => void`     | ❌   | -       | 完成回调，接收最终生成的文本            |
| `onError`   | `(err: Error) => void`             | ❌   | -       | 错误回调                                |

**UseAICompletionReturn 返回值：**

| 属性         | 类型                                | 说明                      |
| ------------ | ----------------------------------- | ------------------------- |
| `completion` | `string`                            | 当前生成的文本内容        |
| `isLoading`  | `boolean`                           | 是否正在加载/生成         |
| `error`      | `Error \| null`                     | 错误信息，无错误时为 null |
| `complete`   | `(prompt: string) => Promise<void>` | 发起文本生成              |
| `stop`       | `() => void`                        | 停止当前生成              |
| `reset`      | `() => void`                        | 重置状态，清空生成内容    |

## 类型定义

### StreamProtocol

流式协议类型，支持三种不同的流式传输协议：

| 值       | 说明                                                                      |
| -------- | ------------------------------------------------------------------------- |
| `'sse'`  | Server-Sent Events，适合 Agent 类场景或通用事件流，可自定义事件类型       |
| `'text'` | 纯文本流，适合简化传输场景                                                |
| `'data'` | 数据流，与 `@ai-sdk/react` 默认协议一致，适合 UI Message 流驱动的聊天体验 |

### UIMessage

消息对象类型，来自 `ai` 包的标准消息格式。具体结构请参考 [ai 包文档](https://sdk.vercel.ai/docs)。

### EventSourceMessage

事件源消息对象，用于流式传输：

| 属性    | 类型     | 必填 | 说明                                               |
| ------- | -------- | ---- | -------------------------------------------------- |
| `id`    | `string` | ✅   | 事件 ID，用于设置 EventSource 对象的 last event ID |
| `event` | `string` | ✅   | 事件类型标识符                                     |
| `data`  | `string` | ✅   | 事件数据                                           |
| `retry` | `number` | ❌   | 重连间隔（毫秒），连接失败时的重试间隔             |

### Data 协议消息格式

当使用 `protocol: 'data'` 时，`onMessage` 回调会接收到以下格式的消息。每条消息都包含 `type` 字段，可通过 `e.type` 访问：

**基础消息类型示例：**

| type            | 说明         | 示例数据                                        |
| --------------- | ------------ | ----------------------------------------------- |
| `'start'`       | 开始生成     | `{"type":"start"}`                              |
| `'start-step'`  | 开始步骤     | `{"type":"start-step"}`                         |
| `'text-start'`  | 开始文本生成 | `{"type":"text-start","id":"0"}`                |
| `'text-delta'`  | 文本增量更新 | `{"type":"text-delta","id":"0","delta":"你好"}` |
| `'text-end'`    | 文本生成结束 | `{"type":"text-end","id":"0"}`                  |
| `'finish-step'` | 步骤完成     | `{"type":"finish-step"}`                        |
| `'finish'`      | 生成完成     | `{"type":"finish"}`                             |

**结束标识：**

- 流的最后一条消息固定为 `data: [DONE]`

**onMessage 使用示例：**

```ts
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  onMessage: e => {
    // 解析 JSON 数据
    const message = JSON.parse(e.data);

    // 根据消息类型处理
    switch (message.type) {
      case 'start':
        console.log('开始生成');
        break;
      case 'text-delta':
        console.log(`文本增量: ${message.delta}, ID: ${message.id}`);
        break;
      case 'text-end':
        console.log(`文本生成完成, ID: ${message.id}`);
        break;
      case 'finish':
        console.log('全部完成');
        break;
    }
  },
});
```

**工具调用场景：**
在 AI Agent 场景中，可能会有工具调用等复杂交互，此时会有更多的 `type` 类型，如 `'tool-call'`、`'tool-result'` 等。通过监听 `onMessage` 可以获取完整的执行过程信息。
