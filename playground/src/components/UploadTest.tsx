import React from 'react';
import { Button, Space, Typography, Alert, Card, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { zac } from 'vtzac/hook';
import { TestInputController } from '../backend/test-input.controller';
import type { TestComponentProps } from '../types';

const { Title, Text, Paragraph } = Typography;

// 创建控制器实例
const testController = zac(TestInputController);

export const UploadTest: React.FC<TestComponentProps> = ({
  loading,
  results,
  setResults,
  setLoading,
}) => {
  // 单文件上传
  const handleSingleUpload = async (file: File) => {
    const key = 'upload-single';
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await testController.call(
        'testSingleFileUpload',
        file as unknown as Express.Multer.File,
        { metadata: 'test' }
      );
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success('单文件上传成功！');
    } catch (error) {
      message.error('单文件上传失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // 多文件上传
  const handleMultipleUpload = async (files: File[]) => {
    const key = 'upload-multiple';
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await testController.call(
        'testMultipleFileUpload',
        files as unknown as Express.Multer.File[],
        { metadata: 'test' }
      );
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success(`多文件上传成功！上传了 ${files.length} 个文件`);
    } catch (error) {
      message.error('多文件上传失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // 具名多文件上传
  const handleNamedUpload = async (documents: File[], images: File[]) => {
    const key = 'upload-named';
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await testController.call(
        'testNamedMultipleFileUpload',
        {
          documents: documents as unknown as Express.Multer.File[],
          images: images as unknown as Express.Multer.File[],
        },
        { metadata: 'test' }
      );
      setResults(prev => ({ ...prev, [key]: res._data }));
      message.success(
        `具名多文件上传成功！文档: ${documents.length} 个，图片: ${images.length} 个`
      );
    } catch (error) {
      message.error('具名多文件上传失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // 渲染结果
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3}>文件上传测试</Title>

      {/* 单文件上传 */}
      <Card title="单文件上传" size="small">
        <Paragraph type="secondary">
          测试单个文件上传功能，支持各种文件类型。
        </Paragraph>
        <Upload
          beforeUpload={file => {
            handleSingleUpload(file);
            return false;
          }}
          showUploadList={false}
        >
          <Button
            icon={<UploadOutlined />}
            loading={loading['upload-single']}
            type="primary"
          >
            选择文件上传
          </Button>
        </Upload>
        {renderResult('upload-single')}
      </Card>

      {/* 多文件上传 */}
      <Card title="多文件上传" size="small">
        <Paragraph type="secondary">
          测试多个文件同时上传功能，最多支持5个文件。
        </Paragraph>
        <Upload
          multiple
          beforeUpload={(_file, fileList) => {
            if (fileList.length <= 5) {
              handleMultipleUpload(fileList);
            } else {
              message.error('最多只能选择5个文件！');
            }
            return false;
          }}
          showUploadList={false}
        >
          <Button
            icon={<UploadOutlined />}
            loading={loading['upload-multiple']}
            type="primary"
          >
            选择多个文件上传
          </Button>
        </Upload>
        {renderResult('upload-multiple')}
      </Card>

      {/* 具名多文件上传 */}
      <Card title="具名多文件上传" size="small">
        <Paragraph type="secondary">
          测试具名多文件上传功能，分别上传文档和图片文件。
        </Paragraph>
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
                    message.success(`已选择 ${fileList.length} 个文档文件`);
                  } else {
                    message.error('文档文件最多只能选择3个！');
                  }
                  return false;
                }}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.txt"
              >
                <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                  选择文档文件
                </Button>
              </Upload>
              {(() => {
                const tempDocs = results['temp-documents'];
                if (tempDocs && Array.isArray(tempDocs)) {
                  return (
                    <div
                      style={{ marginTop: 8, fontSize: '12px', color: '#666' }}
                    >
                      已选择 {tempDocs.length} 个文档文件
                    </div>
                  );
                }
                return null;
              })()}
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
                    setResults(prev => ({ ...prev, 'temp-images': fileList }));
                    message.success(`已选择 ${fileList.length} 个图片文件`);
                  } else {
                    message.error('图片文件最多只能选择2个！');
                  }
                  return false;
                }}
                showUploadList={false}
                accept=".jpg,.jpeg,.png,.gif,.bmp"
              >
                <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                  选择图片文件
                </Button>
              </Upload>
              {(() => {
                const tempImages = results['temp-images'];
                if (tempImages && Array.isArray(tempImages)) {
                  return (
                    <div
                      style={{ marginTop: 8, fontSize: '12px', color: '#666' }}
                    >
                      已选择 {tempImages.length} 个图片文件
                    </div>
                  );
                }
                return null;
              })()}
            </Col>
          </Row>
          <Button
            type="primary"
            loading={loading['upload-named']}
            onClick={() => {
              const documents = (results['temp-documents'] as File[]) || [];
              const images = (results['temp-images'] as File[]) || [];
              if (documents.length === 0 && images.length === 0) {
                message.warning('请先选择文件！');
                return;
              }
              handleNamedUpload(documents, images);
            }}
            style={{ width: '100%' }}
          >
            开始具名多文件上传
          </Button>
        </Space>
        {renderResult('upload-named')}
      </Card>
    </Space>
  );
};
