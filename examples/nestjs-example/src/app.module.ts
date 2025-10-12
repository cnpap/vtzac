import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AskGateway } from './ask.gateway';
import { TestInputController } from './test-input.controller';
import { WebSocketTestGateway } from './websocket.gateway';

@Module({
  imports: [],
  controllers: [AppController, TestInputController],
  providers: [WebSocketTestGateway, AskGateway],
})
export class AppModule {}
