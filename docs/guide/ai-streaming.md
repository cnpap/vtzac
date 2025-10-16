# AI Agent: Streaming formats and unified usage

vtzac provides a unified front-end calling experience across three popular streaming formats in AI apps: SSE, Text, and Data. This avoids changing your business logic when switching protocols.

Highlights:

- Unified protocol abstraction via `protocol: 'sse' | 'text' | 'data'`
- Aligned with Vercel AI SDK server-side helpers: `pipeTextStreamToResponse` and `pipeUIMessageStreamToResponse`
- Works for both Completion (single run) and Chat (multi-turn) modes

Use cases:

- Your backend exposes multiple streaming interfaces (e.g., SSE and Text), and the frontend wants a single way to call them
- You use Vercel AI SDK but still need to support SSE (e.g., agent-style pipelines)

## Streaming formats and corresponding endpoints

The following endpoints come from the sample backend `AiSdkController`:

- SSE (Server-Sent Events): `text/event-stream` based event push
- Text: raw text chunks (`text/plain` + `transfer-encoding: chunked`)
- Data: NDJSON-based UI Message data stream (default for `@ai-sdk/react` `streamProtocol: 'data'`)

### Completion mode: single response generation

**SSE:**

```ts
import { _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// Create controller instance (backend URL + streaming response)
const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
});
const api = controller(AiSdkController);

// SSE completion (GET, via message query)
await api.chatStream('Tell me about Chengdu');
```

```
// Actual request:
// GET /api/ai-sdk/chat/stream?message=Tell%20me%20about%20Chengdu
// Response:
// text/event-stream (SSE event stream, chunked updates)
```

**Text:**

```ts
// Raw text chunk stream (POST)
await api.aiSdkCompletion({ prompt: 'Tell me about Chengdu' });
```

```
// Actual request:
// POST /api/ai-sdk/completion
// Body: { "prompt": "Tell me about Chengdu" }
// Response:
// text/plain (chunked text stream)
```

**Data:**

```ts
// NDJSON data protocol stream (POST)
await api.aiSdkCompletionData({ prompt: 'Tell me about Chengdu' });
```

```
// Actual request:
// POST /api/ai-sdk/completion-data
// Body: { "prompt": "Tell me about Chengdu" }
// Response:
// text/event-stream (NDJSON event stream, compatible with @ai-sdk/react data protocol)
```

### Chat mode: multi-turn with context/history

**SSE:**

```ts
import type { UIMessage } from 'ai';

const messages: UIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hello! I am your AI assistant.' }],
  },
];

// Pass full messages via query (GET)
await api.chatSSE(JSON.stringify(messages));
```

```
// Actual request:
// GET /api/ai-sdk/chat/sse?messages=[...]
// Response:
// text/event-stream (SSE text chunks or event data)
```

**Text:**

```ts
// Returns raw text chunks (POST)
await api.multiChat({ messages });
```

```
// Actual request:
// POST /api/ai-sdk/chat/multi
// Body: { "messages": [ ... ] }
// Response:
// text/plain (chunked text stream)
```

**Data:**

```ts
// Returns UI Message data protocol (POST)
await api.aiSdkCompletionDataMessages({ messages });
```

```
// Actual request:
// POST /api/ai-sdk/completion-data/messages
// Body: { "messages": [ ... ] }
// Response:
// text/event-stream (NDJSON event stream)
```

## Unified frontend calling: why three formats?

Reasons and scenarios:

- Vercel AI SDK defaults to the Data protocol (NDJSON) for React, which is ideal for UI Message driven rendering
- Raw Text streams are lightweight and suitable for plain text generation or simple backends
- SSE is widely used in event-push scenarios; many agent toolchains prefer SSE output

Therefore, vtzac adapts all three and provides unified front-end abstractions:

- The same business code can switch `protocol` to match different server implementations
- In React, you continue to follow `@ai-sdk/react` best practices (see "React helper hooks")

## Configuration example: pick endpoints by protocol

The example below shows how to select backend methods by protocol. For a full UI demo, see the Playground `StreamTest`.

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

// Completion
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

// Chat
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

## Next steps

- For React usage, read "React: AI streaming helper hooks" to learn how to drive all three protocols in components
- See "Getting Started" to run locally and integrate
