import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import type { User } from './websocket/types';
import { useWebSocket, useChat } from './websocket/hooks';
import type { LoadingState } from '../types';
import {
  ConnectionPanel,
  OnlineUsersList,
  ChatArea,
  NicknameModal,
} from './websocket/components';

const WebSocketTestRefactored: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [defaultNickname, setDefaultNickname] = useState('');
  const [loading, setLoading] = useState<LoadingState>({
    connect: false,
    send: false,
    ping: false,
    count: false,
  });

  // 使用自定义hooks
  const {
    messages,
    onlineUsers,
    onlineCount,
    currentUser,
    currentChatTarget,
    joinedChat,
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
  } = useChat();

  // 获取当前聊天消息
  const chatMessages = getCurrentMessages();

  const {
    connected,
    connectWebSocket,
    disconnect,
    sendPing,
    getOnlineCount,
    joinChat,
    sendPublicMessage,
    sendPrivateMessage,
  } = useWebSocket({
    loading,
    setLoading,
    onMessage: addMessage,
    onPrivateMessage: addPrivateMessage,
    onUserUpdate: updateOnlineUsers,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onJoinedChat: handleJoinedChat,
  });

  // 生成默认昵称
  useEffect(() => {
    if (!defaultNickname) {
      const randomNum = Math.floor(Math.random() * 10000);
      setDefaultNickname(`用户${randomNum}`);
    }
  }, [defaultNickname]);

  // 监听连接状态，连接成功后自动加入聊天
  useEffect(() => {
    if (connected && !joinedChat && defaultNickname) {
      joinChat(defaultNickname);
    }
  }, [connected, joinedChat, defaultNickname, joinChat]);

  // 连接WebSocket
  const handleConnect = () => {
    connectWebSocket();
  };

  // 断开连接
  const handleDisconnect = () => {
    disconnect();
    resetChatState();
  };

  // 设置昵称
  const handleNicknameSubmit = (nickname: string) => {
    setShowNicknameModal(false);
    setDefaultNickname(nickname);

    notification.success({
      message: '昵称设置成功',
      description: `您的昵称已设置为: ${nickname}`,
      duration: 2,
    });

    // 如果已连接，重新加入聊天使用新昵称
    if (connected) {
      joinChat(nickname);
    }
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !connected || !currentUser) return;

    if (currentChatTarget === 'public') {
      sendPublicMessage(inputMessage.trim());
    } else if (typeof currentChatTarget === 'object') {
      sendPrivateMessage(inputMessage.trim(), currentChatTarget.id);
    }

    setInputMessage('');
  };

  // 开始私聊
  const handlePrivateChat = (user: User) => {
    startPrivateChat(user);
  };

  // 切换到公共频道
  const handlePublicChat = () => {
    switchToPublicChat();
  };

  // 清空消息
  const handleClearMessages = () => {
    clearMessages();
    notification.success({
      message: '消息已清空',
      description: '所有聊天记录已被清除',
      duration: 2,
    });
  };

  return (
    <>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px',
        }}
      >
        {/* 左侧控制面板 */}
        <ConnectionPanel
          connected={connected}
          currentUser={currentUser}
          onlineCount={onlineCount}
          joinedChat={joinedChat}
          loading={loading}
          onConnect={handleConnect}
          hasMessages={messages.length > 0}
          onDisconnect={handleDisconnect}
          onClearMessages={handleClearMessages}
          onSetNickname={() => setShowNicknameModal(true)}
          onSendPing={sendPing}
          onGetOnlineCount={getOnlineCount}
        />

        {/* 中间在线用户列表 */}
        <OnlineUsersList
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          currentChatTarget={currentChatTarget}
          onPrivateChat={handlePrivateChat}
          onPublicChat={handlePublicChat}
        />

        {/* 右侧聊天区域 */}
        <ChatArea
          messages={chatMessages}
          currentUser={currentUser}
          currentChatTarget={currentChatTarget}
          inputMessage={inputMessage}
          loading={loading}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          onPublicChat={handlePublicChat}
        />
      </div>

      {/* 昵称设置模态框 */}
      <NicknameModal
        visible={showNicknameModal}
        currentNickname={currentUser?.nickname || defaultNickname}
        onOk={handleNicknameSubmit}
        onCancel={() => setShowNicknameModal(false)}
      />
    </>
  );
};

export default WebSocketTestRefactored;
