import type { OpenAPIObject } from '@nestjs/swagger';
import * as process from 'node:process';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 启用 CORS 以支持前端访问
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ], // 支持 localhost 和 127.0.0.1
    credentials: true,
  });

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('VTZAC API')
    .setDescription('VTZAC 测试接口文档')
    .setVersion('1.0')
    .addTag('test', '测试接口')
    .build();
  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
    'Bootstrap'
  );
  Logger.log(
    `📚 Swagger UI is available at: http://localhost:${port}/api-docs`,
    'Bootstrap'
  );
}

void bootstrap();
