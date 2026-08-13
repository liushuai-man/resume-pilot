import { Loader } from '@mantine/core';
import { FilePlus2 } from 'lucide-react';

interface EmptyResumeProps {
  onClick?: () => void;
  loading?: boolean;
}

export default function EmptyResume({ onClick, loading = false }: EmptyResumeProps) {
  return (
    <button
      type="button"
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group flex min-h-[360px] w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#AFC1B9] bg-[#F9FBFA] px-8 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[#176B52] hover:bg-[#F1F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176B52] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader size="sm" color="#176B52" /> : <>
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-[#BFD0C9] bg-white text-[#176B52] transition group-hover:border-[#176B52]">
          <FilePlus2 size={22} strokeWidth={1.8} />
        </span>
        <span className="text-[15px] font-semibold text-[#17211D]">创建空白简历</span>
        <span className="mt-2 max-w-[210px] text-sm leading-6 text-[#66736D]">从基础信息开始，逐步补全你的求职证据</span>
      </>}
    </button>
  );
}
