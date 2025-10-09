import { useState } from 'react';
import { setGlobalZacOfetchOptions } from 'vtzac/hook';
import { Segmented, Typography, Space, Row, Col } from 'antd';
import {
  SendOutlined,
  SearchOutlined,
  LinkOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import type { LoadingState, ResultsState, TestCase } from './types';
import { HelloTest } from './components/HelloTest';
import { QueryTest } from './components/QueryTest';
import { ParamTest } from './components/ParamTest';
import { HeadersTest } from './components/HeadersTest';
import { UploadTest } from './components/UploadTest';
import ComplexTest from './components/ComplexTest';
import { DeleteTest } from './components/DeleteTest';
import { WebSocketTest } from './components/WebSocketTest';
import 'antd/dist/reset.css';

const { Title } = Typography;

setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3001',
});

function App() {
  const [activeCase, setActiveCase] = useState<TestCase>('hello');
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
        return <WebSocketTest {...commonProps} />;
      default:
        return <HelloTest {...commonProps} />;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>选择测试用例</Title>
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
