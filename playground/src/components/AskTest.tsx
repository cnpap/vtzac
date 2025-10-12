import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Divider,
  Alert,
  Tag,
} from 'antd';
import {
  SendOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AskRequest {
  id: string;
  type: 'server-to-client' | 'client-to-server';
  question: string;
  timestamp: string;
}

interface AskResponse {
  id: string;
  answer: string;
  timestamp: string;
}

interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

const AskTest: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [question, setQuestion] = useState('');
  const [callbackQuestion, setCallbackQuestion] = useState('');
  const [ackQuestion, setAckQuestion] = useState('');
  const [serverAnswer, setServerAnswer] = useState('');
  const [callbackAnswer, setCallbackAnswer] = useState('');
  const [ackAnswer, setAckAnswer] = useState('');
  const [pendingServerAsk, setPendingServerAsk] = useState<AskRequest | null>(
    null
  );
  const [clientAnswer, setClientAnswer] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
      data,
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connectSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io('http://localhost:3000/ask', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      addLog('success', '连接到 Ask Gateway 成功');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      addLog('warning', '与 Ask Gateway 断开连接');
    });

    newSocket.on('connected', data => {
      addLog('info', '收到服务端欢迎消息', data);
    });

    // 监听服务端的回答
    newSocket.on('serverAnswer', (response: AskResponse) => {
      setServerAnswer(response.answer);
      setLoading(false);
      addLog('success', '收到服务端回答', response);
    });

    // 监听服务端发起的询问
    newSocket.on('serverAsk', (request: AskRequest) => {
      setPendingServerAsk(request);
      addLog('info', '服务端发起询问', request);
    });

    // 监听服务端确认收到回答
    newSocket.on('serverReceivedAnswer', data => {
      addLog('success', '服务端确认收到回答', data);
      setPendingServerAsk(null);
      setClientAnswer('');
    });

    // 监听服务端通过 emitWithAck 发起的询问
    newSocket.on(
      'serverAskWithAck',
      (
        request: AskRequest,
        callback: (response: { answer: string; timestamp: string }) => void
      ) => {
        addLog('info', '服务端通过 emitWithAck 发起询问111', request);

        // 自动回答服务端的 emitWithAck 询问
        const autoAnswers = [
          'Windows 11 专业版',
          'TypeScript 和 React',
          'emitWithAck 功能很棒！',
          '北京',
          '今天心情不错！',
        ];
        const randomAnswer =
          autoAnswers[Math.floor(Math.random() * autoAnswers.length)];

        const response = {
          answer: randomAnswer,
          timestamp: new Date().toISOString(),
        };

        // 通过回调函数回答
        callback(response);
        addLog(
          'success',
          `自动回答服务端 emitWithAck 询问: ${randomAnswer}`,
          response
        );
      }
    );

    // 监听服务端确认收到 emitWithAck 回答
    newSocket.on('serverAckReceived', data => {
      addLog('success', '服务端确认收到 emitWithAck 回答', data);
    });

    // 监听服务端 emitWithAck 错误
    newSocket.on('serverAckError', data => {
      addLog('error', '服务端 emitWithAck 出错', data);
    });

    newSocket.on('connect_error', error => {
      addLog('error', '连接错误', error.message);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      addLog('info', '主动断开连接');
    }
  };

  // 客户端向服务端发起 ask 请求
  const askServer = () => {
    if (!socket || !question.trim()) return;

    setLoading(true);
    setServerAnswer('');
    addLog('info', `向服务端发起询问: ${question}`);

    socket.emit('askServer', { question: question.trim() });
  };

  // 客户端向服务端发起 ask 请求（使用 callback）
  const askServerWithCallback = () => {
    if (!socket || !callbackQuestion.trim()) return;

    setCallbackLoading(true);
    setCallbackAnswer('');
    addLog('info', `通过 callback 向服务端发起询问: ${callbackQuestion}`);

    socket.emit(
      'askServerWithCallback',
      { question: callbackQuestion.trim() },
      (response: AskResponse) => {
        setCallbackAnswer(response.answer);
        setCallbackLoading(false);
        addLog('success', '通过 callback 收到服务端回答', response);
      }
    );
  };

  // 客户端使用 emitWithAck 向服务端发起询问
  const askServerWithAck = async () => {
    if (!socket || !ackQuestion.trim()) return;

    setAckLoading(true);
    setAckAnswer('');
    addLog('info', `通过 emitWithAck 向服务端发起询问: ${ackQuestion}`);

    try {
      const response = await socket.emitWithAck('askServerWithAck', {
        question: ackQuestion.trim(),
      });
      setAckAnswer(response.answer);
      setAckLoading(false);
      addLog('success', '通过 emitWithAck 收到服务端回答', response);
    } catch (error) {
      setAckLoading(false);
      addLog('error', 'emitWithAck 请求失败', error);
    }
  };

  // 触发服务端向客户端发起询问
  const triggerServerAsk = () => {
    if (!socket) return;

    addLog('info', '触发服务端向客户端发起询问');
    socket.emit('triggerServerAsk');
  };

  // 触发服务端通过 emitWithAck 向客户端发起询问
  const triggerServerAskWithAck = () => {
    if (!socket) return;

    addLog('info', '触发服务端通过 emitWithAck 向客户端发起询问');
    socket.emit('triggerServerAskWithAck');
  };

  // 回答服务端的询问
  const answerServer = () => {
    if (!socket || !pendingServerAsk || !clientAnswer.trim()) return;

    addLog('info', `回答服务端: ${clientAnswer}`);
    socket.emit('answerServer', {
      requestId: pendingServerAsk.id,
      answer: clientAnswer.trim(),
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Ask 模式测试</Title>
      <Paragraph>
        测试服务端和客户端之间的 ask 模式通信，包括普通事件和 callback 方式。
      </Paragraph>

      {/* 连接控制 */}
      <Card title="连接控制" style={{ marginBottom: '20px' }}>
        <Space>
          <Button
            type="primary"
            onClick={connectSocket}
            disabled={connected}
            icon={<CheckCircleOutlined />}
          >
            连接 Ask Gateway
          </Button>
          <Button onClick={disconnectSocket} disabled={!connected} danger>
            断开连接
          </Button>
          <Tag color={connected ? 'green' : 'red'}>
            {connected ? '已连接' : '未连接'}
          </Tag>
        </Space>
      </Card>

      {/* 客户端向服务端询问 */}
      <Card title="客户端向服务端询问" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>普通事件方式:</Text>
            <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
              <Input
                placeholder="输入问题（试试包含'时间'、'状态'、'版本'的问题）"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onPressEnter={askServer}
                disabled={!connected}
              />
              <Button
                type="primary"
                onClick={askServer}
                loading={loading}
                disabled={!connected || !question.trim()}
                icon={<SendOutlined />}
              >
                询问
              </Button>
            </Space.Compact>
            {serverAnswer && (
              <Alert
                message="服务端回答"
                description={serverAnswer}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <Divider />

          <div>
            <Text strong>Callback 方式:</Text>
            <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
              <Input
                placeholder="输入问题（试试包含'计算'、'随机'的问题）"
                value={callbackQuestion}
                onChange={e => setCallbackQuestion(e.target.value)}
                onPressEnter={askServerWithCallback}
                disabled={!connected}
              />
              <Button
                type="primary"
                onClick={askServerWithCallback}
                loading={callbackLoading}
                disabled={!connected || !callbackQuestion.trim()}
                icon={<SendOutlined />}
              >
                询问 (Callback)
              </Button>
            </Space.Compact>
            {callbackAnswer && (
              <Alert
                message="服务端回答 (Callback)"
                description={callbackAnswer}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <Divider />

          <div>
            <Text strong>emitWithAck 方式:</Text>
            <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
              <Input
                placeholder="输入问题（试试包含'服务器'、'内存'、'连接'、'性能'的问题）"
                value={ackQuestion}
                onChange={e => setAckQuestion(e.target.value)}
                onPressEnter={askServerWithAck}
                disabled={!connected}
              />
              <Button
                type="primary"
                onClick={askServerWithAck}
                loading={ackLoading}
                disabled={!connected || !ackQuestion.trim()}
                icon={<SendOutlined />}
              >
                询问 (emitWithAck)
              </Button>
            </Space.Compact>
            {ackAnswer && (
              <Alert
                message="服务端回答 (emitWithAck)"
                description={ackAnswer}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </div>
        </Space>
      </Card>

      {/* 服务端向客户端询问 */}
      <Card title="服务端向客户端询问" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button
              type="primary"
              onClick={triggerServerAsk}
              disabled={!connected}
              icon={<QuestionCircleOutlined />}
            >
              触发服务端询问
            </Button>
            <Button
              type="primary"
              onClick={triggerServerAskWithAck}
              disabled={!connected}
              icon={<MessageOutlined />}
            >
              触发服务端 emitWithAck 询问
            </Button>
          </Space>

          {pendingServerAsk && (
            <Alert
              message="服务端询问"
              description={
                <div>
                  <p>
                    <strong>问题:</strong> {pendingServerAsk.question}
                  </p>
                  <Space
                    direction="vertical"
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    <TextArea
                      placeholder="输入您的回答"
                      value={clientAnswer}
                      onChange={e => setClientAnswer(e.target.value)}
                      rows={3}
                    />
                    <Button
                      type="primary"
                      onClick={answerServer}
                      disabled={!clientAnswer.trim()}
                      icon={<MessageOutlined />}
                    >
                      回答服务端
                    </Button>
                  </Space>
                </div>
              }
              type="info"
              style={{ marginTop: '8px' }}
            />
          )}
        </Space>
      </Card>

      {/* 日志显示 */}
      <Card
        title="通信日志"
        extra={
          <Button size="small" onClick={clearLogs}>
            清空日志
          </Button>
        }
      >
        <div
          style={{
            height: '300px',
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            padding: '12px',
          }}
        >
          {logs.length === 0 ? (
            <Text type="secondary">暂无日志</Text>
          ) : (
            logs.map(log => (
              <div key={log.id} style={{ marginBottom: '8px' }}>
                <Space>
                  <Tag
                    color={getLogColor(log.type)}
                    icon={<ClockCircleOutlined />}
                  >
                    {log.timestamp}
                  </Tag>
                  <Text>{log.message}</Text>
                </Space>
                {log.data && (
                  <pre
                    style={{
                      fontSize: '12px',
                      background: '#f5f5f5',
                      padding: '4px 8px',
                      marginTop: '4px',
                      borderRadius: '4px',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </Card>
    </div>
  );
};

export default AskTest;
