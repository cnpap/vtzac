import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert } from 'antd';
import {
  ThunderboltOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useCompletion } from '@ai-sdk/react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const AiSdkTest: React.FC = () => {
  // Vercel AI SDK useCompletion hook
  const {
    completion,
    complete,
    isLoading: aiSdkLoading,
    error: aiSdkError,
    stop: aiSdkStop,
  } = useCompletion({
    api: 'http://localhost:3000/api/mastra/ai-sdk/completion',
    // 后端使用的是纯文本流（pipeTextStreamToResponse），useCompletion 默认期望的是 data 流。
    // 显式声明为 text 协议，才能正确解析纯文本的 chunk。
    streamProtocol: 'text',
  });

  // Vercel AI SDK useCompletion（数据协议 data）
  const {
    completion: dataCompletion,
    complete: dataComplete,
    isLoading: dataLoading,
    error: dataError,
    stop: dataStop,
  } = useCompletion({
    api: 'http://localhost:3000/api/mastra/ai-sdk/completion-data',
  });

  // AI SDK 输入状态
  // const [aiSdkMessage, setAiSdkMessage] = useState('请介绍一下人工智能的发展历史');
  const [aiSdkMessage, setAiSdkMessage] = useState('你好');

  // AI SDK 处理函数
  const handleAiSdkComplete = async (): Promise<void> => {
    if (!aiSdkMessage.trim()) return;
    await complete(aiSdkMessage);
  };

  const handleAiSdkDataComplete = async (): Promise<void> => {
    if (!aiSdkMessage.trim()) return;
    await dataComplete(aiSdkMessage);
  };

  return (
    <div>
      <Title level={3}>Vercel AI SDK 流式测试</Title>
      <Paragraph>
        测试使用 <Text code>@ai-sdk/react</Text> 的{' '}
        <Text code>useCompletion</Text> hook 与后端 NestJS 的{' '}
        <Text code>streamText</Text> 和{' '}
        <Text code>pipeTextStreamToResponse</Text> 进行 POST 流式传输。这不是
        SSE，而是基于 HTTP POST 的流式响应。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Vercel AI SDK useCompletion 流式聊天 */}
        <Card
          title="Vercel AI SDK useCompletion 流式聊天"
          size="small"
          extra={<ThunderboltOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容..."
              value={aiSdkMessage}
              onChange={e => setAiSdkMessage(e.target.value)}
              rows={4}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={aiSdkLoading}
                onClick={handleAiSdkComplete}
                disabled={!aiSdkMessage.trim()}
              >
                开始 AI SDK 流式
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                disabled={!aiSdkLoading}
                onClick={aiSdkStop}
              >
                停止
              </Button>
            </Space>
            {aiSdkError && (
              <Alert
                type="error"
                message="错误"
                description={aiSdkError.message}
                showIcon
                closable
              />
            )}
            {completion && (
              <Alert
                type="success"
                message="AI SDK 流式输出"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {completion}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
            {aiSdkLoading && !completion && (
              <Alert
                type="info"
                message="正在生成..."
                description="AI 正在思考中，请稍候..."
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Vercel AI SDK useCompletion（数据协议 data）流式 */}
        <Card
          title="Vercel AI SDK useCompletion（数据协议 data）"
          size="small"
          extra={<ThunderboltOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容...（data 协议）"
              value={aiSdkMessage}
              onChange={e => setAiSdkMessage(e.target.value)}
              rows={4}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={dataLoading}
                onClick={handleAiSdkDataComplete}
                disabled={!aiSdkMessage.trim()}
              >
                开始 AI SDK 数据流式
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                disabled={!dataLoading}
                onClick={dataStop}
              >
                停止（data）
              </Button>
            </Space>
            {dataError && (
              <Alert
                type="error"
                message="错误（data）"
                description={dataError.message}
                showIcon
                closable
              />
            )}
            {dataCompletion && (
              <Alert
                type="success"
                message="AI SDK 数据协议流式输出"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {dataCompletion}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
            {dataLoading && !dataCompletion && (
              <Alert
                type="info"
                message="正在生成...（data）"
                description="AI 正在思考中，请稍候..."
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* 技术说明 */}
        <Card title="技术说明" size="small">
          <Space direction="vertical">
            <Text strong>后端实现：</Text>
            <Text>
              • 使用 <Text code>streamText</Text> 从 AI SDK 生成流式文本
            </Text>
            <Text>
              • 使用 <Text code>pipeTextStreamToResponse</Text> 将流直接管道到
              HTTP 响应
            </Text>
            <Text>• 配置阿里百炼平台的 OpenAI 兼容接口（qwen-plus 模型）</Text>

            <Text strong style={{ marginTop: 16, display: 'block' }}>
              前端实现：
            </Text>
            <Text>
              • 使用 <Text code>@ai-sdk/react</Text> 的{' '}
              <Text code>useCompletion</Text> hook
            </Text>
            <Text>• 自动处理流式响应和状态管理</Text>
            <Text>• 支持实时显示、错误处理和停止功能</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AiSdkTest;
