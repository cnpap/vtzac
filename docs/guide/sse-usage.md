# SSE Streaming Response

This guide introduces how to implement Server-Sent Events (SSE) streaming responses in vtzac for real-time data pushing and streaming content transmission.

## SSE: Type-Safe Implementation of Server-Side Event Streams

vtzac provides complete SSE support, including the backend `@Sse` decorator and frontend `consumeStream` function, enabling type-safe streaming data transmission.

> **Important Note**: `consumeStream` automatically handles the SSE protocol format. The `onMessage` callback function receives `ev.data` as parsed clean data content, not raw SSE format data.

### Backend SSE Interface Implementation

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

### Frontend SSE Consumption Implementation

**Frontend Usage Example:**

```ts
import { consumeStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

// Create controller instance
const { controller } = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
});
const aiSdkController = controller(AiSdkController);

// SSE streaming handler function
const startStream = async () => {
  const message = 'Tell me about Chengdu';
  const abortController = new AbortController();

  try {
    // Use consumeStream to consume SSE stream
    await consumeStream(aiSdkController.chatStream(message), {
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

### Complete React Component Example

**React Component Example:**

```tsx
import React, { useRef, useState } from 'react';
import { consumeStream, _http } from 'vtzac';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';

const { controller } = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000', timeout: 30000 },
});
const aiSdkController = controller(AiSdkController);

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
      await consumeStream(aiSdkController.chatStream(message), {
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

  return (
    <div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Enter message..."
      />
      <button onClick={startStream} disabled={loading}>
        {loading ? 'Streaming...' : 'Start Stream'}
      </button>
      <button onClick={stopStream} disabled={!loading}>
        Stop
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {output && (
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
          {output}
        </div>
      )}
    </div>
  );
};
```

### Core Features of SSE Streaming

1. **Type Safety**: Frontend calls to backend SSE interfaces enjoy complete type hints and checking
2. **Automatic Handling**: `consumeStream` automatically handles SSE protocol details without manual parsing
   - Server sends: `id: 1\ndata: Chengdu\n\n`
   - onMessage receives: `ev.data = "Chengdu"` (clean data content)
3. **Error Handling**: Provides complete error handling mechanisms, including network errors and business errors
4. **Stream Control**: Supports interrupting streaming transmission at any time via `AbortController`
5. **Zero Configuration**: No additional configuration needed, directly use controller methods

### Comparison with Traditional SSE Solutions

**Traditional Approach:**

```ts
// Manual SSE protocol handling required
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = event => {
  // Manual data parsing
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

### Real-World Use Cases

- **AI Conversations**: Implement streaming AI conversations with character-by-character response display
- **Real-time Logs**: Push server logs to frontend for real-time display
- **Progress Updates**: Real-time progress pushing for long-running tasks
- **Data Monitoring**: Real-time data metrics pushing and display

Through vtzac's SSE support, you can easily implement high-performance real-time data transmission while maintaining code type safety and simplicity.
