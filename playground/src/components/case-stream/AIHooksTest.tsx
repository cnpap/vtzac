import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Alert,
  Divider,
  List,
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  ApiOutlined,
  ReloadOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { _http } from 'vtzac';
import { useAICompletion, useAIChat } from 'vtzac/react';
import { MastraController } from 'nestjs-example/src/mastra.controller';
import type { UIMessage } from 'ai';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 创建控制器实例
const { controller } = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
});
const mastraController = controller(MastraController);

export const AIHooksTest: React.FC = () => {
  // useAICompletion 测试
  const [completionPrompt, setCompletionPrompt] =
    useState('介绍一下成都这座城市');

  const completion = useAICompletion((prompt: string) =>
    mastraController.chatStream(prompt)
  );

  // AI SDK 文本协议（text）流式测试
  const [aiTextPrompt, setAiTextPrompt] = useState('你好');
  const aiSdkText = useAICompletion(
    (prompt: string) => mastraController.aiSdkCompletion({ prompt }),
    { protocol: 'text' }
  );

  // AI SDK 数据协议（data）流式测试
  const [aiDataPrompt, setAiDataPrompt] = useState('你好');
  const aiSdkData = useAICompletion(
    (prompt: string) => mastraController.aiSdkCompletionData({ prompt }),
    { protocol: 'data' }
  );

  // useAIChat 测试
  const [chatInput, setChatInput] = useState(
    '你好，我是一个程序员，我打算和你聊聊天'
  );

  const chat = useAIChat(
    (messages: UIMessage[]) => {
      return mastraController.multiChat({
        messages,
      });
    },
    {
      protocol: 'text',
      initialMessages: [
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
      ],
    }
  );

  const handleCompletionSubmit = () => {
    if (completionPrompt.trim()) {
      completion.complete(completionPrompt);
    }
  };

  const handleAiTextSubmit = () => {
    if (aiTextPrompt.trim()) {
      aiSdkText.complete(aiTextPrompt);
    }
  };

  const handleAiDataSubmit = () => {
    if (aiDataPrompt.trim()) {
      aiSdkData.complete(aiDataPrompt);
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      chat.append(chatInput);
      setChatInput('');
    }
  };

  return (
    <div>
      <Title level={3}>AI Hooks 测试</Title>
      <Paragraph>
        测试新的 React hooks：<Text code>useAICompletion</Text> 和{' '}
        <Text code>useAIChat</Text>， 简化流式 AI 响应的使用。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* useAICompletion 测试 */}
        <Card
          title="useAICompletion - 文本生成"
          size="small"
          extra={<ApiOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入提示词..."
              value={completionPrompt}
              onChange={e => setCompletionPrompt(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={completion.isLoading}
                onClick={handleCompletionSubmit}
              >
                生成文本
              </Button>
              <Button
                danger
                disabled={!completion.isLoading}
                onClick={completion.stop}
              >
                停止
              </Button>
              <Button icon={<ClearOutlined />} onClick={completion.reset}>
                重置
              </Button>
            </Space>

            {completion.error && (
              <Alert
                type="error"
                message="错误"
                description={completion.error.message}
                showIcon
              />
            )}

            {completion.completion && (
              <Alert
                type="success"
                message="生成结果"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {completion.completion}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
          </Space>
        </Card>

        <Divider />

        {/* AI SDK 文本协议（text） */}
        <Card
          title="AI SDK 文本协议（text）"
          size="small"
          extra={<RobotOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入提示词...（text 协议）"
              value={aiTextPrompt}
              onChange={e => setAiTextPrompt(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={aiSdkText.isLoading}
                onClick={handleAiTextSubmit}
                disabled={!aiTextPrompt.trim()}
              >
                开始（text）
              </Button>
              <Button
                danger
                disabled={!aiSdkText.isLoading}
                onClick={aiSdkText.stop}
              >
                停止（text）
              </Button>
              <Button icon={<ClearOutlined />} onClick={aiSdkText.reset}>
                重置
              </Button>
            </Space>
            {aiSdkText.error && (
              <Alert
                type="error"
                message="错误（text）"
                description={aiSdkText.error.message}
                showIcon
              />
            )}
            {aiSdkText.completion && (
              <Alert
                type="success"
                message="流式输出（text）"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {aiSdkText.completion}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* AI SDK 数据协议（data） */}
        <Card
          title="AI SDK 数据协议（data）"
          size="small"
          extra={<RobotOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入提示词...（data 协议）"
              value={aiDataPrompt}
              onChange={e => setAiDataPrompt(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={aiSdkData.isLoading}
                onClick={handleAiDataSubmit}
                disabled={!aiDataPrompt.trim()}
              >
                开始（data）
              </Button>
              <Button
                danger
                disabled={!aiSdkData.isLoading}
                onClick={aiSdkData.stop}
              >
                停止（data）
              </Button>
              <Button icon={<ClearOutlined />} onClick={aiSdkData.reset}>
                重置
              </Button>
            </Space>
            {aiSdkData.error && (
              <Alert
                type="error"
                message="错误（data）"
                description={aiSdkData.error.message}
                showIcon
              />
            )}
            {aiSdkData.completion && (
              <Alert
                type="success"
                message="流式输出（data）"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {aiSdkData.completion}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* useAIChat 测试 */}
        <Card
          title="useAIChat - 多轮对话"
          size="small"
          extra={<RobotOutlined />}
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
              }}
            >
              <List
                dataSource={chat.messages}
                renderItem={message => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            message.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor:
                              message.role === 'user' ? '#1890ff' : '#f0f0f0',
                            color: message.role === 'user' ? 'white' : 'black',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '12px',
                              opacity: 0.8,
                              marginBottom: '4px',
                            }}
                          >
                            {message.role === 'user' ? '你' : 'AI'}
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {message.parts
                              ?.map(part => {
                                if (part.type === 'text') {
                                  return part.text;
                                }
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
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={chat.isLoading}
                onClick={handleChatSubmit}
              >
                发送
              </Button>
            </Space.Compact>

            <Space>
              <Button
                icon={<ReloadOutlined />}
                disabled={chat.isLoading || chat.messages.length === 0}
                onClick={chat.reload}
              >
                重新生成
              </Button>
              <Button danger disabled={!chat.isLoading} onClick={chat.stop}>
                停止
              </Button>
              <Button icon={<ClearOutlined />} onClick={chat.reset}>
                重置对话
              </Button>
            </Space>

            {chat.error && (
              <Alert
                type="error"
                message="错误"
                description={chat.error.message}
                showIcon
              />
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AIHooksTest;
