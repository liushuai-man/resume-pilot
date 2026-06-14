import { Center, Loader, Text } from '@mantine/core';

interface LoadingPageProps {
  title?: string;
}

export default function LoadingPage({ title = '加载中...' }: LoadingPageProps) {
  return (
    <Center className="min-h-screen">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-blue-500 rounded-xl flex items-center justify-center">
          <Text c="white" fw="bold" size="lg">
            RA
          </Text>
        </div>
        <Loader size="lg" color="blue" mb={2} />
        <Text size="sm" color="dimmed">
          {title}
        </Text>
      </div>
    </Center>
  );
}
