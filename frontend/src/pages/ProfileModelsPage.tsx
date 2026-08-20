import { ActionIcon, Badge, Button, Group, Loader, Paper, Text } from '@mantine/core';
import { Pencil, Plus, Star, StarOff, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ModelManagerModal from '@/components/common/ModelManagerModal';
import { modelConfigApi, type ModelConfig } from '@/api/model-config.api';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';

const providerLabels: Record<string, string> = {
  openai: 'OpenAI', deepseek: 'DeepSeek', mimo: 'Mimo', zhipu: '智谱 AI',
  qwen: '通义千问', custom: '自定义',
};

export default function ProfileModelsPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ModelConfig | null>(null);

  const load = async () => {
    try {
      const response = await modelConfigApi.list();
      if (response.code === 200) setConfigs(response.data || []);
    } catch (error) {
      notification.error(getApiErrorMessage(error, '模型配置加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openForm = (config: ModelConfig | null = null) => {
    setEditingConfig(config);
    setOpened(true);
  };

  const setDefault = async (id: string) => {
    try {
      await modelConfigApi.setDefault(id);
      notification.success('已设为默认模型');
      await load();
    } catch (error) {
      notification.error(getApiErrorMessage(error, '设置默认模型失败'));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('确定删除这个模型配置吗？')) return;
    try {
      await modelConfigApi.delete(id);
      notification.success('模型配置已删除');
      await load();
    } catch (error) {
      notification.error(getApiErrorMessage(error, '删除模型配置失败'));
    }
  };

  return <>
    <div className="mb-5 flex min-h-12 items-start justify-between gap-4 border-b border-[#D8E1DD] pb-4">
      <p className="text-sm text-[#66736D]">管理模拟面试使用的模型配置、连接信息和默认模型。</p>
      <Button size="sm" leftSection={<Plus size={15} />} onClick={() => openForm()}>添加模型</Button>
    </div>
      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader color="#176B52" /></div> :
      <div className="space-y-3">
        {configs.length === 0 ? <Paper withBorder p="xl" className="text-center"><Text c="dimmed" size="sm">尚未配置模型。添加后才能使用 AI 面试与分析功能。</Text></Paper> :
          configs.map((config) => <Paper key={config.id} withBorder p="md" radius="md">
            <Group justify="space-between" wrap="nowrap">
              <div className="min-w-0">
                <Group gap="xs"><Text fw={600} size="sm">{config.displayName}</Text>{config.isDefault && <Badge color="teal" variant="light" size="sm">默认</Badge>}<Badge color={config.purpose === 'embedding' ? 'grape' : 'cyan'} variant="light" size="sm">{config.purpose === 'embedding' ? '向量模型' : '聊天模型'}</Badge></Group>
                <Text size="xs" c="dimmed" mt={6}>{providerLabels[config.provider] || config.provider} · {config.modelName}</Text>
                <Text size="xs" c="dimmed" mt={3}>{config.baseUrl || '使用服务商默认地址'}</Text>
              </div>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon variant="subtle" color="gray" title="编辑模型" onClick={() => openForm(config)}><Pencil size={16} /></ActionIcon>
                {config.purpose === 'chat' && <ActionIcon variant="subtle" color={config.isDefault ? 'teal' : 'yellow'} title={config.isDefault ? '当前默认模型' : '设为默认'} disabled={config.isDefault} onClick={() => void setDefault(config.id)}>{config.isDefault ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}</ActionIcon>}
                <ActionIcon variant="subtle" color="red" title="删除模型" onClick={() => void remove(config.id)}><Trash2 size={16} /></ActionIcon>
              </Group>
            </Group>
          </Paper>)}
      </div>}
    <ModelManagerModal formOnly initialConfig={editingConfig} opened={opened} onClose={() => { setOpened(false); setEditingConfig(null); }} onConfigChange={() => void load()} />
  </>;
}
