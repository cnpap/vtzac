import { Controller, Post, Body, Get, Query, Sse } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import { MastraService } from './mastra.service';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  @Post('chat')
  async chatWithAgent(@Body() body: { message: string }) {
    return this.mastraService.chatWithWeatherAgent(body.message);
  }

  // 原生流式 SSE 接口（GET）
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
