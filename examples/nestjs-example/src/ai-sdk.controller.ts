import { Controller, Post, Body, Res, Sse, Query } from '@nestjs/common';
import type { Response } from 'express';
import { UIMessage } from 'ai';
import { AiSdkService } from './ai-sdk.service';
import { from, map } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  @Sse('sse')
  sse(@Query('prompt') prompt: string) {
    const result = this.aiSdkService.completion(prompt);
    return from(result.textStream).pipe(
      map(
        (chunk): MessageEvent => ({
          data: typeof chunk === 'string' ? chunk : JSON.stringify(chunk),
        }),
      ),
    );
  }

  @Sse('chat/sse')
  chatSse(@Query('messages') messagesParam: string) {
    let messages = JSON.parse(decodeURIComponent(messagesParam)) as UIMessage[];
    const result = this.aiSdkService.chat(messages);
    return from(result.textStream).pipe(
      map(
        (chunk): MessageEvent => ({
          data: typeof chunk === 'string' ? chunk : JSON.stringify(chunk),
        }),
      ),
    );
  }

  // 原生多对话接口（POST）
  @Post('chat/text')
  chat(@Body() body: { messages: UIMessage[] }, @Res() res?: Response) {
    return this.aiSdkService.chat(body.messages).pipeTextStreamToResponse(res!);
  }

  @Post('chat/ui')
  chatUI(@Body() body: { messages: UIMessage[] }, @Res() res?: Response) {
    return this.aiSdkService
      .chat(body.messages)
      .pipeUIMessageStreamToResponse(res!);
  }

  @Post('completion')
  completion(@Body() body: { prompt: string }, @Res() res?: Response) {
    return this.aiSdkService
      .completion(body.prompt)
      .pipeTextStreamToResponse(res!);
  }

  @Post('completion/ui')
  completionUI(@Body() body: { prompt: string }, @Res() res?: Response) {
    return this.aiSdkService
      .completion(body.prompt)
      .pipeUIMessageStreamToResponse(res!);
  }
}
