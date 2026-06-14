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
    { icon: Cloud, title: '云存储', desc: '安全可靠，随时随地访问' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Container size="xl" className="min-h-screen flex items-center">
        <div className="flex w-full items-center justify-center gap-20">
          {/* 左侧 */}
          <div className="max-w-[700px]">
            <Stack gap={40}>
              {/* Logo */}
              <Group gap="sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Text c="white" fw={700}>
                    AI
                  </Text>
                </div>

                <Text fw={700} size="xl">
                  AI Resume Agent
                </Text>
              </Group>

              {/* 标题 */}
              <div>
                <Title order={1} fw={500} className="text-[52px] leading-tight">
                  AI 驱动，轻松打造
                  <br />
                  <span className="text-blue-500">高质量简历</span>
                </Title>

                <Text c="dimmed" size="lg" mt="lg">
                  AI Resume Agent 帮助你快速创建、优化简历，
                  匹配岗位要求，提升面试表现，助你拿到心仪 Offer！
                </Text>
              </div>

              {/* 功能区 */}
              <Group gap={40} mt={20}>
                {features.map((feature) => (
                  <Stack
                    key={feature.title}
                    align="center"
                    gap={8}
                    className="w-[110px]"
                  >
                    <ThemeIcon size={56} radius="xl" variant="light">
                      <feature.icon size={24} />
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
          </div>

          {/* 右侧登录卡片 */}
          <div className="flex flex-col items-end justify-between gap-20">
            <Button
              size="sm"
              color="blue"
              radius="md"
              h={50}
              onClick={() => navigate('/')}
            >
              返回首页
            </Button>
            <Card shadow="md" radius="xl" p={40} className="w-[420px] ">
              <Stack gap="xl">
                <Stack align="center" gap={4}>
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
                  h={52}
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
          </div>
        </div>
      </Container>
    </div>
  );
}
