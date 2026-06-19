import { Card, Text, Loader } from '@mantine/core';
import { Plus } from 'lucide-react';

interface EmptyResumeProps {
  onClick?: () => void;
  loading?: boolean;
}

export default function EmptyResume({
  onClick,
  loading = false,
}: EmptyResumeProps) {
  return (
    <Card
      className={`aspect-[3/4] border-2 border-gray-200 rounded-lg border-dashed flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-solid transition-shadow ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={loading ? undefined : onClick}
    >
      {loading ? (
        <Loader size="md" className="text-blue-500" />
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 hover:bg-blue-50 transition-colors">
            <Plus className="w-8 h-8 text-gray-400 hover:text-blue-500" />
          </div>
          <Text size="sm" fw="medium" className="text-gray-700">
            新建空白简历
          </Text>
          <Text size="xs" className="text-gray-400">
            从零开始创建你的简历
          </Text>
        </>
      )}
    </Card>
  );
}
