import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketTestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebSocketTestGateway.name);

  @WebSocketServer()
  server!: Server;

  // 连接时触发
  handleConnection(client: Socket): void {
    this.logger.log(`客户端连接: ${client.id}`);
    client.emit('connected', {
      message: '连接成功',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  // 断开连接时触发
  handleDisconnect(client: Socket): void {
    this.logger.log(`客户端断开连接: ${client.id}`);
  }

  // 处理客户端发送的消息
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket
  ): void {
    this.logger.log(`收到来自 ${client.id} 的消息:`, data);

    // 回复给发送者
    client.emit('message', {
      type: 'reply',
      text: `服务器收到: ${data.text}`,
      timestamp: new Date().toISOString(),
      clientId: client.id,
    });

    // 广播给所有其他客户端
    client.broadcast.emit('message', {
      type: 'broadcast',
      text: `用户 ${client.id} 说: ${data.text}`,
      timestamp: new Date().toISOString(),
      fromClientId: client.id,
    });
  }

  // 处理心跳检测
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      message: 'pong',
      timestamp: new Date().toISOString(),
    });
  }

  // 获取在线用户数
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount(@ConnectedSocket() client: Socket): void {
    const onlineCount = this.server.sockets.sockets.size;
    client.emit('onlineCount', {
      count: onlineCount,
      timestamp: new Date().toISOString(),
    });
  }
}
