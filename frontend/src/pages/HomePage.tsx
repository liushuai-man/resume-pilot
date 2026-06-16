import { Container, Input, Button } from '@mantine/core';
import { ArrowRight, Search } from 'lucide-react';
import EmptyResume from '@/components/resume/EmptyResume';
import HistoryResume from '@/components/resume/HistoryResume';
import ResumeTemplate from '@/components/resume/ResumeTemplate';

import { resumeTemplates, userResumeList } from '@/mock/index';

export default function HomePage() {
  // 操作方法
  const handleSelectTemplate = (id: string) => console.log('选择模板:', id);
  const handleCreateEmpty = () => console.log('创建空白简历');

  return (
    <Container size="xl" className="">
      <div className="flex items-center justify-between gap-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">我的简历</h1>
          <p className="text-gray-500">管理和编辑你的简历，助力求职之路</p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex items-center justify-between mb-6">
          <Input
            placeholder="搜索简历名称"
            className="w-80"
            leftSection={<Search className="text-gray-400" size={18} />}
          />
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              最新更新时间
            </Button>
          </div>
        </div>
      </div>
      {/* 简历列表区域 */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <EmptyResume onClick={handleCreateEmpty} />
          {userResumeList.map((resume) => (
            <HistoryResume
              key={resume.id}
              resume={resume}
            />
          ))}
        </div>
      </div>

      {/* 精选模板区域 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">精选模板</h2>
            <p className="text-sm text-gray-500">
              选择合适的模板，快速创建专业简历
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600"
          >
            查看全部模板 <ArrowRight size={14} />
          </Button>
        </div>
        <ResumeTemplate
          templates={resumeTemplates}
          onSelect={handleSelectTemplate}
        />
      </div>
    </Container>
  );
}
