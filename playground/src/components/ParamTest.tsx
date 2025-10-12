import React from 'react';
import { Button, Space, Typography, Alert, Card } from 'antd';
import { LinkOutlined, SettingOutlined, SendOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { _http } from 'vtzac/hook';
import type { TestComponentProps, TestResult, ParamTestType } from '../types';
import { TestInputController } from 'nestjs-example/src/test-input.controller';

const { Title, Text, Paragraph } = Typography;

// 创建控制器实例
const testController = _http(TestInputController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
});

export const ParamTest: React.FC<TestComponentProps> = ({
  loading,
  results,
  setResults,
  setLoading,
}) => {
  const handleParamTest = async (type: ParamTestType) => {
    const key = `param-${type}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      let res;
      if (type === 'named') {
        res = await testController.testNamedParam('123', '456');
      } else if (type === 'object') {
        res = await testController.testParamObject({
          type: 'user',
          id: '123',
          action: 'edit',
        });
      } else {
        res = await testController.testMixedParam('123', {
          userId: '123',
          postId: '456',
        });
      }
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success(`Param ${type} 测试成功！`);
    } catch (error) {
      message.error(`Param ${type} 测试失败！`);
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderResult = (key: string, title: string) => {
    const result = results[key] as TestResult;
    if (!result) return null;

    return (
      <Card title={title} size="small" style={{ marginTop: 16 }}>
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
      </Card>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Param 路径参数测试</Title>
        <Space wrap>
          <Button
            type="primary"
            loading={loading['param-named']}
            onClick={() => handleParamTest('named')}
            icon={<LinkOutlined />}
          >
            具名路径参数
          </Button>
          <Button
            type="default"
            loading={loading['param-object']}
            onClick={() => handleParamTest('object')}
            icon={<SettingOutlined />}
          >
            参数对象
          </Button>
          <Button
            type="dashed"
            loading={loading['param-mixed']}
            onClick={() => handleParamTest('mixed')}
            icon={<SendOutlined />}
          >
            混合参数
          </Button>
        </Space>
      </div>
      {renderResult('param-named', '具名路径参数结果')}
      {renderResult('param-object', '参数对象结果')}
      {renderResult('param-mixed', '混合参数结果')}
    </Space>
  );
};
