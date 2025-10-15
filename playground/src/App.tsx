import { useState } from 'react';
import { setGlobalZacOfetchOptions } from 'vtzac';
import { Segmented, Space, Row, Col, Tabs } from 'antd';
import {
  SendOutlined,
  SearchOutlined,
  LinkOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
  WifiOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  ApiOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { LoadingState, ResultsState, TestCase } from './types';
import { HelloTest } from './components/HelloTest';
import { QueryTest } from './components/QueryTest';
import { ParamTest } from './components/ParamTest';
import { HeadersTest } from './components/HeadersTest';
import { UploadTest } from './components/UploadTest';
import ComplexTest from './components/ComplexTest';
import { DeleteTest } from './components/DeleteTest';
import WebSocketTestRefactored from './components/WebSocketTestRefactored';
import AskTest from './components/AskTest';
import { MastraTest } from './components/MastraTest';
import MastraStreamTest from './components/MastraStreamTest';
import AIHooksTest from './components/AIHooksTest';
import 'antd/dist/reset.css';

setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3000',
});

function App() {
  const [activeCase, setActiveCase] = useState<TestCase>('hello');
  const [results, setResults] = useState<ResultsState>({});
  const [loading, setLoading] = useState<LoadingState>({});

  // 常规 HTTP 请求测试用例
  const regularTestCases = [
    { label: 'Hello 测试', value: 'hello', icon: <SendOutlined /> },
    { label: 'Query 参数', value: 'query', icon: <SearchOutlined /> },
    { label: 'Param 参数', value: 'param', icon: <LinkOutlined /> },
    { label: 'Headers 测试', value: 'headers', icon: <SettingOutlined /> },
    { label: '文件上传', value: 'upload', icon: <UploadOutlined /> },
    { label: '复杂组合', value: 'complex', icon: <SettingOutlined /> },
    { label: 'DELETE 方法', value: 'delete', icon: <DeleteOutlined /> },
  ];

  // 流式处理测试用例（SSE、WebSocket、AI 流式）
  const streamingTestCases = [
    { label: 'WebSocket 测试', value: 'websocket', icon: <WifiOutlined /> },
    { label: 'Ask 模式测试', value: 'ask', icon: <QuestionCircleOutlined /> },
    { label: 'Mastra AI 测试', value: 'mastra', icon: <RobotOutlined /> },
    {
      label: 'Mastra 原生流式',
      value: 'mastra-stream',
      icon: <RobotOutlined />,
    },
    {
      label: 'AI Hooks 测试',
      value: 'ai-hooks',
      icon: <RobotOutlined />,
    },
  ];

  const renderTestComponent = () => {
    const commonProps = {
      loading,
      setLoading,
      results,
      setResults,
    };

    switch (activeCase) {
      case 'hello':
        return <HelloTest {...commonProps} />;
      case 'query':
        return <QueryTest {...commonProps} />;
      case 'param':
        return <ParamTest {...commonProps} />;
      case 'headers':
        return <HeadersTest {...commonProps} />;
      case 'upload':
        return <UploadTest {...commonProps} />;
      case 'complex':
        return <ComplexTest {...commonProps} />;
      case 'delete':
        return <DeleteTest {...commonProps} />;
      case 'websocket':
        return <WebSocketTestRefactored />;
      case 'ask':
        return <AskTest />;
      case 'mastra':
        return <MastraTest />;
      case 'mastra-stream':
        return <MastraStreamTest />;
      case 'ai-hooks':
        return <AIHooksTest />;
      default:
        return <HelloTest {...commonProps} />;
    }
  };

  const tabItems = [
    {
      key: 'regular',
      label: (
        <span>
          <ApiOutlined />
          常规用例
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Segmented
              options={regularTestCases}
              value={
                regularTestCases.some(item => item.value === activeCase)
                  ? activeCase
                  : 'hello'
              }
              onChange={value => setActiveCase(value as TestCase)}
              size="large"
              style={{ width: '100%' }}
            />
          </div>
          <Row gutter={[24, 24]}>
            <Col span={24}>{renderTestComponent()}</Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'streaming',
      label: (
        <span>
          <ThunderboltOutlined />
          流式处理
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Segmented
              options={streamingTestCases}
              value={
                streamingTestCases.some(item => item.value === activeCase)
                  ? activeCase
                  : 'websocket'
              }
              onChange={value => setActiveCase(value as TestCase)}
              size="large"
              style={{ width: '100%' }}
            />
          </div>
          <Row gutter={[24, 24]}>
            <Col span={24}>{renderTestComponent()}</Col>
          </Row>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Tabs
        defaultActiveKey="streaming"
        items={tabItems}
        size="large"
        onChange={key => {
          // 切换标签页时，自动选择该分类的第一个测试用例
          if (key === 'regular') {
            setActiveCase('hello');
          } else if (key === 'streaming') {
            setActiveCase('websocket');
          }
        }}
      />
    </div>
  );
}

export default App;
