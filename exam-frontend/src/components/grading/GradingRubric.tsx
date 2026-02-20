import { Card } from '@/components/ui/Card';

interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

interface GradingRubricProps {
  maxScore: number;
}

// Rubrik otomatis berdasarkan maxScore
function generateRubric(maxScore: number): RubricLevel[] {
  return [
    {
      score: maxScore,
      label: 'Sempurna',
      description: 'Jawaban lengkap, tepat, dan menunjukkan pemahaman mendalam.',
    },
    {
      score: Math.round(maxScore * 0.75),
      label: 'Baik',
      description: 'Jawaban sebagian besar benar dengan sedikit kekurangan.',
    },
    {
      score: Math.round(maxScore * 0.5),
      label: 'Cukup',
      description: 'Jawaban menunjukkan pemahaman dasar namun banyak yang kurang.',
    },
    {
      score: Math.round(maxScore * 0.25),
      label: 'Kurang',
      description: 'Jawaban tidak relevan atau sangat tidak lengkap.',
    },
    {
      score: 0,
      label: 'Tidak Ada',
      description: 'Tidak ada jawaban atau jawaban tidak bisa dinilai.',
    },
  ];
}

export function GradingRubric({ maxScore }: GradingRubricProps) {
  const rubric = generateRubric(maxScore);
  return (
    <Card compact>
      <h3 className="mb-3 text-sm font-semibold">Panduan Penilaian</h3>
      <div className="space-y-2">
        {rubric.map((level) => (
          <div key={level.score} className="flex items-start gap-3 text-sm">
            <span className="w-8 shrink-0 font-mono font-bold text-primary">{level.score}</span>
            <div>
              <span className="font-medium">{level.label}</span>
              <span className="text-base-content/50"> — {level.description}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
