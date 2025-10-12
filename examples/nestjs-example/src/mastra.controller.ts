import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MastraService } from './mastra.service';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  @Post('chat')
  async chatWithAgent(@Body() body: { message: string }) {
    return this.mastraService.chatWithWeatherAgent(body.message);
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
