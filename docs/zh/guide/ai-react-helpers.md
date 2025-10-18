# React：AI 流式助手函数

本页介绍两个 React 助手函数：`useAIChat` 与 `useAICompletion`。两者统一支持两种流式协议：`text` 与 `data`，通过 `protocol` 选项切换，无需更改业务逻辑。控制方法与状态也保持一致，便于在聊天与文本完成间复用。

- 协议选择：`protocol: 'text' | 'data'`
- 聊天模式：支持上下文记忆与历史消息
- 完成模式：单次文本生成
- 控制方法：`append / complete / reload / stop / reset`
- 状态与错误：`isLoading / error / messages / completion`

关于消息回调的细节：`onMessage` 与 `onDataMessage` 的完整签名、解析、触发条件请直接阅读「[流式传输](/zh/guide/streaming-usage)」。本页只说明它们与 React Hook 的关系与使用位置。

## 配置示例

通过「发送函数」连接后端，根据协议选择对应的控制器方法。请在 HTTP 客户端中设置 `responseType: 'stream'` 以便前端以流方式消费响应。

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';
import { MastraController } from 'nestjs-example/src/mastra.controller';

// 初始化 HTTP 客户端（务必设置 responseType: 'stream'）
const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
});
const aiSdk = controller(AiSdkController);
const mastra = controller(MastraController);

// 按协议选择聊天发送函数
const getChatSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'text':
      return messages => aiSdk.chat({ messages });
    case 'data':
      return messages => aiSdk.chatUI({ messages });
  }
};

// 按协议选择完成发送函数
const getCompletionSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'text':
      return prompt => aiSdk.completion({ prompt });
    case 'data':
      return prompt => aiSdk.completionUI({ prompt });
  }
};

// 使用 Mastra 控制器时，映射为：
// - text -> mastra.chatText / mastra.completion
// - data -> mastra.chatUI / mastra.completionUI
```

## 基本使用

**聊天模式（useAIChat）：**

```ts
// 使用 data 协议初始化聊天 Hook
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  initialMessages: [
    { id: '1', role: 'assistant', parts: [{ type: 'text', text: '你好！' }] },
  ],
});

// 发送消息
await chat.append('你好，介绍一下成都');

// 控制操作
chat.stop(); // 停止当前生成
chat.reset(); // 重置对话
chat.reload(); // 重新生成最后一条消息

// 状态访问
console.log(chat.messages);
console.log(chat.isLoading);
console.log(chat.error);
```

**完成模式（useAICompletion）：**

```ts
// 使用 text 协议初始化完成 Hook
const completion = useAICompletion(getCompletionSender('text'), {
  protocol: 'text',
});

// 发起文本生成
await completion.complete('介绍一下成都这座城市');

// 控制操作
completion.stop(); // 停止生成
completion.reset(); // 清空生成内容

// 状态访问
console.log(completion.completion);
console.log(completion.isLoading);
console.log(completion.error);
```

> 回调事件（如 `onMessage`）的字段与解析方式，请直接查阅「[流式传输](/zh/guide/streaming-usage)」。

## 最佳实践

- 协议选择：
  - `data`：与主流 AI SDK 的默认数据流一致，适合 UI Message 驱动的聊天体验；消息为 JSON 文本（解析后对象）。
  - `text`：纯文本增量传输，适合轻量或降级场景。
- 复用同一个 Hook，在切换协议时仅调整 `protocol` 与发送函数映射。
- 前端请求务必设置 `responseType: 'stream'` 以启用流式消费。
- 将解析逻辑（尤其 JSON 解析）统一放入事件处理处，避免业务层重复解析。

## API 说明

### useAIChat

函数签名：`useAIChat(send: (messages: UIMessage[]) => PromiseLike<any>, options?: UseAIChatOptions): UseAIChatReturn`

**参数：**

| 参数      | 类型                                          | 必填 | 说明                                   |
| --------- | --------------------------------------------- | ---- | -------------------------------------- |
| `send`    | `(messages: UIMessage[]) => PromiseLike<any>` | Y    | 发送函数，接收消息列表并返回 Promise   |
| `options` | `UseAIChatOptions`                            | N    | 配置选项（协议、初始消息、事件回调等） |

**UseAIChatOptions：**

| 属性              | 类型                                     | 必填 | 默认值   | 说明                             |
| ----------------- | ---------------------------------------- | ---- | -------- | -------------------------------- |
| `protocol`        | `StreamProtocol`                         | N    | `'data'` | 流式协议：`'text'` \| `'data'`   |
| `initialMessages` | `UIMessage[]`                            | N    | `[]`     | 初始消息列表                     |
| `onMessage`       | `(ev: any) => void`                      | N    | -        | 流式消息回调；细节见「流式传输」 |
| `onDataMessage`   | `(data: Record<string, string>) => void` | N    | -        | 数据消息回调；细节见「流式传输」 |
| `onFinish`        | `(message: UIMessage) => void`           | N    | -        | 完成回调，接收最终生成的消息     |
| `onError`         | `(err: Error) => void`                   | N    | -        | 错误回调                         |

**UseAIChatReturn：**

| 属性        | 类型                                 | 说明                        |
| ----------- | ------------------------------------ | --------------------------- |
| `messages`  | `UIMessage[]`                        | 当前消息列表                |
| `isLoading` | `boolean`                            | 是否正在生成                |
| `error`     | `Error \| null`                      | 错误信息，无错误时为 `null` |
| `append`    | `(content: string) => Promise<void>` | 发送新消息                  |
| `reload`    | `() => Promise<void>`                | 重新生成最后一条消息        |
| `stop`      | `() => void`                         | 停止当前生成                |
| `reset`     | `() => void`                         | 重置聊天状态，清空消息列表  |

### useAICompletion

函数签名：`useAICompletion(send: (prompt: string) => PromiseLike<any>, options?: UseAICompletionOptions): UseAICompletionReturn`

**参数：**

| 参数      | 类型                                   | 必填 | 说明                               |
| --------- | -------------------------------------- | ---- | ---------------------------------- |
| `send`    | `(prompt: string) => PromiseLike<any>` | Y    | 发送函数，接收提示词并返回 Promise |
| `options` | `UseAICompletionOptions`               | N    | 配置选项（协议与事件回调）         |

**UseAICompletionOptions：**

| 属性            | 类型                                     | 必填 | 默认值   | 说明                             |
| --------------- | ---------------------------------------- | ---- | -------- | -------------------------------- |
| `protocol`      | `StreamProtocol`                         | N    | `'data'` | 流式协议：`'text'` \| `'data'`   |
| `onMessage`     | `(ev: any) => void`                      | N    | -        | 流式消息回调；细节见「流式传输」 |
| `onDataMessage` | `(data: Record<string, string>) => void` | N    | -        | 数据消息回调；细节见「流式传输」 |
| `onFinish`      | `(completion: string) => void`           | N    | -        | 完成回调，接收最终生成的文本     |
| `onError`       | `(err: Error) => void`                   | N    | -        | 错误回调                         |

**UseAICompletionReturn：**

| 属性         | 类型                                | 说明                        |
| ------------ | ----------------------------------- | --------------------------- |
| `completion` | `string`                            | 当前生成的文本内容          |
| `isLoading`  | `boolean`                           | 是否正在生成                |
| `error`      | `Error \| null`                     | 错误信息，无错误时为 `null` |
| `complete`   | `(prompt: string) => Promise<void>` | 发起文本生成                |
| `stop`       | `() => void`                        | 停止当前生成                |
| `reset`      | `() => void`                        | 重置状态，清空生成内容      |

## 类型定义

### StreamProtocol

两种流式协议类型：

| 值       | 说明                                                  |
| -------- | ----------------------------------------------------- |
| `'text'` | 纯文本字节流，适合简化传输场景                        |
| `'data'` | 数据流（JSON 文本片段），与主流 AI SDK 的默认协议一致 |

### UIMessage

消息对象类型，来自 `ai` 包的标准消息格式。结构参考对应 SDK 文档。

### 事件与消息回调

- 关于 `onMessage`、`onDataMessage` 的使用、字段、解析与触发条件，请阅读「[流式传输](/zh/guide/streaming-usage)」。
- 在 React Hook 中，将它们通过 `options.onMessage / options.onDataMessage` 传入即可；解析逻辑遵循「流式传输」规范。

## 下一步

- 深入了解两种协议差异与事件回调行为，请阅读「[流式传输](/zh/guide/streaming-usage)」。
- 后端统一以 `responseType: 'stream'` 输出流响应；前端通过本页的发送函数映射与 Hook 完成交互。
