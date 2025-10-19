import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UIMessage } from 'ai';
import { AiSdkService } from './ai-sdk.service';

@Controller('api/ai-sdk')
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}
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
