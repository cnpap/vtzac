import { Injectable, Logger } from '@nestjs/common';
import { mastra } from './mastra';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { aliOpenAI } from './model';

@Injectable()
export class MastraService {
  private readonly logger = new Logger(MastraService.name);

  async ask(messageList: MessageListInput) {
    this.logger.log(`Streaming with weather agent: ${messageList}`);
    const agent = mastra.getAgent('weatherAgent');

    if (!agent) {
      throw new Error('Weather agent not found');
    }

    const response = await agent.stream(messageList);

    return response;
  }

  async streamWeatherAgent(message: string): Promise<AsyncIterable<string>> {
    const response = await this.ask([
      {
        role: 'user',
        content: message,
      },
    ]);

    return response.aisdk.v5.textStream;
  }

  // 多对话接口
  async multiChat(messages: UIMessage[]) {
    this.logger.log(`Multi chat: ${messages}`);
    return streamText({
      // 使用 Chat Completions 模式，DashScope 兼容端点不支持 Responses API（/v1/responses）
      model: aliOpenAI.chat('qwen-plus'),
      // 将 UIMessage 转换为核心消息格式，供 Chat Completions 使用
      messages: convertToModelMessages(messages),
    });
  }
}
