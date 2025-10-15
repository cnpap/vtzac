import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message, Tag, Space, Divider } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';

interface NicknameModalProps {
  visible: boolean;
  currentNickname?: string;
  onOk: (nickname: string) => void;
  onCancel: () => void;
}

// 推荐昵称数据
const NICKNAME_SUGGESTIONS = {
  cute: ['小可爱', '萌萌哒', '小天使', '甜心', '小糖果', '小星星'],
  cool: ['酷炫侠', '夜行者', '风暴', '闪电', '影子', '猎鹰'],
  funny: ['逗比王', '搞笑君', '开心果', '笑点低', '段子手', '幽默大师'],
  nature: ['清风', '明月', '流云', '晨露', '夕阳', '雨滴'],
  tech: ['代码侠', '程序猿', '极客', '数据师', '算法君', '技术宅'],
  animals: ['小熊猫', '小狐狸', '小兔子', '小猫咪', '小企鹅', '小海豚'],
};

// 生成随机推荐昵称
const generateRandomSuggestions = (count: number = 6): string[] => {
  const allSuggestions = Object.values(NICKNAME_SUGGESTIONS).flat();
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const NicknameModal: React.FC<NicknameModalProps> = ({
  visible,
  currentNickname,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 初始化推荐昵称
  useEffect(() => {
    if (visible) {
      setSuggestions(generateRandomSuggestions());
    }
  }, [visible]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const nickname = values.nickname.trim();

      if (!nickname) {
        message.error('昵称不能为空');
        return;
      }

      if (nickname.length > 20) {
        message.error('昵称长度不能超过20个字符');
        return;
      }

      onOk(nickname);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 点击推荐昵称直接确认
  const handleSuggestionClick = async (nickname: string) => {
    try {
      setLoading(true);

      if (!nickname) {
        message.error('昵称不能为空');
        return;
      }

      if (nickname.length > 20) {
        message.error('昵称长度不能超过20个字符');
        return;
      }

      onOk(nickname);
      form.resetFields();
    } catch (error) {
      console.error('昵称设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新推荐昵称
  const refreshSuggestions = () => {
    setSuggestions(generateRandomSuggestions());
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          设置昵称
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
      width={450}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ nickname: currentNickname || '' }}
      >
        <Form.Item
          name="nickname"
          label="昵称"
          rules={[
            { required: true, message: '请输入昵称' },
            { max: 20, message: '昵称长度不能超过20个字符' },
            { min: 1, message: '昵称不能为空' },
            {
              pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/,
              message: '昵称只能包含中文、英文、数字、下划线和连字符',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入您的昵称"
            maxLength={20}
            showCount
            autoFocus
          />
        </Form.Item>

        <Divider style={{ margin: '16px 0 12px 0' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            推荐昵称
            <ReloadOutlined
              style={{ marginLeft: 8, cursor: 'pointer' }}
              onClick={refreshSuggestions}
              title="刷新推荐"
            />
          </span>
        </Divider>

        <div style={{ marginBottom: 16 }}>
          <Space size={[8, 8]} wrap>
            {suggestions.map((suggestion, index) => (
              <Tag
                key={`${suggestion}-${index}`}
                color="blue"
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </Space>
        </div>

        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>• 昵称长度：1-20个字符</div>
          <div>• 支持中文、英文、数字、下划线和连字符</div>
          <div>• 昵称将在聊天中显示给其他用户</div>
          <div>• 点击推荐昵称可快速填入</div>
        </div>
      </Form>
    </Modal>
  );
};
