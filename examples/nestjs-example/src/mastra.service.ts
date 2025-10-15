import { Injectable, Logger } from '@nestjs/common';
import { mastra } from './mastra';

@Injectable()
export class MastraService {
  private readonly logger = new Logger(MastraService.name);

  async streamWeatherAgent(message: string): Promise<AsyncIterable<string>> {
    try {
      this.logger.log(`Streaming with weather agent: ${message}`);
      const agent = mastra.getAgent('weatherAgent');

      if (!agent) {
        throw new Error('Weather agent not found');
      }

      const response = await agent.stream([
        {
          role: 'user',
          content: message,
        },
      ]);

      return response.textStream;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error streaming with weather agent: ${errorMessage}`);
      throw error;
    }
  }
}
