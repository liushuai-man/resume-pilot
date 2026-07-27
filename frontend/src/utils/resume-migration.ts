import type { ResumeContent, StyleConfig } from '@/types/resume';
import type {
  ResumeDocument,
  ResumeSection,
  ProfileSection,
  EducationSection,
  ExperienceSection,
  ProjectSection,
  SkillSection,
  CertificationSection,
  ObjectiveSection,
  ResumeStyle,
  ResumeLayout,
} from '@/types/resume-document';

let sectionIdCounter = 0;
let itemIdCounter = 0;

function genSectionId(): string {
  return `migrated-section-${Date.now()}-${++sectionIdCounter}`;
}

function genItemId(prefix: string): string {
  return `migrated-${prefix}-${Date.now()}-${++itemIdCounter}`;
}

function convertProfile(content: ResumeContent): ProfileSection {
  const basic = content.basicInfo || {
    name: '',
    email: '',
    phone: '',
    location: '',
  };

  return {
    id: genSectionId(),
    type: 'profile',
    title: '个人信息',
    visible: true,
    order: 0,
    data: {
      name: basic.name || '',
      title: basic.title || '',
      email: basic.email || '',
      phone: basic.phone || '',
      location: basic.location || '',
      avatar: basic.avatar,
      website: basic.website,
      summary: basic.summary || basic.bio || '',
    },
  };
}

function convertEducation(content: ResumeContent): EducationSection | null {
  const list = content.education || [];
  if (list.length === 0) return null;

  return {
    id: genSectionId(),
    type: 'education',
    title: '教育经历',
    visible: true,
    order: 1,
    data: list.map((edu) => ({
      id: edu.id || genItemId('edu'),
      school: edu.school || '',
      major: edu.major || '',
      degree: edu.degree || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa,
      description: '',
    })),
  };
}

function convertExperience(content: ResumeContent): ExperienceSection | null {
  const list = content.experience || [];
  if (list.length === 0) return null;

  return {
    id: genSectionId(),
    type: 'experience',
    title: '工作经历',
    visible: true,
    order: 2,
    data: list.map((exp) => ({
      id: exp.id || genItemId('exp'),
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || '',
      achievements: exp.achievements || [],
      location: exp.location,
    })),
  };
}

function convertProject(content: ResumeContent): ProjectSection | null {
  const list = content.projects || [];
  if (list.length === 0) return null;

  return {
    id: genSectionId(),
    type: 'project',
    title: '项目经验',
    visible: true,
    order: 3,
    data: list.map((proj) => ({
      id: proj.id || genItemId('proj'),
      name: proj.name || '',
      role: proj.role || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      description: proj.description || '',
      techStack: proj.techStack || [],
      achievements: proj.achievements || [],
    })),
  };
}

function convertSkill(content: ResumeContent): SkillSection | null {
  const list = content.skills || [];
  if (list.length === 0) return null;

  return {
    id: genSectionId(),
    type: 'skill',
    title: '专业技能',
    visible: true,
    order: 4,
    data: list.map((skill) => ({
      id: skill.id || genItemId('skill'),
      name: skill.name || '',
      level: (skill.level as any) || 'intermediate',
      category: skill.category,
    })),
  };
}

function convertCertification(content: ResumeContent): CertificationSection | null {
  const list = content.certifications || [];
  if (list.length === 0) return null;

  return {
    id: genSectionId(),
    type: 'certification',
    title: '证书荣誉',
    visible: true,
    order: 5,
    data: list.map((cert) => ({
      id: cert.id || genItemId('cert'),
      name: cert.name || '',
      issuer: cert.issuer,
      date: cert.date,
      description: cert.description,
    })),
  };
}

function convertObjective(content: ResumeContent): ObjectiveSection | null {
  const text = content.careerObjective;
  if (!text || text.trim() === '') return null;

  return {
    id: genSectionId(),
    type: 'objective',
    title: '职业目标',
    visible: true,
    order: 0.5,
    data: {
      content: text,
    },
  };
}

export function contentToDocument(
  content: ResumeContent,
  styleConfig: StyleConfig | null,
  layout: string
): ResumeDocument {
  sectionIdCounter = 0;
  itemIdCounter = 0;

  const sections: ResumeSection[] = [];

  const profile = convertProfile(content);
  sections.push(profile);

  const objective = convertObjective(content);
  if (objective) sections.push(objective);

  const education = convertEducation(content);
  if (education) sections.push(education);

  const experience = convertExperience(content);
  if (experience) sections.push(experience);

  const project = convertProject(content);
  if (project) sections.push(project);

  const skill = convertSkill(content);
  if (skill) sections.push(skill);

  const certification = convertCertification(content);
  if (certification) sections.push(certification);

  const reordered = sections
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i }));

  const style: ResumeStyle = {
    theme: 'default',
    primaryColor: styleConfig?.primaryColor || '#2563eb',
    secondaryColor: styleConfig?.secondaryColor,
    fontFamily: styleConfig?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: styleConfig?.fontSize || 14,
    lineHeight: 1.6,
    margin: 24,
    sectionSpacing: 24,
    sectionTitleColor: styleConfig?.sectionTitleColor || '#1f2937',
    sectionTitleSize: styleConfig?.sectionTitleSize || 16,
    lineColor: styleConfig?.lineColor || '#e5e7eb',
    sidebarColor: styleConfig?.sidebarColor || '#f3f4f6',
    sidebarTextColor: styleConfig?.sidebarTextColor || '#374151',
    backgroundColor: styleConfig?.backgroundColor || '#ffffff',
  };

  const resumeLayout: ResumeLayout = {
    template: (layout as any) || 'classic',
    pageSize: 'A4',
    orientation: 'portrait',
  };

  return {
    id: '',
    title: '',
    sections: reordered,
    style,
    layout: resumeLayout,
  };
}

export function documentToContent(document: ResumeDocument): ResumeContent {
  const content: ResumeContent = {
    blocks: [],
    basicInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    careerObjective: '',
    certifications: [],
    campusExperiences: [],
  };

  for (const section of document.sections) {
    if (!section.visible) continue;

    switch (section.type) {
      case 'profile': {
        const data = section.data as any;
        content.basicInfo = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          avatar: data.avatar,
          title: data.title,
          website: data.website,
          summary: data.summary,
        };
        break;
      }
      case 'education': {
        content.education = (section.data as any[]).map((item) => ({
          id: item.id,
          school: item.school,
          major: item.major,
          degree: item.degree,
          startDate: item.startDate,
          endDate: item.endDate,
          gpa: item.gpa,
        }));
        break;
      }
      case 'experience': {
        content.experience = (section.data as any[]).map((item) => ({
          id: item.id,
          company: item.company,
          position: item.position,
          startDate: item.startDate,
          endDate: item.endDate,
          description: item.description,
          achievements: item.achievements,
          location: item.location,
        }));
        break;
      }
      case 'project': {
        content.projects = (section.data as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          startDate: item.startDate,
          endDate: item.endDate,
          description: item.description,
          techStack: item.techStack,
          achievements: item.achievements,
        }));
        break;
      }
      case 'skill': {
        content.skills = (section.data as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          level: item.level,
          category: item.category,
        }));
        break;
      }
      case 'certification': {
        content.certifications = (section.data as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          issuer: item.issuer,
          date: item.date,
          description: item.description,
        }));
        break;
      }
      case 'objective': {
        content.careerObjective = (section.data as any).content || '';
        break;
      }
    }
  }

  return content;
}
