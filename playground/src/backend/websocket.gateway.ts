import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { ChatMessage, User } from './websocket.emitter';
import { Logger } from '@nestjs/common';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { emitWith } from 'vtzac/typed-emit';
import { WebSocketEventEmitter } from './websocket.emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketTestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebSocketTestGateway.name);

  // 存储在线用户信息
  private onlineUsers = new Map<string, User>();

  // 存储用户socket映射
  private userSockets = new Map<string, Socket>();

  // 事件发射器实例
  private readonly eventEmitter = new WebSocketEventEmitter();

  @WebSocketServer()
  server!: Server;

  // 连接时触发
  handleConnection(client: Socket): void {
    this.logger.log(`客户端连接: ${client.id}`);

    // 加入公共频道
    client.join('public');

    emitWith(
      this.eventEmitter.connected,
      this.eventEmitter
    )(client.id).toClient(client);
  }

  // 断开连接时触发
  handleDisconnect(client: Socket): void {
    this.logger.log(`客户端断开连接: ${client.id}`);

    // 查找并移除用户
    let disconnectedUser: User | null = null;
    for (const [userId, user] of this.onlineUsers.entries()) {
      if (this.userSockets.get(userId)?.id === client.id) {
        disconnectedUser = user;
        this.onlineUsers.delete(userId);
        this.userSockets.delete(userId);
        break;
      }
    }

    if (disconnectedUser) {
      // 通知其他用户有人离开
      emitWith(
        this.eventEmitter.userLeft,
        this.eventEmitter
      )(disconnectedUser).toRoomAll(this.server, 'public');

      // 更新在线用户列表
      this.broadcastOnlineUsers();
    }
  }

  // 用户设置昵称并加入聊天
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { nickname: string; avatar?: string },
    @ConnectedSocket() client?: Socket
  ): void {
    const userId = client!.id;
    const user: User = {
      id: userId,
      nickname: data.nickname || `用户${userId.slice(-4)}`,
      avatar: data.avatar,
      joinTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    // 存储用户信息
    this.onlineUsers.set(userId, user);
    this.userSockets.set(userId, client!);

    this.logger.log(`用户 ${user.nickname} (${userId}) 加入聊天`);

    // 通知用户加入成功
    emitWith(
      this.eventEmitter.joinedChat,
      this.eventEmitter
    )(user).toClient(client!);

    // 通知其他用户有新用户加入
    emitWith(
      this.eventEmitter.userJoined,
      this.eventEmitter
    )(user).toRoom(client!, 'public');

    // 广播更新的在线用户列表
    this.broadcastOnlineUsers();
  }

  // 处理公共频道消息
  @SubscribeMessage('publicMessage')
  handlePublicMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client?: Socket
  ): void {
    const userId = client!.id;
    const user = this.onlineUsers.get(userId);
    if (!user) {
      emitWith(
        this.eventEmitter.error,
        this.eventEmitter
      )('请先设置昵称加入聊天').toClient(client!);
      return;
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'public',
      text: data.text,
      fromUserId: user.id,
      fromUserNickname: user.nickname,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`公共消息 - ${user.nickname}: ${data.text}`);

    // 广播给公共频道所有用户
    emitWith(
      this.eventEmitter.publicMessage,
      this.eventEmitter
    )(message).toRoomAll(this.server, 'public');

    // 更新用户最后活跃时间
    user.lastActive = new Date().toISOString();
  }

  // 处理私聊消息
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody() data: { text: string; toUserId: string },
    @ConnectedSocket() client?: Socket
  ): void {
    const userId = client!.id;
    const fromUser = this.onlineUsers.get(userId);
    const toUser = this.onlineUsers.get(data.toUserId);
    const toSocket = this.userSockets.get(data.toUserId);

    if (!fromUser) {
      emitWith(
        this.eventEmitter.error,
        this.eventEmitter
      )('请先设置昵称加入聊天').toClient(client!);
      return;
    }

    if (!toUser || !toSocket) {
      emitWith(
        this.eventEmitter.error,
        this.eventEmitter
      )('目标用户不在线').toClient(client!);
      return;
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'private',
      text: data.text,
      fromUserId: fromUser.id,
      fromUserNickname: fromUser.nickname,
      toUserId: toUser.id,
      toUserNickname: toUser.nickname,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `私聊消息 - ${fromUser.nickname} -> ${toUser.nickname}: ${data.text}`
    );

    // 发送给目标用户
    emitWith(
      this.eventEmitter.privateMessage,
      this.eventEmitter
    )(message).toClient(toSocket);

    // 发送给发送者（确认消息）
    emitWith(
      this.eventEmitter.privateMessageSent,
      this.eventEmitter
    )(message).toClient(client!);

    // 更新用户最后活跃时间
    fromUser.lastActive = new Date().toISOString();
  }

  // 获取在线用户列表
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client?: Socket): void {
    const users = Array.from(this.onlineUsers.values());
    emitWith(this.eventEmitter.onlineUsers, this.eventEmitter)(
      users,
      users.length
    ).toClient(client!);
  }

  // 处理心跳检测
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client?: Socket): void {
    const userId = client!.id;
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.lastActive = new Date().toISOString();
    }

    emitWith(this.eventEmitter.pong, this.eventEmitter)().toClient(client!);
  }

  // 获取在线用户数
  @SubscribeMessage('getOnlineCount')
  handleGetOnlineCount(@ConnectedSocket() client?: Socket): void {
    const onlineCount = this.onlineUsers.size;
    emitWith(
      this.eventEmitter.onlineCount,
      this.eventEmitter
    )(onlineCount).toClient(client!);
  }

  // 用户开始输入（私聊）
  @SubscribeMessage('startTyping')
  handleStartTyping(
    @MessageBody() data: { toUserId: string },
    @ConnectedSocket() client?: Socket
  ): void {
    const fromUser = this.onlineUsers.get(client!.id);
    const toSocket = this.userSockets.get(data.toUserId);

    if (fromUser && toSocket) {
      emitWith(this.eventEmitter.userStartTyping, this.eventEmitter)(
        fromUser.id,
        fromUser.nickname
      ).toClient(toSocket);
    }
  }

  // 用户停止输入（私聊）
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { toUserId: string },
    @ConnectedSocket() client?: Socket
  ): void {
    const fromUser = this.onlineUsers.get(client!.id);
    const toSocket = this.userSockets.get(data.toUserId);

    if (fromUser && toSocket) {
      emitWith(this.eventEmitter.userStopTyping, this.eventEmitter)(
        fromUser.id,
        fromUser.nickname
      ).toClient(toSocket);
    }
  }

  // 广播在线用户列表给所有用户
  private broadcastOnlineUsers(): void {
    const users = Array.from(this.onlineUsers.values());
    emitWith(this.eventEmitter.onlineUsers, this.eventEmitter)(
      users,
      users.length
    ).toRoomAll(this.server, 'public');
  }
}
