# SSE Streaming Response

This guide introduces how to implement Server-Sent Events (SSE) streaming responses in vtzac for real-time data pushing and streaming content transmission.

vtzac provides complete SSE support, including the backend `@Sse` decorator and frontend `consumeStream` function, enabling type-safe streaming data transmission.

Core Features:

- **Type Safety**: Frontend calls to backend SSE interfaces enjoy complete type hints and checking
- **Automatic Handling**: `consumeStream` automatically handles SSE protocol details without manual parsing
- **Error Handling**: Provides complete error handling mechanisms, including network errors and business errors
- **Stream Control**: Supports interrupting streaming transmission at any time via `AbortController`
- **Zero Configuration**: No additional configuration needed, directly use controller methods

> **Important Note**: `consumeStream` automatically handles the SSE protocol format. The `onMessage` callback function receives `ev.data` as parsed clean data content, not raw SSE format data.

## Configuration Example

Connect to backend through "controller methods" to achieve type-safe SSE streaming transmission:

```ts
import { consumeStream, _http } from 'vtzac';
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

## Backend SSE Interface Implementation

**Backend Controller Example:**

```ts
import { Controller, Sse, Query } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  // SSE streaming interface
  @Sse('chat/stream')
  async chatStream(
    @Query('message') message: string
  ): Promise<Observable<MessageEvent>> {
    // Get streaming data source
    const stream = await this.aiSdkService.streamWeatherAgent(message);
    // Convert to SSE format
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

## Basic Usage Example

**Frontend SSE Consumption Implementation:**

```ts
// SSE streaming handler function
const startStream = async () => {
  const message = 'Tell me about Chengdu';
  const abortController = new AbortController();

  try {
    // Use consumeStream to consume SSE stream
    await consumeStream(api.chatStream(message), {
      signal: abortController.signal,
      onMessage(ev) {
        // Handle each streaming data chunk
        console.log('Received data:', ev.data); // Output: Received data: Chengdu
        setOutput(prev => prev + ev.data);
      },
      onError(err) {
        console.error('Streaming error:', err.message); // Output: Streaming error: Network error
        setError(err.message);
      },
      onClose() {
        console.log('Streaming connection closed'); // Output: Streaming connection closed
      },
    });
  } catch (err) {
    console.error('Request failed:', err.message); // Output: Request failed: Request timeout
  }
};

// Stop streaming
const stopStream = () => {
  abortController.abort();
};
```

```
// Actual request made:
// GET /api/ai-sdk/chat/stream?message=Tell me about Chengdu

// Server-side SSE format response:
// id: 1
// data: Chengdu
//
// id: 2
// data: ,
//
// id: 3
// data: also
// ...

// Data received by onMessage callback (parsed raw content):
// ev.data = "Chengdu"
// ev.data = ","
// ev.data = "also"
// ...
```

**React Integration Example:**

```ts
import React, { useRef, useState } from 'react';

export const SseStreamDemo: React.FC = () => {
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const startStream = async () => {
    if (!message.trim()) return;

    // Reset state
    setLoading(true);
    setError(null);
    setOutput('');

    // Create new controller
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      // Start streaming
      await consumeStream(api.chatStream(message), {
        signal: controllerRef.current.signal,
        onMessage(ev) {
          // Append output content character by character
          setOutput(prev => prev + ev.data);
        },
        onError(err) {
          setError(err.message);
        },
        onClose() {
          console.log('Streaming completed'); // Output: Streaming completed
        },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  // UI rendering logic...
};
```

## Best Practices

- **Response Type Setting**: Ensure `responseType: 'stream'` is set to allow frontend to consume responses in streaming mode
- **Error Handling**: Always provide `onError` callback to handle network errors and business errors
- **Stream Control**: Use `AbortController` to implement stream pause and cancel functionality
- **State Management**: Properly manage loading state, error state, and output content
- **Memory Management**: Pay attention to timely cleanup of unnecessary data during long-term streaming transmission

## Comparison with Traditional SSE Solutions

**Traditional Approach:**

```ts
// Manual SSE protocol handling required
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = event => {
  // Manual data parsing
  // Parse id, data and other fields
  const data = JSON.parse(event.data);
};
```

**vtzac Approach:**

```ts
// Type-safe method calls
await consumeStream(controller.streamMethod(params), {
  onMessage: ev => {
    // Automatically processed data
    console.log(ev.data);
  },
});
```

## Real-World Use Cases

- **AI Conversations**: Implement streaming AI conversations with character-by-character response display
- **Real-time Logs**: Push server logs to frontend for real-time display
- **Progress Updates**: Real-time progress pushing for long-running tasks
- **Data Monitoring**: Real-time data metrics pushing and display

## Next Steps

- To learn about other streaming protocols, read "AI Agent: Three Streaming Format Support and Unified Calling"
- Refer to "React: AI Streaming Helper Functions" chapter to learn about more advanced streaming interaction methods

## API Documentation

### consumeStream

**Function Signature:** `consumeStream(response: Promise<Response>, options: ConsumeStreamOptions): Promise<void>`

**Parameter Description:**

| Parameter  | Type                    | Required | Description                                        |
| ---------- | ----------------------- | -------- | -------------------------------------------------- |
| `response` | `Promise<Response>`     | ✅       | HTTP response Promise, usually from controller method call |
| `options`  | `ConsumeStreamOptions`  | ✅       | Stream consumption configuration options           |

**ConsumeStreamOptions Configuration:**

| Property    | Type                               | Required | Description                                      |
| ----------- | ---------------------------------- | -------- | ------------------------------------------------ |
| `signal`    | `AbortSignal`                      | ❌       | Signal for canceling streaming transmission      |
| `onMessage` | `(ev: EventSourceMessage) => void` | ✅       | Streaming message callback, receives each data chunk |
| `onError`   | `(err: Error) => void`             | ❌       | Error callback, handles network and business errors |
| `onClose`   | `() => void`                       | ❌       | Connection close callback, triggered when streaming completes |

## Type Definitions

### EventSourceMessage

Event source message object for streaming transmission:

| Property           | Type     | Required | Description                                           |
| ------------------ | -------- | -------- | ----------------------------------------------------- |
| `[key: string]`    | `string` | ❌       | Custom fields in the message                   |

### MessageEvent

Message event object type from the `@nestjs/common` package for backend SSE response. For detailed structure, refer to the [NestJS official documentation](https://docs.nestjs.com/techniques/server-sent-events).

### SSE Data Processing Flow

1. **Server Sends**: `id: 1\ndata: Chengdu\n\n`
2. **Protocol Parsing**: vtzac automatically parses SSE format
3. **Callback Receives**: `onMessage` receives `ev.data = "Chengdu"` (clean data)

Through vtzac's SSE support, you can easily implement high-performance real-time data transmission while maintaining code type safety and simplicity.
