import { Injectable, Logger } from '@nestjs/common';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { aliOpenAI } from './model';

@Injectable()
export class AiSdkService {
  // 多对话接口
  chat(messages: UIMessage[]) {
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      messages: convertToModelMessages(messages),
    });
  }

  // AI SDK 完成接口
  completion(prompt: string) {
    return streamText({
      model: aliOpenAI.chat('qwen-plus'),
      system: 'You are a helpful assistant.',
      prompt,
    });
  }
}
