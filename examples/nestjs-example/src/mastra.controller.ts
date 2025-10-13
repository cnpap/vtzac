import { Controller, Post, Body, Get, Query, Res, Sse } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { Observable as RxObservable } from 'rxjs';
import type { Response } from 'express';
import { MastraService } from './mastra.service';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  @Post('chat')
  async chatWithAgent(@Body() body: { message: string }) {
    return this.mastraService.chatWithWeatherAgent(body.message);
  }
  // 使用 NestJS 原生 @Sse 装饰器的流式接口（适配 EventSource）
  @Sse('chat/stream')
  sseChatStream(
    @Query('message') message: string,
  ): Observable<{ data: string; type?: string }> {
    return new RxObservable<{ data: string; type?: string }>((subscriber) => {
      (async () => {
        try {
          const stream = await this.mastraService.streamWeatherAgent(message);
          for await (const chunk of stream) {
            subscriber.next({ data: chunk });
          }
          subscriber.next({ data: '[DONE]', type: 'end' });
          subscriber.complete();
        } catch (err) {
          subscriber.next({
            data: JSON.stringify({ message: (err as Error).message }),
            type: 'error',
          });
          subscriber.complete();
        }
      })();
    });
  }

  @Get('weather')
  async getWeather(@Query('location') location: string) {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.mastraService.getWeatherInfo(location);
  }

  @Get('activities')
  async getWeatherActivities(@Query('city') city: string) {
    if (!city) {
      throw new Error('City parameter is required');
    }
    return this.mastraService.getWeatherActivities(city);
  }
}
