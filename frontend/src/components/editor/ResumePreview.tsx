import { Card } from '@mantine/core';
import type { ResumeContent } from '@/types/resume';

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
  // 检查内容是否为空
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

  return (
    <Card className={cardClassName}>
      {isEmpty ? (
        <div className="min-h-[calc(100vh-10rem)] p-8 flex items-center justify-center text-gray-400">
          <p className="text-center">暂无简历内容，请在左侧编辑区域填写信息</p>
        </div>
      ) : (
        <div className="p-8 ">
          {/* 基本信息 */}
          {content.basicInfo && (
            <div
              className={`text-center mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'basicInfo' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {content.basicInfo.name || '您的姓名'}
              </h1>
              <p className="text-gray-500">
                {content.basicInfo.title || '您的职位'}
              </p>
              <div className="flex justify-center gap-4 mt-3 text-sm text-gray-600">
                {content.basicInfo.email && (
                  <span>{content.basicInfo.email}</span>
                )}
                {content.basicInfo.phone && (
                  <span>{content.basicInfo.phone}</span>
                )}
                {content.basicInfo.location && (
                  <span>{content.basicInfo.location}</span>
                )}
              </div>
              {content.basicInfo.summary && (
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                  {content.basicInfo.summary}
                </p>
              )}
            </div>
          )}

          {/* 教育经历 */}
          {content.education && content.education.length > 0 && (
            <div
              className={`mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'education' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                教育背景
              </h2>
              {content.education.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {item.school}
                      </h3>
                      <p className="text-sm text-gray-500">{item.major}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {item.startDate} - {item.endDate}
                    </span>
                  </div>
                  {item.gpa && (
                    <p className="text-sm text-gray-500 mt-1">
                      GPA: {item.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 工作经历 */}
          {content.experience && content.experience.length > 0 && (
            <div
              className={`mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'experience' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                工作经历
              </h2>
              {content.experience.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {item.company}
                      </h3>
                      <p className="text-sm text-gray-500">{item.position}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {item.startDate} - {item.endDate || '至今'}
                    </span>
                  </div>
                  {item.description && (
                    <div
                      className="text-sm text-gray-600 mt-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {(item.achievements || []).length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {(item.achievements || []).map((achievement, index) => (
                        <li key={index} className="flex items-start mt-1">
                          <span className="text-blue-500 mr-2">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 项目经验 */}
          {content.projects && content.projects.length > 0 && (
            <div
              className={`mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'projects' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                项目经验
              </h2>
              {content.projects.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.role}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {item.startDate} - {item.endDate || '至今'}
                    </span>
                  </div>
                  {item.description && (
                    <div
                      className="text-sm text-gray-600 mt-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {(item.techStack || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(item.techStack || []).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(item.achievements || []).length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {(item.achievements || []).map((achievement, index) => (
                        <li key={index} className="flex items-start mt-1">
                          <span className="text-blue-500 mr-2">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 专业技能 */}
          {content.skills && content.skills.length > 0 && (
            <div
              className={`mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'skills' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                专业技能
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {content.skills.map((item) => (
                  <li key={item.id} className="text-gray-700 text-sm">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 证书 */}
          {content.certifications && content.certifications.length > 0 && (
            <div
              className={`mb-6 pb-6 border-b border-gray-200 ${highlightSection === 'certifications' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                证书荣誉
              </h2>
              {content.certifications.map((item) => (
                <div key={item.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <span className="text-sm text-gray-400">{item.date}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 校园经历 */}
          {content.campusExperiences &&
            content.campusExperiences.length > 0 && (
              <div
                className={`mb-6 ${highlightSection === 'campusExperiences' ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''}`}
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                  校园经历
                </h2>
                {content.campusExperiences.map((item) => (
                  <div key={item.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {item.name}
                        </h3>
                        {item.position && (
                          <p className="text-sm text-gray-500">
                            {item.position}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {item.startDate} - {item.endDate || '至今'}
                      </span>
                    </div>
                    {(item.achievements || []).length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600">
                        {(item.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start mt-1">
                            <span className="text-blue-500 mr-2">•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* 职业目标 */}
          {content.careerObjective && (
            <div
              className={
                highlightSection === 'careerObjective'
                  ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50'
                  : ''
              }
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                职业目标
              </h2>
              <div
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content.careerObjective }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
