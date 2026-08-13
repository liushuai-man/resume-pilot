import { Check } from 'lucide-react';
import type { JobDescription } from '@/types/job';

interface JobSidebarProps {
  jobs: JobDescription[];
  selectedId: string | null;
  onSelect: (job: JobDescription) => void;
}

export default function JobSidebar({ jobs, selectedId, onSelect }: JobSidebarProps) {
  return (
    <aside className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold">目标岗位</h1>
        <p className="text-xs text-gray-500">{jobs.length} 个 JD</p>
      </div>
      <div className="space-y-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onSelect(job)}
            className={`w-full rounded-lg border p-3 text-left ${
              selectedId === job.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <p className="truncate font-medium text-gray-800">
              {job.latestProfile?.jobTitle || job.title || '未命名岗位'}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500">
              {job.company || '未填写公司'} · {job.latestProfile
                ? `V${job.latestProfile.version}`
                : '待分析'}
            </p>
            {job.latestProfile?.status === 'confirmed' && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-600">
                <Check size={12} />已确认
              </span>
            )}
          </button>
        ))}
        {jobs.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">还没有目标岗位</p>
        )}
      </div>
    </aside>
  );
}
