import { useParams } from 'react-router-dom';

export default function ResumeEditorPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  return <div>Resume Editor Page - {resumeId}</div>;
}
