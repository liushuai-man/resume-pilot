import { useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container
      size="sm"
      className="min-h-screen flex items-center justify-center"
    >
      <Stack align="center" gap="lg">
        <Text
          size="120px"
          fw={700}
          className="text-gray-200 leading-none select-none"
        >
          404
        </Text>

        <Title order={2} ta="center">
          页面未找到
        </Title>

        <Text c="dimmed" size="lg" ta="center" maw={400}>
          抱歉，您访问的页面不存在或已被移除。
        </Text>

        <Button
          size="md"
          leftSection={<Home size={18} />}
          onClick={() => navigate('/')}
          className="mt-4"
        >
          返回首页
        </Button>
      </Stack>
    </Container>
  );
}
