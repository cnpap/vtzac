import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  Sse,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { UIMessage } from 'ai';
import { AiSdkService } from './ai-sdk.service';
import { from, map, Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  // Mastra 天气代理流式 SSE 接口（GET）
  @Sse('chat/stream')
  async chatStream(
    @Query('message') message: string,
  ): Promise<Observable<MessageEvent>> {
    if (!message) {
      throw new Error('Message parameter is required');
    }
    const stream = await this.aiSdkService.streamWeatherAgent(message);
    return from(stream).pipe(map((data): MessageEvent => ({ data })));
  }

  // 标准 SSE 多轮对话接口（GET）
  @Sse('chat/sse')
  chatSSE(@Query('messages') messagesParam: string): Observable<MessageEvent> {
    let messages: UIMessage[];
    try {
      messages = JSON.parse(decodeURIComponent(messagesParam)) as UIMessage[];
    } catch {
      throw new Error('Invalid messages format');
    }

    Logger.log(`SSE Chat messages: ${JSON.stringify(messages)}`);
    const result = this.aiSdkService.multiChat(messages);

    // 将流转换为 SSE 格式
    return from(result.textStream).pipe(
      map(
        (chunk): MessageEvent => ({
          // 不要对文本分片进行 JSON 序列化，否则前端会看到两侧的引号，\n 也会被转义为字面文本
          data: typeof chunk === 'string' ? chunk : JSON.stringify(chunk),
        }),
      ),
    );
  }

  // 原生多对话接口（POST）
  @Post('chat/multi')
  multiChat(@Body() body: { messages: UIMessage[] }, @Res() res?: Response) {
    const { messages } = body;
    Logger.log(`Multi chat: ${JSON.stringify(messages)}`);
    const result = this.aiSdkService.multiChat(messages);
    Logger.log(`Multi chat result: ${JSON.stringify(result)}`);
    return result.pipeTextStreamToResponse(res!);
  }

  // Vercel AI SDK 流式接口（POST）
  // 特征1 content-type text/plain
  // 特征2 响应体为流式文本 transfer-encoding chunked
  @Post('completion')
  aiSdkCompletion(@Body() body: { prompt: string }, @Res() res?: Response) {
    const { prompt } = body;
    const result = this.aiSdkService.completion(prompt);

    // 使用 pipeTextStreamToResponse 来兼容 @ai-sdk/react 的 useCompletion
    return result.pipeTextStreamToResponse(res!);
  }

  // Vercel AI SDK UI Message Stream 接口（POST）
  // 直接流式返回文本，不需要任何处理
  @Post('chat')
  aiSdkChat(@Body() body: { prompt: string }, @Res() res?: Response) {
    const { prompt } = body;
    const result = this.aiSdkService.chat(prompt);

    return result.pipeUIMessageStreamToResponse(res!);
  }

  // Vercel AI SDK UI Message Stream 接口（POST）- 支持完整messages
  // SSE协议，传递完整的messages数组
  @Post('chat/messages')
  aiSdkChatMessages(
    @Body() body: { messages: UIMessage[] },
    @Res() res?: Response,
  ) {
    const { messages } = body;
    Logger.log(`Chat messages: ${JSON.stringify(messages)}`);
    const result = this.aiSdkService.multiChat(messages);

    return result.pipeUIMessageStreamToResponse(res!);
  }

  // Vercel AI SDK 数据协议流式接口（POST）
  // 特征：基于 NDJSON 的数据流（包含多种事件），适配 useCompletion 的默认 streamProtocol: 'data'
  // content-type text/event-stream
  @Post('completion-data')
  aiSdkCompletionData(@Body() body: { prompt: string }, @Res() res?: Response) {
    const { prompt } = body;
    const result = this.aiSdkService.completion(prompt);

    // 使用 UI Message 数据协议流响应（NDJSON 事件流），
    // 适配 @ai-sdk/react 的 useCompletion 默认的 streamProtocol: 'data'
    return result.pipeUIMessageStreamToResponse(res!);
  }

  // Vercel AI SDK 数据协议流式接口（POST）- 支持完整messages
  // Data协议，传递完整的messages数组
  @Post('completion-data/messages')
  aiSdkCompletionDataMessages(
    @Body() body: { messages: UIMessage[] },
    @Res() res?: Response,
  ) {
    const { messages } = body;
    Logger.log(`Completion data messages: ${JSON.stringify(messages)}`);
    const result = this.aiSdkService.multiChat(messages);

    // 使用 UI Message 数据协议流响应（NDJSON 事件流），
    // 适配 @ai-sdk/react 的 useCompletion 默认的 streamProtocol: 'data'
    return result.pipeUIMessageStreamToResponse(res!);
  }
}
