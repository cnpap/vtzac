import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TestInputController } from './test-input.controller';
import { WebSocketTestGateway } from './websocket.gateway';

@Module({
  imports: [],
  controllers: [AppController, TestInputController],
  providers: [WebSocketTestGateway],
})
export class AppModule {}
