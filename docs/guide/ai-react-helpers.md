# React: AI streaming helper hooks

This chapter introduces two React helper hooks provided by vtzac: `useAIChat` and `useAICompletion`. Both support three streaming protocols (SSE / Text / Data) through a unified `protocol` option, allowing you to switch protocols without changing business logic.

Core features:

- Protocol unified: `protocol: 'sse' | 'text' | 'data'`
- Chat mode: supports context memory and message history
- Completion mode: single-shot text generation
- Convenient control methods: `append / complete / reload / stop / reset`
- Complete state and error handling: `isLoading / error / messages / completion`

## Configuration Examples

Connect to the backend through "send functions", selecting corresponding controller methods based on protocol:

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// Initialize HTTP client
const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
}).controller(AiSdkController);

// Select chat method by protocol
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

// Select completion method by protocol
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

## Basic Usage Examples

**Chat mode (useAIChat):**

```ts
// Initialize chat hook
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  initialMessages: [
    { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello!' }] },
  ],
});

// Send message
chat.append('Hello, tell me about Chengdu');

// Control operations
chat.stop(); // Stop generation
chat.reset(); // Reset conversation
chat.reload(); // Regenerate last message

// State access
console.log(chat.messages); // Message list
console.log(chat.isLoading); // Whether generating
console.log(chat.error); // Error information
```

**Completion mode (useAICompletion):**

```ts
// Initialize completion hook
const completion = useAICompletion(getCompletionSender('text'), {
  protocol: 'text',
});

// Generate text
completion.complete('Tell me about Chengdu');

// Control operations
completion.stop(); // Stop generation
completion.reset(); // Reset content

// State access
console.log(completion.completion); // Generated text
console.log(completion.isLoading); // Whether generating
console.log(completion.error); // Error information
```

```
// Actual requests made (may vary by protocol):
// - Data (chat): POST /api/ai-sdk/completion-data/messages
// - Text (chat): POST /api/ai-sdk/chat/multi
// - SSE (chat): GET /api/ai-sdk/chat/sse?messages=[...]
// - Data (completion): POST /api/ai-sdk/completion-data
// - Text (completion): POST /api/ai-sdk/completion
// - SSE (completion): GET /api/ai-sdk/chat/stream?message=...
```

## Best Practices

- Protocol selection recommendations:
  - Data: Consistent with `@ai-sdk/react` default protocol, suitable for UI Message-driven chat experiences
  - Text: Plain text generation or simplified transmission scenarios
  - SSE: Agent scenarios or general event streams
- When switching protocols, prioritize reusing the same hook, only change `protocol` and send function mapping
- Set `responseType: 'stream'` in advance to ensure frontend can consume responses as streams

## Next Steps

- To understand the origins and differences of the three protocols, read "AI Agent: Three streaming format support and unified usage"
- Refer to the SSE section in "Use Cases" to master more streaming interaction methods

## API Reference

### useAIChat

**Function signature:** `useAIChat(send: (messages: UIMessage[]) => PromiseLike<any>, options?: UseAIChatOptions): UseAIChatReturn`

**Parameters:**

| Parameter | Type                                          | Required | Description                                                  |
| --------- | --------------------------------------------- | -------- | ------------------------------------------------------------ |
| `send`    | `(messages: UIMessage[]) => PromiseLike<any>` | ✅       | Send function that receives message list and returns Promise |
| `options` | `UseAIChatOptions`                            | ❌       | Configuration options                                        |

**UseAIChatOptions configuration:**

| Property          | Type                               | Required | Default | Description                                               |
| ----------------- | ---------------------------------- | -------- | ------- | --------------------------------------------------------- |
| `protocol`        | `StreamProtocol`                   | ❌       | `'sse'` | Streaming protocol type: 'sse' \| 'text' \| 'data'        |
| `initialMessages` | `UIMessage[]`                      | ❌       | `[]`    | Initial message list                                      |
| `onMessage`       | `(ev: EventSourceMessage) => void` | ❌       | -       | Streaming message callback                                |
| `onFinish`        | `(message: UIMessage) => void`     | ❌       | -       | Completion callback, receives the final generated message |
| `onError`         | `(err: Error) => void`             | ❌       | -       | Error callback                                            |

**UseAIChatReturn return value:**

| Property    | Type                                 | Description                           |
| ----------- | ------------------------------------ | ------------------------------------- |
| `messages`  | `UIMessage[]`                        | Current message list                  |
| `isLoading` | `boolean`                            | Whether currently loading/generating  |
| `error`     | `Error \| null`                      | Error information, null when no error |
| `append`    | `(content: string) => Promise<void>` | Send new message                      |
| `reload`    | `() => Promise<void>`                | Regenerate the last message           |
| `stop`      | `() => void`                         | Stop current generation               |
| `reset`     | `() => void`                         | Reset chat state, clear message list  |

### useAICompletion

**Function signature:** `useAICompletion(send: (prompt: string) => PromiseLike<any>, options?: UseAICompletionOptions): UseAICompletionReturn`

**Parameters:**

| Parameter | Type                                   | Required | Description                                            |
| --------- | -------------------------------------- | -------- | ------------------------------------------------------ |
| `send`    | `(prompt: string) => PromiseLike<any>` | ✅       | Send function that receives prompt and returns Promise |
| `options` | `UseAICompletionOptions`               | ❌       | Configuration options                                  |

**UseAICompletionOptions configuration:**

| Property    | Type                               | Required | Default | Description                                            |
| ----------- | ---------------------------------- | -------- | ------- | ------------------------------------------------------ |
| `protocol`  | `StreamProtocol`                   | ❌       | `'sse'` | Streaming protocol type: 'sse' \| 'text' \| 'data'     |
| `onMessage` | `(ev: EventSourceMessage) => void` | ❌       | -       | Streaming message callback                             |
| `onFinish`  | `(completion: string) => void`     | ❌       | -       | Completion callback, receives the final generated text |
| `onError`   | `(err: Error) => void`             | ❌       | -       | Error callback                                         |

**UseAICompletionReturn return value:**

| Property     | Type                                | Description                           |
| ------------ | ----------------------------------- | ------------------------------------- |
| `completion` | `string`                            | Current generated text content        |
| `isLoading`  | `boolean`                           | Whether currently loading/generating  |
| `error`      | `Error \| null`                     | Error information, null when no error |
| `complete`   | `(prompt: string) => Promise<void>` | Initiate text generation              |
| `stop`       | `() => void`                        | Stop current generation               |
| `reset`      | `() => void`                        | Reset state, clear generated content  |

## Type Definitions

### StreamProtocol

Streaming protocol type, supports three different streaming protocols:

| Value    | Description                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| `'sse'`  | Server-Sent Events, suitable for Agent scenarios or general event streams, supports custom event types         |
| `'text'` | Plain text stream, suitable for simplified transmission scenarios                                              |
| `'data'` | Data stream, consistent with `@ai-sdk/react` default protocol, suitable for UI Message-driven chat experiences |

### UIMessage

Message object type from the `ai` package's standard message format. For detailed structure, refer to the [ai package documentation](https://sdk.vercel.ai/docs).

### EventSourceMessage

Event source message object for streaming:

| Property | Type     | Required | Description                                                                |
| -------- | -------- | -------- | -------------------------------------------------------------------------- |
| `id`     | `string` | ✅       | Event ID, used to set EventSource object's last event ID                   |
| `event`  | `string` | ✅       | Event type identifier                                                      |
| `data`   | `string` | ✅       | Event data                                                                 |
| `retry`  | `number` | ❌       | Reconnection interval (milliseconds), retry interval when connection fails |

### Data Protocol Message Format

When using `protocol: 'data'`, the `onMessage` callback will receive messages in the following format. Each message contains a `type` field, accessible via `e.type`:

**Basic message type examples:**

| type            | Description             | Example data                                     |
| --------------- | ----------------------- | ------------------------------------------------ |
| `'start'`       | Start generation        | `{"type":"start"}`                               |
| `'start-step'`  | Start step              | `{"type":"start-step"}`                          |
| `'text-start'`  | Start text generation   | `{"type":"text-start","id":"0"}`                 |
| `'text-delta'`  | Text incremental update | `{"type":"text-delta","id":"0","delta":"Hello"}` |
| `'text-end'`    | Text generation end     | `{"type":"text-end","id":"0"}`                   |
| `'finish-step'` | Step completion         | `{"type":"finish-step"}`                         |
| `'finish'`      | Generation complete     | `{"type":"finish"}`                              |

**End marker:**

- The last message of the stream is fixed as `data: [DONE]`

**onMessage usage example:**

```ts
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  onMessage: e => {
    // Parse JSON data
    const message = JSON.parse(e.data);

    // Handle based on message type
    switch (message.type) {
      case 'start':
        console.log('Generation started');
        break;
      case 'text-delta':
        console.log(`Text delta: ${message.delta}, ID: ${message.id}`);
        break;
      case 'text-end':
        console.log(`Text generation completed, ID: ${message.id}`);
        break;
      case 'finish':
        console.log('All completed');
        break;
    }
  },
});
```

**Tool calling scenarios:**
In AI Agent scenarios, there may be tool calls and other complex interactions, with additional `type` values like `'tool-call'`, `'tool-result'`, etc. By listening to `onMessage`, you can get complete execution process information.
