import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AskGateway } from './ask.gateway';
import { TestInputController } from './test-input.controller';
import { WebSocketTestGateway } from './websocket.gateway';
import configuration from './config/configuration';
import { AiSdkController } from './ai-sdk.controller';
import { AiSdkService } from './ai-sdk.service';
import { MastraController } from './mastra.controller';
import { MastraService } from './mastra.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true, // 使配置在整个应用中全局可用
      cache: true, // 缓存配置以提高性能
      expandVariables: true, // 支持环境变量展开
    }),
  ],
  controllers: [
    AppController,
    TestInputController,
    AiSdkController,
    MastraController,
  ],
  providers: [WebSocketTestGateway, AskGateway, AiSdkService, MastraService],
})
export class AppModule {}
