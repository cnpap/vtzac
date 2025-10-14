import type { FetchResponse } from 'ofetch'
import type {
  AIMessage,
  ConsumeEventStreamOptions,
  EventSourceMessage,
  UseAIChatOptions,
  UseAIChatReturn,
  UseAICompletionOptions,
  UseAICompletionReturn,
} from './types'
import { useCallback, useRef, useState } from 'react'
import { consumeEventStream } from './stream'

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
  const { onMessage, onFinish, onError } = options

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
  streamResponsePromise: (messages: AIMessage[]) => Promise<FetchResponse<any>>,
  options: UseAIChatOptions = {},
): UseAIChatReturn {
  const { initialMessages = [], onMessage, onFinish, onError } = options

  const [messages, setMessages] = useState<AIMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const currentAssistantMessageRef = useRef<string>('')

  const processStreamResponse = useCallback(async (messagesToSend: AIMessage[]) => {
    setError(null)
    setIsLoading(true)
    currentAssistantMessageRef.current = ''

    // 取消之前的请求
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // 添加一个空的助手消息作为占位符
    const assistantMessageId = generateId()
    const assistantMessage: AIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await streamResponsePromise(messagesToSend)

      const streamOptions: ConsumeEventStreamOptions = {
        signal: abortControllerRef.current.signal,
        onMessage: (ev: EventSourceMessage) => {
          currentAssistantMessageRef.current += ev.data

          // 更新助手消息内容
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: currentAssistantMessageRef.current }
              : msg,
          ))

          onMessage?.(ev)
        },
        onClose: () => {
          setIsLoading(false)
        },
        onFinish: () => {
          // 获取最终的助手消息
          setMessages((prev) => {
            const finalMessages = prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: currentAssistantMessageRef.current }
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

    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
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
