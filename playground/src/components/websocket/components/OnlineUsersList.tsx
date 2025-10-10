import React from 'react';
import { Card, List, Badge, Tooltip, notification } from 'antd';
import {
  TeamOutlined,
  MessageOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { User, ChatTarget } from '../types';

interface OnlineUsersListProps {
  onlineUsers: User[];
  currentUser: User | null;
  currentChatTarget: ChatTarget;
  onPrivateChat: (user: User) => void;
  onPublicChat: () => void;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  onlineUsers,
  currentUser,
  currentChatTarget,
  onPrivateChat,
  onPublicChat,
}) => {
  const handleItemClick = (item: User | { id: 'public' }) => {
    if (item.id === 'public') {
      onPublicChat();
      notification.success({
        message: '已切换到公共频道',
        description: '现在可以在公共频道聊天了',
        duration: 2,
      });
    } else {
      onPrivateChat(item as User);
      notification.success({
        message: '私聊已开启',
        description: `已切换到与 ${(item as User).nickname} 的私聊`,
        duration: 2,
      });
    }
  };

  const isItemSelected = (item: User | { id: 'public' }) => {
    return (
      (item.id === 'public' && currentChatTarget === 'public') ||
      (typeof currentChatTarget === 'object' &&
        currentChatTarget.id === item.id)
    );
  };

  const getItemStyle = (item: User | { id: 'public' }, isHovered = false) => {
    const isSelected = isItemSelected(item);
    return {
      padding: '12px',
      cursor: 'pointer',
      borderRadius: '8px',
      margin: '8px 0',
      transition: 'all 0.3s ease',
      border: isSelected ? '2px solid #1890ff' : '2px solid transparent',
      backgroundColor: isSelected || isHovered ? '#f0f9ff' : 'white',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    };
  };

  const dataSource = [
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
  ];

  return (
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
        borderRadius: '8px',
      }}
    >
      <List
        dataSource={dataSource}
        renderItem={item => (
          <List.Item
            style={getItemStyle(item)}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, getItemStyle(item, true));
            }}
            onMouseLeave={e => {
              Object.assign(e.currentTarget.style, getItemStyle(item));
            }}
            onClick={() => handleItemClick(item)}
          >
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor:
                      item.id === 'public' ? '#52c41a' : '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
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
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>
                        加入时间: {new Date(item.joinTime).toLocaleTimeString()}
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
  );
};
