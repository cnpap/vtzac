import { Injectable } from '@nestjs/common';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { mastra } from './mastra';

@Injectable()
export class MastraService {
  async ask(messageList: MessageListInput) {
    const agent = mastra.getAgent('weatherAgent');
    if (!agent) {
      throw new Error('Weather agent not found');
    }
    return agent.stream(messageList);
  }

  async textStream(message: string): Promise<AsyncIterable<string>> {
    const response = await this.ask([
      {
        role: 'user',
        content: message,
      },
    ]);
    // Mastra agents expose `textStream` as an AsyncIterable<string>
    return response.textStream;
  }
}
