import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { UIMessage } from 'ai';
import { AiSdkService } from './ai-sdk.service';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  // 原生多对话接口（POST）
  @Post('chat/multi')
  async multiChat(
    @Body() body: { messages: UIMessage[] },
    @Res() res?: Response,
  ) {
    const { messages } = body;
    Logger.log(`Multi chat: ${JSON.stringify(messages)}`);
    const result = await this.aiSdkService.multiChat(messages);
    Logger.log(`Multi chat result: ${JSON.stringify(result)}`);
    return result.pipeTextStreamToResponse(res!);
  }

  // Vercel AI SDK 流式接口（POST）
  // 特征1 content-type text/plain
  // 特征2 响应体为流式文本 transfer-encoding chunked
  @Post('completion')
  async aiSdkCompletion(
    @Body() body: { prompt: string },
    @Res() res?: Response,
  ) {
    const { prompt } = body;
    const result = await this.aiSdkService.completion(prompt);

    // 使用 pipeTextStreamToResponse 来兼容 @ai-sdk/react 的 useCompletion
    return result.pipeTextStreamToResponse(res!);
  }

  // Vercel AI SDK UI Message Stream 接口（POST）
  // 直接流式返回文本，不需要任何处理
  @Post('chat')
  async aiSdkChat(@Body() body: { prompt: string }, @Res() res?: Response) {
    const { prompt } = body;
    const result = await this.aiSdkService.chat(prompt);

    return result.pipeUIMessageStreamToResponse(res!);
  }

  // Vercel AI SDK 数据协议流式接口（POST）
  // 特征：基于 NDJSON 的数据流（包含多种事件），适配 useCompletion 的默认 streamProtocol: 'data'
  // content-type text/event-stream
  @Post('completion-data')
  async aiSdkCompletionData(
    @Body() body: { prompt: string },
    @Res() res?: Response,
  ) {
    const { prompt } = body;
    const result = await this.aiSdkService.completion(prompt);

    // 使用 UI Message 数据协议流响应（NDJSON 事件流），
    // 适配 @ai-sdk/react 的 useCompletion 默认的 streamProtocol: 'data'
    return result.pipeUIMessageStreamToResponse(res!);
  }
}
