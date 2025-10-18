# React: AI streaming helper functions

This page introduces two React helper functions: `useAIChat` and `useAICompletion`. Both support two streaming protocols — Text and Data — through a unified `protocol` option, so you can switch protocols without changing business logic. Control methods and state are consistent across chat and completion, making reuse easy.

Core features:

- Protocol selection: `protocol: 'text' | 'data'`
- Chat mode: supports context memory and message history
- Completion mode: single-shot text generation
- Control methods: `append / complete / reload / stop / reset`
- State and error handling: `isLoading / error / messages / completion`

For message callback details — the full signatures, parsing, and trigger conditions of `onMessage` and `onDataMessage` — please read “Streaming” in the guide. This page focuses on their relationship to the React hooks and where to use them.

## Configuration Example

Connect the backend through “send functions”, then select controller methods based on the chosen protocol. In your HTTP client, set `responseType: 'stream'` so the frontend can consume responses as streams.

```ts
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';
import { MastraController } from 'nestjs-example/src/mastra.controller';

// Initialize HTTP client (make sure to set responseType: 'stream')
const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', responseType: 'stream' },
});
const aiSdk = controller(AiSdkController);
const mastra = controller(MastraController);

// Select chat send function by protocol
const getChatSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'text':
      return messages => aiSdk.chat({ messages });
    case 'data':
      return messages => aiSdk.chatUI({ messages });
  }
};

// Select completion send function by protocol
const getCompletionSender = (protocol: StreamProtocol) => {
  switch (protocol) {
    case 'text':
      return prompt => aiSdk.completion({ prompt });
    case 'data':
      return prompt => aiSdk.completionUI({ prompt });
  }
};

// When using the Mastra controller, map as:
// - text -> mastra.chatText / mastra.completion
// - data -> mastra.chatUI / mastra.completionUI
```

## Basic Usage

**Chat mode (useAIChat):**

```ts
// Initialize chat hook with the data protocol
const chat = useAIChat(getChatSender('data'), {
  protocol: 'data',
  initialMessages: [
    { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello!' }] },
  ],
});

// Send a message
await chat.append('Hello, tell me about Chengdu');

// Control operations
chat.stop(); // Stop current generation
chat.reset(); // Reset conversation
chat.reload(); // Regenerate the last message

// State access
console.log(chat.messages);
console.log(chat.isLoading);
console.log(chat.error);
```

**Completion mode (useAICompletion):**

```ts
// Initialize completion hook with the text protocol
const completion = useAICompletion(getCompletionSender('text'), {
  protocol: 'text',
});

// Start a text generation
await completion.complete('Tell me about Chengdu');

// Control operations
completion.stop(); // Stop generation
completion.reset(); // Clear generated content

// State access
console.log(completion.completion);
console.log(completion.isLoading);
console.log(completion.error);
```

> For the fields and parsing of callbacks (such as `onMessage`), please read “Streaming” in the guide.

## Best Practices

- Protocol selection:
  - `data`: Matches mainstream AI SDK default data streams; ideal for UI Message-driven chat. Messages are JSON text (parsed objects).
  - `text`: Plain text incremental transmission, suitable for lightweight or fallback scenarios.
- Reuse the same hook when switching protocols; only adjust `protocol` and the send function mapping.
- On the frontend, set `responseType: 'stream'` to enable streaming consumption.
- Centralize parsing logic (especially JSON parsing) inside event handlers to avoid redundant parsing in business code.

## API Reference

### useAIChat

Function signature: `useAIChat(send: (messages: UIMessage[]) => PromiseLike<any>, options?: UseAIChatOptions): UseAIChatReturn`

**Parameters:**

| Parameter | Type                                          | Required | Description                                                        |
| --------- | --------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `send`    | `(messages: UIMessage[]) => PromiseLike<any>` | Yes      | Send function that receives the message list and returns a Promise |
| `options` | `UseAIChatOptions`                            | No       | Configuration options (protocol, initial messages, callbacks)      |

**UseAIChatOptions:**

| Property          | Type                                    | Required | Default  | Description                                             |
| ----------------- | --------------------------------------- | -------- | -------- | ------------------------------------------------------- |
| `protocol`        | `StreamProtocol`                        | No       | `'data'` | Streaming protocol: `'text'` \| `'data'`                |
| `initialMessages` | `UIMessage[]`                           | No       | `[]`     | Initial message list                                    |
| `onMessage`       | `(ev: any) => void`                     | No       | -        | Streaming message callback; see “Streaming” for details |
| `onDataMessage`   | `(data: Record<string,string>) => void` | No       | -        | Data message callback; see “Streaming” for details      |
| `onFinish`        | `(message: UIMessage) => void`          | No       | -        | Completion callback, receives the final message         |
| `onError`         | `(err: Error) => void`                  | No       | -        | Error callback                                          |

**UseAIChatReturn:**

| Property    | Type                                 | Description                         |
| ----------- | ------------------------------------ | ----------------------------------- |
| `messages`  | `UIMessage[]`                        | Current message list                |
| `isLoading` | `boolean`                            | Whether currently generating        |
| `error`     | `Error \| null`                      | Error information, `null` when none |
| `append`    | `(content: string) => Promise<void>` | Send a new message                  |
| `reload`    | `() => Promise<void>`                | Regenerate the last message         |
| `stop`      | `() => void`                         | Stop current generation             |
| `reset`     | `() => void`                         | Reset chat state, clear messages    |

### useAICompletion

Function signature: `useAICompletion(send: (prompt: string) => PromiseLike<any>, options?: UseAICompletionOptions): UseAICompletionReturn`

**Parameters:**

| Parameter | Type                                   | Required | Description                                                  |
| --------- | -------------------------------------- | -------- | ------------------------------------------------------------ |
| `send`    | `(prompt: string) => PromiseLike<any>` | Yes      | Send function that receives the prompt and returns a Promise |
| `options` | `UseAICompletionOptions`               | No       | Configuration options (protocol, callbacks)                  |

**UseAICompletionOptions:**

| Property        | Type                                    | Required | Default  | Description                                             |
| --------------- | --------------------------------------- | -------- | -------- | ------------------------------------------------------- |
| `protocol`      | `StreamProtocol`                        | No       | `'data'` | Streaming protocol: `'text'` \| `'data'`                |
| `onMessage`     | `(ev: any) => void`                     | No       | -        | Streaming message callback; see “Streaming” for details |
| `onDataMessage` | `(data: Record<string,string>) => void` | No       | -        | Data message callback; see “Streaming” for details      |
| `onFinish`      | `(completion: string) => void`          | No       | -        | Completion callback, receives the final text            |
| `onError`       | `(err: Error) => void`                  | No       | -        | Error callback                                          |

**UseAICompletionReturn:**

| Property     | Type                                | Description                          |
| ------------ | ----------------------------------- | ------------------------------------ |
| `completion` | `string`                            | Current generated text content       |
| `isLoading`  | `boolean`                           | Whether currently generating         |
| `error`      | `Error \| null`                     | Error information, `null` when none  |
| `complete`   | `(prompt: string) => Promise<void>` | Initiate a text generation           |
| `stop`       | `() => void`                        | Stop current generation              |
| `reset`      | `() => void`                        | Reset state, clear generated content |

## Type Definitions

### StreamProtocol

Two supported streaming protocol types:

| Value    | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| `'text'` | Plain text byte stream, suitable for simplified transmission          |
| `'data'` | Data stream (JSON text fragments), consistent with mainstream AI SDKs |

### UIMessage

Message object type from the `ai` package’s standard message format. Refer to the corresponding SDK documentation for structure details.

### Events & Message Callbacks

- For the usage, fields, parsing, and trigger conditions of `onMessage` and `onDataMessage`, read “Streaming”.
- In the React hooks, pass them via `options.onMessage / options.onDataMessage`; parsing logic follows the “Streaming” rules.
- End marker: the last message of the stream is fixed as `data: [DONE]`.

## Next Steps

- To dive deeper into protocol differences and callback behavior, read “Streaming”.
- Ensure the backend returns responses with `responseType: 'stream'`; the frontend completes interactions via the send-function mapping and hooks described on this page.
