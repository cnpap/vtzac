import React from 'react';
import { Button, Space, Typography, Alert } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { _http } from 'vtzac/hook';
import { AppController } from 'nestjs-example/src/app.controller';
import type { TestComponentProps, TestResult } from '../types';

const { Title, Text, Paragraph } = Typography;

// 创建控制器实例
const defaultController = _http(AppController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 5000,
  },
});

export const HelloTest: React.FC<TestComponentProps> = ({
  loading,
  results,
  setResults,
  setLoading,
}) => {
  const handleHello = async () => {
    setLoading(prev => ({ ...prev, hello: true }));
    try {
      const res = await defaultController.getHello();
      setResults(prev => ({ ...prev, hello: res._data }));
      message.success('Hello 请求成功！');
    } catch (error) {
      message.error('Hello 请求失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, hello: false }));
    }
  };

  const renderResult = () => {
    const result = results.hello as TestResult;
    if (!result) return null;

    return (
      <div style={{ marginTop: 16 }}>
        {typeof result === 'string' ? (
          <Alert
            message="字符串结果"
            description={<Text copyable>{result}</Text>}
            type="success"
            showIcon
          />
        ) : (
          <Alert
            message="JSON 结果"
            description={
              <Paragraph>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                  }}
                >
                  <Text copyable>{JSON.stringify(result, null, 2)}</Text>
                </pre>
              </Paragraph>
            }
            type="success"
            showIcon
          />
        )}
      </div>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Hello 测试用例</Title>
        <Button
          type="primary"
          size="large"
          loading={loading.hello}
          onClick={handleHello}
          icon={<SendOutlined />}
        >
          获取 Hello 消息
        </Button>
      </div>
      {renderResult()}
    </Space>
  );
};
