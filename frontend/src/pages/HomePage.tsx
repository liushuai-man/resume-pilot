import { Button, Text, Container, Input, Select } from '@mantine/core';
import { FileText, ArrowRight, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import EmptyResume from '@/components/home/EmptyResume';
import HistoryResume from '@/components/home/HistoryResume';
import ResumeTemplate from '@/components/home/ResumeTemplate';
import { userResumeList, resumeTemplates } from '@/mock/index';
import { defaultResumeContent } from '@/mock/resumeTemplateData';
import type { Template, Resume } from '@/types/resume';

export default function HomePage() {
  const templates: Template[] = resumeTemplates;
  const resumes: Resume[] = userResumeList;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('updated');

  const getTemplateThumbnail = (templateId?: string) => {
    if (!templateId) return undefined;
    const template = templates.find((t) => t.id === templateId);
    return template?.thumbnail;
  };

  const filteredResumes = useMemo(() => {
    let result = [...resumes];

    // 按名称筛选
    if (searchKeyword.trim()) {
      result = result.filter((resume) =>
        resume.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 排序
    result.sort((a, b) => {
      const field = sortBy === 'created' ? 'created_at' : 'updated_at';
      return new Date(b[field]).getTime() - new Date(a[field]).getTime();
    });

    return result;
  }, [resumes, searchKeyword, sortBy]);

  const handleSelectTemplate = (id: string) => {
    console.log('选择模板:', id);
    const template = templates.find((t) => t.id === id);
    if (template) {
      const resumeData = {
        template_id: id,
        title: '新建简历',
        content: defaultResumeContent,
      };
      console.log('创建简历数据:', resumeData);
    }
  };

  const handleCreateEmpty = () => {
    const defaultTemplate = templates.find((t) => t.id === 'default');
    if (defaultTemplate) {
      const resumeData = {
        template_id: 'default',
        title: '空白简历',
        content: defaultResumeContent,
      };
      console.log('创建空白简历:', resumeData);
    }
  };

  return (
    <Container className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的简历</h1>
          <p className="text-gray-500 mt-1">管理您的个人简历</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索简历名称..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            leftSection={<Search size={16} className="text-gray-400" />}
            className="w-64"
            size="sm"
          />
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value as 'created' | 'updated')}
            data={[
              { value: 'updated', label: '最新修改' },
              { value: 'created', label: '最近创建' },
            ]}
            size="sm"
            className="w-32"
          />
        </div>
      </div>

      {/* 历史简历区域 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">我的简历</h2>
          <Button
            variant="ghost"
            onClick={() => console.log('查看全部')}
            className="text-gray-500 hover:text-blue-600 p-2 bg-white"
          >
            查看全部 <ArrowRight size={14} />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <EmptyResume onClick={handleCreateEmpty} />
          {filteredResumes.map((resume) => (
            <HistoryResume
              key={resume.id}
              resume={resume}
              thumbnail={getTemplateThumbnail(resume.template_id)}
            />
          ))}
        </div>
      </div>

      {/* 精选模板区域 */}
      <div className="bg-gray-50 rounded-xl ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">精选模板</h2>
          <Button
            variant="ghost"
            onClick={() => console.log('查看更多模板')}
            className="text-gray-500 bg-white border-2 border-gray-500 hover:text-blue-600 p-0 h-auto"
          >
            查看更多
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText size={48} className="text-gray-300 mb-4" />
            <Text className="text-gray-400">暂无可用模板</Text>
          </div>
        ) : (
          <ResumeTemplate
            templates={templates}
            onSelect={handleSelectTemplate}
          />
        )}
      </div>
    </Container>
  );
}
