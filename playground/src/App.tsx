import { zac, setGlobalZacOfetchOptions } from 'vtzac/hook';
import { TestInputController } from './backend/test-input.controller';
import { AppController } from './backend/app.controller';
import {
  Segmented,
  Button,
  Upload,
  message,
  Card,
  Typography,
  Alert,
  Space,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  SendOutlined,
  DeleteOutlined,
  SearchOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Text, Paragraph, Title } = Typography;
import 'antd/dist/reset.css';

setGlobalZacOfetchOptions({
  baseURL: 'http://localhost:3001',
});

// 如果这里设置了 ofetchOptions，则会覆盖全局设置
const defaultController = zac(AppController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
    timeout: 5000,
  },
});
const testController = zac(TestInputController);

function App() {
  const [activeCase, setActiveCase] = useState<string>('hello');
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // 通用的结果设置和加载状态管理
  const setResult = (key: string, data: any) => {
    setResults(prev => ({ ...prev, [key]: data }));
  };

  const setLoadingState = (key: string, state: boolean) => {
    setLoading(prev => ({ ...prev, [key]: state }));
  };

  // Hello 测试
  const handleHello = async () => {
    setLoadingState('hello', true);
    try {
      const res = await defaultController
        .setOptions({
          // 这里的设置优先级最高，会覆盖上级设置
          ofetchOptions: {
            timeout: 10000,
          },
        })
        .call('getHello');
      setResult('hello', res._data);
      message.success('Hello 请求成功！');
    } catch (error) {
      message.error('Hello 请求失败！');
      console.error(error);
    } finally {
      setLoadingState('hello', false);
    }
  };

  // Query 参数测试
  const handleQueryTest = async (type: 'named' | 'object') => {
    const key = `query-${type}`;
    setLoadingState(key, true);
    try {
      let res;
      if (type === 'named') {
        res = await testController.call('testNamedQuery', '1', '10');
      } else {
        res = await testController.call('testQueryObject', {
          page: '1',
          limit: '10',
          search: 'test',
        });
      }
      setResult(key, res._data);
      message.success(`Query ${type} 测试成功！`);
    } catch (error) {
      message.error(`Query ${type} 测试失败！`);
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // Param 参数测试
  const handleParamTest = async (type: 'named' | 'object' | 'mixed') => {
    const key = `param-${type}`;
    setLoadingState(key, true);
    try {
      let res;
      if (type === 'named') {
        res = await testController.call('testNamedParam', '123', '456');
      } else if (type === 'object') {
        res = await testController.call('testParamObject', {
          type: 'user',
          id: '123',
          action: 'edit',
        });
      } else {
        res = await testController.call('testMixedParam', '123', {
          userId: '123',
          postId: '456',
        });
      }
      setResult(key, res._data);
      message.success(`Param ${type} 测试成功！`);
    } catch (error) {
      message.error(`Param ${type} 测试失败！`);
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // Headers 测试
  const handleHeadersTest = async () => {
    const key = 'headers';
    setLoadingState(key, true);
    try {
      const res = await testController.call('testHeaders', 'Bearer token123', {
        authorization: 'Bearer token123',
        'user-agent': 'Test Client',
        'x-custom-header': 'custom-value',
      });
      setResult(key, res._data);
      message.success('Headers 测试成功！');
    } catch (error) {
      message.error('Headers 测试失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // 单文件上传
  const handleSingleUpload = async (file: File) => {
    const key = 'upload-single';
    setLoadingState(key, true);
    try {
      const res = await testController.call(
        'testSingleFileUpload',
        file as unknown as Express.Multer.File,
        { metadata: 'test' }
      );
      setResult(key, res._data);
      message.success('单文件上传成功！');
    } catch (error) {
      message.error('单文件上传失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // 多文件上传
  const handleMultipleUpload = async (files: File[]) => {
    const key = 'upload-multiple';
    setLoadingState(key, true);
    try {
      const res = await testController.call(
        'testMultipleFileUpload',
        files as unknown as Express.Multer.File[],
        { metadata: 'test' }
      );
      setResult(key, res._data);
      message.success(`多文件上传成功！上传了 ${files.length} 个文件`);
    } catch (error) {
      message.error('多文件上传失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // 具名多文件上传
  const handleNamedUpload = async (documents: File[], images: File[]) => {
    const key = 'upload-named';
    setLoadingState(key, true);
    try {
      const res = await testController.call(
        'testNamedMultipleFileUpload',
        {
          documents: documents as unknown as Express.Multer.File[],
          images: images as unknown as Express.Multer.File[],
        },
        { metadata: 'test' }
      );
      setResult(key, res._data);
      message.success(
        `具名多文件上传成功！文档: ${documents.length} 个，图片: ${images.length} 个`
      );
    } catch (error) {
      message.error('具名多文件上传失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // 复杂组合测试
  const handleComplexTest = async () => {
    const key = 'complex';
    setLoadingState(key, true);
    try {
      const res = await testController.call(
        'testComplex',
        '123',
        { name: '更新的名称', status: 'active' },
        'v1.0',
        'Bearer token123',
        {} as any
      );
      setResult(key, res._data);
      message.success('复杂组合测试成功！');
    } catch (error) {
      message.error('复杂组合测试失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // DELETE 方法测试
  const handleDeleteTest = async () => {
    const key = 'delete';
    setLoadingState(key, true);
    try {
      const res = await testController.call('testDeleteMethod', '123');
      setResult(key, res._data);
      message.success('DELETE 方法测试成功！');
    } catch (error) {
      message.error('DELETE 方法测试失败！');
      console.error(error);
    } finally {
      setLoadingState(key, false);
    }
  };

  // 通用结果渲染组件
  const renderResult = (key: string, title: string) => {
    const result = results[key];
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

  const renderContent = () => {
    switch (activeCase) {
      case 'hello':
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
            {renderResult('hello', 'Hello 返回结果')}
          </Space>
        );

      case 'query':
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

      case 'param':
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

      case 'headers':
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
            {renderResult('headers', 'Headers 测试结果')}
          </Space>
        );

      case 'upload':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3}>文件上传测试</Title>
            </div>

            {/* 单文件上传 */}
            <Card title="单文件上传" size="small">
              <Upload
                beforeUpload={file => {
                  handleSingleUpload(file);
                  return false;
                }}
                showUploadList={false}
                accept="*"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={loading['upload-single']}
                  type="primary"
                >
                  选择单个文件上传
                </Button>
              </Upload>
              {renderResult('upload-single', '单文件上传结果')}
            </Card>

            {/* 多文件上传 */}
            <Card title="多文件上传（最多5个）" size="small">
              <Upload
                multiple
                beforeUpload={(_file, fileList) => {
                  // 当所有文件都选择完毕后触发上传
                  if (fileList.length <= 5) {
                    handleMultipleUpload(fileList);
                  } else {
                    message.error('最多只能选择5个文件！');
                  }
                  return false;
                }}
                showUploadList={false}
                accept="*"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={loading['upload-multiple']}
                  type="primary"
                >
                  选择多个文件上传（最多5个）
                </Button>
              </Upload>
              {renderResult('upload-multiple', '多文件上传结果')}
            </Card>

            {/* 具名多文件上传 */}
            <Card title="具名多文件上传" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>文档文件（最多3个）：</Text>
                    </div>
                    <Upload
                      multiple
                      beforeUpload={(_file, fileList) => {
                        if (fileList.length <= 3) {
                          // 存储文档文件到状态中
                          setResults(prev => ({
                            ...prev,
                            'temp-documents': fileList,
                          }));
                          message.success(
                            `已选择 ${fileList.length} 个文档文件`
                          );
                        } else {
                          message.error('文档文件最多只能选择3个！');
                        }
                        return false;
                      }}
                      showUploadList={false}
                      accept=".pdf,.doc,.docx,.txt"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{ width: '100%' }}
                      >
                        选择文档文件
                      </Button>
                    </Upload>
                    {results['temp-documents'] && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        已选择 {results['temp-documents'].length} 个文档文件
                      </div>
                    )}
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>图片文件（最多2个）：</Text>
                    </div>
                    <Upload
                      multiple
                      beforeUpload={(_file, fileList) => {
                        if (fileList.length <= 2) {
                          // 存储图片文件到状态中
                          setResults(prev => ({
                            ...prev,
                            'temp-images': fileList,
                          }));
                          message.success(
                            `已选择 ${fileList.length} 个图片文件`
                          );
                        } else {
                          message.error('图片文件最多只能选择2个！');
                        }
                        return false;
                      }}
                      showUploadList={false}
                      accept=".jpg,.jpeg,.png,.gif,.bmp"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{ width: '100%' }}
                      >
                        选择图片文件
                      </Button>
                    </Upload>
                    {results['temp-images'] && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        已选择 {results['temp-images'].length} 个图片文件
                      </div>
                    )}
                  </Col>
                </Row>
                <Button
                  type="primary"
                  size="large"
                  loading={loading['upload-named']}
                  disabled={
                    !results['temp-documents'] && !results['temp-images']
                  }
                  onClick={() => {
                    const documents = results['temp-documents'] || [];
                    const images = results['temp-images'] || [];
                    handleNamedUpload(documents, images);
                  }}
                  style={{ width: '100%', marginTop: 16 }}
                >
                  执行具名多文件上传
                </Button>
              </Space>
              {renderResult('upload-named', '具名多文件上传结果')}
            </Card>
          </Space>
        );

      case 'complex':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3}>复杂组合测试</Title>
              <Button
                type="primary"
                size="large"
                loading={loading.complex}
                onClick={handleComplexTest}
                icon={<SendOutlined />}
              >
                执行复杂组合测试
              </Button>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                包含 Param + Body + Query + Headers + Request
              </div>
            </div>
            {renderResult('complex', '复杂组合测试结果')}
          </Space>
        );

      case 'delete':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3}>HTTP DELETE 方法测试</Title>
              <Button
                type="primary"
                size="large"
                danger
                loading={loading.delete}
                onClick={handleDeleteTest}
                icon={<DeleteOutlined />}
              >
                执行 DELETE 请求
              </Button>
            </div>
            {renderResult('delete', 'DELETE 方法测试结果')}
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <Title level={1} style={{ marginBottom: '24px' }}>
              NestJS 测试用例演示
            </Title>
            <Segmented
              options={[
                { label: 'Hello 测试', value: 'hello' },
                { label: 'Query 参数', value: 'query' },
                { label: 'Param 参数', value: 'param' },
                { label: 'Headers 请求头', value: 'headers' },
                { label: '文件上传', value: 'upload' },
                { label: '复杂组合', value: 'complex' },
                { label: 'DELETE 方法', value: 'delete' },
              ]}
              value={activeCase}
              onChange={setActiveCase}
              block
              size="large"
            />
          </div>
          <Divider />
          <div className="mt-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
