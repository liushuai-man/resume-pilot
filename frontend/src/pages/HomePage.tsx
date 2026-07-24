import {
  Button,
  Text,
  Container,
  Input,
  Select,
  ActionIcon,
} from '@mantine/core';
import { FileText, ArrowRight, Search, X, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import EmptyResume from '@/components/home/EmptyResume';
import HistoryResume from '@/components/home/HistoryResume';
import ResumeTemplate from '@/components/home/ResumeTemplate';
import { resumeApi } from '@/api/home.api';
import { emptyResumeContent } from '@/utils/emptyResumeContent';
import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { notification } from '@/components/common/Notification';
import type { Template, Resume } from '@/types/resume';

export default function HomePage() {
  const { isLoggedIn } = useUserStore();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'name'>(
    'updated'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreating, setIsCreating] = useState(false);

  // 获取模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await resumeApi.getTemplates();
        if (response.code === 200 && response.data) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error('获取模板列表失败:', error);
      }
    };

    fetchTemplates();
  }, []);

  // 获取用户简历列表
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchResumes = async () => {
      try {
        const response = await resumeApi.getUserResumes({ excludeUploaded: true });
        if (response.code === 200 && response.data) {
          setResumes(response.data);
        }
      } catch (error) {
        console.error('获取简历列表失败:', error);
      }
    };

    fetchResumes();
  }, [isLoggedIn]);

  // 筛选和排序简历
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
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.title.localeCompare(b.title, 'zh-CN');
      } else {
        const field = sortBy === 'created' ? 'created_at' : 'updated_at';
        comparison =
          new Date(a[field]).getTime() - new Date(b[field]).getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [resumes, searchKeyword, sortBy, sortOrder]);

  const templateMap = useMemo(() => {
    const map: Record<string, Template> = {};
    templates.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [templates]);

  const getTemplateStyle = (templateId: string) => {
    const template = templateMap[templateId];
    const defaultTemplate = templates[0];
    const targetTemplate = template || defaultTemplate;
    if (!targetTemplate) return { style: null, layout: 'classic' };
    return {
      style: targetTemplate.style_config,
      layout: targetTemplate.schema?.layout || targetTemplate.style_config?.layout || 'classic',
    };
  };

  // 使用默认模板创建简历（空内容）
  const handleCreateEmpty = async () => {
    if (!isLoggedIn) {
      notification.error('请先登录');
      return;
    }
    setIsCreating(true);
    try {
      const defaultTemplate = templates[0];
      const templateId = defaultTemplate?.id || 'classic-blue';

      const response = await resumeApi.createResume({
        template_id: templateId,
        title: '我的简历',
        content: emptyResumeContent,
      });

      if (response.data) {
        notification.success('简历创建成功');
        navigate(`/resume/${response.data.id}`);
      }
    } catch (error) {
      console.error('创建简历失败:', error);
      notification.error('创建简历失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 使用指定模板创建简历（使用模板示例内容）
  const handleSelectTemplate = async (templateId: string) => {
    if (!isLoggedIn) {
      notification.error('请先登录');
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setIsCreating(true);
    try {
      const initialContent =
        template.schema?.defaultContent || emptyResumeContent;

      const response = await resumeApi.createResume({
        template_id: templateId,
        title: `基于${template.name}的简历`,
        content: initialContent,
      });

      if (response.data) {
        notification.success('简历创建成功');
        navigate(`/resume/${response.data.id}`);
      }
    } catch (error) {
      console.error('创建简历失败:', error);
      notification.error('创建简历失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 删除简历后更新列表
  const handleDeleteResume = (id: string) => {
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  return (
    <Container className="max-w-6xl mx-auto">
      {/* 历史简历区域 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">我的简历</h1>
              <p className="text-gray-500 mt-1">
                管理和创建你的简历，助力求职之路
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 border-blue-400 text-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 flex-shrink-0"
              onClick={() => navigate('/resume/interview')}
            >
              <FileText size={14} className="mr-2" />
              在线面试
            </Button>
            <Input
              placeholder="搜索简历名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              leftSection={<Search size={16} className="text-gray-400" />}
              rightSection={
                searchKeyword && (
                  <ActionIcon
                    variant="subtle"
                    size="xs"
                    onClick={() => setSearchKeyword('')}
                  >
                    <X size={14} />
                  </ActionIcon>
                )
              }
              className="w-64"
              size="sm"
            />
            <Select
              value={sortBy}
              onChange={(value) =>
                setSortBy(value as 'created' | 'updated' | 'name')
              }
              data={[
                { value: 'updated', label: '最新修改' },
                { value: 'created', label: '最近创建' },
                { value: 'name', label: '按名称' },
              ]}
              size="sm"
              className="w-32"
            />
            <ActionIcon
              variant="light"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              <ArrowUpDown
                size={16}
                className={sortOrder === 'asc' ? 'rotate-180' : ''}
              />
            </ActionIcon>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 新建简历入口 */}
          <EmptyResume onClick={handleCreateEmpty} loading={isCreating} />

          {/* 用户历史简历 */}
          {filteredResumes.length > 0 ? (
            filteredResumes.map((resume) => {
              const { style, layout } = getTemplateStyle(resume.template_id);
              return (
                <HistoryResume
                  key={resume.id}
                  resume={resume}
                  onDelete={handleDeleteResume}
                  templateStyle={style}
                  templateLayout={layout}
                />
              );
            })
          ) : searchKeyword && resumes.length > 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8">
              <Search size={32} className="text-gray-300 mb-2" />
              <Text className="text-gray-400">
                未找到匹配"{searchKeyword}"的简历
              </Text>
            </div>
          ) : null}
        </div>
      </div>

      {/* 精选模板区域 */}
      <div className="bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">精选模板</h1>
            <p className="text-gray-500 mt-1">
              选择合适的模板，快速创建专业简历
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => console.log('查看更多模板')}
            className="text-gray-500 bg-white hover:text-blue-400 hover:bg-white h-auto"
          >
            查看更多 <ArrowRight size={14} />
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
            loading={isCreating}
          />
        )}
      </div>
    </Container>
  );
}
