import type { ConsumeEventStreamOptions, EventSourceMessage, ParsedMessageData } from './types'

enum ControlChars {
  NewLine = 10,
  CarriageReturn = 13,
  Space = 32,
  Colon = 58,
}

/**
 * Converts a ReadableStream into a callback pattern.
 * @param stream The input ReadableStream.
 * @param onChunk A function that will be called on each new byte chunk in the stream.
 * @returns {Promise<void>} A promise that will be resolved when the stream closes.
 */
export async function getBytes(
  stream: ReadableStream<Uint8Array>,
  onChunk: (arr: Uint8Array) => void,
): Promise<void> {
  const reader = stream.getReader()
  let result = await reader.read()
  while (!result.done) {
    onChunk(result.value)
    result = await reader.read()
  }
}

/**
 * Parses arbitary byte chunks into EventSource line buffers.
 * Each line should be of the format "field: value" and ends with \r, \n, or \r\n.
 * @param onLine A function that will be called on each new EventSource line.
 * @returns A function that should be called for each incoming byte chunk.
 */
export function getLines(
  onLine: (line: Uint8Array, fieldLength: number) => void,
) {
  let buffer: Uint8Array | undefined
  let position: number // current read position
  let fieldLength: number // length of the `field` portion of the line
  let discardTrailingNewline = false

  // return a function that can process each incoming byte chunk:
  return function onChunk(arr: Uint8Array) {
    if (buffer === undefined) {
      buffer = arr
      position = 0
      fieldLength = -1
    }
    else {
      // we're still parsing the old line. Append the new bytes into buffer:
      buffer = concat(buffer, arr)
    }

    const bufLength = buffer.length
    let lineStart = 0 // index where the current line starts
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === ControlChars.NewLine) {
          lineStart = ++position // skip to next char
        }

        discardTrailingNewline = false
      }

      // start looking forward till the end of line:
      let lineEnd = -1 // index of the \r or \n char
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case ControlChars.Colon:
            if (fieldLength === -1) {
              // first colon in line
              fieldLength = position - lineStart
            }
            break
          case ControlChars.CarriageReturn:
            discardTrailingNewline = true
            // falls through
          case ControlChars.NewLine:
            lineEnd = position
            break
        }
      }

      if (lineEnd === -1) {
        // We reached the end of the buffer but the line hasn't ended.
        // Wait for the next arr and then continue parsing:
        break
      }

      // we've reached the line end, send it out:
      onLine(buffer.subarray(lineStart, lineEnd), fieldLength)
      lineStart = position // we're now on the next line
      fieldLength = -1
    }

    if (lineStart === bufLength) {
      buffer = undefined // we've finished reading it
    }
    else if (lineStart !== 0) {
      // Create a new view into buffer beginning at lineStart so we don't
      // need to copy over the previous lines when we get the new arr:
      buffer = buffer.subarray(lineStart)
      position -= lineStart
    }
  }
}

/**
 * Parses line buffers into EventSourceMessages.
 * @param onId A function that will be called on each `id` field.
 * @param onRetry A function that will be called on each `retry` field.
 * @param onMessage A function that will be called on each message.
 * @returns A function that should be called for each incoming line buffer.
 */
export function getMessages(
  onId: (id: string) => void,
  onRetry: (retry: number) => void,
  onMessage?: (msg: EventSourceMessage) => void,
) {
  let message = newMessage()
  const decoder = new TextDecoder()

  // return a function that can process each incoming line buffer:
  return function onLine(line: Uint8Array, fieldLength: number) {
    if (line.length === 0) {
      // empty line denotes end of message. Trigger the callback and start a new message:
      onMessage?.(message)
      message = newMessage()
    }
    else if (fieldLength > 0) {
      // exclude comments and lines with no values
      // line is of format "<field>:<value>" or "<field>: <value>"
      // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
      const field = decoder.decode(line.subarray(0, fieldLength))
      const valueOffset
        = fieldLength + (line[fieldLength + 1] === ControlChars.Space ? 2 : 1)
      const value = decoder.decode(line.subarray(valueOffset))

      switch (field) {
        case 'data':
          // if this message already has data, append the new value to the old.
          // otherwise, just set to the new value:
          message.data = message.data ? `${message.data}\n${value}` : value // otherwise,
          break
        case 'event':
          message.event = value
          break
        case 'id':
          onId((message.id = value))
          break
        case 'retry': {
          const retry = Number.parseInt(value, 10)
          if (!Number.isNaN(retry)) {
            // per spec, ignore non-integers
            onRetry((message.retry = retry))
          }
          break
        }
      }
    }
  }
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length)
  res.set(a)
  res.set(b, a.length)
  return res
}

function newMessage(): EventSourceMessage {
  // data, event, and id must be initialized to empty strings:
  // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
  // retry should be initialized to undefined so we return a consistent shape
  // to the js engine all the time: https://mathiasbynens.be/notes/shapes-ics#takeaways
  return {
    data: '',
    event: '',
    id: '',
    retry: undefined,
  }
}

function emitRawAndJson(
  raw: string,
  onMessage?: (raw: string) => void,
  onDataMessage?: (parsed: ParsedMessageData) => void,
): void {
  if (!raw)
    return
  if (onMessage)
    onMessage(raw)
  if (onDataMessage) {
    try {
      const parsed = JSON.parse(raw) as unknown as ParsedMessageData
      onDataMessage(parsed)
    }
    catch {
      // ignore parse error for non-JSON chunks
    }
  }
}

/**
 * 消费 EventStream 响应的核心函数
 * @param response ofetch 返回的 Response 对象
 * @param options 消费选项，包含各种回调函数
 * @returns Promise<void>
 */
export async function consumeEventStream(
  response: Response,
  options: ConsumeEventStreamOptions = {},
): Promise<void> {
  const { onMessage, onDataMessage } = options

  return withStreamLifecycle(response, options, async (body) => {
    await getBytes(
      body,
      getLines(
        getMessages(
          (_id) => {},
          (_retry) => {},
          (onMessage || onDataMessage)
            ? (msg) => {
                // 跳过完成标记
                if (msg.data === '[DONE]')
                  return
                // 保持与原实现一致：仅在 msg.data 非空时触发
                if (msg.data)
                  emitRawAndJson(msg.data, onMessage, onDataMessage)
              }
            : undefined,
        ),
      ),
    )
  })
}

/**
 * 消费纯文本流（非 SSE），例如 AI SDK 的 pipeTextStreamToResponse 返回的内容
 * 将每个字节块按 UTF-8 解码为字符串，并通过 onMessage 回调传递原始文本数据。
 */
export async function consumeTextStream(
  response: Response,
  options: Omit<ConsumeEventStreamOptions, 'onDataMessage'> = {},
): Promise<void> {
  const { onMessage } = options

  return withStreamLifecycle(response, options, async (body) => {
    const decoder = new TextDecoder()

    await getBytes(body, (arr: Uint8Array) => {
      const chunkText = decoder.decode(arr, { stream: true })
      if (chunkText) {
        if (!chunkText)
          return
        if (onMessage)
          onMessage(chunkText)
      }
    })
    const rest = decoder.decode()
    if (rest) {
      if (!rest)
        return
      if (onMessage)
        onMessage(rest)
    }
  })
}

async function withStreamLifecycle(
  response: Response,
  options: ConsumeEventStreamOptions,
  start: (body: ReadableStream<Uint8Array>, signal?: AbortSignal) => Promise<void>,
): Promise<void> {
  const { onOpen, onClose, onFinish, onError, signal } = options
  try {
    if (onOpen)
      await onOpen(response)

    if (signal?.aborted)
      return

    const body = response.body
    if (!body)
      throw new Error('Response body is null')

    const abortPromise = signal
      ? new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true })
      })
      : null

    const streamPromise = start(body, signal)

    if (abortPromise)
      await Promise.race([streamPromise, abortPromise])
    else
      await streamPromise

    onClose?.()
    onFinish?.()
  }
  catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    if (onError)
      onError(err)
    else
      throw err
  }
}
