import { Injectable, Logger } from '@nestjs/common';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { aliOpenAI } from './model';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { mastra } from './mastra';

@Injectable()
export class AiSdkService {
  private readonly logger = new Logger(AiSdkService.name);

  async ask(messageList: MessageListInput) {
    this.logger.log(
      `Streaming with weather agent: ${JSON.stringify(messageList)}`,
    );
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
  multiChat(messages: UIMessage[]) {
    this.logger.log(`Multi chat: ${JSON.stringify(messages)}`);
    return streamText({
      // 使用 Chat Completions 模式，DashScope 兼容端点不支持 Responses API（/v1/responses）
      model: aliOpenAI.chat('qwen-plus'),
      // 将 UIMessage 转换为核心消息格式，供 Chat Completions 使用
      messages: convertToModelMessages(messages),
    });
  }

  // AI SDK 完成接口
  completion(prompt: string) {
    this.logger.log(`AI SDK completion: ${prompt}`);
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      system: 'You are a helpful assistant.',
      prompt,
    });
  }

  // AI SDK 聊天接口
  chat(prompt: string) {
    this.logger.log(`AI SDK chat: ${prompt}`);
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      system: 'You are a helpful assistant.',
      prompt,
    });
  }
}
