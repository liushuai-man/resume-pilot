import { INTERVIEW_NOTES_MAX_LENGTH } from '@/hooks/useInterviewWorkspace';

interface Props {
  notes: string;
  sessionStarted: boolean;
  onChange: (value: string) => void;
}

export default function InterviewNotesPanel({ notes, sessionStarted, onChange }: Props) {
  return (
    <section className="flex h-full flex-col bg-[#F8FAF9] p-5" aria-labelledby="interview-notes-title">
      <header className="mb-4 border-b border-[#D8E1DD] pb-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#176B52]">Private workspace</p>
        <h2 id="interview-notes-title" className="text-lg font-semibold text-[#17211D]">临时笔记</h2>
        <p className="mt-1 text-xs leading-5 text-[#66756F]">仅保存在此浏览器，不会提交给面试 Agent，也不参与评分。</p>
      </header>

      <label htmlFor="interview-notes" className="mb-2 text-sm font-medium text-[#34423D]">面试过程记录</label>
      <textarea
        id="interview-notes"
        value={notes}
        disabled={!sessionStarted}
        maxLength={INTERVIEW_NOTES_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        placeholder={sessionStarted ? '记录待补充的案例、关键词或复盘要点……' : '开始面试后可使用临时笔记'}
        className="min-h-0 flex-1 resize-none rounded-xl border border-[#CBD7D2] bg-white p-4 text-sm leading-6 text-[#17211D] shadow-sm outline-none transition placeholder:text-[#99A59F] focus:border-[#176B52] focus:ring-2 focus:ring-[#176B52]/15 disabled:cursor-not-allowed disabled:bg-[#EEF2F0]"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A8882]">
        <span>{sessionStarted ? '当前面试专属' : '尚未开始面试'}</span>
        <span>{notes.length} / {INTERVIEW_NOTES_MAX_LENGTH}</span>
      </div>
    </section>
  );
}
