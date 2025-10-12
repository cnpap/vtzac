import React from 'react';
import { Button, Space, Typography, Alert } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { _http } from 'vtzac/hook';
import type { TestComponentProps, TestResult, HeadersObject } from '../types';
import { TestInputController } from 'nestjs-example/src/test-input.controller';

const { Title, Text, Paragraph } = Typography;

// 创建控制器实例
const testController = _http(TestInputController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
});

export const HeadersTest: React.FC<TestComponentProps> = ({
  loading,
  results,
  setResults,
  setLoading,
}) => {
  // Headers 测试
  const handleHeadersTest = async () => {
    const key = 'headers';
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const headersObj: HeadersObject = {
        authorization: 'Bearer token123',
        'user-agent': 'Test Client',
        'x-custom-header': 'custom-value',
      };
      const res = await testController.testHeaders(
        'Bearer token123',
        headersObj
      );
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success('Headers 测试成功！');
    } catch (error) {
      message.error('Headers 测试失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderResult = () => {
    const result = results.headers as TestResult;
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
        <Title level={3}>Headers 请求头测试</Title>
        <Button
          type="primary"
          size="large"
          loading={loading.headers}
          onClick={handleHeadersTest}
          icon={<SendOutlined />}
        >
          测试请求头处理
        </Button>
      </div>
      {renderResult()}
    </Space>
  );
};
