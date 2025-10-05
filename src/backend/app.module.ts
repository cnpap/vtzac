import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { TestController } from './test-input.controller'

@Module({
  imports: [],
  controllers: [
    AppController,
    TestController,
  ],
  providers: [],
})
export class AppModule {}
