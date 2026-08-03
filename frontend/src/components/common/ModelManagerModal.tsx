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
} from '@mantine/core';
import {
  Trash2,
  Star,
  StarOff,
  Plus,
  Pencil,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  modelConfigApi,
  ModelConfig,
  ModelPreset,
  CreateModelConfigRequest,
} from '@/api/model-config.api';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setShowApiKey(false);
    setSaveError(null);
    setFormData({
      provider: 'openai',
      modelName: 'gpt-4o',
      apiKey: '',
      baseUrl: '',
      displayName: '',
      isDefault: false,
      purpose: 'chat',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
      notification.error(
        getApiErrorMessage(error, '加载模型配置失败，请稍后重试')
      );
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
    setSaveError(null);
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
      (!editingId && !formData.apiKey) ||
      !formData.displayName
    ) {
      const message = '请填写完整的配置信息';
      setSaveError(message);
      notification.error(message);
      return;
    }

    setSaveError(null);
    setLoading(true);
    try {
      const res = editingId
        ? await modelConfigApi.update(editingId, {
            provider: formData.provider,
            modelName: formData.modelName,
            ...(formData.apiKey.trim() ? { apiKey: formData.apiKey.trim() } : {}),
            baseUrl: formData.baseUrl,
            displayName: formData.displayName,
            purpose: formData.purpose,
          })
        : await modelConfigApi.create(formData);
      if (res.code === 200) {
        notification.success(editingId ? '模型配置已更新' : '模型配置已保存');
        resetForm();
        await loadConfigs();
        onConfigChange?.();
      } else {
        const message = res.message || '模型配置保存失败';
        setSaveError(message);
        notification.error(message);
      }
    } catch (error: any) {
      const message = getApiErrorMessage(error, '模型配置保存失败');
      setSaveError(message);
      notification.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: ModelConfig) => {
    setEditingId(config.id);
    setShowForm(true);
    setShowApiKey(false);
    setSaveError(null);
    setFormData({
      provider: config.provider,
      modelName: config.modelName,
      apiKey: '',
      baseUrl: config.baseUrl || '',
      displayName: config.displayName,
      isDefault: config.isDefault,
      purpose: config.purpose,
    });
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
      notification.error(getApiErrorMessage(error, '设置默认模型失败'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型配置吗？')) return;
    try {
      const res = await modelConfigApi.delete(id);
      if (res.code === 200) {
        notification.success('删除成功');
        if (editingId === id) resetForm();
        await loadConfigs();
        onConfigChange?.();
      }
    } catch (error: any) {
      notification.error(getApiErrorMessage(error, '删除模型配置失败'));
    }
  };

  const providerOptions = presets.map((p) => ({
    value: p.provider,
    label: PROVIDER_LABELS[p.provider] || p.provider,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="模型管理"
      size="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            已添加 {configs.length} 个模型配置
          </Text>
          <Button
            size="sm"
            leftSection={<Plus size={14} />}
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingId(null);
                setShowForm(true);
              }
            }}
            disabled={loading}
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
                onChange={(purpose) => {
                  setSaveError(null);
                  setFormData({
                    ...formData,
                    purpose: purpose === 'embedding' ? 'embedding' : 'chat',
                    isDefault: false,
                  });
                }}
                size="sm"
                disabled={loading}
              />
              <Text fw={500} size="sm">
                {editingId ? '编辑模型' : '添加新模型'}
              </Text>
              <Select
                label="服务商"
                placeholder="选择服务商"
                data={providerOptions}
                value={formData.provider}
                onChange={handleProviderChange}
                size="sm"
                disabled={loading}
              />
              <TextInput
                label="显示名称"
                placeholder="例如：我的 GPT-4"
                value={formData.displayName}
                onChange={(e) => {
                  setSaveError(null);
                  setFormData({ ...formData, displayName: e.target.value });
                }}
                size="sm"
                disabled={loading}
              />
              <TextInput
                label="模型名称"
                placeholder="例如：gpt-4o"
                value={formData.modelName}
                onChange={(e) => {
                  setSaveError(null);
                  setFormData({ ...formData, modelName: e.target.value });
                }}
                size="sm"
                disabled={loading}
              />
              <TextInput
                label="API Key"
                placeholder={editingId ? '留空则继续使用原 API Key' : 'sk-...'}
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => {
                  setSaveError(null);
                  setFormData({ ...formData, apiKey: e.target.value });
                }}
                size="sm"
                disabled={loading}
                rightSection={
                  <ActionIcon
                    size="xs"
                    onClick={() => setShowApiKey(!showApiKey)}
                    color="dimmed"
                    disabled={loading}
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </ActionIcon>
                }
              />
              <TextInput
                label="Base URL（可选）"
                placeholder="https://api.openai.com/v1"
                value={formData.baseUrl || ''}
                onChange={(e) => {
                  setSaveError(null);
                  setFormData({ ...formData, baseUrl: e.target.value });
                }}
                size="sm"
                disabled={loading}
              />

              <Text size="xs" c="dimmed">
                保存时会自动验证连接，验证失败不会覆盖现有配置。
              </Text>

              {saveError && (
                <Paper p="sm" radius="sm" bg="red.0" withBorder>
                  <Text size="sm" c="red.7" fw={500}>
                    连接测试未通过，配置尚未保存
                  </Text>
                  <Text size="xs" c="red.7" mt={4}>
                    {saveError}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    你填写的内容已保留，请修改后再次保存。
                  </Text>
                </Paper>
              )}

              <Group justify="flex-end" gap="sm">
                <Button size="sm" onClick={handleSubmit} loading={loading}>
                  {saveError
                    ? '重新测试并保存'
                    : editingId
                      ? '保存修改'
                      : '保存模型'}
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
                    <Badge
                      mt={4}
                      color={config.purpose === 'embedding' ? 'grape' : 'cyan'}
                      variant="light"
                      size="xs"
                    >
                      {config.purpose === 'embedding' ? '向量模型' : '聊天模型'}
                    </Badge>
                  </div>
                  <Group gap="xs">
                    <ActionIcon
                      size="sm"
                      color="gray"
                      variant="subtle"
                      onClick={() => handleEdit(config)}
                      title="编辑"
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                    {config.purpose === 'chat' && !config.isDefault && (
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
