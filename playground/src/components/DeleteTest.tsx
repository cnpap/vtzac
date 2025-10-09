import React from 'react';
import { Card, Button, Alert, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { zac } from 'vtzac/hook';
import { TestInputController } from '../backend/test-input.controller';
import type { TestComponentProps } from '../types';

export const DeleteTest: React.FC<TestComponentProps> = ({
  loading,
  setLoading,
  results,
  setResults,
}) => {
  const testController = zac(TestInputController);

  const handleDeleteTest = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await testController.call('testDeleteMethod', '123');
      setResults(prev => ({ ...prev, delete: res._data }));
      message.success('DELETE 方法测试成功！');
    } catch (error) {
      console.error('DELETE 方法测试失败:', error);
      message.error('DELETE 方法测试失败！');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const renderResult = (key: string) => {
    const result = results[key];
    if (!result) return null;

    return (
      <Alert
        type="success"
        message="响应结果"
        description={
          <pre style={{ margin: 0, fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        }
        style={{ marginTop: 16 }}
      />
    );
  };

  return (
    <Card title="DELETE 方法测试" size="small">
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined />}
        loading={loading.delete}
        onClick={handleDeleteTest}
      >
        执行 DELETE 请求
      </Button>
      {renderResult('delete')}
    </Card>
  );
};
