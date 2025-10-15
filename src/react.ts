import type { UIMessage } from 'ai'
import type { FetchResponse } from 'ofetch'
import type {
  ConsumeEventStreamOptions,
  EventSourceMessage,
  UseAIChatOptions,
  UseAIChatReturn,
  UseAICompletionOptions,
  UseAICompletionReturn,
} from './types'
import { useCallback, useRef, useState } from 'react'
import { consumeEventStream, consumeTextStream } from './stream'

/**
 * 数据协议事件：文本增量
 */
interface TextDeltaEvent {
  type: 'text-delta'
  delta: string
}

/**
 * 类型守卫：判断是否为文本增量事件
 */
function isTextDeltaEvent(value: unknown): value is TextDeltaEvent {
  if (typeof value !== 'object' || value === null)
    return false
  const v = value as { type?: unknown, delta?: unknown }
  return v.type === 'text-delta' && typeof v.delta === 'string'
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * useAICompletion - 用于单次文本生成的 React hook
 *
 * @param streamResponsePromise 返回流式响应的 Promise 函数
 * @param options 配置选项
 * @returns UseAICompletionReturn
 */
export function useAICompletion(
  streamResponsePromise: (prompt: string) => Promise<FetchResponse<any>>,
  options: UseAICompletionOptions = {},
): UseAICompletionReturn {
  const { onMessage, onFinish, onError, protocol = 'sse' } = options

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

      if (protocol === 'text') {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            // 文本协议：直接累加文本片段
            setCompletion(prev => prev + ev.data)
            onMessage?.(ev)
          },
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
        }
        await consumeTextStream(response, streamOptions)
      }
      else if (protocol === 'data') {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            // 数据协议：ev.data 是 JSON 字符串，包含多种事件类型
            try {
              const parsed: unknown = JSON.parse(ev.data)
              // 仅处理文本增量事件
              if (isTextDeltaEvent(parsed)) {
                setCompletion(prev => prev + parsed.delta)
              }
            }
            catch {
              // 非预期格式时忽略
            }
            onMessage?.(ev)
          },
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
        }
        await consumeEventStream(response, streamOptions)
      }
      else {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            setCompletion(prev => prev + ev.data)
            onMessage?.(ev)
          },
          onClose: () => {
            setIsLoading(false)
          },
          onFinish: () => {
            // 获取最终的完整文本
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
        }
        await consumeEventStream(response, streamOptions)
      }
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsLoading(false)
      onError?.(error)
    }
  }, [streamResponsePromise, onMessage, onFinish, onError])

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
  streamResponsePromise: (messages: UIMessage[]) => Promise<FetchResponse<any>>,
  options: UseAIChatOptions = {},
): UseAIChatReturn {
  const { initialMessages = [], onMessage, onFinish, onError, protocol = 'sse' } = options

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

      if (protocol === 'text') {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            currentAssistantMessageRef.current += ev.data

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

            onMessage?.(ev)
          },
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
        }
        await consumeTextStream(response, streamOptions)
      }
      else if (protocol === 'data') {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            try {
              const parsed: unknown = JSON.parse(ev.data)
              if (isTextDeltaEvent(parsed)) {
                currentAssistantMessageRef.current += parsed.delta
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
            }
            catch {
              // 忽略不可解析的片段
            }
            onMessage?.(ev)
          },
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

            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
          },
        }
        await consumeEventStream(response, streamOptions)
      }
      else {
        const streamOptions: ConsumeEventStreamOptions = {
          signal: abortControllerRef.current.signal,
          onMessage: (ev: EventSourceMessage) => {
            currentAssistantMessageRef.current += ev.data

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

            onMessage?.(ev)
          },
          onClose: () => {
            setIsLoading(false)
          },
          onFinish: () => {
            // 获取最终的助手消息（更新为 parts）
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
        }
        await consumeEventStream(response, streamOptions)
      }
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsLoading(false)
      onError?.(error)

      // 移除失败的助手消息
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    }
  }, [streamResponsePromise, onMessage, onFinish, onError])

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
