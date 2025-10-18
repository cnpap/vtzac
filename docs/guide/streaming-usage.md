# Streaming

This guide shows how to consume generic streaming in vtzac (including SSE) and explains the callback signatures and usage. vtzac does not limit you to SSE; SSE is just one protocol/format for streaming. We provide two consumer functions: `consumeEventStream` for SSE (`text/event-stream`), and `consumeTextStream` for raw text byte streams (non‑SSE). In AI scenarios, each chunk can be JSON text; `consumeEventStream` offers `onDataMessage` to parse each JSON chunk, while `consumeTextStream` does not include that option.

> Recommendations:
>
> - Choose a callback based on the stream format:
>   - Plain text stream: use `onMessage(data: string)`.
>   - JSON text stream: use `onDataMessage(parsed: Record<string,string>)`.
> - For AI integrations, many providers stream JSON fragments (progress/events). Prefer `onDataMessage` and read deltas from fields like `delta`/`text`/`content` to reflect state changes.
> - Providing both callbacks is optional: when `onDataMessage` exists and the data can be parsed as JSON, both callbacks fire — `onMessage` receives the raw string and `onDataMessage` receives the parsed object.
> - `onDataMessage` is only invoked when you provide the callback and JSON parsing succeeds; otherwise it is ignored.
> - When using `consumeTextStream`, `onDataMessage` is not supported; only `onMessage` handles raw text.

## Configuration Example

Connect to your backend through “controller methods” to enable type‑safe SSE streaming:

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

## Backend SSE Endpoint Implementation

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
// Response header: content-type: text/event-stream
// Response body: streaming SSE event data
```

## Basic Usage Examples

### Text stream (data is plain text)

```ts
const startStream = async () => {
  const message = 'Tell me about Chengdu';
  const abortController = new AbortController();

  try {
    const response = await api.chatStream(message);
    await consumeEventStream(response, {
      signal: abortController.signal,
      onMessage(data) {
        console.log('received text:', data);
        setOutput(prev => prev + data);
      },
      onError(err) {
        console.error('streaming error:', err.message);
        setError(err.message);
      },
      onClose() {
        console.log('stream closed');
      },
    });
  } catch (err) {
    console.error('request failed:', (err as Error).message);
  }
};

const stopStream = () => {
  abortController.abort();
};
```

### Raw text stream (Text)

```ts
const startTextStream = async () => {
  const message = 'Tell me about Chengdu';
  const ac = new AbortController();

  try {
    const response = await api.completion(message); // assume a raw text stream endpoint
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
    console.error('request failed:', (err as Error).message);
  }
};
```

```
// Server SSE example:
// id: 1
// data: Chengdu
//
// id: 2
// data: ,
// ...

// onMessage receives:
// data = "Chengdu"
// data = ","
// ...
```

### JSON data stream (data is JSON text)

When the server returns a JSON string in `data`:

```ts
await consumeEventStream(await api.chatStream('Who are you'), {
  onDataMessage(parsed) {
    // pick the delta text based on actual fields (e.g. delta/text/content)
    const delta = parsed.delta || parsed.text || parsed.content;
    if (delta) {
      setOutput(prev => prev + delta);
    }
  },
  onMessage(data) {
    // if you want to keep the raw text (e.g. for logging or fallback), you can receive it too
    console.debug('raw:', data);
  },
});
```

> Note: `onDataMessage` fires only when you provided the callback and `data` is valid JSON. For normal plain text streams, or when JSON parsing fails, `onDataMessage` is not called.

## Comparison with traditional SSE

```ts
// Traditional: manually unpack the SSE protocol
const es = new EventSource('/api/stream');
es.onmessage = ev => {
  // you need to parse JSON or text from ev.data yourself
  const data = ev.data;
};
```

```ts
// vtzac: unified consumer functions and type-safe invocation
const response = await controller.streamMethod(params);
await consumeEventStream(response, {
  onMessage: data => {
    console.log(data); // raw text
  },
  onDataMessage: parsed => {
    // parsed JSON (Record<string,string>)
    console.log(parsed);
  },
});
```

## Real‑world Use Cases

- AI chat: display replies progressively (text or JSON deltas).
- Real‑time logs: push server logs to the frontend for live display.
- Progress updates: stream progress for long‑running tasks.
- Data monitoring: push metrics in real time and visualize them.

## Next Steps

- See “[React Helpers](/guide/ai-react-helpers)” to build richer interactions.

## API Reference

### consumeEventStream

Signature: `consumeEventStream(response: Response, options: ConsumeEventStreamOptions): Promise<void>`

### consumeTextStream

Signature: `consumeTextStream(response: Response, options: Omit<ConsumeEventStreamOptions, 'onDataMessage'>): Promise<void>`

Parameters:

| Param      | Type                                               | Required | Description                                          |
| ---------- | -------------------------------------------------- | -------- | ---------------------------------------------------- |
| `response` | `Response`                                         | Y        | HTTP response object (must provide a streaming body) |
| `options`  | `Omit<ConsumeEventStreamOptions, 'onDataMessage'>` | N        | Consumer options for raw text streams                |

### ConsumeEventStreamOptions

| Property        | Type                                    | Required | Description                                                     |
| --------------- | --------------------------------------- | -------- | --------------------------------------------------------------- |
| `signal`        | `AbortSignal`                           | N        | Used to cancel streaming                                        |
| `onOpen`        | `(response: Response) => void`          | N        | Fired when the response is received; can be used for validation |
| `onMessage`     | `(data: string) => void`                | N        | Raw text message callback (no JSON parsing)                     |
| `onDataMessage` | `(data: Record<string,string>) => void` | N        | If provided, tries to parse JSON and passes the parsed object   |
| `onClose`       | `() => void`                            | N        | Fired when the connection closes                                |
| `onFinish`      | `() => void`                            | N        | Fired after a successful completion (after `onClose`)           |
| `onError`       | `(err: Error) => void`                  | N        | Fired when an error occurs                                      |

## Type Definitions

- `ParsedMessageData`: `Record<string, string>`, used to carry parsed JSON data.

## SSE Data Processing Flow

1. Server sends: e.g. `id: 1\ndata: {"delta":"C"}\n\n` or `id: 1\ndata: C\n\n`
2. Protocol parsing: vtzac parses SSE lines and extracts the `data` text.
3. Callbacks:
   - `onMessage(data)`: receives the raw text (e.g. `"C"`).
   - `onDataMessage(parsed)`: when you provided the callback and `data` is valid JSON, receives the parsed object (e.g. `{ delta: "C" }`).
