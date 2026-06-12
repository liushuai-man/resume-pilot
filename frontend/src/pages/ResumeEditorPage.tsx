import { useParams } from 'react-router-dom'

export default function ResumeEditorPage() {
  const { id } = useParams()
  return <div>Resume Editor Page - {id}</div>
}
