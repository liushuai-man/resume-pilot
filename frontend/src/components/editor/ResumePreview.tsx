import { Card } from '@mantine/core';
import type { ResumeContent } from '@/types/resume';
import { useResumeStore } from '@/store/useResumeStore';

interface ResumePreviewProps {
  content: ResumeContent;
  highlightSection?: string;
  variant?: 'editor' | 'card';
}

export default function ResumePreview({
  content,
  highlightSection,
  variant = 'editor',
}: ResumePreviewProps) {
  const { templateStyle, templateLayout, formatConfig } = useResumeStore();

  const primaryColor = templateStyle?.primaryColor || '#2563EB';
  const sectionTitleColor = templateStyle?.sectionTitleColor || primaryColor;
  const lineColor = templateStyle?.lineColor || '#E2E8F0';
  const backgroundColor = templateStyle?.backgroundColor || '#FFFFFF';
  const fontSize = templateStyle?.fontSize || 14;
  const fontFamily = templateStyle?.fontFamily || "'Microsoft YaHei', Arial, sans-serif";
  const sidebarColor = templateStyle?.sidebarColor || '#0F172A';
  const sidebarTextColor = templateStyle?.sidebarTextColor || '#F1F5F9';

  const isEmpty =
    !content.basicInfo?.name &&
    !content.basicInfo?.title &&
    !content.education?.length &&
    !content.experience?.length &&
    !content.projects?.length &&
    !content.skills?.length &&
    !content.certifications?.length &&
    !content.campusExperiences?.length &&
    !content.careerObjective;

  const cardClassName =
    variant === 'card'
      ? 'bg-white shadow-lg w-[794px]'
      : 'bg-white shadow-lg min-h-[calc(80vh)]';

  const highlightClass = (section: string) =>
    highlightSection === section ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : '';

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className="font-semibold mb-4 flex items-center"
      style={{
        color: sectionTitleColor,
        fontSize: `${templateStyle?.sectionTitleSize || 16}px`,
        paddingBottom: '8px',
        borderBottom: `2px solid ${sectionTitleColor}`,
      }}
    >
      <span
        className="mr-3 rounded"
        style={{ width: '4px', height: '20px', backgroundColor: primaryColor }}
      ></span>
      {children}
    </h2>
  );

  if (isEmpty) {
    return (
      <Card className={cardClassName} style={{ fontFamily, fontSize: `${fontSize}px` }}>
        <div
          className="min-h-[calc(100vh-10rem)] flex items-center justify-center text-gray-400"
          style={{ padding: `${formatConfig.margin}px` }}
        >
          <p className="text-center">暂无简历内容，请在左侧编辑区域填写信息</p>
        </div>
      </Card>
    );
  }

  if (templateLayout === 'sidebar') {
    return (
      <Card
        className={cardClassName}
        style={{ fontFamily, fontSize: `${fontSize}px`, backgroundColor, padding: 0 }}
      >
        <div className="flex w-full" style={{ minHeight: '100%' }}>
          <div
            className="p-8"
            style={{
              width: '35%',
              backgroundColor: sidebarColor,
              color: sidebarTextColor,
            }}
          >
            {content.basicInfo && (
              <div className="mb-8">
                <h1
                  className="font-bold mb-2"
                  style={{ color: sidebarTextColor, fontSize: '24px' }}
                >
                  {content.basicInfo.name || '您的姓名'}
                </h1>
                <p style={{ color: `${sidebarTextColor}cc`, fontSize: '13px' }}>
                  {content.basicInfo.title || '您的职位'}
                </p>
                <div className="mt-5 space-y-2" style={{ fontSize: '11px' }}>
                  {content.basicInfo.phone && (
                    <div style={{ color: `${sidebarTextColor}dd` }}>📱 {content.basicInfo.phone}</div>
                  )}
                  {content.basicInfo.email && (
                    <div style={{ color: `${sidebarTextColor}dd` }}>📧 {content.basicInfo.email}</div>
                  )}
                  {content.basicInfo.location && (
                    <div style={{ color: `${sidebarTextColor}dd` }}>📍 {content.basicInfo.location}</div>
                  )}
                </div>
              </div>
            )}

            {content.skills && content.skills.length > 0 && (
              <div className="mb-6">
                <h3
                  className="font-bold mb-3 pb-1"
                  style={{
                    color: primaryColor,
                    fontSize: '14px',
                    borderBottom: `1px solid ${primaryColor}60`,
                  }}
                >
                  专业技能
                </h3>
                <div className="flex flex-wrap gap-1">
                  {content.skills.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${primaryColor}30`,
                        color: sidebarTextColor,
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {content.education && content.education.length > 0 && (
              <div className="mb-6">
                <h3
                  className="font-bold mb-3 pb-1"
                  style={{
                    color: primaryColor,
                    fontSize: '14px',
                    borderBottom: `1px solid ${primaryColor}60`,
                  }}
                >
                  教育背景
                </h3>
                {content.education.map((item) => (
                  <div key={item.id} className="mb-3 last:mb-0" style={{ fontSize: '11px' }}>
                    <div style={{ fontWeight: 'bold', color: sidebarTextColor }}>{item.school}</div>
                    <div style={{ color: `${sidebarTextColor}cc` }}>{item.major} · {item.degree}</div>
                  </div>
                ))}
              </div>
            )}

            {content.certifications && content.certifications.length > 0 && (
              <div className="mb-6">
                <h3
                  className="font-bold mb-3 pb-1"
                  style={{
                    color: primaryColor,
                    fontSize: '14px',
                    borderBottom: `1px solid ${primaryColor}60`,
                  }}
                >
                  证书荣誉
                </h3>
                {content.certifications.map((item) => (
                  <div key={item.id} className="mb-2 last:mb-0" style={{ fontSize: '11px', color: `${sidebarTextColor}cc` }}>
                    • {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 flex-1" style={{ backgroundColor: '#fff', color: '#333' }}>
            {content.basicInfo?.bio && (
              <div className={`mb-6 pb-6 ${highlightClass('basicInfo')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
                <SectionTitle>个人总结</SectionTitle>
                <p className="text-gray-600 leading-relaxed" style={{ fontSize: '13px' }}>
                  {content.basicInfo.bio}
                </p>
              </div>
            )}

            {content.careerObjective && (
              <div className={`mb-6 pb-6 ${highlightClass('careerObjective')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
                <SectionTitle>职业目标</SectionTitle>
                <div
                  className="text-gray-600 prose prose-sm max-w-none"
                  style={{ fontSize: '13px' }}
                  dangerouslySetInnerHTML={{ __html: content.careerObjective }}
                />
              </div>
            )}

            {content.experience && content.experience.length > 0 && (
              <div className={`mb-6 pb-6 ${highlightClass('experience')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
                <SectionTitle>工作经历</SectionTitle>
                {content.experience.map((item) => (
                  <div key={item.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800" style={{ fontSize: '14px' }}>
                          {item.company}
                        </h3>
                        <p className="text-gray-500" style={{ fontSize: '12px' }}>
                          {item.position}{item.location ? ` | ${item.location}` : ''}
                        </p>
                      </div>
                      <span className="text-gray-400" style={{ fontSize: '11px' }}>
                        {item.startDate} - {item.endDate || '至今'}
                      </span>
                    </div>
                    {item.description && (
                      <div
                        className="text-gray-600 mt-2 prose prose-sm max-w-none"
                        style={{ fontSize: '12px' }}
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                    {(item.achievements || []).length > 0 && (
                      <ul className="mt-2 text-gray-600">
                        {(item.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start mt-1" style={{ fontSize: '12px' }}>
                            <span className="mr-2" style={{ color: primaryColor }}>•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {content.projects && content.projects.length > 0 && (
              <div className={`mb-6 pb-6 ${highlightClass('projects')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
                <SectionTitle>项目经验</SectionTitle>
                {content.projects.map((item) => (
                  <div key={item.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800" style={{ fontSize: '14px' }}>{item.name}</h3>
                        <p className="text-gray-500" style={{ fontSize: '12px' }}>{item.role}</p>
                      </div>
                      <span className="text-gray-400" style={{ fontSize: '11px' }}>
                        {item.startDate} - {item.endDate || '至今'}
                      </span>
                    </div>
                    {item.description && (
                      <div
                        className="text-gray-600 mt-2 prose prose-sm max-w-none"
                        style={{ fontSize: '12px' }}
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                    {(item.techStack || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(item.techStack || []).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(item.achievements || []).length > 0 && (
                      <ul className="mt-2 text-gray-600">
                        {(item.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start mt-1" style={{ fontSize: '12px' }}>
                            <span className="mr-2" style={{ color: primaryColor }}>•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {content.campusExperiences && content.campusExperiences.length > 0 && (
              <div className={`mb-6 ${highlightClass('campusExperiences')}`}>
                <SectionTitle>校园经历</SectionTitle>
                {content.campusExperiences.map((item) => (
                  <div key={item.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800" style={{ fontSize: '14px' }}>{item.name}</h3>
                        <p className="text-gray-500" style={{ fontSize: '12px' }}>{item.role || item.position}</p>
                      </div>
                      <span className="text-gray-400" style={{ fontSize: '11px' }}>
                        {item.startDate} - {item.endDate || '至今'}
                      </span>
                    </div>
                    {(item.achievements || []).length > 0 && (
                      <ul className="mt-2 text-gray-600">
                        {(item.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start mt-1" style={{ fontSize: '12px' }}>
                            <span className="mr-2" style={{ color: primaryColor }}>•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (templateLayout === 'minimal') {
    return (
      <Card
        className={cardClassName}
        style={{ fontFamily, fontSize: `${fontSize}px`, backgroundColor, lineHeight: '1.8' }}
      >
        <div style={{ padding: '50px 40px' }}>
          {content.basicInfo && (
            <div className={`mb-10 ${highlightClass('basicInfo')}`}>
              <h1
                className="font-light mb-1 tracking-wider"
                style={{ color: '#222', fontSize: '36px', letterSpacing: '2px' }}
              >
                {content.basicInfo.name || '您的姓名'}
              </h1>
              <p className="tracking-wide mb-4" style={{ color: '#999', fontSize: '14px', letterSpacing: '1px' }}>
                {content.basicInfo.title || '您的职位'}
              </p>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                {content.basicInfo.phone && <span>{content.basicInfo.phone} · </span>}
                {content.basicInfo.email && <span>{content.basicInfo.email} · </span>}
                {content.basicInfo.location && <span>{content.basicInfo.location}</span>}
              </div>
              {content.basicInfo.bio && (
                <p className="mt-5 leading-relaxed" style={{ fontSize: '12px', color: '#777', maxWidth: '80%' }}>
                  {content.basicInfo.bio}
                </p>
              )}
            </div>
          )}

          {content.careerObjective && (
            <div className={`mb-8 ${highlightClass('careerObjective')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                职业目标
              </h2>
              <div
                className="text-gray-600 prose prose-sm max-w-none"
                style={{ fontSize: '12px', lineHeight: '1.8', color: '#666' }}
                dangerouslySetInnerHTML={{ __html: content.careerObjective }}
              />
            </div>
          )}

          {content.experience && content.experience.length > 0 && (
            <div className={`mb-8 ${highlightClass('experience')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                工作经历
              </h2>
              {content.experience.map((item) => (
                <div key={item.id} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800" style={{ fontSize: '14px' }}>
                      {item.company}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#bbb' }}>
                      {item.startDate} - {item.endDate || '至今'}
                    </span>
                  </div>
                  <p className="text-gray-500 mb-2" style={{ fontSize: '12px' }}>{item.position}</p>
                  {item.description && (
                    <div
                      className="text-gray-600 prose prose-sm max-w-none"
                      style={{ fontSize: '12px', color: '#666', lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {(item.achievements || []).length > 0 && (
                    <ul className="mt-2 text-gray-600">
                      {(item.achievements || []).map((achievement, index) => (
                        <li key={index} className="flex items-start mt-1" style={{ fontSize: '12px', color: '#666' }}>
                          <span className="mr-2" style={{ color: primaryColor }}>•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {content.education && content.education.length > 0 && (
            <div className={`mb-8 ${highlightClass('education')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                教育背景
              </h2>
              {content.education.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800" style={{ fontSize: '14px' }}>{item.school}</h3>
                    <span style={{ fontSize: '11px', color: '#bbb' }}>{item.startDate} - {item.endDate}</span>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: '12px' }}>{item.major} | {item.degree}</p>
                  {item.gpa && <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>GPA: {item.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {content.projects && content.projects.length > 0 && (
            <div className={`mb-8 ${highlightClass('projects')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                项目经验
              </h2>
              {content.projects.map((item) => (
                <div key={item.id} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800" style={{ fontSize: '14px' }}>{item.name}</h3>
                    <span style={{ fontSize: '11px', color: '#bbb' }}>{item.startDate} - {item.endDate || '至今'}</span>
                  </div>
                  <p className="text-gray-500 mb-2" style={{ fontSize: '12px' }}>{item.role}</p>
                  {item.description && (
                    <div
                      className="text-gray-600 prose prose-sm max-w-none"
                      style={{ fontSize: '12px', color: '#666', lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {(item.techStack || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(item.techStack || []).map((tech, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '11px',
                            color: '#888',
                            padding: '2px 0',
                            borderBottom: `1px solid ${primaryColor}40`,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {content.skills && content.skills.length > 0 && (
            <div className={`mb-8 ${highlightClass('skills')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                专业技能
              </h2>
              <div className="flex flex-wrap gap-3">
                {content.skills.map((item) => (
                  <span
                    key={item.id}
                    style={{
                      fontSize: '11px',
                      color: '#888',
                      padding: '2px 0',
                      borderBottom: `1px solid ${primaryColor}40`,
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.certifications && content.certifications.length > 0 && (
            <div className={`mb-8 ${highlightClass('certifications')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                证书荣誉
              </h2>
              {content.certifications.map((item) => (
                <div key={item.id} className="mb-2 last:mb-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-700" style={{ fontSize: '13px' }}>{item.name}</h3>
                    <span style={{ fontSize: '11px', color: '#bbb' }}>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {content.campusExperiences && content.campusExperiences.length > 0 && (
            <div className={`mb-8 ${highlightClass('campusExperiences')}`}>
              <h2
                className="font-bold mb-4 tracking-widest uppercase"
                style={{
                  color: primaryColor,
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                校园经历
              </h2>
              {content.campusExperiences.map((item) => (
                <div key={item.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800" style={{ fontSize: '13px' }}>{item.name}</h3>
                      <p className="text-gray-500" style={{ fontSize: '12px' }}>{item.role || item.position}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#bbb' }}>
                      {item.startDate} - {item.endDate || '至今'}
                    </span>
                  </div>
                  {(item.achievements || []).length > 0 && (
                    <ul className="mt-2 text-gray-600">
                      {(item.achievements || []).map((achievement, index) => (
                        <li key={index} className="flex items-start mt-1" style={{ fontSize: '12px', color: '#666' }}>
                          <span className="mr-2" style={{ color: primaryColor }}>•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cardClassName}
      style={{ fontFamily, fontSize: `${fontSize}px`, backgroundColor }}
    >
      <div style={{ padding: `${formatConfig.margin}px` }}>
        {content.basicInfo && (
          <div
            className={`text-center mb-6 pb-6 ${highlightClass('basicInfo')}`}
            style={{ borderBottom: `3px solid ${primaryColor}` }}
          >
            <h1 className="font-bold mb-2" style={{ color: primaryColor, fontSize: '32px' }}>
              {content.basicInfo.name || '您的姓名'}
            </h1>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
              {content.basicInfo.title || '您的职位'}
            </p>
            <div className="flex justify-center gap-4" style={{ fontSize: '12px', color: '#888' }}>
              {content.basicInfo.email && <span>{content.basicInfo.email}</span>}
              {content.basicInfo.phone && <span>{content.basicInfo.phone}</span>}
              {content.basicInfo.location && <span>{content.basicInfo.location}</span>}
            </div>
            {content.basicInfo.bio && (
              <p className="mt-4 text-gray-600 leading-relaxed text-left" style={{ fontSize: '13px' }}>
                {content.basicInfo.bio}
              </p>
            )}
          </div>
        )}

        {content.education && content.education.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('education')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>教育背景</SectionTitle>
            {content.education.map((item) => (
              <div key={item.id} className="mb-4 last:mb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '15px' }}>{item.school}</h3>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>{item.major} | {item.degree}</p>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: '12px' }}>{item.startDate} - {item.endDate}</span>
                </div>
                {item.gpa && <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>GPA: {item.gpa}</p>}
              </div>
            ))}
          </div>
        )}

        {content.experience && content.experience.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('experience')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>工作经历</SectionTitle>
            {content.experience.map((item) => (
              <div key={item.id} className="mb-4 last:mb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '15px' }}>{item.company}</h3>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>
                      {item.position}{item.location ? ` | ${item.location}` : ''}
                    </p>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: '12px' }}>
                    {item.startDate} - {item.endDate || '至今'}
                  </span>
                </div>
                {item.description && (
                  <div
                    className="text-gray-600 mt-2 prose prose-sm max-w-none"
                    style={{ fontSize: '13px' }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
                {(item.achievements || []).length > 0 && (
                  <ul className="mt-2 text-gray-600">
                    {(item.achievements || []).map((achievement, index) => (
                      <li key={index} className="flex items-start mt-1">
                        <span className="mr-2" style={{ color: primaryColor }}>•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {content.projects && content.projects.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('projects')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>项目经验</SectionTitle>
            {content.projects.map((item) => (
              <div key={item.id} className="mb-4 last:mb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '15px' }}>{item.name}</h3>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>{item.role}</p>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: '12px' }}>
                    {item.startDate} - {item.endDate || '至今'}
                  </span>
                </div>
                {item.description && (
                  <div
                    className="text-gray-600 mt-2 prose prose-sm max-w-none"
                    style={{ fontSize: '13px' }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
                {(item.techStack || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(item.techStack || []).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}40`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {(item.achievements || []).length > 0 && (
                  <ul className="mt-2 text-gray-600">
                    {(item.achievements || []).map((achievement, index) => (
                      <li key={index} className="flex items-start mt-1">
                        <span className="mr-2" style={{ color: primaryColor }}>•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {content.skills && content.skills.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('skills')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>专业技能</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 rounded text-sm"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}40`,
                  }}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {content.certifications && content.certifications.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('certifications')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>证书荣誉</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {content.certifications.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 rounded text-sm"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}40`,
                  }}
                >
                  {item.name} {item.date || ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {content.campusExperiences && content.campusExperiences.length > 0 && (
          <div className={`mb-6 pb-6 ${highlightClass('campusExperiences')}`} style={{ borderBottom: `1px solid ${lineColor}` }}>
            <SectionTitle>校园经历</SectionTitle>
            {content.campusExperiences.map((item) => (
              <div key={item.id} className="mb-3 last:mb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '15px' }}>{item.name}</h3>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>{item.role || item.position}</p>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: '12px' }}>
                    {item.startDate} - {item.endDate || '至今'}
                  </span>
                </div>
                {(item.achievements || []).length > 0 && (
                  <ul className="mt-2 text-gray-600">
                    {(item.achievements || []).map((achievement, index) => (
                      <li key={index} className="flex items-start mt-1">
                        <span className="mr-2" style={{ color: primaryColor }}>•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {content.careerObjective && (
          <div className={highlightClass('careerObjective')}>
            <SectionTitle>职业目标</SectionTitle>
            <div
              className="text-gray-600 prose prose-sm max-w-none"
              style={{ fontSize: '13px' }}
              dangerouslySetInnerHTML={{ __html: content.careerObjective }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
