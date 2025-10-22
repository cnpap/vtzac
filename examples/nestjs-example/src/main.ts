import type { OpenAPIObject } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { ConfigType } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 获取配置服务
  const configService = app.get(ConfigService);

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
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VTZAC API')
    .setDescription('VTZAC 测试接口文档')
    .setVersion('1.0')
    .addTag('test', '测试接口')
    .build();
  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory);

  // 从配置服务获取端口号
  const appConfig = configService.get<ConfigType>('app');
  const port = appConfig?.PORT ?? 3000;
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
