import { useCallback, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { interviewApi, type Answer, type InterviewResult, type Question } from '@/api/interview.api';
import { getApiErrorMessage } from '@/utils/api-error';

interface StartOptions { resumeId: string; targetPosition?: string; questionCount: number; jobProfileId?: string; }

export function useInterviewSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{ id: string; questionId: string; answer: string } | null>(null);

  const finish = useCallback(async (activeSessionId = sessionId) => {
    if (!activeSessionId) return;
    setFinishing(true);
    try {
      const result = await interviewApi.finishInterview(activeSessionId);
      setInterviewResult(result); setIsFinished(true);
      notifications.show(result.status === 'failed'
        ? { title: '报告生成失败', message: '完整问答已保存，可在面试记录中重试', color: 'red' }
        : { title: '完成', message: '面试已完成，查看报告', color: 'green' });
    } catch (error) {
      notifications.show({ title: '完成面试失败', message: getApiErrorMessage(error, '请稍后重试'), color: 'red' });
    } finally { setFinishing(false); }
  }, [sessionId]);

  const start = useCallback(async (options: StartOptions) => {
    setStarting(true); setIsThinking(true);
    try {
      const result = await interviewApi.startInterview(options.resumeId, options.targetPosition, options.questionCount, options.jobProfileId);
      setSessionId(result.sessionId); setCurrentQuestion(result.firstQuestion); setQuestions([result.firstQuestion]);
    } catch (error) {
      setSessionId(null); setCurrentQuestion(null); setQuestions([]);
      notifications.show({ title: '开始面试失败', message: getApiErrorMessage(error, '请检查模型配置和网络连接后重试'), color: 'red' });
    } finally { setStarting(false); setIsThinking(false); }
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !sessionId || !currentAnswer.trim()) return;
    const answerText = pendingSubmission?.answer || currentAnswer;
    const submission = pendingSubmission?.questionId === currentQuestion.id
      ? pendingSubmission
      : { id: crypto.randomUUID(), questionId: currentQuestion.id, answer: answerText };
    setPendingSubmission(submission);
    setSubmitting(true); setIsThinking(true);
    try {
      const result = await interviewApi.submitAnswer(sessionId, submission.answer, submission.id);
      setAnswers((items) => items.some((item) => item.submissionId === submission.id)
        ? items : [...items, { questionId: result.questionId, content: submission.answer, submissionId: submission.id }]);
      setCurrentAnswer(''); setPendingSubmission(null);
      if (result.isFinished) await finish(sessionId);
      else {
        const nextQuestion = await interviewApi.getNextQuestion(sessionId);
        if (nextQuestion) { setCurrentQuestion(nextQuestion); setQuestions((items) => [...items, nextQuestion]); }
      }
    } catch (error) {
      setCurrentAnswer(submission.answer);
      notifications.show({ title: '回答保存失败', message: getApiErrorMessage(error, '草稿已保留，请重新提交'), color: 'red' });
    } finally { setSubmitting(false); setIsThinking(false); }
  }, [currentAnswer, currentQuestion, finish, pendingSubmission, sessionId]);

  const retryReport = useCallback(async () => {
    if (!interviewResult?.id) return;
    setFinishing(true);
    try {
      const result = interviewResult.failed_node && interviewResult.evaluation_input_hash
        ? await interviewApi.retryInterviewNode(interviewResult.id, interviewResult.failed_node, interviewResult.evaluation_input_hash)
        : await interviewApi.retryInterviewReport(interviewResult.id);
      setInterviewResult(result);
      if (result.status === 'failed') throw new Error(result.error_message || '报告生成失败');
      notifications.show({ title: '报告已生成', message: '批量评价已完成', color: 'green' });
    } catch (error) {
      notifications.show({ title: '重试失败', message: getApiErrorMessage(error, '完整问答仍已安全保存，请稍后重试'), color: 'red' });
    } finally { setFinishing(false); }
  }, [interviewResult]);

  const restart = useCallback(() => {
    setSessionId(null); setCurrentQuestion(null); setQuestions([]); setAnswers([]); setCurrentAnswer('');
    setIsFinished(false); setInterviewResult(null); setPendingSubmission(null);
  }, []);

  return { sessionId, currentQuestion, questions, answers, currentAnswer, setCurrentAnswer, interviewResult,
    isFinished, starting, submitting, finishing, isThinking, answerSaveFailed: Boolean(pendingSubmission), start, submitAnswer, finish, retryReport, restart };
}
