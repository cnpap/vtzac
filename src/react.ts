import type { UIMessage } from 'ai'
import type { FetchResponse } from 'ofetch'
import type {
  AIDrive,
  ConsumeEventStreamOptions,
  ParsedMessageData,
  StreamProtocol,
  UseAIChatOptions,
  UseAIChatReturn,
  UseAICompletionOptions,
  UseAICompletionReturn,
} from './types'
import { useCallback, useRef, useState } from 'react'
import { consumeEventStream, consumeTextStream } from './stream'

/**
 * 类型守卫：判断是否为文本增量事件
 */
function textDeltaValue(parsed: ParsedMessageData, drive: AIDrive = 'ai-sdk'): string | undefined {
  if (typeof parsed !== 'object' || parsed === null)
    return undefined
  if (parsed.type === 'text-delta') {
    if (drive === 'ai-sdk') {
      return parsed.delta
    }
    else if (drive === 'mastra') {
      return (parsed.payload as unknown as { text: string }).text
    }
  }
  return undefined
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 添加：统一的流处理辅助函数，按协议路由并累加文本
async function runStream(
  params: {
    protocol: StreamProtocol
    response: Response
    signal?: AbortSignal
    accumulate: (delta: string) => void
    onMessage?: ConsumeEventStreamOptions['onMessage']
    onDataMessage?: ConsumeEventStreamOptions['onDataMessage']
    onClose?: () => void
    onFinish?: () => void
    onError?: (err: Error) => void
    drive?: AIDrive
  },
): Promise<void> {
  const {
    protocol,
    response,
    signal,
    accumulate,
    onMessage,
    onDataMessage,
    onClose,
    onFinish,
    onError,
    drive = 'mastra',
  } = params

  const streamOptions: ConsumeEventStreamOptions = {
    signal,
    onMessage: (data: string) => {
      if (protocol === 'text') {
        accumulate(data)
      }
      onMessage?.(data)
    },
    onDataMessage: (parsed: ParsedMessageData) => {
      if (protocol === 'data') {
        const delta = textDeltaValue(parsed, drive)
        if (delta) {
          accumulate(delta)
        }
      }
      onDataMessage?.(parsed)
    },
    onClose,
    onFinish,
    onError,
  }

  if (protocol === 'text') {
    await consumeTextStream(response, streamOptions)
  }
  else {
    await consumeEventStream(response, streamOptions)
  }
}

/**
 * useAICompletion - 用于单次文本生成的 React hook
 *
 * @param streamResponsePromise 返回流式响应的 Promise 函数
 * @param options 配置选项
 * @returns UseAICompletionReturn
 */
export function useAICompletion(
  streamResponsePromise: (prompt: string) => Promise<FetchResponse<unknown>>,
  options: UseAICompletionOptions = {},
): UseAICompletionReturn {
  const { onMessage, onDataMessage, onFinish, onError, protocol = 'data', drive } = options

  const [completion, setCompletion] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const complete = useCallback(async (prompt: string) => {
    if (!prompt.trim())
      return

    // 重置状态
    setCompletion('')
    setError(null)
    setIsLoading(true)

    // 取消之前的请求
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      const response = await streamResponsePromise(prompt)

      await runStream({
        protocol,
        response,
        signal: abortControllerRef.current.signal,
        accumulate: (delta) => {
          setCompletion(prev => prev + delta)
        },
        onMessage,
        onDataMessage,
        onClose: () => {
          setIsLoading(false)
        },
        onFinish: () => {
          setCompletion((current) => {
            onFinish?.(current)
            return current
          })
        },
        onError: (err: Error) => {
          setError(err)
          setIsLoading(false)
          onError?.(err)
        },
        drive,
      })
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsLoading(false)
      onError?.(error)
    }
  }, [streamResponsePromise, onMessage, onDataMessage, onFinish, onError])

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  const reset = useCallback(() => {
    setCompletion('')
    setError(null)
    setIsLoading(false)
    abortControllerRef.current?.abort()
  }, [])

  return {
    completion,
    isLoading,
    error,
    complete,
    stop,
    reset,
  }
}

/**
 * useAIChat - 用于多轮对话的 React hook
 *
 * @param streamResponsePromise 返回流式响应的 Promise 函数，接收消息历史
 * @param options 配置选项
 * @returns UseAIChatReturn
 */
export function useAIChat(
  streamResponsePromise: (messages: UIMessage[]) => Promise<FetchResponse<unknown>>,
  options: UseAIChatOptions = {},
): UseAIChatReturn {
  const { initialMessages = [], onMessage, onDataMessage, onFinish, onError, protocol = 'data', drive } = options

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const currentAssistantMessageRef = useRef<string>('')

  const processStreamResponse = useCallback(async (messagesToSend: UIMessage[]) => {
    setError(null)
    setIsLoading(true)
    currentAssistantMessageRef.current = ''

    // 取消之前的请求
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // 添加一个空的助手消息作为占位符
    const assistantMessageId = generateId()
    const assistantMessage: UIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      parts: [
        {
          type: 'text' as const,
          text: '',
        },
      ] as UIMessage['parts'],
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await streamResponsePromise(messagesToSend)

      const updateAssistant = (delta: string): void => {
        currentAssistantMessageRef.current += delta

        // 更新助手消息内容（使用 parts 而不是 content）
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                parts: [
                  {
                    type: 'text' as const,
                    text: currentAssistantMessageRef.current,
                  },
                ] as UIMessage['parts'],
              } as UIMessage
            : msg,
        ))
      }

      await runStream({
        protocol,
        response,
        signal: abortControllerRef.current.signal,
        accumulate: updateAssistant,
        onMessage,
        onDataMessage,
        onClose: () => {
          setIsLoading(false)
        },
        onFinish: () => {
          setMessages((prev) => {
            const finalMessages = prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    parts: [
                      {
                        type: 'text' as const,
                        text: currentAssistantMessageRef.current,
                      },
                    ] as UIMessage['parts'],
                  } as UIMessage
                : msg,
            )
            const finalAssistantMessage = finalMessages.find(msg => msg.id === assistantMessageId)
            if (finalAssistantMessage) {
              onFinish?.(finalAssistantMessage)
            }
            return finalMessages
          })
        },
        onError: (err: Error) => {
          setError(err)
          setIsLoading(false)
          onError?.(err)

          // 移除失败的助手消息
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
        },
        drive,
      })
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsLoading(false)
      onError?.(error)

      // 移除失败的助手消息
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    }
  }, [streamResponsePromise, onMessage, onDataMessage, onFinish, onError])

  const append = useCallback(async (content: string) => {
    if (!content.trim())
      return

    const userMessage: UIMessage = {
      id: generateId(),
      role: 'user',
      parts: [
        {
          type: 'text' as const,
          text: content.trim(),
        },
      ],
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    await processStreamResponse(newMessages)
  }, [messages, processStreamResponse])

  const reload = useCallback(async () => {
    if (messages.length === 0)
      return

    // 移除最后一条助手消息（如果存在）
    const lastMessage = messages[messages.length - 1]
    const messagesToReload = lastMessage.role === 'assistant'
      ? messages.slice(0, -1)
      : messages

    setMessages(messagesToReload)
    await processStreamResponse(messagesToReload)
  }, [messages, processStreamResponse])

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  const reset = useCallback(() => {
    setMessages(initialMessages)
    setError(null)
    setIsLoading(false)
    abortControllerRef.current?.abort()
    currentAssistantMessageRef.current = ''
  }, [initialMessages])

  return {
    messages,
    isLoading,
    error,
    append,
    reload,
    stop,
    reset,
  }
}
