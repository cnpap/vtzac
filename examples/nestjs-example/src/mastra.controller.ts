import { Controller, Post, Body, Res, Sse, Query } from '@nestjs/common';
import { from, map } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import {
  UIMessage,
  convertToModelMessages,
  pipeTextStreamToResponse,
  pipeUIMessageStreamToResponse,
} from 'ai';
import { MastraService } from './mastra.service';
import type { Response } from 'express';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  // 保留 SSE Demo
  @Sse('sse')
  async sse(@Query('message') message: string) {
    const stream = await this.mastraService.textStream(message);
    return from(stream).pipe(map((data): MessageEvent => ({ data })));
  }

  // 与 ai-sdk 路径、请求方式保持一致：chat/text（使用 Mastra 实现并转换为 ai-sdk 文本流）
  @Post('chat/text')
  async chatText(@Body() body: { messages: UIMessage[] }, @Res() res?: any) {
    const modelMessages = convertToModelMessages(body.messages);
    const stream = await this.mastraService.ask(modelMessages);
    return pipeTextStreamToResponse({
      response: res!,
      textStream: stream.aisdk.v5
        .textStream as unknown as ReadableStream<string>,
    });
  }

  // 与 ai-sdk 路径、请求方式保持一致：chat/ui（使用 Mastra 实现并转换为 ai-sdk UI 流）
  @Post('chat/ui')
  async chatUI(@Body() body: { messages: UIMessage[] }, @Res() res?: Response) {
    const modelMessages = convertToModelMessages(body.messages);
    const stream = await this.mastraService.ask(modelMessages);
    return pipeUIMessageStreamToResponse({
      stream: stream.aisdk.v5.toUIMessageStream(),
      response: res!,
    });
  }

  // 与 ai-sdk 路径、请求方式保持一致：completion（使用 Mastra 实现并转换为 ai-sdk 文本流）
  @Post('completion')
  async completion(@Body() body: { prompt: string }, @Res() res?: Response) {
    const stream = await this.mastraService.ask([
      { role: 'user', content: body.prompt },
    ]);
    return pipeTextStreamToResponse({
      response: res!,
      textStream: stream.aisdk.v5
        .textStream as unknown as ReadableStream<string>,
    });
  }

  // 与 ai-sdk 路径、请求方式保持一致：completion/ui（使用 Mastra 实现并转换为 ai-sdk UI 流）
  @Post('completion/ui')
  async completionUI(@Body() body: { prompt: string }, @Res() res?: Response) {
    const stream = await this.mastraService.ask([
      { role: 'user', content: body.prompt },
    ]);
    return pipeUIMessageStreamToResponse({
      stream: stream.aisdk.v5.toUIMessageStream(),
      response: res!,
    });
  }
}
