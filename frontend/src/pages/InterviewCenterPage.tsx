import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, FileText, Play, Target } from 'lucide-react';
import { interviewApi, type InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';

export default function InterviewCenterPage() {
  const navigate = useNavigate();
  const [recentResults, setRecentResults] = useState<InterviewResult[]>([]);

  useEffect(() => {
    let active = true;
    interviewApi
      .getInterviewResults()
      .then((results) => {
        if (active) setRecentResults(results.slice(0, 3));
      })
      .catch((error) => console.error('加载最近面试记录失败:', error));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-2">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-blue-600">INTERVIEW PRACTICE</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">模拟面试</h1>
          <p className="mt-2 text-gray-500">使用目标岗位和简历证据进行有评价标准的面试训练。</p>
        </div>
        <button
          onClick={() => navigate('/resume/interview')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Play size={18} fill="currentColor" />
          开始新的面试
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Target className="text-blue-600" size={22} />
          <h2 className="mt-4 font-semibold text-gray-900">岗位定向</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">根据目标岗位要求决定能力维度和问题重点。</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <FileText className="text-blue-600" size={22} />
          <h2 className="mt-4 font-semibold text-gray-900">简历追问</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">围绕项目、经历和技能证据进行连续追问。</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <CalendarClock className="text-blue-600" size={22} />
          <h2 className="mt-4 font-semibold text-gray-900">训练复盘</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">保存评价结果，持续观察能力变化和知识缺口。</p>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">最近面试</h2>
            <p className="mt-1 text-sm text-gray-500">继续查看最近的训练结果</p>
          </div>
          <button onClick={() => navigate('/history')} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            查看全部 <ArrowRight size={15} />
          </button>
        </div>
        {recentResults.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">还没有面试记录，完成第一场训练后会显示在这里。</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentResults.map((result) => (
              <button key={result.id} onClick={() => navigate(`/resume/interview/result/${result.id}`)} className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{result.position || '模拟面试'}</p>
                  <p className="mt-1 text-xs text-gray-400">{result.resume?.title || '未关联简历'} · {formatDateTime(result.created_at)}</p>
                </div>
                <div className="flex items-center gap-3"><span className="text-sm font-semibold text-blue-600">{result.score || 0} 分</span><ArrowRight size={16} className="text-gray-400" /></div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
