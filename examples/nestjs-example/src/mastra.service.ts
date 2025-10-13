import { Injectable, Logger } from '@nestjs/common';
import { mastra } from './mastra';

@Injectable()
export class MastraService {
  private readonly logger = new Logger(MastraService.name);

  async chatWithWeatherAgent(message: string) {
    try {
      this.logger.log(`Chatting with weather agent: ${message}`);
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

      let responseText = '';
      for await (const chunk of response.textStream) {
        responseText += chunk;
      }

      return { response: responseText };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error chatting with weather agent: ${errorMessage}`);
      throw error;
    }
  }

  async getWeatherInfo(location: string) {
    try {
      this.logger.log(`Getting weather info for ${location}`);
      const agent = mastra.getAgent('weatherAgent');

      if (!agent) {
        throw new Error('Weather agent not found');
      }

      const response = await agent.stream([
        {
          role: 'user',
          content: `Get the current weather for ${location}`,
        },
      ]);

      let responseText = '';
      for await (const chunk of response.textStream) {
        responseText += chunk;
      }

      return { weather: responseText, location };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting weather info: ${errorMessage}`);
      throw error;
    }
  }

  async getWeatherActivities(city: string) {
    try {
      this.logger.log(`Getting weather activities for ${city}`);
      const agent = mastra.getAgent('weatherAgent');

      if (!agent) {
        throw new Error('Weather agent not found');
      }

      const response = await agent.stream([
        {
          role: 'user',
          content: `Get weather forecast and suggest activities for ${city}. Please provide a detailed forecast and activity recommendations.`,
        },
      ]);

      let responseText = '';
      for await (const chunk of response.textStream) {
        responseText += chunk;
      }

      return { activities: responseText, city };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting weather activities: ${errorMessage}`);
      throw error;
    }
  }

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
