import React, { useRef, useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert } from 'antd';
import { RobotOutlined, SendOutlined, ApiOutlined } from '@ant-design/icons';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { consumeStream, _http } from 'vtzac';
import { MastraController } from 'nestjs-example/src/mastra.controller';

const { Text, Paragraph } = Typography;
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

export const MastraStreamTest: React.FC = () => {
  const [message, setMessage] = useState('介绍一下成都');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  // 独立 consumeStream 相关状态
  const [standaloneMessage, setStandaloneMessage] = useState('介绍一下成都');
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [standaloneError, setStandaloneError] = useState<string | null>(null);
  const [standaloneOutput, setStandaloneOutput] = useState('');
  const standaloneControllerRef = useRef<AbortController | null>(null);

  const startStream = async (): Promise<void> => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setOutput('');
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      await fetchEventSource(
        `http://localhost:3000/api/ai-sdk/sse?prompt=${encodeURIComponent(message)}`,
        {
          signal: controllerRef.current.signal,
          onmessage(ev) {
            if (ev.data === '[DONE]') return;
            setOutput(prev => prev + ev.data);
          },
          onerror(err) {
            setError(err.message);
          },
          openWhenHidden: true,
        }
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = (): void => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  // 独立 consumeStream 流式处理函数
  const startStandaloneStream = async (): Promise<void> => {
    if (!standaloneMessage.trim()) return;
    setStandaloneLoading(true);
    setStandaloneError(null);
    setStandaloneOutput('');
    standaloneControllerRef.current?.abort();
    standaloneControllerRef.current = new AbortController();

    try {
      // 使用独立的 consumeStream 函数
      await consumeStream(mastraController.sse(standaloneMessage), {
        signal: standaloneControllerRef.current.signal,
        onMessage(ev) {
          // 不再需要手动判断 [DONE]，consumeStream 会自动过滤
          setStandaloneOutput(prev => prev + ev);
        },
        onError(err) {
          setStandaloneError(err.message);
        },
        onClose() {
          console.log('Standalone stream closed');
        },
      });
    } catch (err) {
      setStandaloneError((err as Error).message);
    } finally {
      setStandaloneLoading(false);
    }
  };

  const stopStandaloneStream = (): void => {
    standaloneControllerRef.current?.abort();
    setStandaloneLoading(false);
  };

  return (
    <div>
      <Paragraph>
        测试三种 SSE 流式响应方式：使用{' '}
        <Text code>@microsoft/fetch-event-source</Text>、{' '}
        <Text code>vtzac 集成的 httpConsumeStream</Text> 和{' '}
        <Text code>独立的 consumeStream</Text> 函数来消费后端 SSE
        流式响应，逐字展示。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 原生 fetch-event-source 流式聊天 */}
        <Card
          title="fetch-event-source 流式聊天"
          size="small"
          extra={<RobotOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={startStream}
              >
                开始流式
              </Button>
              <Button danger disabled={!loading} onClick={stopStream}>
                停止
              </Button>
            </Space>
            {error && (
              <Alert type="error" message="错误" description={error} showIcon />
            )}
            {output && (
              <Alert
                type="success"
                message="流式输出"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {output}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* 独立 consumeStream 流式聊天 */}
        <Card
          title="独立 consumeStream 流式聊天"
          size="small"
          extra={<ApiOutlined />}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容..."
              value={standaloneMessage}
              onChange={e => setStandaloneMessage(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={standaloneLoading}
                onClick={startStandaloneStream}
              >
                开始独立流式
              </Button>
              <Button
                danger
                disabled={!standaloneLoading}
                onClick={stopStandaloneStream}
              >
                停止
              </Button>
            </Space>
            {standaloneError && (
              <Alert
                type="error"
                message="错误"
                description={standaloneError}
                showIcon
              />
            )}
            {standaloneOutput && (
              <Alert
                type="success"
                message="独立流式输出"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {standaloneOutput}
                    </Text>
                  </div>
                }
                showIcon
              />
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default MastraStreamTest;
