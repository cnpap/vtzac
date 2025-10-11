import { Emit } from 'vtzac/typed-emit';

// 用户信息接口
export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  joinTime: string;
  lastActive: string;
}

// 消息接口
export interface ChatMessage {
  id: string;
  type: 'public' | 'private';
  text: string;
  fromUserId: string;
  fromUserNickname: string;
  toUserId?: string; // 私聊目标用户ID
  toUserNickname?: string; // 私聊目标用户昵称
  timestamp: string;
  roomId?: string;
}

// 事件发射器类，使用 @Emit 装饰器定义所有事件
export class WebSocketEventEmitter {
  @Emit('userLeft')
  userLeft(user: User): { user: User; timestamp: string } {
    return {
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('joinedChat')
  joinedChat(user: User): { user: User; timestamp: string } {
    return {
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('userJoined')
  userJoined(user: User): { user: User; timestamp: string } {
    return {
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('error')
  error(message: string): { message: string } {
    return { message };
  }

  @Emit('publicMessage')
  publicMessage(message: ChatMessage): ChatMessage {
    return message;
  }

  @Emit('privateMessage')
  privateMessage(message: ChatMessage): ChatMessage {
    return message;
  }

  @Emit('privateMessageSent')
  privateMessageSent(message: ChatMessage): ChatMessage {
    return message;
  }

  @Emit('onlineUsers')
  onlineUsers(
    users: User[],
    count: number
  ): { users: User[]; count: number; timestamp: string } {
    return {
      users,
      count,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('pong')
  pong(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('onlineCount')
  onlineCount(count: number): { count: number; timestamp: string } {
    return {
      count,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('userStartTyping')
  userStartTyping(
    userId: string,
    nickname: string
  ): { userId: string; nickname: string; timestamp: string } {
    return {
      userId,
      nickname,
      timestamp: new Date().toISOString(),
    };
  }

  @Emit('userStopTyping')
  userStopTyping(
    userId: string,
    nickname: string
  ): { userId: string; nickname: string; timestamp: string } {
    return {
      userId,
      nickname,
      timestamp: new Date().toISOString(),
    };
  }
}
