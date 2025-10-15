import { Tag } from 'antd';
import type { MessageType, MessageTagConfigMap } from './types';

// 消息类型标签配置
export const MESSAGE_TAG_CONFIG: MessageTagConfigMap = {
  connected: { color: 'green', text: '系统' },
  reply: { color: 'blue', text: '回复' },
  system: { color: 'green', text: '系统' },
  broadcast: { color: 'orange', text: '广播' },
  pong: { color: 'purple', text: '心跳' },
  onlineCount: { color: 'cyan', text: '在线数' },
  error: { color: 'red', text: '错误' },
  sent: { color: 'blue', text: '已发送' },
  public: { color: 'blue', text: '公共' },
  private: { color: 'purple', text: '私聊' },
  userJoined: { color: 'green', text: '加入' },
  userLeft: { color: 'orange', text: '离开' },
};

// 渲染消息类型标签
export const renderMessageTag = (type: MessageType) => {
  const config = MESSAGE_TAG_CONFIG[type] || {
    color: 'default',
    text: type,
  };

  return (
    <Tag color={config.color} style={{ fontSize: '11px' }}>
      {config.text}
    </Tag>
  );
};

// 格式化时间戳
export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString();
};

// 生成头像文本
export const getAvatarText = (nickname?: string, fallback = 'U'): string => {
  return (nickname?.[0] || fallback).toUpperCase();
};

// 判断是否为系统消息
export const isSystemMessage = (type: MessageType): boolean => {
  return [
    'connected',
    'error',
    'onlineCount',
    'pong',
    'userJoined',
    'userLeft',
  ].includes(type);
};

// 滚动到底部的工具函数
export const scrollToBottom = (element: HTMLElement | null) => {
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }
};

// 使用 requestAnimationFrame 确保 DOM 更新后滚动
export const scrollToBottomSmooth = (element: HTMLElement | null) => {
  requestAnimationFrame(() => {
    scrollToBottom(element);
  });
};
