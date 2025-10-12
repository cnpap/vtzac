import React from 'react';
import { Card, Button, Alert, Typography, message } from 'antd';
import { _http } from 'vtzac/hook';
import type {
  TestComponentProps,
  TestResult,
  LoadingState,
  ResultsState,
} from '../types';
import { TestInputController } from 'nestjs-example/src/test-input.controller';

const { Text, Paragraph } = Typography;

const ComplexTest: React.FC<TestComponentProps> = ({
  loading,
  setLoading,
  results,
  setResults,
}) => {
  const testController = _http(TestInputController);

  const handleComplexTest = async () => {
    setLoading((prev: LoadingState) => ({ ...prev, complex: true }));
    try {
      const res = await testController.testComplex(
        '123',
        { name: '更新的名称', status: 'active' },
        'v1.0',
        'Bearer token123'
      );
      setResults((prev: ResultsState) => ({ ...prev, complex: res._data }));
      message.success('复杂组合测试成功！');
    } catch (error) {
      console.error('复杂组合测试失败:', error);
      message.error('复杂组合测试失败！');
    } finally {
      setLoading((prev: LoadingState) => ({ ...prev, complex: false }));
    }
  };

  const renderResult = (key: string) => {
    const result = results[key] as TestResult;
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
                  <Text copyable>
                    {JSON.stringify(result, null, 2) as React.ReactNode}
                  </Text>
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
    <Card title="复杂组合测试" size="small">
      <Button
        type="primary"
        loading={loading['complex-test']}
        onClick={handleComplexTest}
      >
        发送复杂组合请求
      </Button>
      {renderResult('complex')}
    </Card>
  );
};

export default ComplexTest;
