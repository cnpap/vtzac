import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Alert,
  List,
  Select,
  Radio,
} from 'antd';
import {
  SendOutlined,
  ReloadOutlined,
  ClearOutlined,
  MessageOutlined,
  RobotOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { _http, type StreamProtocol } from 'vtzac';
import { useAIChat, useAICompletion } from 'vtzac/react';
import { AiSdkController } from 'nestjs-example/src/ai-sdk.controller';
import type { UIMessage } from 'ai';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 创建控制器实例
const { controller } = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
});
const aiSdkController = controller(AiSdkController);

type TestMode = 'chat' | 'completion';

export const StreamTest: React.FC = () => {
  const [mode, setMode] = useState<TestMode>('chat');
  const [streamProtocol, setStreamProtocol] = useState<StreamProtocol>('sse');

  // 对话模式状态
  const [chatInput, setChatInput] = useState(
    '你好，我是一个程序员，我打算和你聊聊天'
  );

  // 完成模式状态
  const [completionPrompt, setCompletionPrompt] =
    useState('介绍一下成都这座城市');

  // 保存聊天历史记录的引用
  const savedMessages = useRef<UIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: '你好！我是 AI 助手，有什么可以帮助你的吗？',
        },
      ],
    },
  ]);

  // 根据不同的流协议和模式选择不同的接口
  const getChatFunction = (protocol: StreamProtocol) => {
    switch (protocol) {
      case 'sse':
        return (messages: UIMessage[]) =>
          aiSdkController.chatSse(JSON.stringify(messages));
      case 'text':
        return (messages: UIMessage[]) => aiSdkController.chat({ messages });
      case 'data':
        return (messages: UIMessage[]) => aiSdkController.chatUI({ messages });
      default:
        return (messages: UIMessage[]) =>
          aiSdkController.chatSse(JSON.stringify(messages));
    }
  };

  const getCompletionFunction = (protocol: StreamProtocol) => {
    switch (protocol) {
      case 'sse':
        return (prompt: string) => aiSdkController.sse(prompt);
      case 'text':
        return (prompt: string) => aiSdkController.completion({ prompt });
      case 'data':
        return (prompt: string) => aiSdkController.completionUI({ prompt });
      default:
        return (prompt: string) => aiSdkController.sse(prompt);
    }
  };

  // 对话模式 hook
  const chat = useAIChat(getChatFunction(streamProtocol), {
    protocol: streamProtocol,
    initialMessages: savedMessages.current,
  });

  // 完成模式 hook
  const completion = useAICompletion(getCompletionFunction(streamProtocol), {
    protocol: streamProtocol,
  });

  // 当消息发生变化时，保存到引用中
  useEffect(() => {
    if (mode === 'chat') {
      savedMessages.current = chat.messages;
    }
  }, [chat.messages, mode]);

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      chat.append(chatInput);
      setChatInput('');
    }
  };

  const handleCompletionSubmit = () => {
    if (completionPrompt.trim()) {
      completion.complete(completionPrompt);
    }
  };

  const handleProtocolChange = (value: StreamProtocol) => {
    // 保存当前消息到引用中
    if (mode === 'chat') {
      savedMessages.current = chat.messages;
    }
    setStreamProtocol(value);
  };

  const handleModeChange = (value: TestMode) => {
    // 保存当前消息到引用中
    if (mode === 'chat') {
      savedMessages.current = chat.messages;
    }
    setMode(value);
  };

  const protocolDescriptions = {
    sse: 'Server-Sent Events 协议，使用 text/event-stream 格式',
    'sse-data':
      'Server-Sent Events 协议，使用 text/event-stream 格式，数据部分基于 NDJSON 格式',
    text: 'Text 协议，直接流式返回文本内容',
    data: 'Data 协议，基于 NDJSON 的数据流格式',
  };

  const modeDescriptions = {
    chat: '多轮对话模式，支持上下文记忆和历史消息',
    completion: '文本完成模式，单次生成响应',
  };

  return (
    <div>
      <Title level={3}>流式 AI 测试</Title>
      <Paragraph>
        统一的流式 AI
        测试组件，支持协议切换（SSE/Text/Data）和模式切换（对话/完成）。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 设置面板 */}
        <Card title="测试设置" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 模式选择 */}
            <div>
              <Text strong>测试模式：</Text>
              <Radio.Group
                value={mode}
                onChange={e => handleModeChange(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <Radio.Button value="chat">
                  <MessageOutlined /> 对话模式
                </Radio.Button>
                <Radio.Button value="completion">
                  <RobotOutlined /> 完成模式
                </Radio.Button>
              </Radio.Group>
            </div>

            {/* 协议选择 */}
            <div>
              <Text strong>流协议：</Text>
              <Select
                value={streamProtocol}
                onChange={handleProtocolChange}
                style={{ width: 200, marginLeft: 8 }}
              >
                <Option value="sse">SSE 协议</Option>
                <Option value="text">Text 协议</Option>
                <Option value="data">Data 协议</Option>
              </Select>
            </div>

            {/* 当前配置说明 */}
            <Alert
              message={`当前配置：${mode === 'chat' ? '对话' : '完成'}模式 + ${streamProtocol.toUpperCase()}协议`}
              description={
                <div>
                  <div>
                    <strong>模式说明：</strong>
                    {modeDescriptions[mode]}
                  </div>
                  <div>
                    <strong>协议说明：</strong>
                    {protocolDescriptions[streamProtocol]}
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          </Space>
        </Card>

        {/* 对话模式界面 */}
        {mode === 'chat' && (
          <Card
            title={`多轮对话 - ${streamProtocol.toUpperCase()} 协议`}
            size="small"
            extra={<MessageOutlined />}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 消息列表 */}
              <div
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: '#fafafa',
                }}
              >
                <List
                  dataSource={chat.messages}
                  renderItem={message => (
                    <List.Item style={{ padding: '8px 0', border: 'none' }}>
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              message.role === 'user'
                                ? 'flex-end'
                                : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              backgroundColor:
                                message.role === 'user' ? '#1890ff' : '#ffffff',
                              color:
                                message.role === 'user' ? 'white' : 'black',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              border:
                                message.role === 'assistant'
                                  ? '1px solid #e8e8e8'
                                  : 'none',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '12px',
                                opacity: 0.8,
                                marginBottom: '6px',
                                fontWeight: 'bold',
                              }}
                            >
                              {message.role === 'user' ? '你' : 'AI 助手'}
                            </div>
                            <div
                              style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.5',
                              }}
                            >
                              {message.parts
                                ?.map(part => {
                                  if (part.type === 'text') {
                                    return part.text;
                                  }
                                  return '';
                                })
                                .join('')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              {/* 输入区域 */}
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="输入消息..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onPressEnter={handleChatSubmit}
                  disabled={chat.isLoading}
                  style={{ fontSize: '14px' }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={chat.isLoading}
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim()}
                >
                  发送
                </Button>
              </Space.Compact>

              {/* 控制按钮 */}
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  disabled={chat.isLoading || chat.messages.length <= 1}
                  onClick={chat.reload}
                >
                  重新生成
                </Button>
                <Button danger disabled={!chat.isLoading} onClick={chat.stop}>
                  停止生成
                </Button>
                <Button icon={<ClearOutlined />} onClick={chat.reset}>
                  重置对话
                </Button>
              </Space>

              {/* 错误提示 */}
              {chat.error && (
                <Alert
                  type="error"
                  message="聊天错误"
                  description={chat.error.message}
                  showIcon
                  closable
                />
              )}

              {/* 状态信息 */}
              <div style={{ fontSize: '12px', color: '#666' }}>
                消息数量: {chat.messages.length} | 协议:{' '}
                {streamProtocol.toUpperCase()} | 状态:{' '}
                {chat.isLoading ? '生成中...' : '就绪'}
              </div>
            </Space>
          </Card>
        )}

        {/* 完成模式界面 */}
        {mode === 'completion' && (
          <Card
            title={`文本完成 - ${streamProtocol.toUpperCase()} 协议`}
            size="small"
            extra={<ApiOutlined />}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="输入提示词..."
                value={completionPrompt}
                onChange={e => setCompletionPrompt(e.target.value)}
                rows={4}
                style={{ fontSize: '14px' }}
              />

              <Space>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={completion.isLoading}
                  onClick={handleCompletionSubmit}
                  disabled={!completionPrompt.trim()}
                >
                  生成文本
                </Button>
                <Button
                  danger
                  disabled={!completion.isLoading}
                  onClick={completion.stop}
                >
                  停止生成
                </Button>
                <Button icon={<ClearOutlined />} onClick={completion.reset}>
                  重置
                </Button>
              </Space>

              {/* 错误提示 */}
              {completion.error && (
                <Alert
                  type="error"
                  message="生成错误"
                  description={completion.error.message}
                  showIcon
                  closable
                />
              )}

              {/* 生成结果 */}
              {completion.completion && (
                <Alert
                  type="success"
                  message="生成结果"
                  description={
                    <div
                      style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '12px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '6px',
                        border: '1px solid #e8e8e8',
                      }}
                    >
                      <Text
                        copyable
                        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                      >
                        {completion.completion}
                      </Text>
                    </div>
                  }
                  showIcon
                />
              )}

              {/* 状态信息 */}
              <div style={{ fontSize: '12px', color: '#666' }}>
                协议: {streamProtocol.toUpperCase()} | 状态:{' '}
                {completion.isLoading ? '生成中...' : '就绪'} | 字符数:{' '}
                {completion.completion?.length || 0}
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default StreamTest;
