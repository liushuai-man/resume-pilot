import { Loader, Text } from '@mantine/core';
import { FileCheck2 } from 'lucide-react';

interface LoadingPageProps {
  title?: string;
}

export default function LoadingPage({ title = '加载中...' }: LoadingPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F6] px-6 text-[#17211D]">
      <div className="w-full max-w-sm rounded-[8px] border border-[#D8E1DD] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#176B52] text-white">
          <FileCheck2 size={24} strokeWidth={1.9} />
        </div>
        <Loader size="md" color="#176B52" mb={8} />
        <Text size="sm" c="#66736D">
          {title}
        </Text>
      </div>
    </main>
  );
}
