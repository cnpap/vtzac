import { Controller, Query, Sse } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import { MastraService } from './mastra.service';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  // Mastra 天气代理流式 SSE 接口（GET）
  @Sse('chat/stream')
  async chatStream(
    @Query('message') message: string,
  ): Promise<Observable<MessageEvent>> {
    if (!message) {
      throw new Error('Message parameter is required');
    }
    const stream = await this.mastraService.streamWeatherAgent(message);
    return from(stream).pipe(map((data): MessageEvent => ({ data })));
  }
}
