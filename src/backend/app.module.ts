import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { TestInputController } from './test-input.controller'

@Module({
  imports: [],
  controllers: [
    AppController,
    TestInputController,
  ],
  providers: [],
})
export class AppModule {}
