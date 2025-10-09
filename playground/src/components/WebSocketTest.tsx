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
} from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SendOutlined,
  ClearOutlined,
  HeartOutlined,
  TeamOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  type:
    | 'connected'
    | 'reply'
    | 'broadcast'
    | 'pong'
    | 'onlineCount'
    | 'error'
    | 'sent';
  text?: string;
  message?: string;
  timestamp: string;
  clientId?: string;
  fromClientId?: string;
  count?: number;
  isSent?: boolean; // 标识是否为用户发送的消息
}

import type { TestComponentProps, LoadingState } from '../types';

export function WebSocketTest({ loading, setLoading }: TestComponentProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
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
      const newSocket = io('http://localhost:3001', {
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
          message: '已连接到服务器',
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('connected', data => {
        addMessage({
          id: Date.now().toString(),
          type: 'connected',
          ...data,
        });
      });

      newSocket.on('message', data => {
        addMessage({
          id: Date.now().toString(),
          type: data.type || 'reply',
          ...data,
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

      newSocket.on('disconnect', () => {
        setConnected(false);
        setSocket(null);
        socketRef.current = null;
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

  // 发送消息
  const sendMessage = () => {
    if (!socket || !inputMessage.trim()) {
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, send: true }));

    // 先添加用户发送的消息到界面
    addMessage({
      id: Date.now().toString(),
      type: 'sent',
      text: inputMessage,
      timestamp: new Date().toISOString(),
      isSent: true,
    });

    socket.emit('message', { text: inputMessage });
    setInputMessage('');
    setLoading((prev: LoadingState) => ({ ...prev, send: false }));
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

  // 清空消息
  const clearMessages = () => {
    setMessages([]);
  };

  // 组件挂载时自动连接，卸载时断开连接
  useEffect(() => {
    // 自动连接WebSocket服务器
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 渲染消息类型标签
  const renderMessageTag = (type: string) => {
    const tagConfig = {
      connected: { color: 'green', text: '连接' },
      reply: { color: 'blue', text: '回复' },
      broadcast: { color: 'orange', text: '广播' },
      pong: { color: 'purple', text: '心跳' },
      onlineCount: { color: 'cyan', text: '在线数' },
      error: { color: 'red', text: '错误' },
      sent: { color: 'blue', text: '已发送' },
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
    const isUserMessage = message.isSent || message.type === 'sent';
    const isSystemMessage = [
      'connected',
      'error',
      'onlineCount',
      'pong',
    ].includes(message.type);

    if (isSystemMessage) {
      return (
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#f0f0f0',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#666',
            }}
          >
            {renderMessageTag(message.type)}
            <span style={{ marginLeft: 4 }}>
              {message.text || message.message}
              {message.count !== undefined && ` 在线人数: ${message.count}`}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
          marginBottom: 12,
          alignItems: 'flex-start',
        }}
      >
        {!isUserMessage && (
          <Avatar
            icon={<RobotOutlined />}
            size="small"
            style={{ marginRight: 8, backgroundColor: '#1890ff' }}
          />
        )}
        <div
          style={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUserMessage ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              background: isUserMessage ? '#1890ff' : '#f0f0f0',
              color: isUserMessage ? 'white' : '#333',
              padding: '8px 12px',
              borderRadius: '12px',
              borderTopRightRadius: isUserMessage ? '4px' : '12px',
              borderTopLeftRadius: isUserMessage ? '12px' : '4px',
              wordBreak: 'break-word',
            }}
          >
            {message.text || message.message}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#999',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {!isSystemMessage && renderMessageTag(message.type)}
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
        {isUserMessage && (
          <Avatar
            icon={<UserOutlined />}
            size="small"
            style={{ marginLeft: 8, backgroundColor: '#52c41a' }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        display: 'flex',
        gap: '20px',
      }}
    >
      {/* 左侧控制面板 */}
      <Card title="连接控制" style={{ width: '300px', height: 'fit-content' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 连接状态 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Badge status={connected ? 'processing' : 'default'} />
              <Text strong>{connected ? '已连接' : '未连接'}</Text>
              {onlineCount > 0 && (
                <>
                  <Divider type="vertical" />
                  <TeamOutlined />
                  <Text>在线: {onlineCount}</Text>
                </>
              )}
            </div>
          </div>

          {/* 连接控制按钮 */}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<WifiOutlined />}
              onClick={connectWebSocket}
              loading={loading.connect}
              disabled={connected}
              block
            >
              连接服务器
            </Button>
            <Button
              icon={<DisconnectOutlined />}
              onClick={disconnectWebSocket}
              disabled={!connected}
              block
            >
              断开连接
            </Button>
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
              disabled={messages.length === 0}
              block
            >
              清空消息
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 右侧聊天区域 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={4} style={{ margin: 0 }}>
              WebSocket 聊天测试
            </Title>
            <Badge status={connected ? 'processing' : 'default'} />
            <Text type="secondary">{connected ? '已连接' : '未连接'}</Text>
          </div>
        }
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minHeight: 0,
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
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#999',
                marginTop: '50px',
                fontSize: '14px',
              }}
            >
              暂无消息，开始聊天吧...
            </div>
          ) : (
            <>
              {messages.map(message => (
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
              placeholder={connected ? '输入消息...' : '请先连接服务器'}
              rows={2}
              disabled={!connected}
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
              disabled={!connected || !inputMessage.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              发送
            </Button>
          </div>
          <div style={{ marginTop: 4, fontSize: '12px', color: '#999' }}>
            按 Enter 发送，Shift+Enter 换行
          </div>
        </div>
      </Card>
    </div>
  );
}
