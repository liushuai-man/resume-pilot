import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Container,
  Group,
  Title,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { Sparkles, Target, MessageSquare, Cloud } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleLoginToGithub = () => {
    // 通过 Vite proxy 跳转到后端 GitHub OAuth 授权入口
    try {
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('跳转github登录失败:', error);
      navigate('/auth/login');
    }
  };

  const features = [
    { icon: Sparkles, title: 'AI 智能优化', desc: '润色表达，提升专业度' },
    { icon: Target, title: '岗位匹配分析', desc: '精准匹配，突出优势' },
    { icon: MessageSquare, title: '模拟面试', desc: '实战演练，提升自信' },
    { icon: Cloud, title: '云存储', desc: '安全可靠，随时访问' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Container
        size={1400}
        className="min-h-screen flex items-center justify-center"
      >
        <Stack gap={40} className="w-[600px] ">
          {/* Logo */}
          <Group gap="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <Text c="white" fw={400}>
                  AI
                </Text>
              </div>

              <Text fw={400} size="xl">
                AI Resume Agent
              </Text>
            </div>
            <Button variant="subtle" color="gray" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </Group>

          {/* 标题 */}
          <div>
            <Title order={1} fw={400} className="text-[30px] ">
              AI 驱动，轻松打造
              <span className="text-blue-500 pl-2">高质量简历</span>
            </Title>

            <Text c="dimmed" size="lg" mt="lg" maw={600}>
              AI Resume Agent 帮助你快速创建、优化简历，
              匹配岗位要求，提升面试表现， 助你拿到心仪 Offer！
            </Text>
          </div>

          <Card shadow="xl" radius="xl" p={48} className="w-[420px] mx-auto">
            <Stack gap="xl">
              <Stack align="center" gap={6}>
                <Title order={3}>欢迎回来</Title>

                <Text c="dimmed" size="sm">
                  使用 GitHub 账号登录以继续
                </Text>
              </Stack>

              <Button
                size="lg"
                fullWidth
                color="dark"
                radius="md"
                h={54}
                leftSection={<FaGithub size={18} />}
                onClick={handleLoginToGithub}
              >
                使用 GitHub 登录
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                登录即表示你同意我们的
                <a href="#" className="text-blue-500 mx-1">
                  用户协议
                </a>
                和
                <a href="#" className="text-blue-500 mx-1">
                  隐私政策
                </a>
              </Text>
            </Stack>
          </Card>
          {/* 功能区 */}
          <Group justify="space-between">
            {features.map((feature) => (
              <Stack
                key={feature.title}
                align="center"
                gap={10}
                className="w-[130px]"
              >
                <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                  <feature.icon size={28} />
                </ThemeIcon>

                <Text fw={600} size="sm" ta="center">
                  {feature.title}
                </Text>

                <Text size="xs" c="dimmed" ta="center">
                  {feature.desc}
                </Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
