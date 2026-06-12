import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import ResumeEditorPage from '@/pages/ResumeEditorPage'
import InterviewPage from '@/pages/InterviewPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resume/:id" element={<ResumeEditorPage />} />
          <Route path="/interview" element={<InterviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}


