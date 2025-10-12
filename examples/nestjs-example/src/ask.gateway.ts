import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import process from 'node:process';

import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

interface AskRequest {
  id: string;
  type: 'server-to-client' | 'client-to-server';
  question: string;
  timestamp: string;
}

interface AskResponse {
  id: string;
  answer: string;
  timestamp: string;
}

interface ConnectionInfo {
  clientId: string;
  connectedAt: string;
  totalConnections: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ask',
})
export class AskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AskGateway.name);
  private connectedClients = new Map<string, Socket>();

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    this.logger.log(`客户端连接: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // 连接成功后发送欢迎消息
    client.emit('connected', {
      message: '连接成功，Ask 模式已就绪',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`客户端断开连接: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // 客户端向服务端发起 ask 请求（使用 callback 方式返回）
  @SubscribeMessage('askServer')
  handleAskServer(
    @MessageBody() data: { question: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`客户端 ${client.id} 询问服务端: ${data.question}`);

    const request: AskRequest = {
      id: `ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'client-to-server',
      question: data.question,
      timestamp: new Date().toISOString(),
    };

    // 模拟服务端处理逻辑
    let answer = '';
    if (data.question.includes('时间')) {
      answer = `当前服务器时间是: ${new Date().toLocaleString('zh-CN')}`;
    } else if (data.question.includes('状态')) {
      answer = `服务器运行正常，当前连接数: ${this.connectedClients.size}`;
    } else if (data.question.includes('版本')) {
      answer = 'Ask Gateway v1.0.0';
    } else {
      answer = `服务端收到您的问题: "${data.question}"，这是一个通用回答。`;
    }

    const response: AskResponse = {
      id: request.id,
      answer,
      timestamp: new Date().toISOString(),
    };

    // 直接返回响应给客户端
    client.emit('serverAnswer', response);
  }

  // 客户端向服务端发起 ask 请求（使用 callback 方式返回）
  @SubscribeMessage('askServerWithCallback')
  handleAskServerWithCallback(
    @MessageBody() data: { question: string },
    @ConnectedSocket() client: Socket,
  ): AskResponse {
    this.logger.log(
      `客户端 ${client.id} 通过 callback 询问服务端: ${data.question}`,
    );

    // 模拟服务端处理逻辑
    let answer = '';
    if (data.question.includes('计算')) {
      const numbers = data.question.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const sum = numbers
          .slice(0, 2)
          .reduce(
            (a, b) =>
              Number.parseInt(a as unknown as string) + Number.parseInt(b),
            0,
          );
        answer = `计算结果: ${numbers[0]} + ${numbers[1]} = ${sum}`;
      } else {
        answer = '请提供两个数字进行计算';
      }
    } else if (data.question.includes('随机')) {
      answer = `随机数: ${Math.floor(Math.random() * 100)}`;
    } else {
      answer = `通过 callback 回答: ${data.question}`;
    }

    const response: AskResponse = {
      id: `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answer,
      timestamp: new Date().toISOString(),
    };

    // 使用 callback 方式返回
    return response;
  }

  // 服务端向客户端发起 ask 请求
  @SubscribeMessage('triggerServerAsk')
  handleTriggerServerAsk(@ConnectedSocket() client: Socket): void {
    this.logger.log(`触发服务端向客户端 ${client.id} 发起询问`);

    const questions = [
      '你的浏览器类型是什么？',
      '你当前的屏幕分辨率是多少？',
      '你最喜欢的颜色是什么？',
      '你现在的心情如何？',
      '你觉得这个 Ask 功能怎么样？',
    ];

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    const request: AskRequest = {
      id: `server_ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'server-to-client',
      question: randomQuestion,
      timestamp: new Date().toISOString(),
    };

    // 发送询问给客户端
    client.emit('serverAsk', request);
  }

  // 服务端使用 emitWithAck 向客户端发起询问
  @SubscribeMessage('triggerServerAskWithAck')
  async handleTriggerServerAskWithAck(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `触发服务端通过 emitWithAck 向客户端 ${client.id} 发起询问`,
    );

    const questions = [
      '请告诉我你的操作系统版本？',
      '你最常用的编程语言是什么？',
      '你觉得这个 emitWithAck 功能如何？',
      '你现在在哪个城市？',
      '你今天心情怎么样？',
    ];

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    const request: AskRequest = {
      id: `server_ack_ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'server-to-client',
      question: randomQuestion,
      timestamp: new Date().toISOString(),
    };

    // 使用 emitWithAck 发送询问并等待客户端回答
    const response: AskResponse = (await client.emitWithAck(
      'serverAskWithAck',
      request as unknown,
    )) as AskResponse;
    this.logger.log(
      `客户端 ${client.id} 通过 emitWithAck 回答: ${JSON.stringify(response)}`,
    );

    // 向客户端确认收到回答
    client.emit('serverAckReceived', {
      message: '服务端通过 emitWithAck 收到您的回答',
      originalRequest: request,
      clientResponse: response,
      timestamp: new Date().toISOString(),
    });
  }

  // 接收客户端对服务端询问的回答
  @SubscribeMessage('answerServer')
  handleAnswerServer(
    @MessageBody() data: { requestId: string; answer: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`客户端 ${client.id} 回答服务端: ${data.answer}`);

    // 确认收到客户端的回答
    client.emit('serverReceivedAnswer', {
      message: '服务端已收到您的回答',
      originalAnswer: data.answer,
      timestamp: new Date().toISOString(),
    });
  }

  // 处理客户端通过 emitWithAck 发起的询问
  @SubscribeMessage('askServerWithAck')
  handleAskServerWithAck(
    @MessageBody() data: { question: string },
    @ConnectedSocket() client: Socket,
  ): AskResponse {
    this.logger.log(
      `客户端 ${client.id} 通过 emitWithAck 询问服务端: ${data.question}`,
    );

    // 模拟服务端处理逻辑
    let answer = '';
    if (data.question.includes('服务器')) {
      answer = `服务器信息: Node.js ${process.version}, 运行时间: ${Math.floor(process.uptime())}秒`;
    } else if (data.question.includes('内存')) {
      const memUsage = process.memoryUsage();
      answer = `内存使用: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`;
    } else if (data.question.includes('连接')) {
      answer = `当前连接数: ${this.connectedClients.size}`;
    } else if (data.question.includes('性能')) {
      answer = `CPU 使用率: ${Math.floor(Math.random() * 50 + 10)}%, 负载: ${(Math.random() * 2).toFixed(2)}`;
    } else {
      answer = `通过 emitWithAck 回答: "${data.question}" - 这是服务端的智能回复`;
    }

    const response: AskResponse = {
      id: `ack_response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answer,
      timestamp: new Date().toISOString(),
    };

    // 直接返回响应（emitWithAck 会自动处理）
    return response;
  }

  // 获取连接状态
  @SubscribeMessage('getConnectionInfo')
  handleGetConnectionInfo(@ConnectedSocket() client: Socket): ConnectionInfo {
    return {
      clientId: client.id,
      connectedAt: new Date().toISOString(),
      totalConnections: this.connectedClients.size,
    };
  }
}
