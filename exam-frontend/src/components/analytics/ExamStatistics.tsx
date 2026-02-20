'use client'
import { Bar } from 'react-chartjs-2' // NOTE: sudah ada chart.js di package.json
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { useUiStore } from '@/stores/ui.store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ExamStatisticsProps {
  labels: string[]
  scores: number[]
  title?: string
}

export function ExamStatistics({ labels, scores, title = 'Distribusi Nilai' }: ExamStatisticsProps) {
  const { theme } = useUiStore()
  const textColor = theme === 'dark' ? '#d1d5db' : '#374151'

  const data = {
    labels,
    datasets: [{
      label: 'Jumlah Siswa',
      data: scores,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-sm">{title}</h3>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0 }, beginAtZero: true },
          },
        }}
      />
    </div>
  )
}
