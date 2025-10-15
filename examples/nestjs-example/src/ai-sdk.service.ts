import { Injectable, Logger } from '@nestjs/common';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { aliOpenAI } from './model';

@Injectable()
export class AiSdkService {
  private readonly logger = new Logger(AiSdkService.name);

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

  // AI SDK 完成接口
  async completion(prompt: string) {
    this.logger.log(`AI SDK completion: ${prompt}`);
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      system: 'You are a helpful assistant.',
      prompt,
    });
  }

  // AI SDK 聊天接口
  async chat(prompt: string) {
    this.logger.log(`AI SDK chat: ${prompt}`);
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      system: 'You are a helpful assistant.',
      prompt,
    });
  }
}
