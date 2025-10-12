import { useState } from 'react';
import { setGlobalZacOfetchOptions } from 'vtzac/hook';
import { Segmented, Space, Row, Col } from 'antd';
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
import 'antd/dist/reset.css';

setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3000',
});

function App() {
  const [activeCase, setActiveCase] = useState<TestCase>('websocket');
  const [results, setResults] = useState<ResultsState>({});
  const [loading, setLoading] = useState<LoadingState>({});

  const testCases = [
    { label: 'Hello 测试', value: 'hello', icon: <SendOutlined /> },
    { label: 'Query 参数', value: 'query', icon: <SearchOutlined /> },
    { label: 'Param 参数', value: 'param', icon: <LinkOutlined /> },
    { label: 'Headers 测试', value: 'headers', icon: <SettingOutlined /> },
    { label: '文件上传', value: 'upload', icon: <UploadOutlined /> },
    { label: '复杂组合', value: 'complex', icon: <SettingOutlined /> },
    { label: 'DELETE 方法', value: 'delete', icon: <DeleteOutlined /> },
    { label: 'WebSocket 测试', value: 'websocket', icon: <WifiOutlined /> },
    { label: 'Ask 模式测试', value: 'ask', icon: <QuestionCircleOutlined /> },
    { label: 'Mastra AI 测试', value: 'mastra', icon: <RobotOutlined /> },
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
      default:
        return <HelloTest {...commonProps} />;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Segmented
            options={testCases}
            value={activeCase}
            onChange={value => setActiveCase(value as TestCase)}
            size="large"
            style={{ width: '100%' }}
          />
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>{renderTestComponent()}</Col>
        </Row>
      </Space>
    </div>
  );
}

export default App;
