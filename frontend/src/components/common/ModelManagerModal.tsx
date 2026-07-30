import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Select,
  Text,
  Paper,
  Group,
  ActionIcon,
  Badge,
  Stack,
  Loader,
} from '@mantine/core';
import {
  Trash2,
  Star,
  StarOff,
  Plus,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  modelConfigApi,
  ModelConfig,
  ModelPreset,
  CreateModelConfigRequest,
  TestConnectionResponse,
} from '@/api/model-config.api';
import { notification } from '@/components/common/Notification';

interface ModelManagerModalProps {
  opened: boolean;
  onClose: () => void;
  onConfigChange?: () => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  mimo: 'Mimo (小米)',
  zhipu: '智谱 AI',
  qwen: '通义千问',
  custom: '自定义',
};

export default function ModelManagerModal({
  opened,
  onClose,
  onConfigChange,
}: ModelManagerModalProps) {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [presets, setPresets] = useState<ModelPreset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(
    null
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState<CreateModelConfigRequest>({
    provider: 'openai',
    modelName: 'gpt-4o',
    apiKey: '',
    baseUrl: '',
    displayName: '',
    isDefault: false,
    purpose: 'chat',
  });

  useEffect(() => {
    if (opened) {
      loadConfigs();
      loadPresets();
    }
  }, [opened]);

  const loadConfigs = async () => {
    try {
      const res = await modelConfigApi.list();
      if (res.code === 200) {
        setConfigs(res.data || []);
      }
    } catch (error: any) {
      console.error('加载模型配置失败:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const res = await modelConfigApi.getPresets();
      if (res.code === 200) {
        setPresets(res.data || []);
      }
    } catch (error: any) {
      console.error('加载预设失败:', error);
    }
  };

  const handleProviderChange = (provider: string | null) => {
    if (!provider) return;
    const preset = presets.find((p) => p.provider === provider);
    setFormData((prev) => ({
      ...prev,
      provider,
      baseUrl: preset?.baseUrl || '',
      modelName: preset?.defaultModel || '',
      displayName: prev.displayName || PROVIDER_LABELS[provider] || provider,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.provider ||
      !formData.modelName ||
      !formData.apiKey ||
      !formData.displayName
    ) {
      notification.error('请填写完整的配置信息');
      return;
    }

    setLoading(true);
    try {
      const res = await modelConfigApi.create(formData);
      if (res.code === 200) {
        notification.success('模型配置创建成功');
        setShowForm(false);
        setFormData({
          provider: 'openai',
          modelName: 'gpt-4o',
          apiKey: '',
          baseUrl: '',
          displayName: '',
          isDefault: false,
          purpose: 'chat',
        });
        await loadConfigs();
        onConfigChange?.();
      } else {
        notification.error(res.message || '创建失败');
      }
    } catch (error: any) {
      notification.error(`创建失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await modelConfigApi.setDefault(id);
      if (res.code === 200) {
        notification.success('已设为默认模型');
        await loadConfigs();
        onConfigChange?.();
      }
    } catch (error: any) {
      notification.error(`设置失败: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型配置吗？')) return;
    try {
      const res = await modelConfigApi.delete(id);
      if (res.code === 200) {
        notification.success('删除成功');
        await loadConfigs();
        onConfigChange?.();
      }
    } catch (error: any) {
      notification.error(`删除失败: ${error.message}`);
    }
  };

  const providerOptions = presets.map((p) => ({
    value: p.provider,
    label: PROVIDER_LABELS[p.provider] || p.provider,
  }));

  const handleTestConnection = async () => {
    if (!formData.provider || !formData.modelName || !formData.apiKey) {
      notification.error('请填写服务商、模型名称和 API Key');
      return;
    }

    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await modelConfigApi.test({
        provider: formData.provider,
        modelName: formData.modelName,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl,
      });
      if (res.code === 200 && res.data) {
        setTestResult(res.data);
        if (res.data.success) {
          notification.success('连接测试成功');
        } else {
          notification.error(`连接测试失败: ${res.data.message}`);
        }
      }
    } catch (error: any) {
      notification.error(`测试失败: ${error.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="模型管理" size="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            已添加 {configs.length} 个模型配置
          </Text>
          <Button
            size="sm"
            leftSection={<Plus size={14} />}
            onClick={() => {
              setShowForm(!showForm);
              setTestResult(null);
            }}
          >
            {showForm ? '取消' : '添加模型'}
          </Button>
        </Group>

        {showForm && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Select
                label="模型用途"
                data={[
                  { value: 'chat', label: '聊天模型（必需）' },
                  { value: 'embedding', label: '向量模型（可选）' },
                ]}
                value={formData.purpose || 'chat'}
                onChange={(purpose) =>
                  setFormData({
                    ...formData,
                    purpose: purpose === 'embedding' ? 'embedding' : 'chat',
                    isDefault: false,
                  })
                }
                size="sm"
              />
              <Text fw={500} size="sm">
                添加新模型
              </Text>
              <Select
                label="服务商"
                placeholder="选择服务商"
                data={providerOptions}
                value={formData.provider}
                onChange={handleProviderChange}
                size="sm"
              />
              <TextInput
                label="显示名称"
                placeholder="例如：我的 GPT-4"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                size="sm"
              />
              <TextInput
                label="模型名称"
                placeholder="例如：gpt-4o"
                value={formData.modelName}
                onChange={(e) =>
                  setFormData({ ...formData, modelName: e.target.value })
                }
                size="sm"
              />
              <TextInput
                label="API Key"
                placeholder="sk-..."
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                size="sm"
                rightSection={
                  <ActionIcon
                    size="xs"
                    onClick={() => setShowApiKey(!showApiKey)}
                    color="dimmed"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </ActionIcon>
                }
              />
              <TextInput
                label="Base URL（可选）"
                placeholder="https://api.openai.com/v1"
                value={formData.baseUrl || ''}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                size="sm"
              />

              {testResult && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {testResult.success ? (
                    <Wifi size={16} style={{ color: '#22c55e' }} />
                  ) : (
                    <WifiOff size={16} style={{ color: '#ef4444' }} />
                  )}
                  <Text size="sm" c={testResult.success ? 'green' : 'red'}>
                    {testResult.message}
                    {testResult.response && (
                      <Text size="xs" c="dimmed" style={{ display: 'block' }}>
                        响应: {testResult.response}
                      </Text>
                    )}
                  </Text>
                </div>
              )}

              <Group justify="flex-end" gap="sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestConnection}
                  loading={testLoading}
                  leftSection={
                    testLoading ? <Loader size={14} /> : <Wifi size={14} />
                  }
                >
                  测试连接
                </Button>
                <Button size="sm" onClick={handleSubmit} loading={loading}>
                  保存
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        <Stack gap="xs">
          {configs.length === 0 ? (
            <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
              <Text c="dimmed" size="sm">
                还没有添加模型配置，点击上方「添加模型」开始配置
              </Text>
            </Paper>
          ) : (
            configs.map((config) => (
              <Paper key={config.id} p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Group gap="xs">
                      <Text fw={500} size="sm">
                        {config.displayName}
                      </Text>
                      {config.isDefault && (
                        <Badge color="blue" size="xs">
                          默认
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {PROVIDER_LABELS[config.provider] || config.provider} ·{' '}
                      {config.modelName}
                    </Text>
                  </div>
                  <Group gap="xs">
                    {!config.isDefault && (
                      <ActionIcon
                        size="sm"
                        color="yellow"
                        onClick={() => handleSetDefault(config.id)}
                        title="设为默认"
                      >
                        <StarOff size={16} />
                      </ActionIcon>
                    )}
                    {config.isDefault && (
                      <ActionIcon size="sm" color="blue" title="默认模型">
                        <Star size={16} fill="currentColor" />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      size="sm"
                      color="red"
                      onClick={() => handleDelete(config.id)}
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
