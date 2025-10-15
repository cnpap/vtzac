import { createOpenAI } from '@ai-sdk/openai';

export const aliOpenAI = createOpenAI({
  baseURL:
    process.env.OPENAI_BASE_URL ||
    'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.OPENAI_API_KEY,
});
