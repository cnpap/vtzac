import React from 'react';
import { Card, Button, Space, Typography, Divider, Avatar } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  HeartOutlined,
  TeamOutlined,
  UserOutlined,
  ClearOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { User } from '../types';
import type { LoadingState } from '../../../types';

const { Text } = Typography;

interface ConnectionPanelProps {
  connected: boolean;
  joinedChat: boolean;
  currentUser: User | null;
  onlineCount: number;
  loading: LoadingState;
  onConnect: () => void;
  onDisconnect: () => void;
  onSetNickname: () => void;
  onSendPing: () => void;
  onGetOnlineCount: () => void;
  onClearMessages: () => void;
  hasMessages: boolean;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  connected,
  joinedChat,
  currentUser,
  onlineCount,
  loading,
  onConnect,
  onDisconnect,
  onSetNickname,
  onSendPing,
  onGetOnlineCount,
  onClearMessages,
  hasMessages,
}) => {
  return (
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
              {connected ? (joinedChat ? '已加入聊天' : '已连接') : '未连接'}
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
            onClick={connected ? onDisconnect : onConnect}
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
          {connected && (
            <Button
              type={joinedChat ? 'default' : 'primary'}
              icon={<EditOutlined />}
              onClick={onSetNickname}
              block
              style={{
                height: '40px',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              {joinedChat ? '修改昵称' : '设置昵称'}
            </Button>
          )}
        </Space>

        <Divider />

        {/* 功能按钮 */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            icon={<HeartOutlined />}
            onClick={onSendPing}
            loading={loading.ping}
            disabled={!connected}
            block
          >
            心跳检测
          </Button>
          <Button
            icon={<TeamOutlined />}
            onClick={onGetOnlineCount}
            loading={loading.count}
            disabled={!connected}
            block
          >
            获取在线数
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={onClearMessages}
            disabled={!hasMessages}
            block
          >
            清空消息
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
