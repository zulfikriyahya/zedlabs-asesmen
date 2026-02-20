'use client';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/stores/ui.store';

interface ItemData {
  questionId: string;
  label: string;
  difficulty: number; // 0–1 (proporsi yang salah)
  discrimination: number; // -1 to 1
}

interface ItemAnalysisChartProps {
  items: ItemData[];
}

export function ItemAnalysisChart({ items }: ItemAnalysisChartProps) {
  const { theme } = useUiStore();
  const tc = theme === 'dark' ? '#d1d5db' : '#374151';

  const data = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        label: 'Tingkat Kesulitan',
        data: items.map((i) => +(i.difficulty * 100).toFixed(1)),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'Daya Pembeda',
        data: items.map((i) => +(i.discrimination * 100).toFixed(1)),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">Analisis Butir Soal</h3>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top', labels: { color: tc, font: { size: 11 } } },
          },
          scales: {
            x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } },
            y: {
              ticks: { color: tc },
              beginAtZero: true,
              max: 100,
              title: { display: true, text: '%', color: tc },
            },
          },
        }}
      />
    </div>
  );
}
