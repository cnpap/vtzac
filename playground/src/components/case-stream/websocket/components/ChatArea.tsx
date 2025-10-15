import React, { useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Empty,
  Divider,
  Badge,
  Tooltip,
} from 'antd';
import {
  SendOutlined,
  MessageOutlined,
  GlobalOutlined,
  UserOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { Message, User, ChatTarget } from '../types';
import type { LoadingState } from '../../../../types';
import { ChatMessage } from './ChatMessage';
import { scrollToBottomSmooth } from '../utils';

const { TextArea } = Input;

interface ChatAreaProps {
  messages: Message[];
  currentUser: User | null;
  currentChatTarget: ChatTarget;
  inputMessage: string;
  loading: LoadingState;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onPublicChat: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  currentChatTarget,
  inputMessage,
  loading,
  onInputChange,
  onSendMessage,
  onPublicChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottomSmooth(messagesEndRef.current);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const getChatTitle = () => {
    if (currentChatTarget === 'public') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GlobalOutlined style={{ color: '#52c41a' }} />
          <span>公共频道</span>
          <Badge
            count={messages.filter(m => m.type === 'public').length}
            style={{ backgroundColor: '#52c41a' }}
          />
        </div>
      );
    } else if (typeof currentChatTarget === 'object') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>与 {currentChatTarget.nickname} 的私聊</span>
          <Badge
            count={
              messages.filter(
                m =>
                  m.type === 'private' &&
                  (m.fromUserId === currentChatTarget.id ||
                    m.toUserId === currentChatTarget.id)
              ).length
            }
            style={{ backgroundColor: '#1890ff' }}
          />
          <Tooltip title="返回公共频道">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onPublicChat}
              style={{ marginLeft: 'auto' }}
            />
          </Tooltip>
        </div>
      );
    }
    return '聊天';
  };

  const getPlaceholder = () => {
    if (currentChatTarget === 'public') {
      return '在公共频道发送消息...';
    } else if (typeof currentChatTarget === 'object') {
      return `向 ${currentChatTarget.nickname} 发送私信...`;
    }
    return '输入消息...';
  };

  const filteredMessages = messages.filter(message => {
    if (currentChatTarget === 'public') {
      return (
        message.type === 'public' ||
        message.type === 'system' ||
        message.type === 'userJoined' ||
        message.type === 'userLeft' ||
        message.type === 'onlineCount'
      );
    } else if (typeof currentChatTarget === 'object') {
      return (
        message.type === 'private' &&
        ((message.fromUserId === currentUser?.id &&
          message.toUserId === currentChatTarget.id) ||
          (message.fromUserId === currentChatTarget.id &&
            message.toUserId === currentUser?.id))
      );
    }
    return false;
  });

  return (
    <Card
      title={getChatTitle()}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        borderRadius: '8px',
      }}
      styles={{
        header: {
          borderBottom: '1px solid #f0f0f0',
        },
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        },
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          margin: '1px 0 0 0',
          backgroundColor: '#fafafa',
        }}
      >
        {filteredMessages.length === 0 ? (
          <Empty
            description={
              currentChatTarget === 'public'
                ? '暂无公共消息'
                : typeof currentChatTarget === 'object'
                  ? `与 ${currentChatTarget.nickname} 暂无私聊记录`
                  : '暂无消息'
            }
            style={{
              marginTop: '100px',
            }}
          />
        ) : (
          filteredMessages.map((message, index) => (
            <ChatMessage
              key={`${message.timestamp}-${index}`}
              message={message}
              currentUser={currentUser}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: 0 }} />

      <div style={{ padding: '16px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={inputMessage}
            onChange={e => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              resize: 'none',
              borderRadius: '8px 0 0 8px',
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSendMessage}
            loading={loading.send}
            disabled={!inputMessage.trim()}
            style={{
              height: 'auto',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '32px',
            }}
          >
            发送
          </Button>
        </Space.Compact>

        <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
          <MessageOutlined style={{ marginRight: 4 }} />按 Enter 发送，Shift +
          Enter 换行
        </div>
      </div>
    </Card>
  );
};
