import React, { useRef, useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const MastraStreamTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const esRef = useRef<EventSource | null>(null);

  const startStream = async (): Promise<void> => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setOutput('');

    try {
      // 使用 @Sse GET 接口，直接通过 query 携带 message
      const url = new URL('http://localhost:3000/api/mastra/chat/stream');
      url.searchParams.set('message', message);
      const es = new EventSource(url.toString());
      esRef.current = es;

      es.onmessage = ev => {
        if (ev.data === '[DONE]') return;
        setOutput(prev => prev + ev.data);
      };

      es.addEventListener('end', () => {
        setLoading(false);
        es.close();
      });

      es.addEventListener('error', () => {
        setError('EventSource error');
        setLoading(false);
        es.close();
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const stopStream = (): void => {
    esRef.current?.close();
    setLoading(false);
  };

  return (
    <div>
      <Title level={3}>Mastra 原生流式测试</Title>
      <Paragraph>
        使用 <Text code>EventSource</Text> 直接消费后端 <Text code>@Sse</Text>{' '}
        流式响应，逐字展示。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="原生流式聊天" size="small" extra={<RobotOutlined />}>
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
      </Space>
    </div>
  );
};

export default MastraStreamTest;
