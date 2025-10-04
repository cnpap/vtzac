import * as process from 'node:process'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  // 启用 CORS 以支持前端访问
  app.enableCors({
    origin: 'http://localhost:5173', // Vite 默认端口
    credentials: true,
  })

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap')
}

void bootstrap()
