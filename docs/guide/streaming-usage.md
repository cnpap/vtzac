# Streaming Response

This guide explains how to consume generic streaming responses in vtzac (including SSE) and clarifies callback signatures and usage patterns. vtzac is not SSE-specific — SSE is one streaming protocol. We provide two consumers: `consumeEventStream` for SSE (`text/event-stream`), and `consumeTextStream` for raw text byte streams (non-SSE). In AI scenarios, each chunk can be JSON; `consumeEventStream` exposes `onDataMessage` to parse each JSON chunk, while `consumeTextStream` does not include `onDataMessage`.

> Important notes:
>
> - Choose one callback based on your stream format:
>   - Plain text streams: use `onMessage(data: string)`.
>   - JSON text streams: use `onDataMessage(parsed: Record<string, string>)`.
> - In AI integrations, providers often stream JSON deltas (progress/events) per chunk; prefer `onDataMessage` so you can read fields like `delta`/`text`/`content` and reflect state changes.
> - Supplying both is optional: when `onDataMessage` exists and the data is valid JSON, both will be called — `onMessage` receives the raw string, `onDataMessage` receives the parsed object.
> - `onDataMessage` only fires when provided and JSON parsing succeeds; otherwise it is ignored.
> - With `consumeTextStream`, `onDataMessage` is not available; only `onMessage` is supported.

## Configuration Example

Connect to your backend via controller methods to achieve type-safe SSE streaming:

```ts
import { consumeEventStream, consumeTextStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// Initialize HTTP client
const api = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
}).controller(AiSdkController);
```

## Backend SSE Interface

```ts
import { Controller, Sse, Query } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  // SSE streaming endpoint
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
// Actual SSE endpoint created:
// GET /api/ai-sdk/chat/stream?message=hello
// Response headers: content-type: text/event-stream
// Response body: streaming SSE event data
```

## Basic Usage

### Text stream (data is plain text)

````ts
const startStream = async () => {
  const message = 'Tell me about Chengdu';
  const abortController = new AbortController();

  try {
    const response = await api.chatStream(message);
    await consumeEventStream(response, {
      signal: abortController.signal,
      onMessage(data) {
        // Handle each text chunk
        console.log('Received text:', data);
        setOutput(prev => prev + data);
      },
      onError(err) {
        console.error('Streaming error:', err.message);
        setError(err.message);
      },
      onClose() {
        console.log('Streaming connection closed');
      },
    });
  } catch (err) {
    console.error('Request failed:', (err as Error).message);
  }
};

const stopStream = () => {
  abortController.abort();
};

### Text stream (plain text)

```ts
const startTextStream = async () => {
  const message = 'Tell me about Chengdu';
  const ac = new AbortController();

  try {
    const response = await api.completion(message); // assumes plain text streaming endpoint
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
    console.error('Request failed:', (err as Error).message);
  }
};
````

### JSON data stream (data is JSON text)

When the server returns a JSON string in the SSE `data:` field:

```ts
const response = await api.chatStream('Who are you');
await consumeEventStream(response, {
  onDataMessage(parsed) {
    const delta = parsed.delta || parsed.text || parsed.content;
    if (delta) setOutput(prev => prev + delta);
  },
  onMessage(data) {
    console.debug('raw:', data);
  },
});
```

> Only when `onDataMessage` is provided and the `data` is valid JSON will that callback fire. For plain text streams or failed JSON parsing, `onDataMessage` is not called.

## Comparison

```ts
// Traditional: manual SSE protocol handling
const es = new EventSource('/api/stream');
es.onmessage = ev => {
  const data = ev.data; // you must parse JSON or text yourself
};
```

```ts
// vtzac: unified consumers and type-safe controller calls
const response = await controller.streamMethod(params);
await consumeEventStream(response, {
  onMessage: data => {
    console.log(data); // raw text
  },
  onDataMessage: parsed => {
    console.log(parsed); // parsed JSON (Record<string, string>)
  },
});
```

## Real-World Use Cases

- AI conversation: character-by-character or chunked replies (text or JSON delta).
- Real-time logs: push server logs to the frontend.
- Progress updates: long-running task updates.
- Data monitoring: push real-time metrics for visualization.

## Next Steps

- To learn other streaming formats and unified calling, read `AI Agent: Streaming Support`.
- See `React: AI Streaming Helpers` for more advanced interactions.

## API

### consumeEventStream

- Signature: `consumeEventStream(response: Response, options: ConsumeEventStreamOptions): Promise<void>`

### consumeTextStream

- Signature: `consumeTextStream(response: Response, options: Omit<ConsumeEventStreamOptions, 'onDataMessage'>): Promise<void>`

### ConsumeEventStreamOptions

| Property        | Type                                     | Required | Description                                      |
| --------------- | ---------------------------------------- | -------- | ------------------------------------------------ |
| `signal`        | `AbortSignal`                            | N        | Signal for cancelling streaming                  |
| `onOpen`        | `(response: Response) => void`           | N        | Fired when the response is received              |
| `onMessage`     | `(data: string) => void`                 | N        | Raw text callback (no JSON parsing)              |
| `onDataMessage` | `(data: Record<string, string>) => void` | N        | Tries to parse JSON and passes the parsed object |
| `onClose`       | `() => void`                             | N        | Fired when the connection is closed              |
| `onFinish`      | `() => void`                             | N        | Fired after `onClose` on successful completion   |
| `onError`       | `(err: Error) => void`                   | N        | Fired on errors                                  |

## Types

- `ParsedMessageData`: `Record<string, string>`, used to carry JSON-parsed data.

## Event Stream Processing Flow

1. Server sends, e.g. `id: 1\ndata: {"delta":"C"}\n\n` or `id: 1\ndata: C\n\n`.
2. vtzac parses SSE lines and extracts the `data` text.
3. Callbacks receive:
   - `onMessage(data)`: raw text (e.g., `"C"`).
   - `onDataMessage(parsed)`: parsed JSON (e.g., `{ delta: "C" }`) if you provided the callback and the data is valid JSON.
