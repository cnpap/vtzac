# React: AI streaming helper hooks

This chapter introduces two React helper hooks provided by vtzac: `useAIChat` and `useAICompletion`. Both support the three streaming protocols (SSE / Text / Data) through a unified `protocol` option, so you don’t need to change business logic.

Highlights:

- Protocol unified: `protocol: 'sse' | 'text' | 'data'`
- Chat mode: multi-turn conversation with context/history
- Completion mode: single-shot text generation
- Handy controls: `append / complete / reload / stop / reset`
- Full states and errors: `isLoading / error / messages / completion`

## API overview

- `useAIChat(send: (messages) => PromiseLike<any>, options)` for multi-turn chat
  - `options.protocol`: 'sse' | 'text' | 'data'
  - `options.initialMessages`: initial `UIMessage[]`
  - Returns: `{ messages, append, reload, stop, reset, isLoading, error }`

- `useAICompletion(send: (prompt) => PromiseLike<any>, options)` for text completion
  - `options.protocol`: 'sse' | 'text' | 'data'
  - Returns: `{ completion, complete, stop, reset, isLoading, error }`

## Mapping by protocol

Both hooks connect to the backend using a "send function". You can map different controller methods depending on the chosen protocol (from `AiSdkController`).

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

// Chat hook
const chat = useAIChat(getChat('data'), {
  protocol: 'data',
  initialMessages: [
    {
      id: '1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello! I am your AI assistant.' }],
    },
  ],
});

// Completion hook
const completion = useAICompletion(getCompletion('text'), {
  protocol: 'text',
});
```

## Minimal component example

The snippet below demonstrates two common interactions:

```tsx
import React, { useState } from 'react';
import type { UIMessage } from 'ai';

function Demo() {
  const [msg, setMsg] = useState('Hello, tell me about Chengdu');

  // Chat: Data protocol (matches @ai-sdk/react default)
  const chat = useAIChat(getChat('data'), {
    protocol: 'data',
    initialMessages: [
      { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hi!' }] },
    ],
  });

  // Completion: Text protocol (raw text chunks)
  const completion = useAICompletion(getCompletion('text'), {
    protocol: 'text',
  });

  return (
    <div>
      {/* Chat input */}
      <input
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={() => chat.append(msg)} disabled={chat.isLoading}>
        Send
      </button>
      <button onClick={chat.stop} disabled={!chat.isLoading}>
        Stop
      </button>
      <button onClick={chat.reset}>Reset</button>

      {/* Messages */}
      <ul>
        {chat.messages.map(m => (
          <li key={m.id}>
            {m.role === 'user' ? 'You' : 'AI'}:{' '}
            {m.parts?.map(p => (p.type === 'text' ? p.text : '')).join('')}
          </li>
        ))}
      </ul>

      {/* Completion */}
      <button
        onClick={() => completion.complete('Tell me about Chengdu')}
        disabled={completion.isLoading}
      >
        Generate
      </button>
      <button onClick={completion.stop} disabled={!completion.isLoading}>
        Stop
      </button>
      <button onClick={completion.reset}>Reset</button>

      {/* Result */}
      <pre>{completion.completion}</pre>

      {/* Status & errors */}
      <small>
        chat: {chat.isLoading ? 'generating...' : 'ready'} | completion:{' '}
        {completion.isLoading ? 'generating...' : 'ready'}
      </small>
      {chat.error && <div>Chat error: {chat.error.message}</div>}
      {completion.error && (
        <div>Completion error: {completion.error.message}</div>
      )}
    </div>
  );
}
```

```
// Actual requests (depending on protocol):
// - Data (chat): POST /api/ai-sdk/completion-data/messages
// - Text (chat): POST /api/ai-sdk/chat/multi
// - SSE  (chat): GET  /api/ai-sdk/chat/sse?messages=[...]
// - Data (completion): POST /api/ai-sdk/completion-data
// - Text (completion): POST /api/ai-sdk/completion
// - SSE  (completion): GET  /api/ai-sdk/chat/stream?message=...
```

## Best practices

- Protocol selection:
  - Data: matches `@ai-sdk/react` default, ideal for UI Message-driven chat
  - Text: lightweight plain text generation
  - SSE: agent-oriented or general event streams
- When switching protocols, reuse the same hook and change only `protocol` and the send-function mapping
- Configure `responseType: 'stream'` upfront so the frontend consumes responses as streams

## Next steps

- If you need background and differences between the three protocols, read "AI Agent: Streaming formats and unified usage"
- See the SSE section in Use Cases for more streaming options
