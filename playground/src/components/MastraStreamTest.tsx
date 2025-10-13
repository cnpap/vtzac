import React, { useRef, useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert } from 'antd';
import { RobotOutlined, SendOutlined, ApiOutlined } from '@ant-design/icons';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { _http } from 'vtzac/hook';
import { MastraController } from 'nestjs-example/src/mastra.controller';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 创建控制器实例
const mastraController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    responseType: 'stream',
  },
}).controller(MastraController);

export const MastraStreamTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  // ofetch 流式相关状态
  const [ofetchMessage, setOfetchMessage] = useState('南充环境如何');
  const [ofetchLoading, setOfetchLoading] = useState(false);
  const [ofetchError, setOfetchError] = useState<string | null>(null);
  const [ofetchOutput, setOfetchOutput] = useState('');
  const ofetchControllerRef = useRef<AbortController | null>(null);

  const startStream = async (): Promise<void> => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setOutput('');
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      await fetchEventSource(
        `http://localhost:3000/api/mastra/chat/stream?message=${encodeURIComponent(message)}`,
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

  // SSE 解析函数
  const parseSSEData = (text: string): string => {
    const lines = text.split('\n');
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6); // 移除 'data: ' 前缀
        if (data === '[DONE]') {
          break; // 结束标志
        }
        dataLines.push(data);
      }
    }

    // 将多行 data 用换行符连接，保留原始格式
    return dataLines.join('\n');
  };

  // ofetch 流式处理函数
  const startOfetchStream = async (): Promise<void> => {
    if (!ofetchMessage.trim()) return;
    setOfetchLoading(true);
    setOfetchError(null);
    setOfetchOutput('');
    ofetchControllerRef.current?.abort();
    ofetchControllerRef.current = new AbortController();

    try {
      const stream = await mastraController.chatStream(ofetchMessage);
      console.log('stream', stream);
      const reader = stream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // 用于处理不完整的 SSE 消息

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码当前块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按双换行符分割 SSE 消息
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // 保留最后一个可能不完整的消息

        // 处理完整的 SSE 消息
        for (const message of messages) {
          if (message.trim()) {
            const data = parseSSEData(message);
            if (data) {
              setOfetchOutput(prev => prev + data);
            }
          }
        }
      }

      // 处理剩余的缓冲区内容
      if (buffer.trim()) {
        const data = parseSSEData(buffer);
        if (data) {
          setOfetchOutput(prev => prev + data);
        }
      }
    } catch (err) {
      setOfetchError((err as Error).message);
    } finally {
      setOfetchLoading(false);
    }
  };

  const stopOfetchStream = (): void => {
    ofetchControllerRef.current?.abort();
    setOfetchLoading(false);
  };

  return (
    <div>
      <Title level={3}>Mastra 流式测试</Title>
      <Paragraph>
        测试两种流式响应方式：使用{' '}
        <Text code>@microsoft/fetch-event-source</Text> 和{' '}
        <Text code>ofetch</Text> 直接消费后端 SSE 流式响应，逐字展示。
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

        {/* ofetch 流式聊天 */}
        <Card title="ofetch 流式聊天" size="small" extra={<ApiOutlined />}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容..."
              value={ofetchMessage}
              onChange={e => setOfetchMessage(e.target.value)}
              rows={3}
            />
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={ofetchLoading}
                onClick={startOfetchStream}
              >
                开始 ofetch 流式
              </Button>
              <Button
                danger
                disabled={!ofetchLoading}
                onClick={stopOfetchStream}
              >
                停止
              </Button>
            </Space>
            {ofetchError && (
              <Alert
                type="error"
                message="错误"
                description={ofetchError}
                showIcon
              />
            )}
            {ofetchOutput && (
              <Alert
                type="success"
                message="ofetch 流式输出"
                description={
                  <div>
                    <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                      {ofetchOutput}
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
