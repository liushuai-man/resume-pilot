import { useState, useEffect } from 'react';
import { Menu, Button, Text, ActionIcon } from '@mantine/core';
import { Cpu, Settings, ChevronDown, Plus } from 'lucide-react';
import { modelConfigApi, ModelConfig } from '@/api/model-config.api';
import ModelManagerModal from './ModelManagerModal';
import { useUserStore } from '@/store/useUserStore';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';

interface ModelSelectorProps {
  variant?: 'compact' | 'full';
  readOnly?: boolean;
}

export default function ModelSelector({
  variant = 'compact',
  readOnly = false,
}: ModelSelectorProps) {
  const { isLoggedIn } = useUserStore();
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [defaultConfig, setDefaultConfig] = useState<ModelConfig | null>(null);
  const [managerOpened, setManagerOpened] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadConfigs();
    }
  }, [isLoggedIn]);

  const loadConfigs = async () => {
    try {
      const res = await modelConfigApi.list();
      if (res.code === 200 && res.data) {
        const chatConfigs = res.data.filter(
          (config) => config.purpose === 'chat'
        );
        setConfigs(chatConfigs);
        const def = chatConfigs.find((config) => config.isDefault);
        setDefaultConfig(def || chatConfigs[0] || null);
      }
    } catch (error: any) {
      console.error('加载模型配置失败:', error);
      notification.error(
        getApiErrorMessage(error, '加载模型配置失败，请稍后重试')
      );
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await modelConfigApi.setDefault(id);
      if (res.code === 200) {
        await loadConfigs();
      }
    } catch (error: any) {
      console.error('设置默认模型失败:', error);
      notification.error(
        getApiErrorMessage(error, '设置默认模型失败，请稍后重试')
      );
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (readOnly) return variant === 'full' ? <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D8E1DD] bg-[#F7F9F8] px-3 text-sm text-[#52615B]"><Cpu size={16}/><span>{defaultConfig ? defaultConfig.displayName : '未配置模型'}</span>{defaultConfig && <span className="text-xs text-[#8A9691]">{defaultConfig.modelName}</span>}</div> : <ActionIcon variant="subtle" size="md" title={defaultConfig ? `当前模型：${defaultConfig.displayName}` : '未配置模型'} disabled><Cpu size={18}/></ActionIcon>;

  return (
    <>
      <Menu shadow="md" width={240} position="bottom-end">
        <Menu.Target>
          {variant === 'full' ? (
            <Button
              variant="subtle"
              size="sm"
              leftSection={<Cpu size={16} />}
              rightSection={<ChevronDown size={14} />}
            >
              {defaultConfig ? defaultConfig.displayName : '未配置模型'}
            </Button>
          ) : (
            <ActionIcon variant="subtle" size="md" title="模型选择">
              <Cpu size={18} />
            </ActionIcon>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Text size="xs" fw={500}>
              当前模型
            </Text>
          </Menu.Label>
          <Menu.Item
            leftSection={
              defaultConfig ? <Cpu size={14} /> : <Settings size={14} />
            }
            disabled
          >
            <div>
              <Text size="sm" fw={500}>
                {defaultConfig ? defaultConfig.displayName : '未配置模型'}
              </Text>
              <Text size="xs" c="dimmed">
                {defaultConfig ? defaultConfig.modelName : '请添加模型配置'}
              </Text>
            </div>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>
            <Text size="xs" fw={500}>
              切换模型
            </Text>
          </Menu.Label>

          {configs.length === 0 ? (
            <Menu.Item disabled>
              <Text size="sm" c="dimmed">
                暂无模型配置
              </Text>
            </Menu.Item>
          ) : (
            configs.map((config) => (
              <Menu.Item
                key={config.id}
                onClick={() => handleSetDefault(config.id)}
                leftSection={
                  config.isDefault ? (
                    <Text size="xs" c="blue" fw="bold">
                      ★
                    </Text>
                  ) : (
                    <Text size="xs" c="dimmed">
                      ○
                    </Text>
                  )
                }
              >
                <div>
                  <Text size="sm">{config.displayName}</Text>
                  <Text size="xs" c="dimmed">
                    {config.modelName}
                  </Text>
                </div>
              </Menu.Item>
            ))
          )}

          <Menu.Divider />

          <Menu.Item
            leftSection={<Plus size={14} />}
            onClick={() => setManagerOpened(true)}
          >
            <Text size="sm">添加/管理模型</Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ModelManagerModal
        opened={managerOpened}
        onClose={() => {
          setManagerOpened(false);
          loadConfigs();
        }}
        onConfigChange={loadConfigs}
      />
    </>
  );
}
