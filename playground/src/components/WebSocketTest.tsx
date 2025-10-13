import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Badge,
  Divider,
  Tag,
  Avatar,
  List,
  Modal,
  Tooltip,
  notification,
} from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SendOutlined,
  ClearOutlined,
  HeartOutlined,
  TeamOutlined,
  UserOutlined,
  MessageOutlined,
  GlobalOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 用户信息接口
interface User {
  id: string;
  nickname: string;
  avatar?: string;
  joinTime: string;
  lastActive: string;
}

// 聊天消息接口
interface ChatMessage {
  id: string;
  type: 'public' | 'private';
  text: string;
  fromUserId: string;
  fromUserNickname: string;
  toUserId?: string;
  toUserNickname?: string;
  timestamp: string;
}

interface Message {
  id: string;
  type:
    | 'connected'
    | 'reply'
    | 'broadcast'
    | 'pong'
    | 'onlineCount'
    | 'error'
    | 'sent'
    | 'public'
    | 'private'
    | 'userJoined'
    | 'userLeft';
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

import type { TestComponentProps, LoadingState } from '../types';

export function WebSocketTest({ loading, setLoading }: TestComponentProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentChatTarget, setCurrentChatTarget] = useState<'public' | User>(
    'public'
  );
  const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [joinedChat, setJoinedChat] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 强制滚动到最新消息
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  // 每当消息更新时，自动滚动到底部
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 更新完成后再滚动
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]);

  // 连接 WebSocket
  const connectWebSocket = () => {
    if (socketRef.current) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, connect: true }));

    try {
      const newSocket = io('http://localhost:3000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        setConnected(true);
        setSocket(newSocket);
        socketRef.current = newSocket;
        setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
        addMessage({
          id: Date.now().toString(),
          type: 'connected',
          message: '已连接到服务器，请设置昵称加入聊天',
          timestamp: new Date().toISOString(),
        });
        setShowNicknameModal(true);
      });

      newSocket.on('connected', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'connected',
          ...data,
        });
      });

      // 加入聊天成功
      newSocket.on('joinedChat', data => {
        setCurrentUser(data.user);
        setJoinedChat(true);
        addMessage({
          id: Date.now().toString(),
          type: 'connected',
          message: `欢迎 ${data.user.nickname} 加入聊天！`,
          timestamp: data.timestamp,
        });
        setShowNicknameModal(false);
      });

      // 公共频道消息
      newSocket.on('publicMessage', (data: ChatMessage) => {
        addMessage({
          id: data.id,
          type: 'public',
          text: data.text,
          fromUserId: data.fromUserId,
          fromUserNickname: data.fromUserNickname,
          timestamp: data.timestamp,
          isSent: data.fromUserId === newSocket.id, // 标记是否为自己发送的消息
        });
      });

      // 私聊消息（接收）
      newSocket.on('privateMessage', (data: ChatMessage) => {
        addPrivateMessage(data.fromUserId, {
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
      newSocket.on('privateMessageSent', (data: ChatMessage) => {
        addPrivateMessage(data.toUserId!, {
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
      newSocket.on('onlineUsers', data => {
        setOnlineUsers(data.users);
        setOnlineCount(data.count);
      });

      // 用户加入
      newSocket.on('userJoined', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'userJoined',
          message: `${data.user.nickname} 加入了聊天`,
          timestamp: data.timestamp,
          user: data.user,
        });
      });

      // 用户离开
      newSocket.on('userLeft', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'userLeft',
          message: `${data.user.nickname} 离开了聊天`,
          timestamp: data.timestamp,
          user: data.user,
        });
      });

      newSocket.on('pong', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'pong',
          ...data,
        });
      });

      newSocket.on('onlineCount', data => {
        setOnlineCount(data.count);
        addMessage({
          id: Date.now().toString(),
          type: 'onlineCount',
          ...data,
        });
      });

      newSocket.on('error', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'error',
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        setSocket(null);
        socketRef.current = null;
        setJoinedChat(false);
        setCurrentUser(null);
        setOnlineUsers([]);
        addMessage({
          id: Date.now().toString(),
          type: 'error',
          message: '连接已断开',
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('connect_error', error => {
        setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
        addMessage({
          id: Date.now().toString(),
          type: 'error',
          message: `连接错误: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      setLoading((prev: LoadingState) => ({ ...prev, connect: false }));
      addMessage({
        id: Date.now().toString(),
        type: 'error',
        message: `连接失败: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // 断开连接
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  };

  // 加入聊天
  const joinChat = () => {
    if (!socket || !nickname.trim()) {
      return;
    }

    socket.emit('joinChat', { nickname: nickname.trim() });
  };

  // 发送公共消息
  const sendPublicMessage = () => {
    if (!socket || !inputMessage.trim() || !joinedChat) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, send: true }));

    socket.emit('publicMessage', { text: inputMessage });
    setInputMessage('');
    setLoading((prev: LoadingState) => ({ ...prev, send: false }));
  };

  // 发送私聊消息
  const sendPrivateMessage = () => {
    if (
      !socket ||
      !inputMessage.trim() ||
      typeof currentChatTarget !== 'object' ||
      !joinedChat
    ) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, send: true }));

    socket.emit('privateMessage', {
      text: inputMessage,
      toUserId: currentChatTarget.id,
    });

    setInputMessage('');
    setLoading((prev: LoadingState) => ({ ...prev, send: false }));
  };

  // 发送消息（根据当前聊天目标）
  const sendMessage = () => {
    if (currentChatTarget === 'public') {
      sendPublicMessage();
    } else if (typeof currentChatTarget === 'object') {
      sendPrivateMessage();
    }
  };

  // 发送心跳
  const sendPing = () => {
    if (!socket) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, ping: true }));
    socket.emit('ping');
    setLoading((prev: LoadingState) => ({ ...prev, ping: false }));
  };

  // 获取在线人数
  const getOnlineCount = () => {
    if (!socket) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, count: true }));
    socket.emit('getOnlineCount');
    setLoading((prev: LoadingState) => ({ ...prev, count: false }));
  };

  // 添加消息到列表
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // 添加私聊消息
  const addPrivateMessage = (userId: string, message: Message) => {
    setPrivateChats(prev => {
      const newChats = new Map(prev);
      const userMessages = newChats.get(userId) || [];
      newChats.set(userId, [...userMessages, message]);
      return newChats;
    });
  };

  // 获取当前显示的消息列表
  const getCurrentMessages = (): Message[] => {
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
  };

  // 清空消息
  const clearMessages = () => {
    if (currentChatTarget === 'public') {
      setMessages([]);
    } else if (typeof currentChatTarget === 'object') {
      setPrivateChats(prev => {
        const newChats = new Map(prev);
        newChats.delete(currentChatTarget.id);
        return newChats;
      });
    }
  };

  // 开始私聊
  const handlePrivateChat = (user: User) => {
    setCurrentChatTarget(user);
  };

  // 渲染消息类型标签
  const renderMessageTag = (type: string) => {
    const tagConfig = {
      connected: { color: 'green', text: '系统' },
      reply: { color: 'blue', text: '回复' },
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

    const config = tagConfig[type as keyof typeof tagConfig] || {
      color: 'default',
      text: type,
    };
    return (
      <Tag color={config.color} style={{ fontSize: '11px' }}>
        {config.text}
      </Tag>
    );
  };

  // 渲染聊天消息
  const renderChatMessage = (message: Message) => {
    const isUserMessage =
      message.isSent || (currentUser && message.fromUserId === currentUser.id);
    const isSystemMessage = [
      'connected',
      'error',
      'onlineCount',
      'pong',
      'userJoined',
      'userLeft',
    ].includes(message.type);

    if (isSystemMessage) {
      return (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '6px 16px',
              borderRadius: '16px',
              fontSize: '12px',
              color: '#666',
              border: '1px solid #e9ecef',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {renderMessageTag(message.type)}
            <span style={{ marginLeft: 6 }}>
              {message.text || message.message}
              {message.count && ` 在线人数: ${message.count}`}
            </span>
          </div>
        </div>
      );
    }

    // 显示发送者昵称（非用户自己的消息）
    const showSenderName = !isUserMessage && message.fromUserNickname;
    const avatarText = isUserMessage
      ? (currentUser?.nickname?.[0] || 'U').toUpperCase()
      : (message.fromUserNickname?.[0] || 'G').toUpperCase();

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
          marginBottom: 16,
          alignItems: 'flex-start',
        }}
      >
        {!isUserMessage && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginRight: 10,
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(24,144,255,0.3)',
            }}
          >
            {avatarText}
          </div>
        )}
        <div
          style={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUserMessage ? 'flex-end' : 'flex-start',
          }}
        >
          {showSenderName && (
            <div
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              {message.fromUserNickname}
            </div>
          )}
          <div
            style={{
              background: isUserMessage
                ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                : 'white',
              color: isUserMessage ? 'white' : '#333',
              padding: '12px 16px',
              borderRadius: isUserMessage
                ? '20px 20px 6px 20px'
                : '20px 20px 20px 6px',
              wordBreak: 'break-word',
              lineHeight: '1.5',
              boxShadow: isUserMessage
                ? '0 2px 8px rgba(24,144,255,0.3)'
                : '0 2px 8px rgba(0,0,0,0.1)',
              border: isUserMessage ? 'none' : '1px solid #e8e8e8',
              position: 'relative',
            }}
          >
            {message.text || message.message}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#999',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {renderMessageTag(message.type)}
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.type === 'private' && message.toUserNickname && (
              <span style={{ color: '#1890ff', fontWeight: 500 }}>
                → {message.toUserNickname}
              </span>
            )}
          </div>
        </div>
        {isUserMessage && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#52c41a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: 10,
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(82,196,26,0.3)',
            }}
          >
            {avatarText}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
          display: 'flex',
          gap: '20px',
        }}
      >
        {/* 左侧控制面板 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WifiOutlined />
              连接控制
            </div>
          }
          style={{
            width: '280px',
            height: 'fit-content',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 用户信息 */}
            {currentUser && (
              <div
                style={{
                  padding: '12px',
                  background: '#f6f8fa',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  size="large"
                  style={{ backgroundColor: '#52c41a', marginBottom: 8 }}
                />
                <div style={{ fontWeight: 'bold' }}>{currentUser.nickname}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(currentUser.joinTime).toLocaleTimeString()} 加入
                </div>
              </div>
            )}

            {/* 连接状态 */}
            <div
              style={{
                padding: '12px',
                backgroundColor: connected
                  ? joinedChat
                    ? '#f6ffed'
                    : '#e6f7ff'
                  : '#fafafa',
                borderRadius: '6px',
                border: `1px solid ${connected ? (joinedChat ? '#b7eb8f' : '#91d5ff') : '#d9d9d9'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: connected
                      ? joinedChat
                        ? '#52c41a'
                        : '#1890ff'
                      : '#d9d9d9',
                  }}
                />
                <Text strong>
                  {connected
                    ? joinedChat
                      ? '已加入聊天'
                      : '已连接'
                    : '未连接'}
                </Text>
              </div>
              {onlineCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  <Text>在线用户: {onlineCount}</Text>
                </div>
              )}
            </div>

            {/* 连接控制按钮 */}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type={connected ? 'default' : 'primary'}
                icon={connected ? <DisconnectOutlined /> : <WifiOutlined />}
                onClick={connected ? disconnectWebSocket : connectWebSocket}
                loading={loading.connect}
                danger={connected}
                block
                style={{
                  height: '40px',
                  borderRadius: '6px',
                  fontWeight: '500',
                }}
              >
                {connected ? '断开连接' : '连接服务器'}
              </Button>
              {connected && !joinedChat && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setShowNicknameModal(true)}
                  block
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    fontWeight: '500',
                  }}
                >
                  设置昵称
                </Button>
              )}
            </Space>

            <Divider />

            {/* 功能按钮 */}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                icon={<HeartOutlined />}
                onClick={sendPing}
                loading={loading.ping}
                disabled={!connected}
                block
              >
                心跳检测
              </Button>
              <Button
                icon={<TeamOutlined />}
                onClick={getOnlineCount}
                loading={loading.count}
                disabled={!connected}
                block
              >
                获取在线数
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={clearMessages}
                disabled={getCurrentMessages().length === 0}
                block
              >
                清空消息
              </Button>
            </Space>
          </Space>
        </Card>

        {/* 在线用户列表 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TeamOutlined />
              在线用户列表
              <Badge
                count={onlineUsers.length}
                style={{ backgroundColor: '#52c41a' }}
              />
            </div>
          }
          style={{
            width: '280px',
            height: 'fit-content',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <List
            dataSource={[
              // 公共频道作为第一项
              {
                id: 'public',
                nickname: '公共频道',
                joinTime: '',
                lastActive: '',
                isPublic: true,
              },
              // 其他在线用户（排除当前用户）
              ...onlineUsers.filter(user => user.id !== currentUser?.id),
            ]}
            renderItem={item => (
              <List.Item
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  margin: '4px 0',
                  transition: 'all 0.3s ease',
                  border:
                    (item.id === 'public' && currentChatTarget === 'public') ||
                    (typeof currentChatTarget === 'object' &&
                      currentChatTarget.id === item.id)
                      ? '2px solid #1890ff'
                      : '1px solid transparent',
                  backgroundColor:
                    (item.id === 'public' && currentChatTarget === 'public') ||
                    (typeof currentChatTarget === 'object' &&
                      currentChatTarget.id === item.id)
                      ? '#f0f9ff'
                      : 'white',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(24,144,255,0.15)';
                }}
                onMouseLeave={e => {
                  const isSelected =
                    (item.id === 'public' && currentChatTarget === 'public') ||
                    (typeof currentChatTarget === 'object' &&
                      currentChatTarget.id === item.id);
                  e.currentTarget.style.backgroundColor = isSelected
                    ? '#f0f9ff'
                    : 'white';
                  e.currentTarget.style.borderColor = isSelected
                    ? '#1890ff'
                    : 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isSelected
                    ? '0 4px 12px rgba(24,144,255,0.15)'
                    : 'none';
                }}
                onClick={() => {
                  if (item.id === 'public') {
                    setCurrentChatTarget('public');
                    notification.success({
                      message: '已切换到公共频道',
                      description: '现在可以在公共频道聊天了',
                      duration: 2,
                    });
                  } else {
                    handlePrivateChat(item as User);
                    notification.success({
                      message: '私聊已开启',
                      description: `已切换到与 ${item.nickname} 的私聊`,
                      duration: 2,
                    });
                  }
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor:
                          item.id === 'public' ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '2px solid white',
                      }}
                    >
                      {item.id === 'public' ? (
                        <GlobalOutlined />
                      ) : (
                        item.nickname[0].toUpperCase()
                      )}
                    </div>
                  }
                  title={
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#333',
                        }}
                      >
                        {item.nickname}
                      </span>
                      <Tooltip
                        title={
                          item.id === 'public' ? '点击进入公共频道' : '点击私聊'
                        }
                      >
                        {item.id === 'public' ? (
                          <GlobalOutlined
                            style={{
                              fontSize: '14px',
                              color: '#52c41a',
                              transition: 'transform 0.2s',
                            }}
                          />
                        ) : (
                          <MessageOutlined
                            style={{
                              fontSize: '14px',
                              color: '#1890ff',
                              transition: 'transform 0.2s',
                            }}
                          />
                        )}
                      </Tooltip>
                    </div>
                  }
                  description={
                    item.id === 'public' ? (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#52c41a',
                            }}
                          />
                          <span>公共聊天频道</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>
                            加入时间:{' '}
                            {new Date(item.joinTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#52c41a',
                            }}
                          />
                          <span>在线活跃</span>
                        </div>
                      </div>
                    )
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: '暂无在线用户' }}
          />
        </Card>

        {/* 右侧聊天区域 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={4} style={{ margin: 0 }}>
                {currentChatTarget === 'public'
                  ? '公共频道'
                  : typeof currentChatTarget === 'object'
                    ? `与 ${currentChatTarget.nickname} 私聊`
                    : 'WebSocket 聊天'}
              </Title>
              <Badge status={connected ? 'processing' : 'default'} />
              <Text type="secondary">
                {connected ? (joinedChat ? '已加入聊天' : '已连接') : '未连接'}
              </Text>
            </div>
          }
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          styles={{
            body: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              minHeight: 0,
            },
          }}
        >
          {/* 消息列表 */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              background: '#fafafa',
              minHeight: '300px',
              maxHeight: '500px',
            }}
          >
            {!joinedChat ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  marginTop: '50px',
                  fontSize: '14px',
                }}
              >
                请先连接服务器并设置昵称加入聊天
              </div>
            ) : getCurrentMessages().length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  marginTop: '50px',
                  fontSize: '14px',
                }}
              >
                {currentChatTarget === 'public'
                  ? '暂无消息，开始聊天吧...'
                  : typeof currentChatTarget === 'object'
                    ? `与 ${currentChatTarget.nickname} 的私聊，开始对话吧...`
                    : '请选择一个聊天对象'}
              </div>
            ) : (
              <>
                {getCurrentMessages().map(message => (
                  <div key={message.id}>{renderChatMessage(message)}</div>
                ))}
                <div ref={messagesEndRef} style={{ height: '1px' }} />
              </>
            )}
          </div>

          {/* 输入区域 */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              background: 'white',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={
                  !joinedChat
                    ? '请先加入聊天...'
                    : currentChatTarget === 'public'
                      ? '输入公共消息...'
                      : typeof currentChatTarget === 'object'
                        ? `给 ${currentChatTarget.nickname} 发私信...`
                        : '请选择聊天对象...'
                }
                rows={2}
                disabled={!joinedChat}
                style={{ flex: 1 }}
                onPressEnter={e => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  sendMessage();
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={loading.send}
                disabled={!joinedChat || !inputMessage.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                发送
              </Button>
            </div>
            <div style={{ marginTop: 4, fontSize: '12px', color: '#999' }}>
              按 Enter 发送，Shift+Enter 换行
              {typeof currentChatTarget === 'object' && (
                <span style={{ marginLeft: 8 }}>
                  当前私聊对象: {currentChatTarget.nickname}
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 昵称设置模态框 */}
      <Modal
        title="设置昵称"
        open={showNicknameModal}
        onOk={joinChat}
        onCancel={() => {
          if (!joinedChat) {
            setShowNicknameModal(false);
            disconnectWebSocket();
          }
        }}
        okText="加入聊天"
        cancelText="取消"
        okButtonProps={{ disabled: !nickname.trim() }}
        closable={joinedChat}
        maskClosable={joinedChat}
      >
        <div style={{ margin: '20px 0' }}>
          <Input
            placeholder="请输入您的昵称"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onPressEnter={joinChat}
            maxLength={20}
            showCount
          />
          <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
            昵称将作为您在聊天室中的显示名称
          </div>
        </div>
      </Modal>
    </>
  );
}
