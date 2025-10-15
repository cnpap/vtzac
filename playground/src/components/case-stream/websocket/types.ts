// WebSocket聊天相关的类型定义

// 用户信息接口
export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  joinTime: string;
  lastActive: string;
}

// 聊天消息接口
export interface ChatMessageType {
  id: string;
  type: 'public' | 'private';
  text: string;
  fromUserId: string;
  fromUserNickname: string;
  toUserId?: string;
  toUserNickname?: string;
  timestamp: string;
}

// 系统消息类型
export type MessageType =
  | 'connected'
  | 'reply'
  | 'system'
  | 'broadcast'
  | 'pong'
  | 'onlineCount'
  | 'error'
  | 'sent'
  | 'public'
  | 'private'
  | 'userJoined'
  | 'userLeft';

// 消息接口
export interface Message {
  id: string;
  type: MessageType;
  text?: string;
  message?: string;
  timestamp: string;
  clientId?: string;
  fromClientId?: string;
  fromUserId?: string;
  fromUserNickname?: string;
  toUserId?: string;
  toUserNickname?: string;
  count?: number;
  isSent?: boolean;
  user?: User;
}

// 聊天目标类型
export type ChatTarget = 'public' | User;

// 消息标签配置
export interface MessageTagConfig {
  color: string;
  text: string;
}

// 消息标签配置映射
export type MessageTagConfigMap = Record<MessageType, MessageTagConfig>;
