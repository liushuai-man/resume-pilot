import { Text } from '@mantine/core';
import { BriefcaseBusiness } from 'lucide-react';
import type { JobProfile } from '@/types/job';

interface Props { profile?: JobProfile & { company?: string | null }; }

export default function JobProfilePanel({ profile }: Props) {
  if (!profile) return <div className="flex h-full flex-col items-center justify-center bg-[#F8FAF9] text-center"><BriefcaseBusiness size={30} className="text-[#7C9289]"/><Text fw={700} mt={12}>通用岗位</Text><Text size="sm" c="dimmed" mt={6}>本场使用系统通用 Rubric，不引用具体 JD。</Text></div>;
  return (
    <div className="h-full overflow-y-auto bg-[#F8FAF9] p-6"><div className="mx-auto max-w-lg">
      <Text size="xs" fw={700} className="tracking-[0.12em] text-[#176B52]">FROZEN JOB PROFILE</Text>
      <Text fw={700} size="xl" mt={8}>{profile.jobTitle}</Text>
      <Text size="sm" c="dimmed" mt={4}>{[profile.company, profile.seniority, profile.industry].filter(Boolean).join(' · ')} · v{profile.version}</Text>
      {[['核心职责', profile.responsibilities], ['必备能力', profile.requiredSkills], ['加分项', profile.preferredSkills]].map(([title, items]) => (
        <section key={String(title)} className="mt-7 border-t border-[#D8E1DD] pt-5"><Text fw={700} size="sm">{String(title)}</Text>
          <div className="mt-3 space-y-3">{(items as any[]).map((item, index) => <div key={index} className="rounded-lg bg-white p-3 shadow-sm"><Text size="sm" fw={600}>{item.name}</Text><Text size="xs" c="dimmed" mt={4}>{item.evidence}</Text></div>)}</div>
        </section>
      ))}
    </div></div>
  );
}
