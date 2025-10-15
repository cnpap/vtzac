import { UIMessage } from 'ai';

export declare class AiSdkController {
  multiChat(body: { messages: UIMessage[] }): Promise<any>;
  aiSdkCompletion(body: { prompt: string }): Promise<any>;
  aiSdkChat(body: { prompt: string }): Promise<any>;
  aiSdkCompletionData(body: { prompt: string }): Promise<any>;
}
