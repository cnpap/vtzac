import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('echo')
  echo(@Body() body: any): any {
    return {
      message: 'Echo from backend',
      data: body,
      timestamp: new Date().toISOString(),
    }
  }
}
