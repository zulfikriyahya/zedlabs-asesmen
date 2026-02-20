'use client';
import { useState } from 'react';
import { gradingApi } from '@/lib/api/grading.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { useToast } from '@/hooks/use-toast';
import type { ManualGradingItem } from '@/types/answer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EssaySimilarityBadge } from './EssaySimilarityBadge';

interface ManualGradingCardProps {
  item: ManualGradingItem;
  onGraded: () => void;
}

export function ManualGradingCard({ item, onGraded }: ManualGradingCardProps) {
  const { success, error: toastError } = useToast();
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score < 0 || score > item.maxScore) {
      toastError(`Nilai harus antara 0–${item.maxScore}`);
      return;
    }
    setSubmitting(true);
    try {
      await gradingApi.gradeAnswer({
        answerId: item.answerId,
        score,
        feedback: feedback.trim() || undefined,
      });
      success(`Jawaban ${item.studentName} berhasil dinilai`);
      onGraded();
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const answerText =
    typeof item.answerValue === 'string' ? item.answerValue : JSON.stringify(item.answerValue);

  return (
    <Card bordered className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="w-8 rounded-full bg-primary text-primary-content">
              <span className="text-xs">{item.studentName[0]?.toUpperCase()}</span>
            </div>
          </div>
          <span className="text-sm font-medium">{item.studentName}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.similarityScore !== undefined && (
            <EssaySimilarityBadge score={item.similarityScore} />
          )}
          <Badge variant="warning" size="sm">
            Perlu Dinilai
          </Badge>
          <span className="text-xs text-base-content/50">Max: {item.maxScore} poin</span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-box bg-base-200 p-3">
        <p className="mb-1 text-xs font-medium text-base-content/50">Pertanyaan</p>
        <p className="text-sm leading-relaxed">{item.questionContent}</p>
      </div>

      {/* Answer */}
      <div>
        <p className="mb-1 text-xs font-medium text-base-content/50">Jawaban Siswa</p>
        <div className="min-h-[4rem] rounded-box border border-base-300 bg-base-100 p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {answerText || <span className="italic text-base-content/30">Tidak ada jawaban</span>}
          </p>
        </div>
        {item.mediaUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.mediaUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-xs gap-1"
              >
                📎 Media {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Score input */}
      <div className="flex items-end gap-3">
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text font-medium">Nilai (0 – {item.maxScore})</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={item.maxScore}
              step={0.5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="range range-primary flex-1"
              disabled={submitting}
            />
            <input
              type="number"
              min={0}
              max={item.maxScore}
              step={0.5}
              value={score}
              onChange={(e) =>
                setScore(Math.min(item.maxScore, Math.max(0, Number(e.target.value))))
              }
              className="input input-sm input-bordered w-20 text-center font-mono font-bold"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">
            Komentar / Feedback <span className="text-base-content/40">(opsional)</span>
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered resize-none"
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Berikan komentar untuk siswa..."
          disabled={submitting}
        />
      </div>

      <Button onClick={handleSubmit} loading={submitting} className="w-full">
        Simpan Nilai
      </Button>
    </Card>
  );
}
