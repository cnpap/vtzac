import { useState, useRef, useCallback } from 'react';
import { notification } from 'antd';
import { io, Socket } from 'socket.io-client';
import type {
  User,
  Message,
  ChatMessageType,
  WebSocketEventData,
} from '../types';
import type { LoadingState } from '../../../types';

interface UseWebSocketProps {
  loading: LoadingState;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  onMessage: (message: Message) => void;
  onPrivateMessage: (userId: string, message: Message) => void;
  onUserUpdate: (data: { users: User[]; count: number }) => void;
  onUserJoined: (data: { user: User; timestamp: string }) => void;
  onUserLeft: (data: { user: User; timestamp: string }) => void;
  onJoinedChat: (user: User) => void;
}

export const useWebSocket = ({
  setLoading,
  onMessage,
  onPrivateMessage,
  onUserUpdate,
  onUserJoined,
  onUserLeft,
  onJoinedChat,
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // 连接 WebSocket
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, connect: true }));

    try {
      const newSocket = io('http://localhost:3001', {
        transports: ['websocket'],
      });

      // 连接成功
      newSocket.on('connect', () => {
        setConnected(true);
        setSocket(newSocket);
        socketRef.current = newSocket;
        setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
        onMessage({
          id: Date.now().toString(),
          type: 'connected',
          message: '已连接到服务器，请设置昵称加入聊天',
          timestamp: new Date().toISOString(),
        });
      });

      // 服务器确认连接
      newSocket.on('connected', (data: WebSocketEventData['connected']) => {
        onMessage({
          id: Date.now().toString(),
          type: 'connected',
          ...data!,
        });
      });

      // 加入聊天成功
      newSocket.on('joinedChat', (data: WebSocketEventData['joinedChat']) => {
        if (data) {
          onJoinedChat(data.user);
          onMessage({
            id: Date.now().toString(),
            type: 'connected',
            message: `欢迎 ${data.user.nickname} 加入聊天！`,
            timestamp: data.timestamp,
          });
        }
      });

      // 公共频道消息
      newSocket.on('publicMessage', (data: ChatMessageType) => {
        onMessage({
          id: data.id,
          type: 'public',
          text: data.text,
          fromUserId: data.fromUserId,
          fromUserNickname: data.fromUserNickname,
          timestamp: data.timestamp,
          isSent: data.fromUserId === newSocket.id,
        });
      });

      // 私聊消息（接收）
      newSocket.on('privateMessage', (data: ChatMessageType) => {
        onPrivateMessage(data.fromUserId, {
          id: data.id,
          type: 'private',
          text: data.text,
          fromUserId: data.fromUserId,
          fromUserNickname: data.fromUserNickname,
          toUserId: data.toUserId,
          toUserNickname: data.toUserNickname,
          timestamp: data.timestamp,
        });

        // 显示通知
        notification.info({
          message: '新私聊消息',
          description: `${data.fromUserNickname}: ${data.text}`,
          placement: 'topRight',
        });
      });

      // 私聊消息（发送确认）
      newSocket.on('privateMessageSent', (data: ChatMessageType) => {
        onPrivateMessage(data.toUserId!, {
          id: data.id,
          type: 'private',
          text: data.text,
          fromUserId: data.fromUserId,
          fromUserNickname: data.fromUserNickname,
          toUserId: data.toUserId,
          toUserNickname: data.toUserNickname,
          timestamp: data.timestamp,
          isSent: true,
        });
      });

      // 在线用户列表更新
      newSocket.on('onlineUsers', (data: WebSocketEventData['onlineUsers']) => {
        if (data) {
          onUserUpdate(data);
        }
      });

      // 用户加入
      newSocket.on('userJoined', (data: WebSocketEventData['userJoined']) => {
        if (data) {
          onUserJoined(data);
          onMessage({
            id: Date.now().toString(),
            type: 'userJoined',
            message: `${data.user.nickname} 加入了聊天`,
            timestamp: data.timestamp,
            user: data.user,
          });
        }
      });

      // 用户离开
      newSocket.on('userLeft', (data: WebSocketEventData['userLeft']) => {
        if (data) {
          onUserLeft(data);
          onMessage({
            id: Date.now().toString(),
            type: 'userLeft',
            message: `${data.user.nickname} 离开了聊天`,
            timestamp: data.timestamp,
            user: data.user,
          });
        }
      });

      // 心跳响应
      newSocket.on('pong', (data: WebSocketEventData['pong']) => {
        onMessage({
          id: Date.now().toString(),
          type: 'pong',
          ...data!,
        });
      });

      // 在线人数
      newSocket.on('onlineCount', (data: WebSocketEventData['onlineCount']) => {
        onMessage({
          id: Date.now().toString(),
          type: 'onlineCount',
          ...data!,
        });
      });

      // 错误处理
      newSocket.on('error', (data: WebSocketEventData['error']) => {
        onMessage({
          id: Date.now().toString(),
          type: 'error',
          message: data?.message || '未知错误',
          timestamp: new Date().toISOString(),
        });
      });

      // 连接断开
      newSocket.on('disconnect', () => {
        setConnected(false);
        setSocket(null);
        socketRef.current = null;
        onMessage({
          id: Date.now().toString(),
          type: 'error',
          message: '连接已断开',
          timestamp: new Date().toISOString(),
        });
      });

      // 连接错误
      newSocket.on('connect_error', error => {
        setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
        onMessage({
          id: Date.now().toString(),
          type: 'error',
          message: `连接错误: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
      onMessage({
        id: Date.now().toString(),
        type: 'error',
        message: `连接失败: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    setLoading,
    onMessage,
    onPrivateMessage,
    onUserUpdate,
    onUserJoined,
    onUserLeft,
    onJoinedChat,
  ]);

  // 断开连接
  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  }, []);

  // 发送心跳
  const sendPing = useCallback(() => {
    if (!socket) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, ping: true }));
    socket.emit('ping');
    setLoading((prev: LoadingState) => ({ ...prev, ping: false }));
  }, [socket, setLoading]);

  // 获取在线人数
  const getOnlineCount = useCallback(() => {
    if (!socket) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, count: true }));
    socket.emit('getOnlineCount');
    setLoading((prev: LoadingState) => ({ ...prev, count: false }));
  }, [socket, setLoading]);

  // 加入聊天
  const joinChat = useCallback(
    (nickname: string) => {
      if (!socket || !nickname.trim()) {
        return;
      }

      socket.emit('joinChat', { nickname: nickname.trim() });
    },
    [socket]
  );

  // 发送公共消息
  const sendPublicMessage = useCallback(
    (text: string) => {
      if (!socket || !text.trim()) {
        return;
      }

      setLoading((prev: LoadingState) => ({ ...prev, send: true }));
      socket.emit('publicMessage', { text });
      setLoading((prev: LoadingState) => ({ ...prev, send: false }));
    },
    [socket, setLoading]
  );

  // 发送私聊消息
  const sendPrivateMessage = useCallback(
    (text: string, toUserId: string) => {
      if (!socket || !text.trim() || !toUserId) {
        return;
      }

      setLoading((prev: LoadingState) => ({ ...prev, send: true }));
      socket.emit('privateMessage', { text, toUserId });
      setLoading((prev: LoadingState) => ({ ...prev, send: false }));
    },
    [socket, setLoading]
  );

  return {
    socket,
    connected,
    connectWebSocket,
    disconnectWebSocket,
    sendPing,
    getOnlineCount,
    joinChat,
    sendPublicMessage,
    sendPrivateMessage,
  };
};
