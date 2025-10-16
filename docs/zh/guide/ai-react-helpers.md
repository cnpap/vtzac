# React：AI 流式助手函数

本章节介绍 vtzac 提供的两个 React 助手函数：`useAIChat` 与 `useAICompletion`。两者都支持三种流式协议（SSE / Text / Data），通过统一的 `protocol` 选项切换，无需更改业务逻辑。

核心功能：

- 协议统一：`protocol: 'sse' | 'text' | 'data'`
- Chat 模式：支持上下文记忆与历史消息
- Completion 模式：单次文本生成
- 便捷的控制方法：`append / complete / reload / stop / reset`
- 完整的状态与错误：`isLoading / error / messages / completion`

## API 说明

- `useAIChat(send: (messages) => PromiseLike<any>, options)`：多轮对话
  - `options.protocol`：'sse' | 'text' | 'data'
  - `options.initialMessages`：初始消息列表（`UIMessage[]`）
  - 返回：`{ messages, append, reload, stop, reset, isLoading, error }`

- `useAICompletion(send: (prompt) => PromiseLike<any>, options)`：文本完成
  - `options.protocol`：'sse' | 'text' | 'data'
  - 返回：`{ completion, complete, stop, reset, isLoading, error }`

## 配置示例：按协议选择后端方法

两类 Hook 都通过一个「发送函数」连接后端。发送函数可按协议选择不同的控制器方法（对应后端 `AiSdkController`）。

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
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

const getChat = (p: StreamProtocol) => {
  switch (p) {
    case 'sse':
      return (messages: UIMessage[]) => api.chatSSE(JSON.stringify(messages));
    case 'text':
      return (messages: UIMessage[]) => api.multiChat({ messages });
    case 'data':
      return (messages: UIMessage[]) =>
        api.aiSdkCompletionDataMessages({ messages });
  }
};

const getCompletion = (p: StreamProtocol) => {
  switch (p) {
    case 'sse':
      return (prompt: string) => api.chatStream(prompt);
    case 'text':
      return (prompt: string) => api.aiSdkCompletion({ prompt });
    case 'data':
      return (prompt: string) => api.aiSdkCompletionData({ prompt });
  }
};

// 对话模式 Hook
const chat = useAIChat(getChat('data'), {
  protocol: 'data',
  initialMessages: [
    {
      id: '1',
      role: 'assistant',
      parts: [{ type: 'text', text: '你好！我是 AI 助手。' }],
    },
  ],
});

// 完成模式 Hook
const completion = useAICompletion(getCompletion('text'), {
  protocol: 'text',
});
```

## 示例：最小可用组件

以下示例演示两个常见交互：

```tsx
import React, { useState } from 'react';
import type { UIMessage } from 'ai';

function Demo() {
  const [msg, setMsg] = useState('你好，介绍一下成都');

  // 聊天：Data 协议（适配 @ai-sdk/react 默认）
  const chat = useAIChat(getChat('data'), {
    protocol: 'data',
    initialMessages: [
      { id: '1', role: 'assistant', parts: [{ type: 'text', text: '你好！' }] },
    ],
  });

  // 完成：Text 协议（纯文本分片）
  const completion = useAICompletion(getCompletion('text'), {
    protocol: 'text',
  });

  return (
    <div>
      {/* 对话输入 */}
      <input
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="输入消息..."
      />
      <button onClick={() => chat.append(msg)} disabled={chat.isLoading}>
        发送
      </button>
      <button onClick={chat.stop} disabled={!chat.isLoading}>
        停止
      </button>
      <button onClick={chat.reset}>重置</button>

      {/* 消息列表 */}
      <ul>
        {chat.messages.map(m => (
          <li key={m.id}>
            {m.role === 'user' ? '你' : 'AI'}:{' '}
            {m.parts?.map(p => (p.type === 'text' ? p.text : '')).join('')}
          </li>
        ))}
      </ul>

      {/* 完成模式 */}
      <button
        onClick={() => completion.complete('介绍一下成都')}
        disabled={completion.isLoading}
      >
        生成文本
      </button>
      <button onClick={completion.stop} disabled={!completion.isLoading}>
        停止
      </button>
      <button onClick={completion.reset}>重置</button>

      {/* 生成结果 */}
      <pre>{completion.completion}</pre>

      {/* 状态与错误 */}
      <small>
        chat: {chat.isLoading ? '生成中...' : '就绪'} | completion:{' '}
        {completion.isLoading ? '生成中...' : '就绪'}
      </small>
      {chat.error && <div>聊天错误：{chat.error.message}</div>}
      {completion.error && <div>生成错误：{completion.error.message}</div>}
    </div>
  );
}
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
