import React from 'react';
import { Button, Space, Typography, Alert, Card } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { _http } from 'vtzac/hook';
import { TestInputController } from 'nestjs-example/src/test-input.controller';
import type { TestComponentProps, TestResult, QueryTestType } from '../types';

const { Title, Text, Paragraph } = Typography;

// 创建控制器实例
const testController = _http(TestInputController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
});

export const QueryTest: React.FC<TestComponentProps> = ({
  loading,
  results,
  setResults,
  setLoading,
}) => {
  const handleQueryTest = async (type: QueryTestType) => {
    const key = `query-${type}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      let res;
      if (type === 'named') {
        res = await testController.testNamedQuery('1', '10');
      } else {
        res = await testController.testQueryObject({
          page: '1',
          limit: '10',
          search: 'test',
        });
      }
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success(`Query ${type} 测试成功！`);
    } catch (error) {
      message.error(`Query ${type} 测试失败！`);
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
        <Title level={3}>Query 参数测试</Title>
        <Space wrap>
          <Button
            type="primary"
            loading={loading['query-named']}
            onClick={() => handleQueryTest('named')}
            icon={<SearchOutlined />}
          >
            具名查询参数
          </Button>
          <Button
            type="default"
            loading={loading['query-object']}
            onClick={() => handleQueryTest('object')}
            icon={<SettingOutlined />}
          >
            查询对象
          </Button>
        </Space>
      </div>
      {renderResult('query-named', '具名查询参数结果')}
      {renderResult('query-object', '查询对象结果')}
    </Space>
  );
};
