import React from 'react';
import type { Message, User } from '../types';
import {
  renderMessageTag,
  formatTimestamp,
  getAvatarText,
  isSystemMessage,
} from '../utils';

interface ChatMessageProps {
  message: Message;
  currentUser: User | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
}) => {
  const isUserMessage =
    message.isSent || (currentUser && message.fromUserId === currentUser.id);
  const isSystemMsg = isSystemMessage(message.type);

  if (isSystemMsg) {
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
    ? getAvatarText(currentUser?.nickname, 'U')
    : getAvatarText(message.fromUserNickname, 'G');

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
          <span>{formatTimestamp(message.timestamp)}</span>
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
