import { ActionIcon, Input, Select } from '@mantine/core';
import { ArrowDownAZ, ArrowUpAZ, FileText, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyResume from '@/components/home/EmptyResume';
import HistoryResume from '@/components/home/HistoryResume';
import ResumeTemplate from '@/components/home/ResumeTemplate';
import { resumeApi } from '@/api/home.api';
import { emptyResumeContent } from '@/utils/emptyResumeContent';
import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { notification } from '@/components/common/Notification';
import type { Resume } from '@/types/resume';
import { getApiErrorMessage } from '@/utils/api-error';

const MAX_RESUMES = 7;

export default function HomePage() {
  const { isLoggedIn, user } = useUserStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'name'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    void (async () => {
      try {
        const response = await resumeApi.getUserResumes({ excludeUploaded: true });
        if (response.code === 200 && response.data) setResumes(response.data.filter((item) => item.content?.isUploadedFile !== true));
      } catch (error) {
        notification.error(getApiErrorMessage(error, '简历列表加载失败，请刷新后重试'));
      }
    })();
  }, [isLoggedIn]);

  const filteredResumes = useMemo(() => {
    const result = resumes.filter((resume) => resume.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()));
    result.sort((a, b) => {
      const comparison = sortBy === 'name' ? a.title.localeCompare(b.title, 'zh-CN') : new Date(a[sortBy === 'created' ? 'created_at' : 'updated_at']).getTime() - new Date(b[sortBy === 'created' ? 'created_at' : 'updated_at']).getTime();
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return result;
  }, [resumes, searchKeyword, sortBy, sortOrder]);

  const createResume = async (templateId: string, title = '我的简历') => {
    if (!isLoggedIn) return navigate('/auth/login');
    setIsCreating(true);
    try {
      const response = await resumeApi.createResume({ template_id: templateId, title, content: emptyResumeContent });
      if (response.data) { notification.success('简历创建成功'); navigate(`/resumes/${response.data.id}/edit`); }
    } catch { notification.error('创建简历失败，请稍后重试'); }
    finally { setIsCreating(false); }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <header className="border-b border-[#D8E1DD] pb-7 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#176B52]"><FileText size={14} />Resume workspace</p>
            <h1 className="text-[32px] font-bold tracking-[-0.025em] text-[#17211D]">我的简历</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#66736D]">{user?.github_login ? `${user.github_login}，` : ''}在这里维护用于不同岗位的简历，优化记录会留在对应简历中。</p>
          </div>
          <button type="button" onClick={() => void createResume('classic-blue')} disabled={isCreating} className="flex h-11 items-center gap-2 rounded-lg bg-[#176B52] px-5 text-sm font-semibold text-white transition hover:bg-[#10563F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176B52] disabled:opacity-60"><Plus size={17} />{isCreating ? '创建中…' : '创建简历'}</button>
        </div>
      </header>

      <section className="pt-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-[#17211D]">简历文件</h2><p className="mt-1 text-sm text-[#7A8782]">共 {resumes.length} 份，最多展示最近的 {MAX_RESUMES} 份</p></div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Input aria-label="搜索简历" placeholder="搜索简历名称" value={searchKeyword} onChange={(event) => setSearchKeyword(event.currentTarget.value)} leftSection={<Search size={16} color="#66736D" />} rightSection={searchKeyword ? <ActionIcon variant="subtle" color="gray" aria-label="清除搜索" onClick={() => setSearchKeyword('')}><X size={15} /></ActionIcon> : null} className="min-w-0 flex-1 sm:w-60 sm:flex-none" styles={{ input: { borderColor: '#D8E1DD', borderRadius: 8, height: 40 } }} />
            <Select aria-label="简历排序方式" value={sortBy} onChange={(value) => value && setSortBy(value as typeof sortBy)} data={[{ value: 'updated', label: '最近更新' }, { value: 'created', label: '最近创建' }, { value: 'name', label: '按名称' }]} className="w-32" styles={{ input: { borderColor: '#D8E1DD', borderRadius: 8, height: 40 } }} />
            <ActionIcon variant="default" size={40} aria-label={sortOrder === 'asc' ? '切换为降序' : '切换为升序'} title={sortOrder === 'asc' ? '当前升序' : '当前降序'} onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} styles={{ root: { borderColor: '#D8E1DD', borderRadius: 8 } }}>{sortOrder === 'asc' ? <ArrowDownAZ size={17} /> : <ArrowUpAZ size={17} />}</ActionIcon>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <EmptyResume onClick={() => void createResume('classic-blue')} loading={isCreating} />
          {filteredResumes.slice(0, MAX_RESUMES).map((resume) => <HistoryResume key={resume.id} resume={resume} onDelete={(id) => setResumes((items) => items.filter((item) => item.id !== id))} templateStyle={null} templateLayout={resume.template_id || 'classic'} />)}
        </div>

        {searchKeyword && filteredResumes.length === 0 && <div className="mt-5 rounded-[10px] border border-dashed border-[#C5D1CC] bg-white px-6 py-12 text-center"><Search size={24} className="mx-auto text-[#9AA7A1]" /><p className="mt-3 font-medium text-[#17211D]">没有找到“{searchKeyword}”</p><button type="button" onClick={() => setSearchKeyword('')} className="mt-2 text-sm font-medium text-[#176B52] hover:underline">清除搜索条件</button></div>}
      </section>

      <section className="mt-14 border-t border-[#D8E1DD] pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A5A26]">Template library</p><h2 className="mt-2 text-xl font-semibold text-[#17211D]">从成熟版式开始</h2><p className="mt-1 text-sm text-[#66736D]">模板只改变排版，不会替你编写内容。</p></div><span className="text-xs text-[#7A8782]">更多模板持续补充</span></div>
        <ResumeTemplate onSelect={(layout) => void createResume(layout)} loading={isCreating} />
      </section>
    </div>
  );
}
