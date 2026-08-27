import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { notifications } from '@mantine/notifications';
import { resumeApi } from '@/api/home.api';
import { jobApi } from '@/api/job.api';
import { uploadApi } from '@/api/upload.api';
import type { JobDescription, JobProfile } from '@/types/job';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { contentToDocument } from '@/utils/resume-migration';
import { getApiErrorMessage } from '@/utils/api-error';
import { guestWorkspace } from '@/services/guest-workspace';
import { guestSampleJob, guestSampleProfile, guestSampleResume } from '@/utils/guest-samples';

export function useInterviewResources(userId?: string, initialResumeId?: string, isGuest = false) {
  const { resume, setResume, setContent, loadTemplate } = useResumeStore();
  const { loadDocument } = useDocumentStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobProfiles, setJobProfiles] = useState<Array<JobProfile & { company?: string | null }>>([]);
  const [selectedJobProfileId, setSelectedJobProfileId] = useState<string | null>(null);

  const loadResume = useCallback(async (item: any) => {
    setResume(item); setContent(item.content);
    let template: any = null;
    if (item.template_id) { await loadTemplate(item.template_id); template = useResumeStore.getState().template; }
    const document = contentToDocument(item.content, template?.style_config || null, template?.style_config?.layout || 'classic');
    document.id = item.id; document.title = item.title; loadDocument(document);
  }, [loadDocument, loadTemplate, setContent, setResume]);

  useEffect(() => {
    if (isGuest) {
      Promise.all([guestWorkspace.listResumes(), guestWorkspace.listJobs()]).then(async ([storedResumes, storedJobs]) => {
        const items = storedResumes.length ? storedResumes : [guestSampleResume];
        setResumes(items);
        const selected = items.find((item) => item.id === initialResumeId) || items[0];
        if (selected) { setSelectedResumeId(selected.id); await loadResume(selected); }
        const profiles = storedJobs.map((job) => job.latestProfile && ({ ...job.latestProfile, company: job.company })).filter(Boolean) as Array<JobProfile & { company?: string | null }>;
        setJobProfiles(profiles.length ? profiles : [{ ...guestSampleProfile, company: guestSampleJob.company }]);
        setSelectedJobProfileId((profiles[0] || guestSampleProfile).id);
      }).finally(() => setLoading(false));
      return;
    }
    if (!userId) {
      setLoading(false);
      return;
    }
    resumeApi.getUserResumes().then(async (response) => {
      const items = response.data || []; setResumes(items);
      const selected = items.find((item: any) => item.id === initialResumeId) || items[0];
      if (selected) { setSelectedResumeId(selected.id); await loadResume(selected); }
    }).catch((error) => notifications.show({ title: '简历加载失败', message: getApiErrorMessage(error, '请刷新页面后重试'), color: 'red' }))
      .finally(() => setLoading(false));
  }, [initialResumeId, isGuest, loadResume, userId]);

  useEffect(() => {
    if (!userId || isGuest) return;
    jobApi.list().then(async (response) => {
      const groups = await Promise.all((response.data || []).map(async (job: JobDescription) =>
        ((await jobApi.listProfiles(job.id)).data || []).filter((profile) => profile.status === 'confirmed').map((profile) => ({ ...profile, company: job.company }))));
      setJobProfiles(groups.flat());
    }).catch(() => setJobProfiles([]));
  }, [isGuest, userId]);

  useEffect(() => {
    const selected = resumes.find((item) => item.id === selectedResumeId);
    if (selected) loadResume(selected);
  }, [loadResume, resumes, selectedResumeId]);

  const uploadResume = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!['application/pdf','image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) {
      notifications.show({ title: '错误', message: '不支持的文件类型，仅支持 PDF 和图片格式', color: 'red' }); return;
    }
    if (isGuest) {
      notifications.show({ title: '文件已保留在你的设备上', message: '当前游客版先支持编辑现有简历；文件解析能力将在匿名处理服务接入后开放。', color: 'teal' });
      event.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const result = await uploadApi.uploadResume(file); setResumes((items) => [result.resume, ...items]); setSelectedResumeId(result.resume.id);
      notifications.show({ title: '成功', message: `简历导入成功，识别了${result.fileInfo.pageCount || 1}页内容`, color: 'green' });
    } catch (error) { notifications.show({ title: '上传简历失败', message: getApiErrorMessage(error, '请检查文件格式和大小后重试'), color: 'red' }); }
    finally { setUploading(false); event.target.value = ''; }
  }, [isGuest]);

  const deleteResume = useCallback(async (id: string) => {
    try {
      if (isGuest) await guestWorkspace.deleteResume(id);
      else await resumeApi.deleteResume(id);
      setResumes((items) => { const remaining = items.filter((item) => item.id !== id); if (selectedResumeId === id) setSelectedResumeId(remaining[0]?.id || null); return remaining; });
      notifications.show({ title: '成功', message: '简历已删除', color: 'green' });
    } catch (error) { notifications.show({ title: '删除简历失败', message: getApiErrorMessage(error, '请稍后重试'), color: 'red' }); }
  }, [isGuest, selectedResumeId]);

  return { loading, uploading, resumes, resume, selectedResumeId, setSelectedResumeId, jobProfiles,
    selectedJobProfileId, setSelectedJobProfileId, uploadResume, deleteResume };
}
