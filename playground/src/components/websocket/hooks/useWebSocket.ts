import { useState, useRef, useCallback } from 'react';
import { notification } from 'antd';
import { Socket } from 'socket.io-client';
import type { User, Message } from '../types';
import type { LoadingState } from '../../../types';
import { _socket } from 'vtzac/hook';
import { WebSocketTestGateway } from 'nestjs-example/src/websocket.gateway';
import { WebSocketEventEmitter } from 'nestjs-example/src/websocket.emitter';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emitterRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listenerRef = useRef<any>(null);

  // 连接 WebSocket
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, connect: true }));

    try {
      const { emitter, createListener, socket } = _socket(
        'http://localhost:3000',
        WebSocketTestGateway,
        {
          socketIoOptions: {
            transports: ['websocket'],
          },
        }
      );

      const listener = createListener(WebSocketEventEmitter);

      emitterRef.current = emitter;
      listenerRef.current = listener;

      // 连接成功
      socket.on('connect', () => {
        setConnected(true);
        setSocket(socket);
        socketRef.current = socket;
        setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
        onMessage({
          id: Date.now().toString(),
          type: 'connected',
          message: '已连接到服务器，请设置昵称加入聊天',
          timestamp: new Date().toISOString(),
        });
      });

      // 加入聊天成功
      listener.joinedChat(data => {
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
      listener.publicMessage(data => {
        onMessage({
          id: data.id,
          type: 'public',
          text: data.text,
          fromUserId: data.fromUserId,
          fromUserNickname: data.fromUserNickname,
          timestamp: data.timestamp,
          isSent: data.fromUserId === socket.id,
        });
      });

      // 私聊消息（接收）
      listener.privateMessage(data => {
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
      listener.privateMessageSent(data => {
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
      listener.onlineUsers(data => {
        if (data) {
          onUserUpdate(data);
        }
      });

      // 用户加入
      listener.userJoined(data => {
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
      listener.userLeft(data => {
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
      listener.pong(data => {
        onMessage({
          id: Date.now().toString(),
          type: 'pong',
          ...data!,
        });
      });

      // 在线人数
      listener.onlineCount(data => {
        onMessage({
          id: Date.now().toString(),
          type: 'onlineCount',
          ...data!,
        });
      });

      // 错误处理
      listener.error(data => {
        onMessage({
          id: Date.now().toString(),
          type: 'error',
          message: data?.message || '未知错误',
          timestamp: new Date().toISOString(),
        });
      });

      // 连接断开
      socket.on('disconnect', () => {
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
      socket.on('connect_error', error => {
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
    if (!socket || !emitterRef.current) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, ping: true }));
    emitterRef.current.handlePing();
    setLoading((prev: LoadingState) => ({ ...prev, ping: false }));
  }, [socket, setLoading]);

  // 获取在线人数
  const getOnlineCount = useCallback(() => {
    if (!socket || !emitterRef.current) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, count: true }));
    emitterRef.current.handleGetOnlineCount();
    setLoading((prev: LoadingState) => ({ ...prev, count: false }));
  }, [socket, setLoading]);

  // 加入聊天
  const joinChat = useCallback(
    (nickname: string) => {
      if (!socket || !nickname.trim() || !emitterRef.current) {
        return;
      }

      emitterRef.current.handleJoinChat({ nickname: nickname.trim() });
    },
    [socket]
  );

  // 发送公共消息
  const sendPublicMessage = useCallback(
    (text: string) => {
      if (!socket || !text.trim() || !emitterRef.current) {
        return;
      }

      setLoading((prev: LoadingState) => ({ ...prev, send: true }));
      emitterRef.current.handlePublicMessage({ text });
      setLoading((prev: LoadingState) => ({ ...prev, send: false }));
    },
    [socket, setLoading]
  );

  // 发送私聊消息
  const sendPrivateMessage = useCallback(
    (text: string, toUserId: string) => {
      if (!socket || !text.trim() || !toUserId || !emitterRef.current) {
        return;
      }

      setLoading((prev: LoadingState) => ({ ...prev, send: true }));
      emitterRef.current.handlePrivateMessage({ text, toUserId });
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
