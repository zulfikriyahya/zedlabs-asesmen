'use client';
import { useEffect, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useExamStore, selectCurrentQuestion, selectTotalQuestions } from '@/stores/exam.store';
import { useAnswerStore } from '@/stores/answer.store';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { submitExam } from '@/lib/exam/controller';
import { validateAnswers } from '@/lib/exam/validator';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { QuestionNavigation } from '@/components/exam/QuestionNavigation';
import { AutoSaveIndicator } from '@/components/exam/AutoSaveIndicator';
import { ActivityLogger } from '@/components/exam/ActivityLogger';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Confirm } from '@/components/ui/Confirm';
import { Loading } from '@/components/ui/Loading';
import { getAnswersByAttempt } from '@/lib/db/queries';
import { useState } from 'react';
import type { AnswerValue } from '@/types/answer';
import type { ExamQuestion } from '@/types/question';

// Lazy load per tipe soal
const MultipleChoice = lazy(() =>
  import('@/components/exam/question-types/MultipleChoice').then((m) => ({
    default: m.MultipleChoice,
  })),
);
const MultipleChoiceComplex = lazy(() =>
  import('@/components/exam/question-types/MultipleChoiceComplex').then((m) => ({
    default: m.MultipleChoiceComplex,
  })),
);
const TrueFalse = lazy(() =>
  import('@/components/exam/question-types/TrueFalse').then((m) => ({ default: m.TrueFalse })),
);
const ShortAnswer = lazy(() =>
  import('@/components/exam/question-types/ShortAnswer').then((m) => ({ default: m.ShortAnswer })),
);
const Essay = lazy(() =>
  import('@/components/exam/question-types/Essay').then((m) => ({ default: m.Essay })),
);
const Matching = lazy(() =>
  import('@/components/exam/question-types/Matching').then((m) => ({ default: m.Matching })),
);

function QuestionRenderer({ question }: { question: ExamQuestion }) {
  const { answers } = useAnswerStore();
  const params = useParams();
  const sessionId = params.id as string;
  const { activeAttempt } = useExamStore();
  const { saveAnswer } = useAutoSave({ attemptId: activeAttempt?.id ?? '', sessionId });

  const val = answers[question.id];

  const handleChange = (v: AnswerValue) => saveAnswer(question.id, v);

  return (
    <Suspense fallback={<Loading size="sm" />}>
      {question.type === 'MULTIPLE_CHOICE' && (
        <MultipleChoice
          options={question.options as never}
          value={val as string | undefined}
          onChange={handleChange}
        />
      )}
      {question.type === 'COMPLEX_MULTIPLE_CHOICE' && (
        <MultipleChoiceComplex
          options={question.options as never}
          value={val as string[] | undefined}
          onChange={handleChange}
        />
      )}
      {question.type === 'TRUE_FALSE' && (
        <TrueFalse value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'SHORT_ANSWER' && (
        <ShortAnswer value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'ESSAY' && (
        <Essay value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'MATCHING' && (
        <Matching
          options={question.options as never}
          value={val as Record<string, string> | undefined}
          onChange={handleChange}
        />
      )}
    </Suspense>
  );
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { success, error: toastError } = useToast();

  const examStore = useExamStore();
  const { answers } = useAnswerStore();
  const currentQuestion = selectCurrentQuestion(examStore);
  const totalQuestions = selectTotalQuestions(examStore);
  const answeredCount = Object.keys(answers).length;
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attempt = examStore.activeAttempt;
  const pkg = examStore.activePackage;

  // Redirect jika tidak ada attempt aktif
  useEffect(() => {
    if (!attempt || !pkg) {
      router.replace('/siswa/ujian/download');
    }
  }, [attempt, pkg, router]);

  // Hydrate jawaban dari IndexedDB saat page load
  useEffect(() => {
    if (!attempt) return;
    getAnswersByAttempt(attempt.id).then((localAnswers) => {
      if (localAnswers.length > 0) {
        useAnswerStore.getState().hydrateFromLocal(
          localAnswers.map((a) => ({
            questionId: a.questionId,
            answer: a.answer,
            mediaUrls: a.mediaUrls,
          })),
        );
      }
    });
  }, [attempt]);

  // Timer
  useTimer({
    durationSeconds: (pkg?.settings.duration ?? 0) * 60,
    startedAt: attempt ? new Date(attempt.startedAt).getTime() : Date.now(),
    onExpire: handleSubmit,
  });

  async function handleSubmit() {
    if (!attempt) return;
    setIsSubmitting(true);
    try {
      await submitExam(attempt.id);
      examStore.markSubmitted();
      success('Ujian berhasil dikumpulkan!');
      router.replace(`/siswa/ujian/${sessionId}/result`);
    } catch (e) {
      toastError('Gagal mengumpulkan ujian. Mencoba ulang...');
      setIsSubmitting(false);
    }
  }

  if (!attempt || !pkg || !currentQuestion) {
    return <Loading fullscreen text="Memuat ujian..." />;
  }

  const warnings = validateAnswers(pkg, answers);
  const unansweredCount = warnings.length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Activity logger (invisible) */}
      <ActivityLogger attemptId={attempt.id} sessionId={sessionId} />

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
        <div className="flex items-center gap-4">
          <ExamTimer />
          <div className="hidden sm:block">
            <AutoSaveIndicator />
          </div>
        </div>
        <div className="text-sm font-medium">
          Soal {examStore.currentQuestionIndex + 1} / {totalQuestions}
        </div>
        <Button
          variant="error"
          size="sm"
          onClick={() => setShowSubmitConfirm(true)}
          disabled={isSubmitting}
        >
          Kumpulkan
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Question navigation */}
        <div className="hidden w-56 shrink-0 overflow-y-auto border-r border-base-300 md:block">
          <div className="p-3">
            <ProgressBar answered={answeredCount} total={totalQuestions} />
          </div>
          <QuestionNavigation />
        </div>

        {/* Main — Question content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {/* Question header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-outline">
                  Soal {examStore.currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-base-content/50">{currentQuestion.points} poin</span>
              </div>
              <span className="badge badge-ghost badge-sm">
                {currentQuestion.type.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Question content */}
            <div className="prose-sm prose max-w-none">
              <p className="text-base leading-relaxed">{currentQuestion.content.text}</p>
              {currentQuestion.content.images?.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Gambar ${i + 1}`}
                  className="max-h-64 rounded-box object-contain"
                />
              ))}
            </div>

            {/* Answer input */}
            <div className="rounded-box bg-base-200/50 p-4">
              <QuestionRenderer question={currentQuestion} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between border-t border-base-300 bg-base-100 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={examStore.prevQuestion}
          disabled={examStore.currentQuestionIndex === 0}
        >
          ← Sebelumnya
        </Button>

        {/* Mobile: soal navigator */}
        <div className="flex max-w-[60vw] gap-1 overflow-x-auto py-1 md:hidden">
          {examStore.questionOrder
            .slice(
              Math.max(0, examStore.currentQuestionIndex - 2),
              examStore.currentQuestionIndex + 3,
            )
            .map((id, relIdx) => {
              const absIdx = Math.max(0, examStore.currentQuestionIndex - 2) + relIdx;
              const isCurr = absIdx === examStore.currentQuestionIndex;
              return (
                <button
                  key={id}
                  onClick={() => examStore.goToQuestion(absIdx)}
                  className={`btn btn-square btn-xs font-mono ${isCurr ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {absIdx + 1}
                </button>
              );
            })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={examStore.nextQuestion}
          disabled={examStore.currentQuestionIndex === totalQuestions - 1}
        >
          Berikutnya →
        </Button>
      </div>

      {/* Submit confirm */}
      <Confirm
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        title="Kumpulkan Ujian?"
        message={
          unansweredCount > 0
            ? `Masih ada ${unansweredCount} soal yang belum dijawab. Yakin ingin mengumpulkan?`
            : 'Semua soal sudah dijawab. Kumpulkan sekarang?'
        }
        variant={unansweredCount > 0 ? 'warning' : 'primary'}
        confirmLabel="Ya, Kumpulkan"
        loading={isSubmitting}
      />
    </div>
  );
}
