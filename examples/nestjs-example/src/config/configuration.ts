import { registerAs } from '@nestjs/config';
import { z } from 'zod';

// 环境变量验证模式
export const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
});

export type ConfigType = z.infer<typeof configSchema>;

// 验证环境变量
export function validateConfig(config: Record<string, unknown>): ConfigType {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Configuration validation error: ${result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`
    );
  }

  return result.data;
}

// 应用配置
export default registerAs('app', () => {
  return validateConfig(process.env);
});
