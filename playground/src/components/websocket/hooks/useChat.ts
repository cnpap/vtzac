import { useState, useCallback } from 'react';
import type { User, Message, ChatTarget } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentChatTarget, setCurrentChatTarget] =
    useState<ChatTarget>('public');
  const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [joinedChat, setJoinedChat] = useState(false);

  // 添加消息到列表
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // 添加私聊消息
  const addPrivateMessage = useCallback((userId: string, message: Message) => {
    setPrivateChats(prev => {
      const newChats = new Map(prev);
      const userMessages = newChats.get(userId) || [];
      newChats.set(userId, [...userMessages, message]);
      return newChats;
    });
  }, []);

  // 更新在线用户
  const updateOnlineUsers = useCallback(
    (data: { users: User[]; count: number }) => {
      setOnlineUsers(data.users);
      setOnlineCount(data.count);
    },
    []
  );

  // 用户加入处理
  const handleUserJoined = useCallback(
    (_data: { user: User; timestamp: string }) => {
      // 在线用户列表会通过 onlineUsers 事件更新，这里只需要处理其他逻辑
      console.log(_data);
    },
    []
  );

  // 用户离开处理
  const handleUserLeft = useCallback(
    (_data: { user: User; timestamp: string }) => {
      // 在线用户列表会通过 onlineUsers 事件更新，这里只需要处理其他逻辑
      console.log(_data);
    },
    []
  );

  // 加入聊天成功处理
  const handleJoinedChat = useCallback((user: User) => {
    setCurrentUser(user);
    setJoinedChat(true);
  }, []);

  // 获取当前显示的消息列表
  const getCurrentMessages = useCallback((): Message[] => {
    if (currentChatTarget === 'public') {
      return messages.filter(msg =>
        [
          'connected',
          'error',
          'pong',
          'onlineCount',
          'public',
          'userJoined',
          'userLeft',
        ].includes(msg.type)
      );
    } else if (typeof currentChatTarget === 'object') {
      return privateChats.get(currentChatTarget.id) || [];
    }
    return [];
  }, [currentChatTarget, messages, privateChats]);

  // 清空消息
  const clearMessages = useCallback(() => {
    if (currentChatTarget === 'public') {
      setMessages([]);
    } else if (typeof currentChatTarget === 'object') {
      setPrivateChats(prev => {
        const newChats = new Map(prev);
        newChats.delete(currentChatTarget.id);
        return newChats;
      });
    }
  }, [currentChatTarget]);

  // 开始私聊
  const startPrivateChat = useCallback((user: User) => {
    setCurrentChatTarget(user);
  }, []);

  // 切换到公共频道
  const switchToPublicChat = useCallback(() => {
    setCurrentChatTarget('public');
  }, []);

  // 重置聊天状态（断开连接时使用）
  const resetChatState = useCallback(() => {
    setJoinedChat(false);
    setCurrentUser(null);
    setOnlineUsers([]);
    setOnlineCount(0);
    setCurrentChatTarget('public');
    setPrivateChats(new Map());
  }, []);

  return {
    // 状态
    messages,
    onlineUsers,
    onlineCount,
    currentUser,
    currentChatTarget,
    privateChats,
    joinedChat,

    // 方法
    addMessage,
    addPrivateMessage,
    updateOnlineUsers,
    handleUserJoined,
    handleUserLeft,
    handleJoinedChat,
    getCurrentMessages,
    clearMessages,
    startPrivateChat,
    switchToPublicChat,
    resetChatState,

    // 设置方法
    setCurrentUser,
    setCurrentChatTarget,
  };
};
