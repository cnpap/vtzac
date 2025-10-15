import { Injectable, Logger } from '@nestjs/common';
import { mastra } from './mastra';
import { MessageListInput } from '@mastra/core/agent/message-list';

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
}
