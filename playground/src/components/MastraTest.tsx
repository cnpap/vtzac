import React, { useState } from 'react';
import { Button, Space, Typography, Alert, Input, Card } from 'antd';
import {
  SendOutlined,
  CloudOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { _http } from 'vtzac/hook';
import { MastraController } from 'nestjs-example/src/mastra.controller';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 创建控制器实例
const mastraController = _http(MastraController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
    timeout: 30000, // Mastra 调用可能需要更长时间
  },
});

export const MastraTest: React.FC = () => {
  const [loading, setLoading] = useState({
    chat: false,
    weather: false,
    activities: false,
  });
  const [results, setResults] = useState<{
    chat?: unknown;
    weather?: unknown;
    activities?: unknown;
  }>({});
  const [chatMessage, setChatMessage] = useState('');
  const [weatherLocation, setWeatherLocation] = useState('');
  const [activitiesCity, setActivitiesCity] = useState('');

  const handleChat = async () => {
    if (!chatMessage.trim()) {
      message.warning('请输入聊天消息');
      return;
    }

    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const res = await mastraController.chatWithAgent({
        message: chatMessage,
      });
      setResults(prev => ({ ...prev, chat: res._data }));
      message.success('聊天请求成功！');
    } catch (error) {
      message.error('聊天请求失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  const handleWeather = async () => {
    if (!weatherLocation.trim()) {
      message.warning('请输入位置');
      return;
    }

    setLoading(prev => ({ ...prev, weather: true }));
    try {
      const res = await mastraController.getWeather(weatherLocation);
      setResults(prev => ({ ...prev, weather: res._data }));
      message.success('天气查询成功！');
    } catch (error) {
      message.error('天气查询失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, weather: false }));
    }
  };

  const handleActivities = async () => {
    if (!activitiesCity.trim()) {
      message.warning('请输入城市名称');
      return;
    }

    setLoading(prev => ({ ...prev, activities: true }));
    try {
      const res = await mastraController.getWeatherActivities(activitiesCity);
      setResults(prev => ({ ...prev, activities: res._data }));
      message.success('活动建议获取成功！');
    } catch (error) {
      message.error('活动建议获取失败！');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  const renderResult = (key: string, result: unknown) => {
    if (!result) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          message={`${key} 结果`}
          description={
            <div>
              <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                {typeof result === 'string'
                  ? result
                  : JSON.stringify(result, null, 2)}
              </Text>
            </div>
          }
          type="success"
          showIcon
        />
      </div>
    );
  };

  return (
    <div>
      <Title level={3}>Mastra AI 测试</Title>
      <Paragraph>
        测试 Mastra AI 功能，包括智能聊天、天气查询和活动建议。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 智能聊天测试 */}
        <Card title="智能聊天" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="输入你想和 AI 聊天的内容..."
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              rows={3}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading.chat}
              onClick={handleChat}
            >
              发送聊天
            </Button>
            {renderResult('聊天', results.chat)}
          </Space>
        </Card>

        {/* 天气查询测试 */}
        <Card title="天气查询" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="输入城市名称，如：北京、上海、New York..."
              value={weatherLocation}
              onChange={e => setWeatherLocation(e.target.value)}
              prefix={<EnvironmentOutlined />}
            />
            <Button
              type="primary"
              icon={<CloudOutlined />}
              loading={loading.weather}
              onClick={handleWeather}
            >
              查询天气
            </Button>
            {renderResult('天气', results.weather)}
          </Space>
        </Card>

        {/* 活动建议测试 */}
        <Card title="活动建议" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="输入城市名称，获取基于天气的活动建议..."
              value={activitiesCity}
              onChange={e => setActivitiesCity(e.target.value)}
              prefix={<EnvironmentOutlined />}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading.activities}
              onClick={handleActivities}
            >
              获取活动建议
            </Button>
            {renderResult('活动建议', results.activities)}
          </Space>
        </Card>
      </Space>
    </div>
  );
};
