# Frontend Blueprint - Astro Exam System

> Auto-generated blueprint untuk frontend Astro
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Multi-Tenant Web Application

## 📋 Informasi Project

- **Framework**: Astro (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **PWA**: Service Worker enabled
- **Target**: Android WebView optimized

---

## 📁 Direktori: src

**Core application code** - Components, pages, layouts, lib, stores

### 📂 Sub-direktori: src/components

#### 📄 File: `./src/components/analytics/DashboardStats.astro`

```astro
---
// src/components/analytics/DashboardStats.astro
interface Props {
  stats: {
    totalExams: number;
    activeExams: number;
    completedExams: number;
    averageScore: number;
  };
}

const { stats } = Astro.props;
---

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  <!-- Total Exams -->
  <div class="stat rounded-lg bg-base-200 shadow">
    <div class="text-primary stat-figure">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        ></path>
      </svg>
    </div>
    <div class="stat-title">Total Ujian</div>
    <div class="text-primary stat-value">{stats.totalExams}</div>
    <div class="stat-desc">Semua ujian</div>
  </div>

  <!-- Active Exams -->
  <div class="stat rounded-lg bg-base-200 shadow">
    <div class="stat-figure text-success">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        ></path>
      </svg>
    </div>
    <div class="stat-title">Ujian Aktif</div>
    <div class="stat-value text-success">{stats.activeExams}</div>
    <div class="stat-desc">Sedang berlangsung</div>
  </div>

  <!-- Completed Exams -->
  <div class="stat rounded-lg bg-base-200 shadow">
    <div class="stat-figure text-info">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>
    <div class="stat-title">Selesai</div>
    <div class="stat-value text-info">{stats.completedExams}</div>
    <div class="stat-desc">Ujian selesai</div>
  </div>

  <!-- Average Score -->
  <div class="stat rounded-lg bg-base-200 shadow">
    <div class="stat-figure text-warning">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        ></path>
      </svg>
    </div>
    <div class="stat-title">Rata-rata Nilai</div>
    <div class="stat-value text-warning">{stats.averageScore.toFixed(1)}</div>
    <div class="stat-desc">Dari 100</div>
  </div>
</div>

```

---

#### 📄 File: `./src/components/analytics/ExamStatistics.astro`

```astro
---
// src/components/analytics/ExamStatistics.astro
interface Props {
  examId: number;
  statistics: {
    totalParticipants: number;
    submitted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passingRate: number;
    averageTime: number;
  };
}

const { examId, statistics } = Astro.props;
---

<div class="space-y-6">
  <!-- Summary Cards -->
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">Peserta</h3>
        <p class="text-3xl font-bold">{statistics.totalParticipants}</p>
        <p class="text-sm text-base-content/70">
          {statistics.submitted} sudah submit
        </p>
      </div>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">Nilai Rata-rata</h3>
        <p class="text-3xl font-bold">{statistics.averageScore.toFixed(1)}</p>
        <div class="text-sm text-base-content/70">
          <span>Tertinggi: {statistics.highestScore}</span>
          <span class="mx-2">•</span>
          <span>Terendah: {statistics.lowestScore}</span>
        </div>
      </div>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">Kelulusan</h3>
        <p class="text-3xl font-bold">{statistics.passingRate.toFixed(1)}%</p>
        <p class="text-sm text-base-content/70">
          Rata-rata waktu: {Math.floor(statistics.averageTime / 60)} menit
        </p>
      </div>
    </div>
  </div>

  <!-- Score Distribution Chart -->
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">Distribusi Nilai</h3>
      <canvas id="score-distribution-chart"></canvas>
    </div>
  </div>

  <!-- Item Analysis Chart -->
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">Analisis Butir Soal</h3>
      <canvas id="item-analysis-chart"></canvas>
    </div>
  </div>
</div>

<script>
  import { Chart } from 'chart.js/auto';

  // Load chart data from API
  async function loadCharts() {
    try {
      const examId = window.location.pathname.split('/').pop();
      const response = await fetch(`/api/exams/${examId}/analytics`);
      const data = await response.json();

      // Score Distribution Chart
      const scoreCtx = document.getElementById('score-distribution-chart') as HTMLCanvasElement;
      new Chart(scoreCtx, {
        type: 'bar',
        data: {
          labels: [
            '0-10',
            '11-20',
            '21-30',
            '31-40',
            '41-50',
            '51-60',
            '61-70',
            '71-80',
            '81-90',
            '91-100',
          ],
          datasets: [
            {
              label: 'Jumlah Siswa',
              data: data.scoreDistribution,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });

      // Item Analysis Chart
      const itemCtx = document.getElementById('item-analysis-chart') as HTMLCanvasElement;
      new Chart(itemCtx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Soal',
              data: data.itemAnalysis,
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
              pointRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Difficulty Index' },
              min: 0,
              max: 1,
            },
            y: {
              title: { display: true, text: 'Discrimination Index' },
              min: -1,
              max: 1,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to load charts:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCharts);
  } else {
    loadCharts();
  }
</script>

<style>
  canvas {
    max-height: 400px;
  }
</style>

```

---

#### 📄 File: `./src/components/analytics/ItemAnalysisChart.astro`

```astro
---
// src/components/analytics/ItemAnalysisChart.astro
interface Props {
  examId: number;
  questions: Array<{
    id: number;
    number: number;
    difficulty: number;
    discrimination: number;
    type: string;
  }>;
}

const { examId, questions } = Astro.props;
---

<div class="card bg-base-200">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="card-title">Analisis Butir Soal</h3>
      <div class="text-sm text-base-content/70">
        <span class="mr-4">D: Difficulty Index (0-1)</span>
        <span>Disc: Discrimination Index (-1 to 1)</span>
      </div>
    </div>

    <canvas id="item-analysis-chart" class="max-h-96"></canvas>

    <!-- Legend -->
    <div class="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
      <div class="flex items-center gap-2">
        <div class="h-4 w-4 rounded-full bg-success"></div>
        <span>Baik (D: 0.3-0.7, Disc > 0.3)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-4 w-4 rounded-full bg-warning"></div>
        <span>Perlu Revisi (D atau Disc kurang)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-4 w-4 rounded-full bg-error"></div>
        <span>Buang (Disc < 0)</span>
      </div>
    </div>

    <!-- Question Details Table -->
    <div class="mt-6 overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>No</th>
            <th>Tipe</th>
            <th>Difficulty</th>
            <th>Discrimination</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {
            questions.map((q) => {
              const isGood = q.difficulty >= 0.3 && q.difficulty <= 0.7 && q.discrimination > 0.3;
              const needsRevision = !isGood && q.discrimination >= 0;
              const shouldDiscard = q.discrimination < 0;

              return (
                <tr>
                  <td>{q.number}</td>
                  <td>{q.type}</td>
                  <td>{q.difficulty.toFixed(2)}</td>
                  <td>{q.discrimination.toFixed(2)}</td>
                  <td>
                    {isGood && <span class="badge badge-success badge-sm">Baik</span>}
                    {needsRevision && <span class="badge badge-warning badge-sm">Revisi</span>}
                    {shouldDiscard && <span class="badge badge-error badge-sm">Buang</span>}
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

<script define:vars={{ questions }}>
  import { Chart } from 'chart.js/auto';

  const ctx = document.getElementById('item-analysis-chart');

  if (ctx) {
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Soal',
            data: questions.map((q) => ({
              x: q.difficulty,
              y: q.discrimination,
              questionNumber: q.number,
              type: q.type,
            })),
            backgroundColor: questions.map((q) => {
              const isGood = q.difficulty >= 0.3 && q.difficulty <= 0.7 && q.discrimination > 0.3;
              const shouldDiscard = q.discrimination < 0;

              if (shouldDiscard) return 'rgba(239, 68, 68, 0.6)';
              if (isGood) return 'rgba(34, 197, 94, 0.6)';
              return 'rgba(251, 191, 36, 0.6)';
            }),
            pointRadius: 8,
            pointHoverRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.raw;
                return [
                  `Soal #${point.questionNumber}`,
                  `Tipe: ${point.type}`,
                  `Difficulty: ${point.x.toFixed(2)}`,
                  `Discrimination: ${point.y.toFixed(2)}`,
                ];
              },
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Difficulty Index (P)',
            },
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.1,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Discrimination Index (D)',
            },
            min: -1,
            max: 1,
            ticks: {
              stepSize: 0.2,
            },
          },
        },
      },
    });
  }
</script>

```

---

#### 📄 File: `./src/components/analytics/StudentProgress.astro`

```astro
---
// src/components/analytics/StudentProgress.astro
interface Props {
  studentId: number;
  progress: Array<{
    examId: number;
    examTitle: string;
    score: number;
    maxScore: number;
    completedAt: string;
    rank: number;
    totalParticipants: number;
  }>;
}

const { studentId, progress } = Astro.props;

const averageScore =
  progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / progress.length
    : 0;
---

<div class="space-y-6">
  <!-- Summary -->
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">Ringkasan Progres</h3>
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p class="text-sm text-base-content/70">Total Ujian</p>
          <p class="text-2xl font-bold">{progress.length}</p>
        </div>
        <div>
          <p class="text-sm text-base-content/70">Rata-rata Nilai</p>
          <p class="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
        </div>
        <div>
          <p class="text-sm text-base-content/70">Peringkat Rata-rata</p>
          <p class="text-2xl font-bold">
            {
              progress.length > 0
                ? Math.round(progress.reduce((sum, p) => sum + p.rank, 0) / progress.length)
                : '-'
            }
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Progress Chart -->
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">Grafik Perkembangan</h3>
      <canvas id="progress-chart" class="max-h-80"></canvas>
    </div>
  </div>

  <!-- Exam History -->
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">Riwayat Ujian</h3>
      <div class="mt-4 overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Ujian</th>
              <th>Nilai</th>
              <th>Peringkat</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {
              progress.map((p) => (
                <tr>
                  <td>{p.examTitle}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">
                        {p.score}/{p.maxScore}
                      </span>
                      <span class="text-sm text-base-content/70">
                        ({((p.score / p.maxScore) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-outline">
                      {p.rank} dari {p.totalParticipants}
                    </span>
                  </td>
                  <td>
                    {new Date(p.completedAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script define:vars={{ progress }}>
  import { Chart } from 'chart.js/auto';

  const ctx = document.getElementById('progress-chart');

  if (ctx && progress.length > 0) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: progress.map((p) => {
          const date = new Date(p.completedAt);
          return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            label: 'Nilai (%)',
            data: progress.map((p) => (p.score / p.maxScore) * 100),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Peringkat (inverted)',
            data: progress.map((p) => {
              // Invert rank so lower is better
              return 100 - (p.rank / p.totalParticipants) * 100;
            }),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Nilai: ${context.parsed.y.toFixed(1)}%`;
                } else {
                  const rankIndex = context.dataIndex;
                  const rank = progress[rankIndex].rank;
                  const total = progress[rankIndex].totalParticipants;
                  return `Peringkat: ${rank} dari ${total}`;
                }
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }
</script>

```

---

#### 📄 File: `./src/components/auth/DeviceLockWarning.astro`

```astro
---
// src/components/auth/DeviceLockWarning.astro
interface Props {
  message?: string;
  isLocked?: boolean;
}

const { message = 'Device ini sudah terdaftar untuk user lain', isLocked = false } = Astro.props;
---

<div class="modal modal-open">
  <div class="modal-box">
    <div class="flex flex-col items-center text-center">
      <!-- Warning Icon -->
      <div class="mb-4">
        {
          isLocked ? (
            <svg class="h-20 w-20 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ) : (
            <svg
              class="h-20 w-20 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )
        }
      </div>

      <!-- Title -->
      <h3 class="mb-2 text-2xl font-bold">
        {isLocked ? 'Device Terkunci' : 'Peringatan Device'}
      </h3>

      <!-- Message -->
      <p class="mb-6 text-base-content/80">
        {message}
      </p>

      <!-- Details -->
      <div class="alert alert-warning mb-6 text-left">
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-sm">
          <p class="mb-1 font-semibold">Mengapa ini terjadi?</p>
          <ul class="list-inside list-disc space-y-1">
            <li>Setiap akun hanya bisa login di 1 device</li>
            <li>Device ini sudah digunakan oleh user lain</li>
            <li>Untuk keamanan ujian</li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-action w-full">
        {
          isLocked ? (
            <div class="w-full space-y-2">
              <p class="mb-4 text-sm text-base-content/70">
                Hubungi operator untuk reset device lock
              </p>
              <button class="btn btn-primary btn-block" onclick="window.location.href='/login'">
                Kembali ke Login
              </button>
            </div>
          ) : (
            <div class="grid w-full grid-cols-2 gap-2">
              <button class="btn btn-ghost" onclick="window.location.href='/login'">
                Batal
              </button>
              <button id="force-login-btn" class="btn btn-warning">
                Lanjutkan (Logout User Lain)
              </button>
            </div>
          )
        }
      </div>
    </div>
  </div>
</div>

<script>
  const forceLoginBtn = document.getElementById('force-login-btn');

  if (forceLoginBtn) {
    forceLoginBtn.addEventListener('click', async () => {
      if (confirm('Yakin ingin logout user lain dan login dengan device ini?')) {
        try {
          forceLoginBtn.classList.add('loading');

          // Call force login API
          const response = await fetch('/api/auth/force-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_fingerprint: localStorage.getItem('device_fingerprint'),
            }),
          });

          if (response.ok) {
            window.location.href = '/siswa/dashboard';
          } else {
            const error = await response.json();
            alert(error.message || 'Gagal force login');
          }
        } catch (error) {
          console.error('Force login error:', error);
          alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
          forceLoginBtn.classList.remove('loading');
        }
      }
    });
  }
</script>

```

---

#### 📄 File: `./src/components/auth/LoginForm.astro`

```astro
---
// src/components/auth/LoginForm.astro
---

<div class="card w-full max-w-md bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title mb-4 text-center text-2xl font-bold">Login Sistem Ujian</h2>

    <div id="error-alert" class="alert alert-error mb-4 hidden">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span id="error-message"></span>
    </div>

    <form id="login-form" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Username</span>
        </label>
        <input
          type="text"
          name="username"
          placeholder="Masukkan username"
          class="input input-bordered w-full"
          required
          autocomplete="username"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          type="password"
          name="password"
          placeholder="Masukkan password"
          class="input input-bordered w-full"
          required
          autocomplete="current-password"
        />
      </div>

      <div class="form-control mt-6">
        <button type="submit" class="btn btn-primary w-full" id="login-btn">
          <span id="login-text">Login</span>
          <span id="login-loading" class="loading loading-spinner loading-sm hidden"></span>
        </button>
      </div>
    </form>

    <div class="mt-4 text-center">
      <p class="text-sm text-base-content/70">
        Pastikan koneksi internet stabil untuk login pertama kali
      </p>
    </div>
  </div>
</div>

<script>
  import { login } from '@/lib/api/auth';
  import { showToast } from '@/stores/toast';

  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorAlert = document.getElementById('error-alert');
  const errorMessage = document.getElementById('error-message');
  const loginText = document.getElementById('login-text');
  const loginLoading = document.getElementById('login-loading');
  const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorAlert?.classList.add('hidden');
    loginBtn.disabled = true;
    loginText?.classList.add('hidden');
    loginLoading?.classList.remove('hidden');

    const formData = new FormData(form);
    const credentials = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    try {
      const response = await login(credentials);

      const role = response.user.role;
      const redirectMap: Record<string, string> = {
        siswa: '/siswa/dashboard',
        guru: '/guru/dashboard',
        pengawas: '/pengawas/dashboard',
        operator: '/operator/dashboard',
        superadmin: '/superadmin/dashboard',
      };

      window.location.href = redirectMap[role] || '/';
    } catch (error: any) {
      if (errorMessage && errorAlert) {
        errorMessage.textContent =
          error.response?.data?.error || 'Login gagal. Periksa username dan password Anda.';
        errorAlert.classList.remove('hidden');
      }

      loginBtn.disabled = false;
      loginText?.classList.remove('hidden');
      loginLoading?.classList.add('hidden');
    }
  });
</script>

```

---

#### 📄 File: `./src/components/exam/AutoSaveIndicator.astro`

```astro
---
// src/components/exam/AutoSaveIndicator.astro
---

<div id="autosave-indicator" class="flex items-center gap-2 text-sm">
  <span id="save-status" class="flex items-center gap-2">
    <!-- Idle State -->
    <span id="status-idle" class="text-base-content/50">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
        ></path>
      </svg>
      <span>Tersimpan</span>
    </span>

    <!-- Saving State -->
    <span id="status-saving" class="hidden text-info">
      <span class="loading loading-spinner loading-sm"></span>
      <span>Menyimpan...</span>
    </span>

    <!-- Saved State -->
    <span id="status-saved" class="hidden text-success">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Tersimpan</span>
    </span>

    <!-- Error State -->
    <span id="status-error" class="hidden text-error">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Gagal menyimpan</span>
    </span>
  </span>

  <span id="last-saved" class="text-xs text-base-content/50"></span>
</div>

<script>
  import { $answersStore } from '@/stores/answers';

  const statusIdle = document.getElementById('status-idle');
  const statusSaving = document.getElementById('status-saving');
  const statusSaved = document.getElementById('status-saved');
  const statusError = document.getElementById('status-error');
  const lastSavedEl = document.getElementById('last-saved');

  function hideAllStatuses() {
    statusIdle?.classList.add('hidden');
    statusSaving?.classList.add('hidden');
    statusSaved?.classList.add('hidden');
    statusError?.classList.add('hidden');
  }

  function showStatus(status: 'idle' | 'saving' | 'saved' | 'error') {
    hideAllStatuses();

    switch (status) {
      case 'idle':
        statusIdle?.classList.remove('hidden');
        break;
      case 'saving':
        statusSaving?.classList.remove('hidden');
        break;
      case 'saved':
        statusSaved?.classList.remove('hidden');
        updateLastSaved();
        // Auto-hide after 2 seconds
        setTimeout(() => showStatus('idle'), 2000);
        break;
      case 'error':
        statusError?.classList.remove('hidden');
        break;
    }
  }

  function updateLastSaved() {
    if (!lastSavedEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    lastSavedEl.textContent = `(${timeStr})`;
  }

  // Listen to answer store changes
  let isDirty = false;
  let saveTimeout: number | null = null;

  $answersStore.subscribe((state) => {
    isDirty = state.isDirty;

    if (isDirty) {
      // Clear previous timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Show saving after a short delay (debounce)
      saveTimeout = window.setTimeout(() => {
        showStatus('saving');
      }, 500);
    }
  });

  // Listen to save events
  window.addEventListener('exam:save-start', () => {
    showStatus('saving');
  });

  window.addEventListener('exam:save-success', () => {
    showStatus('saved');
  });

  window.addEventListener('exam:save-error', () => {
    showStatus('error');
  });

  // Initialize
  showStatus('idle');
</script>

<style>
  #autosave-indicator {
    user-select: none;
  }
</style>

```

---

#### 📄 File: `./src/components/exam/ExamInstructions.astro`

```astro
---
// src/components/exam/ExamInstructions.astro
interface Props {
  exam: {
    title: string;
    description?: string;
    duration_minutes: number;
    total_questions: number;
    instructions?: string;
  };
  onStart: () => void;
}

const { exam } = Astro.props;
---

<div class="modal modal-open">
  <div class="modal-box max-w-2xl">
    <h2 class="mb-4 text-2xl font-bold">{exam.title}</h2>

    {exam.description && <p class="mb-6 text-base-content/80">{exam.description}</p>}

    <div class="mb-6 grid grid-cols-2 gap-4">
      <div class="stat rounded-lg bg-base-200">
        <div class="stat-title text-xs">Durasi</div>
        <div class="stat-value text-2xl">{exam.duration_minutes}</div>
        <div class="stat-desc">menit</div>
      </div>

      <div class="stat rounded-lg bg-base-200">
        <div class="stat-title text-xs">Jumlah Soal</div>
        <div class="stat-value text-2xl">{exam.total_questions}</div>
        <div class="stat-desc">soal</div>
      </div>
    </div>

    <div class="alert alert-warning mb-6">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        ></path>
      </svg>
      <div class="text-sm">
        <p class="font-bold">Perhatian!</p>
        <ul class="mt-1 list-inside list-disc">
          <li>Ujian akan dimulai saat Anda klik "Mulai Ujian"</li>
          <li>Timer akan berjalan otomatis</li>
          <li>Jawaban tersimpan otomatis setiap 30 detik</li>
          <li>Jangan keluar dari halaman ujian</li>
        </ul>
      </div>
    </div>

    {
      exam.instructions && (
        <div class="prose mb-6 max-w-none">
          <h3 class="text-lg font-bold">Petunjuk Khusus:</h3>
          <div set:html={exam.instructions} />
        </div>
      )
    }

    <div class="modal-action">
      <label class="flex cursor-pointer items-center gap-2">
        <input type="checkbox" class="checkbox checkbox-sm" id="agree-checkbox" />
        <span class="text-sm">Saya telah membaca dan memahami instruksi</span>
      </label>

      <button id="start-exam-btn" class="btn btn-primary" disabled> Mulai Ujian </button>
    </div>
  </div>
</div>

<script>
  const agreeCheckbox = document.getElementById('agree-checkbox') as HTMLInputElement;
  const startBtn = document.getElementById('start-exam-btn') as HTMLButtonElement;

  agreeCheckbox?.addEventListener('change', () => {
    startBtn.disabled = !agreeCheckbox.checked;
  });

  startBtn?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('exam:start'));
  });
</script>

```

---

#### 📄 File: `./src/components/exam/ExamTimer.astro`

```astro
---
// src/components/exam/ExamTimer.astro
---

<div class="exam-timer flex items-center gap-3 rounded-lg bg-base-200 px-4 py-2">
  <svg class="h-5 w-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>

  <div>
    <p class="text-xs text-base-content/70">Sisa Waktu</p>
    <p id="timer-display" class="font-mono text-xl font-bold">00:00:00</p>
  </div>

  <div id="timer-warning" class="ml-auto hidden">
    <span class="badge badge-warning badge-sm animate-pulse">Hampir Habis!</span>
  </div>
</div>

<script>
  import { $timerStore, setTimeRemaining, decrementTime } from '@/stores/timer';

  const timerDisplay = document.getElementById('timer-display');
  const timerWarning = document.getElementById('timer-warning');
  let timerInterval: number | null = null;

  // Format time as HH:MM:SS
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update display
  function updateDisplay(seconds: number) {
    if (!timerDisplay) return;

    timerDisplay.textContent = formatTime(seconds);

    // Color changes based on remaining time
    if (seconds <= 60) {
      // Last minute - red and flash
      timerDisplay.classList.add('text-error', 'animate-pulse');
      timerWarning?.classList.remove('hidden');
    } else if (seconds <= 300) {
      // Last 5 minutes - warning
      timerDisplay.classList.add('text-warning');
      timerDisplay.classList.remove('text-error');
      timerWarning?.classList.remove('hidden');
    } else if (seconds <= 600) {
      // Last 10 minutes - info
      timerDisplay.classList.add('text-info');
      timerDisplay.classList.remove('text-warning');
      timerWarning?.classList.add('hidden');
    } else {
      timerDisplay.classList.remove('text-error', 'text-warning', 'text-info', 'animate-pulse');
      timerWarning?.classList.add('hidden');
    }
  }

  // Start timer
  function startTimer() {
    // Update display immediately
    const initialTime = $timerStore.get().timeRemaining;
    updateDisplay(initialTime);

    // Update every second
    timerInterval = window.setInterval(() => {
      const state = $timerStore.get();

      if (!state.isPaused && state.timeRemaining > 0) {
        decrementTime();
        updateDisplay(state.timeRemaining - 1);

        // Time warnings (play sound if available)
        if (state.timeRemaining === 600) {
          // 10 minutes
          showTimeWarning('10 menit lagi!');
        } else if (state.timeRemaining === 300) {
          // 5 minutes
          showTimeWarning('5 menit lagi!');
        } else if (state.timeRemaining === 60) {
          // 1 minute
          showTimeWarning('1 menit lagi!');
        }

        // Auto-submit when time runs out
        if (state.timeRemaining <= 0) {
          handleTimeUp();
        }
      }
    }, 1000);
  }

  function showTimeWarning(message: string) {
    // Show toast notification
    const toast = document.createElement('div');
    toast.className =
      'alert alert-warning fixed top-4 right-4 w-auto shadow-lg z-50 animate-bounce';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Play sound (if available)
    try {
      const audio = new Audio('/sounds/timer-warning.mp3');
      audio.play().catch(() => {}); // Ignore if no sound file
    } catch (e) {}

    // Remove after 3 seconds
    setTimeout(() => toast.remove(), 3000);
  }

  function handleTimeUp() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Show time up modal
    const modal = document.createElement('div');
    modal.className = 'modal modal-open';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Waktu Habis!</h3>
        <p class="py-4">Waktu ujian telah berakhir. Jawaban Anda akan disubmit otomatis.</p>
        <div class="modal-action">
          <button class="btn btn-primary" id="submit-now-btn">Submit Sekarang</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Auto-submit after 3 seconds
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('exam:auto-submit'));
    }, 3000);

    document.getElementById('submit-now-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('exam:auto-submit'));
    });
  }

  // Subscribe to timer store changes
  $timerStore.subscribe((state) => {
    updateDisplay(state.timeRemaining);
  });

  // Start timer when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTimer);
  } else {
    startTimer();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });
</script>

<style>
  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse-slow 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>

```

---

#### 📄 File: `./src/components/exam/MediaPlayer.astro`

```astro
---
// src/components/exam/MediaPlayer.astro
interface Props {
  url: string;
  type: 'audio' | 'video';
  repeatable?: boolean;
  maxPlays?: number;
}

const { url, type, repeatable = true, maxPlays } = Astro.props;
---

<div class="media-player card bg-base-200">
  <div class="card-body">
    {
      type === 'audio' && (
        <audio id="media-player" controls class="w-full">
          <source src={url} type="audio/mpeg" />
          Browser Anda tidak mendukung audio player.
        </audio>
      )
    }

    {
      type === 'video' && (
        <video id="media-player" controls class="w-full rounded-lg">
          <source src={url} type="video/mp4" />
          Browser Anda tidak mendukung video player.
        </video>
      )
    }

    {
      maxPlays && (
        <div class="mt-2 text-center text-sm text-base-content/70">
          Pemutaran: <span id="play-count">0</span> / {maxPlays}
        </div>
      )
    }

    {
      !repeatable && (
        <div class="alert-sm alert alert-warning mt-2">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span class="text-xs">Media hanya dapat diputar sekali</span>
        </div>
      )
    }
  </div>
</div>

<script define:vars={{ repeatable, maxPlays }}>
  const player = document.getElementById('media-player');
  const playCount = document.getElementById('play-count');
  let plays = 0;

  if (player && maxPlays) {
    player.addEventListener('play', () => {
      plays++;
      if (playCount) {
        playCount.textContent = plays.toString();
      }

      if (plays >= maxPlays) {
        player.addEventListener('ended', () => {
          player.controls = false;
          player.style.pointerEvents = 'none';
        });
      }
    });
  }

  if (player && !repeatable) {
    player.addEventListener(
      'ended',
      () => {
        player.controls = false;
        player.style.pointerEvents = 'none';
      },
      { once: true }
    );
  }
</script>

```

---

#### 📄 File: `./src/components/exam/MediaRecorder.astro`

```astro
---
// src/components/exam/MediaRecorder.astro
interface Props {
  type: 'audio' | 'video';
  maxDuration?: number;
  questionId: number;
}

const { type, maxDuration = 300, questionId } = Astro.props;
---

<div class="media-recorder card bg-base-200">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-bold">
        {type === 'audio' ? 'Rekam Audio' : 'Rekam Video'}
      </h3>
      <div class="font-mono text-lg" id={`rec-timer-${questionId}`}>00:00</div>
    </div>

    {
      type === 'video' && (
        <video
          id={`preview-${questionId}`}
          class="mb-4 h-64 w-full rounded bg-black"
          autoplay
          muted
          playsinline
        />
      )
    }

    {
      type === 'audio' && (
        <div class="mb-4 flex h-32 items-center justify-center rounded bg-base-300">
          <div id={`audio-visualizer-${questionId}`} class="flex h-20 items-end gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div class="bg-primary w-1 rounded-t" style={`height: ${Math.random() * 100}%`} />
            ))}
          </div>
        </div>
      )
    }

    <div class="flex justify-center gap-2">
      <button id={`start-rec-${questionId}`} type="button" class="btn btn-error">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6"></circle>
        </svg>
        Mulai Rekam
      </button>

      <button id={`stop-rec-${questionId}`} type="button" class="btn btn-primary" disabled>
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <rect x="6" y="6" width="8" height="8"></rect>
        </svg>
        Stop
      </button>

      <button id={`retry-rec-${questionId}`} type="button" class="btn btn-ghost" disabled>
        Ulangi
      </button>
    </div>

    <div id={`playback-area-${questionId}`} class="mt-4 hidden">
      <h4 class="mb-2 font-semibold">Preview Rekaman</h4>
      {
        type === 'audio' ? (
          <audio id={`playback-audio-${questionId}`} class="w-full" controls />
        ) : (
          <video id={`playback-video-${questionId}`} class="w-full rounded" controls playsinline />
        )
      }

      <div class="mt-2 flex justify-end gap-2">
        <button id={`confirm-rec-${questionId}`} type="button" class="btn btn-success">
          Gunakan Rekaman Ini
        </button>
      </div>
    </div>
  </div>
</div>

<script define:vars={{ type, maxDuration, questionId }}>
  let mediaRecorder;
  let recordedChunks = [];
  let stream;
  let startTime;
  let timerInterval;
  let recordingBlob;
  let audioContext;
  let analyser;
  let dataArray;
  let animationFrame;

  const startBtn = document.getElementById(`start-rec-${questionId}`);
  const stopBtn = document.getElementById(`stop-rec-${questionId}`);
  const retryBtn = document.getElementById(`retry-rec-${questionId}`);
  const confirmBtn = document.getElementById(`confirm-rec-${questionId}`);
  const timerEl = document.getElementById(`rec-timer-${questionId}`);
  const playbackArea = document.getElementById(`playback-area-${questionId}`);

  startBtn?.addEventListener('click', startRecording);
  stopBtn?.addEventListener('click', stopRecording);
  retryBtn?.addEventListener('click', retryRecording);
  confirmBtn?.addEventListener('click', confirmRecording);

  async function startRecording() {
    try {
      const constraints =
        type === 'audio'
          ? { audio: { echoCancellation: true, noiseSuppression: true } }
          : {
              audio: { echoCancellation: true, noiseSuppression: true },
              video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            };

      stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === 'video') {
        const preview = document.getElementById(`preview-${questionId}`);
        if (preview) preview.srcObject = stream;
      } else {
        setupAudioVisualizer(stream);
      }

      const mimeType = type === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9';

      const options = { mimeType };
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      recordedChunks = [];
      mediaRecorder.start();
      startTime = Date.now();

      startBtn.disabled = true;
      stopBtn.disabled = false;
      retryBtn.disabled = true;
      playbackArea.classList.add('hidden');

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);

      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          stopRecording();
          alert(`Durasi maksimal ${maxDuration / 60} menit tercapai.`);
        }
      }, maxDuration * 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Gagal memulai rekaman. Pastikan izin mikrofon/kamera sudah diberikan.');
    }
  }

  function setupAudioVisualizer(audioStream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    visualize();
  }

  function visualize() {
    const visualizer = document.getElementById(`audio-visualizer-${questionId}`);
    if (!visualizer || !analyser) return;

    analyser.getByteFrequencyData(dataArray);

    const bars = visualizer.children;
    for (let i = 0; i < bars.length && i < dataArray.length; i++) {
      const height = (dataArray[i] / 255) * 100;
      bars[i].style.height = `${Math.max(height, 10)}%`;
    }

    animationFrame = requestAnimationFrame(visualize);
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      stream.getTracks().forEach((track) => track.stop());

      if (timerInterval) clearInterval(timerInterval);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioContext) audioContext.close();

      startBtn.disabled = false;
      stopBtn.disabled = true;
      retryBtn.disabled = false;
    }
  }

  function handleRecordingStop() {
    const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
    recordingBlob = new Blob(recordedChunks, { type: mimeType });

    const playbackEl =
      type === 'audio'
        ? document.getElementById(`playback-audio-${questionId}`)
        : document.getElementById(`playback-video-${questionId}`);

    if (playbackEl) {
      playbackEl.src = URL.createObjectURL(recordingBlob);
      playbackArea.classList.remove('hidden');
    }
  }

  function retryRecording() {
    recordedChunks = [];
    recordingBlob = null;
    if (timerEl) timerEl.textContent = '00:00';
    playbackArea.classList.add('hidden');
    startRecording();
  }

  function confirmRecording() {
    if (!recordingBlob) return;

    const duration = (Date.now() - startTime) / 1000;

    window.dispatchEvent(
      new CustomEvent('recording-complete', {
        detail: {
          blob: recordingBlob,
          duration,
          type,
          questionId,
        },
      })
    );

    const event = new CustomEvent('media-recorded', {
      detail: {
        questionId,
        blob: recordingBlob,
        type,
        duration,
      },
    });
    window.dispatchEvent(event);
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (timerEl) {
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const remaining = maxDuration - elapsed;
    if (remaining <= 60) {
      timerEl?.classList.add('text-error');
    } else if (remaining <= 120) {
      timerEl?.classList.add('text-warning');
    }
  }
</script>

<style>
  #audio-visualizer > div {
    transition: height 0.1s ease;
  }
</style>

```

---

#### 📄 File: `./src/components/exam/ProgressBar.astro`

```astro
---
// src/components/exam/ProgressBar.astro
interface Props {
  current: number;
  total: number;
  answered: number;
}

const { current, total, answered } = Astro.props;
const percentage = (answered / total) * 100;
---

<div class="progress-bar">
  <div class="mb-2 flex items-center justify-between text-sm">
    <span class="font-semibold">
      Soal {current + 1} dari {total}
    </span>
    <span class="text-base-content/70">
      {answered} terjawab ({percentage.toFixed(0)}%)
    </span>
  </div>

  <div class="h-2 w-full overflow-hidden rounded-full bg-base-300">
    <div
      class="h-full rounded-full bg-success transition-all duration-300"
      style={`width: ${percentage}%`}
    >
    </div>
  </div>
</div>

```

---

#### 📄 File: `./src/components/exam/QuestionNavigation.astro`

```astro
---
// src/components/exam/QuestionNavigation.astro
interface Props {
  questions: Array<{
    id: number;
    number: number;
    type: string;
  }>;
  currentIndex: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
}

const { questions, currentIndex, answeredQuestions, flaggedQuestions } = Astro.props;
---

<div class="question-navigation flex h-full flex-col">
  <div class="border-b border-base-300 p-4">
    <h3 class="text-lg font-bold">Navigasi Soal</h3>
    <div class="mt-2 text-sm text-base-content/70">
      <span>{answeredQuestions.size}/{questions.length} terjawab</span>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4">
    <div class="grid grid-cols-5 gap-2">
      {
        questions.map((q, index) => {
          const isAnswered = answeredQuestions.has(q.id);
          const isFlagged = flaggedQuestions.has(q.id);
          const isCurrent = index === currentIndex;

          return (
            <button
              type="button"
              class={`aspect-square rounded-lg border-2 font-semibold transition-all ${
                isCurrent
                  ? 'border-primary bg-primary text-primary-content'
                  : isAnswered
                    ? 'border-success bg-success/20 text-success-content'
                    : isFlagged
                      ? 'border-warning bg-warning/20 text-warning-content'
                      : 'hover:border-base-400 border-base-300'
              }`}
              data-question-index={index}
            >
              <div class="flex h-full flex-col items-center justify-center">
                <span class="text-lg">{q.number}</span>
                {isFlagged && (
                  <svg class="mt-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 6l3-3v12l-3-3V6zm4 0v12l10-6L7 6z" />
                  </svg>
                )}
              </div>
            </button>
          );
        })
      }
    </div>
  </div>

  <div class="border-t border-base-300 p-4">
    <div class="flex gap-2 text-xs">
      <div class="flex items-center gap-1">
        <div class="bg-primary h-4 w-4 rounded"></div>
        <span>Aktif</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="h-4 w-4 rounded border-2 border-success bg-success/20"></div>
        <span>Terjawab</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="h-4 w-4 rounded border-2 border-warning bg-warning/20"></div>
        <span>Ditandai</span>
      </div>
    </div>
  </div>
</div>

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/Essay.astro`

```astro
---
// src/components/exam/QuestionTypes/Essay.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    min_words?: number;
    max_words?: number;
    require_media?: boolean;
    media_type_required?: 'audio' | 'video';
    max_media_duration?: number;
  };
  savedAnswer?: {
    text?: string;
    media_blob?: Blob;
    media_url?: string;
  };
  readonly?: boolean;
}

const { question, savedAnswer, readonly = false } = Astro.props;
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {question.question_html ? (
      <div set:html={question.question_html} />
    ) : (
      <p class="text-lg">{question.question_text}</p>
    )}
    
    {question.require_media && (
      <div class="alert alert-info mt-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">
          Rekaman {question.media_type_required === 'audio' ? 'audio' : 'video'} <strong>wajib</strong> dilampirkan
        </span>
      </div>
    )}
  </div>

  <!-- Question Media -->
  {question.media_url && (
    <div class="question-media">
      {question.media_type === 'image' && (
        <img 
          src={question.media_url} 
          alt="Question media"
          class="max-w-full rounded-lg shadow-lg"
        />
      )}
      
      {question.media_type === 'audio' && (
        <audio controls class="w-full">
          <source src={question.media_url} type="audio/mpeg" />
        </audio>
      )}
      
      {question.media_type === 'video' && (
        <video controls class="w-full rounded-lg">
          <source src={question.media_url} type="video/mp4" />
        </video>
      )}
    </div>
  )}

  <!-- Text Answer -->
  <div class="answer-section">
    <label class="label">
      <span class="label-text font-semibold">Jawaban Esai</span>
      {(question.min_words || question.max_words) && (
        <span class="label-text-alt">
          {question.min_words && `Min: ${question.min_words} kata`}
          {question.min_words && question.max_words && ' • '}
          {question.max_words && `Max: ${question.max_words} kata`}
        </span>
      )}
    </label>
    
    <textarea
      id={`essay-${question.id}`}
      name={`question-${question.id}`}
      placeholder="Tulis jawaban esai Anda di sini..."
      rows="10"
      class="textarea textarea-bordered w-full text-base"
      data-answer-input
      readonly={readonly}
    >{savedAnswer?.text || ''}</textarea>
    
    <div class="flex justify-between items-center mt-2 text-sm text-base-content/70">
      <span id="word-count">0 kata</span>
      <span id="char-count">0 karakter</span>
    </div>
  </div>

  <!-- Media Recording (if required) -->
  {question.require_media && question.media_type_required && (
    <div class="media-recording-section" id="media-section">
      <div class="divider">REKAMAN MEDIA</div>
      
      <div id="recorder-placeholder" class="text-center">
        <p class="text-base-content/70 mb-4">
          {question.media_type_required === 'audio' ? 'Rekam jawaban audio Anda' : 'Rekam jawaban video Anda'}
        </p>
        <button 
          type="button"
          id="start-recording-btn"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="3"/>
          </svg>
          Mulai Merekam
        </button>
      </div>

      <div id="recording-ui" class="hidden">
        <!-- Recording UI will be injected here -->
      </div>

      {savedAnswer?.media_url && (
        <div class="saved-media mt-4">
          <p class="text-sm font-semibold mb-2">Rekaman Tersimpan:</p>
          {question.media_type_required === 'audio' ? (
            <audio controls class="w-full">
              <source src={savedAnswer.media_url} type="audio/webm" />
            </audio>
          ) : (
            <video controls class="w-full rounded-lg">
              <source src={savedAnswer.media_url} type="video/webm" />
            </video>
          )}
        </div>
      )}
    </div>
  )}
</div>

<script>
  // Word and character counter
  const textarea = document.querySelector('textarea[data-answer-input]') as HTMLTextAreaElement;
  const wordCount = document.getElementById('word-count');
  const charCount = document.getElementById('char-count');
  
  function updateCounts() {
    if (!textarea || !wordCount || !charCount) return;
    
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    
    wordCount.textContent = `${words} kata`;
    charCount.textContent = `${chars} karakter`;
  }
  
  if (textarea) {
    textarea.addEventListener('input', updateCounts);
    updateCounts(); // Initial count
  }

  // Media recording (to be implemented with MediaRecorder component)
  const startRecordingBtn = document.getElementById('start-recording-btn');
  
  if (startRecordingBtn) {
    startRecordingBtn.addEventListener('click', () => {
      // TODO: Load MediaRecorder component dynamically
      alert('Media recorder akan dimuat...');
    });
  }
</script>
```

---

#### 📄 File: `./src/components/exam/QuestionTypes/Matching.astro`

```astro
---
// src/components/exam/QuestionTypes/Matching.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    pairs: Array<{
      id: number;
      left_text: string;
      right_text: string;
      left_media_url?: string;
      right_media_url?: string;
    }>;
  };
  savedAnswer?: Record<number, number>; // left_id => right_id
  readonly?: boolean;
}

const { question, savedAnswer = {}, readonly = false } = Astro.props;

// Shuffle right items for display
const rightItems = [...question.pairs].sort(() => Math.random() - 0.5);
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {question.question_html ? (
      <div set:html={question.question_html} />
    ) : (
      <p class="text-lg">{question.question_text}</p>
    )}
    
    <div class="alert alert-info mt-4">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm">Pasangkan item di sebelah kiri dengan item di sebelah kanan yang sesuai</span>
    </div>
  </div>

  <!-- Question Media -->
  {question.media_url && (
    <div class="question-media">
      {question.media_type === 'image' && (
        <img 
          src={question.media_url} 
          alt="Question media"
          class="max-w-full rounded-lg shadow-lg"
        />
      )}
    </div>
  )}

  <!-- Matching Interface -->
  <div class="matching-container grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Left Column -->
    <div class="left-column space-y-3">
      <h4 class="font-semibold mb-4">Kolom A</h4>
      {question.pairs.map((pair, index) => (
        <div class="matching-item-left p-4 bg-base-200 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="badge badge-primary">{index + 1}</span>
            <div class="flex-1">
              <p>{pair.left_text}</p>
              {pair.left_media_url && (
                <img 
                  src={pair.left_media_url} 
                  alt="Left item" 
                  class="mt-2 max-w-xs rounded"
                />
              )}
            </div>
          </div>
          
          <!-- Match Selection -->
          <div class="mt-3">
            <select
              name={`match-${pair.id}`}
              class="select select-bordered select-sm w-full"
              data-left-id={pair.id}
              data-answer-input
              disabled={readonly}
            >
              <option value="">Pilih pasangan...</option>
              {rightItems.map((right, idx) => (
                <option 
                  value={right.id}
                  selected={savedAnswer[pair.id] === right.id}
                >
                  {String.fromCharCode(65 + idx)}) {right.right_text.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>

    <!-- Right Column -->
    <div class="right-column space-y-3">
      <h4 class="font-semibold mb-4">Kolom B</h4>
      {rightItems.map((item, index) => (
        <div 
          class="matching-item-right p-4 bg-base-200 rounded-lg border-2 border-dashed border-base-300"
          data-right-id={item.id}
        >
          <div class="flex items-start gap-3">
            <span class="badge badge-outline">{String.fromCharCode(65 + index)}</span>
            <div class="flex-1">
              <p>{item.right_text}</p>
              {item.right_media_url && (
                <img 
                  src={item.right_media_url} 
                  alt="Right item" 
                  class="mt-2 max-w-xs rounded"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <!-- Progress Indicator -->
  <div class="text-sm text-base-content/70 text-center">
    <span id="match-progress">0</span> dari {question.pairs.length} pasangan selesai
  </div>
</div>

<script>
  // Track matching progress
  const selects = document.querySelectorAll('select[data-answer-input]');
  const progressEl = document.getElementById('match-progress');
  
  function updateProgress() {
    const matched = Array.from(selects).filter(s => (s as HTMLSelectElement).value !== '').length;
    if (progressEl) {
      progressEl.textContent = matched.toString();
    }
  }
  
  selects.forEach(select => {
    select.addEventListener('change', () => {
      updateProgress();
      
      // Visual feedback
      const leftItem = select.closest('.matching-item-left');
      if (select.value) {
        leftItem?.classList.add('border-2', 'border-success');
      } else {
        leftItem?.classList.remove('border-2', 'border-success');
      }
    });
  });
  
  // Initialize
  updateProgress();
</script>

<style>
  .matching-item-left {
    transition: all 0.2s ease;
  }
</style>
```

---

#### 📄 File: `./src/components/exam/QuestionTypes/MultipleChoice.astro`

```astro
---
// src/components/exam/QuestionTypes/MultipleChoice.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    options: Array<{
      id: number;
      option_text: string;
      option_html?: string;
      media_url?: string;
    }>;
  };
  savedAnswer?: number;
  readonly?: boolean;
}

const { question, savedAnswer, readonly = false } = Astro.props;
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {
      question.question_html ? (
        <div set:html={question.question_html} />
      ) : (
        <p class="text-lg">{question.question_text}</p>
      )
    }
  </div>

  <!-- Question Media -->
  {
    question.media_url && (
      <div class="question-media">
        {question.media_type === 'image' && (
          <img
            src={question.media_url}
            alt="Question media"
            class="max-w-full rounded-lg shadow-lg"
          />
        )}

        {question.media_type === 'audio' && (
          <audio controls class="w-full">
            <source src={question.media_url} type="audio/mpeg" />
            Browser Anda tidak mendukung audio player.
          </audio>
        )}

        {question.media_type === 'video' && (
          <video controls class="w-full rounded-lg">
            <source src={question.media_url} type="video/mp4" />
            Browser Anda tidak mendukung video player.
          </video>
        )}
      </div>
    )
  }

  <!-- Options -->
  <div class="options-container space-y-3">
    {
      question.options.map((option, index) => {
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
        const isSelected = savedAnswer === option.id;

        return (
          <label
            class={`option-item flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all hover:bg-base-200 ${
              isSelected ? 'border-primary bg-primary/10' : 'border-base-300'
            } ${readonly ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={isSelected}
              disabled={readonly}
              class="radio-primary radio mt-1"
              data-answer-input
            />

            <div class="flex-1">
              <div class="flex items-start gap-3">
                <span class="badge badge-primary badge-lg">{optionLetter}</span>

                <div class="flex-1">
                  {option.option_html ? (
                    <div set:html={option.option_html} />
                  ) : (
                    <p>{option.option_text}</p>
                  )}

                  {option.media_url && (
                    <div class="mt-2">
                      <img
                        src={option.media_url}
                        alt={`Option ${optionLetter}`}
                        class="max-w-xs rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </label>
        );
      })
    }
  </div>
</div>

<style>
  .option-item {
    transition: all 0.2s ease;
  }

  .option-item:hover:not(.cursor-not-allowed) {
    transform: translateX(4px);
  }

  .option-item input:checked ~ div {
    font-weight: 600;
  }
</style>

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/MultipleChoiceComplex.astro`

```astro
---
// src/components/exam/QuestionTypes/MultipleChoiceComplex.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    min_selections?: number;
    max_selections?: number;
    options: Array<{
      id: number;
      option_text: string;
      option_html?: string;
      media_url?: string;
    }>;
  };
  savedAnswer?: number[];
  readonly?: boolean;
}

const { question, savedAnswer = [], readonly = false } = Astro.props;
const minSelections = question.min_selections || 1;
const maxSelections = question.max_selections || question.options.length;
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {
      question.question_html ? (
        <div set:html={question.question_html} />
      ) : (
        <p class="text-lg">{question.question_text}</p>
      )
    }

    <div class="alert alert-info mt-4">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span class="text-sm">
        Pilih <strong
          >{
            minSelections === maxSelections ? minSelections : `${minSelections}-${maxSelections}`
          }</strong
        > jawaban yang benar
      </span>
    </div>
  </div>

  <!-- Question Media -->
  {
    question.media_url && (
      <div class="question-media">
        {question.media_type === 'image' && (
          <img
            src={question.media_url}
            alt="Question media"
            class="max-w-full rounded-lg shadow-lg"
          />
        )}

        {question.media_type === 'audio' && (
          <audio controls class="w-full">
            <source src={question.media_url} type="audio/mpeg" />
          </audio>
        )}

        {question.media_type === 'video' && (
          <video controls class="w-full rounded-lg">
            <source src={question.media_url} type="video/mp4" />
          </video>
        )}
      </div>
    )
  }

  <!-- Options -->
  <div class="options-container space-y-3">
    {
      question.options.map((option, index) => {
        const optionLetter = String.fromCharCode(65 + index);
        const isSelected = savedAnswer.includes(option.id);

        return (
          <label
            class={`option-item flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all hover:bg-base-200 ${
              isSelected ? 'border-primary bg-primary/10' : 'border-base-300'
            } ${readonly ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <input
              type="checkbox"
              name={`question-${question.id}`}
              value={option.id}
              checked={isSelected}
              disabled={readonly}
              class="checkbox-primary checkbox mt-1"
              data-answer-input
              data-max-selections={maxSelections}
            />

            <div class="flex-1">
              <div class="flex items-start gap-3">
                <span class="badge badge-primary badge-lg">{optionLetter}</span>

                <div class="flex-1">
                  {option.option_html ? (
                    <div set:html={option.option_html} />
                  ) : (
                    <p>{option.option_text}</p>
                  )}

                  {option.media_url && (
                    <div class="mt-2">
                      <img
                        src={option.media_url}
                        alt={`Option ${optionLetter}`}
                        class="max-w-xs rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </label>
        );
      })
    }
  </div>

  <!-- Selection Counter -->
  <div class="flex items-center justify-between text-sm">
    <span class="text-base-content/70">
      <span id="selection-count">0</span> dari {maxSelections} dipilih
    </span>
    {
      savedAnswer.length < minSelections && (
        <span class="text-warning">Minimal {minSelections} jawaban</span>
      )
    }
  </div>
</div>

<script>
  // Limit checkbox selections
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-answer-input]');
  const selectionCount = document.getElementById('selection-count');

  function updateSelectionCount() {
    const checked = Array.from(checkboxes).filter((cb) => cb.checked).length;
    if (selectionCount) {
      selectionCount.textContent = checked.toString();
    }
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const maxSelections = parseInt(target.dataset.maxSelections || '99');
      const checked = Array.from(checkboxes).filter((cb) => cb.checked).length;

      // Prevent selecting more than max
      if (checked > maxSelections) {
        target.checked = false;
        alert(`Maksimal ${maxSelections} pilihan`);
      }

      updateSelectionCount();
    });
  });

  // Initialize count
  updateSelectionCount();
</script>

<style>
  .option-item {
    transition: all 0.2s ease;
  }

  .option-item:hover:not(.cursor-not-allowed) {
    transform: translateX(4px);
  }

  .option-item input:checked ~ div {
    font-weight: 600;
  }
</style>

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/ShortAnswer.astro`

```astro
---
// src/components/exam/QuestionTypes/ShortAnswer.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    max_length?: number;
  };
  savedAnswer?: string;
  readonly?: boolean;
}

const { question, savedAnswer = '', readonly = false } = Astro.props;
const maxLength = question.max_length || 500;
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {
      question.question_html ? (
        <div set:html={question.question_html} />
      ) : (
        <p class="text-lg">{question.question_text}</p>
      )
    }
  </div>

  <!-- Question Media -->
  {
    question.media_url && (
      <div class="question-media">
        {question.media_type === 'image' && (
          <img
            src={question.media_url}
            alt="Question media"
            class="max-w-full rounded-lg shadow-lg"
          />
        )}

        {question.media_type === 'audio' && (
          <audio controls class="w-full">
            <source src={question.media_url} type="audio/mpeg" />
          </audio>
        )}

        {question.media_type === 'video' && (
          <video controls class="w-full rounded-lg">
            <source src={question.media_url} type="video/mp4" />
          </video>
        )}
      </div>
    )
  }

  <!-- Answer Input -->
  <div class="answer-input">
    <textarea
      name={`question-${question.id}`}
      placeholder="Ketik jawaban Anda di sini..."
      maxlength={maxLength}
      rows="4"
      class="textarea textarea-bordered w-full text-base"
      data-answer-input
      readonly={readonly}>{savedAnswer}</textarea
    >

    <div class="mt-2 flex items-center justify-between text-sm text-base-content/70">
      <span>Jawaban singkat</span>
      <span>
        <span id="char-count">{savedAnswer.length}</span>/{maxLength} karakter
      </span>
    </div>
  </div>
</div>

<script>
  const textarea = document.querySelector('textarea[data-answer-input]');
  const charCount = document.getElementById('char-count');

  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length.toString();
    });
  }
</script>

<style>
  textarea:focus {
    outline: none;
    border-color: hsl(var(--p));
  }
</style>

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/TrueFalse.astro`

```astro
---
// src/components/exam/QuestionTypes/TrueFalse.astro
interface Props {
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
  };
  savedAnswer?: boolean;
  readonly?: boolean;
}

const { question, savedAnswer, readonly = false } = Astro.props;
---

<div class="question-container space-y-6">
  <!-- Question Text -->
  <div class="question-text prose max-w-none">
    {
      question.question_html ? (
        <div set:html={question.question_html} />
      ) : (
        <p class="text-lg">{question.question_text}</p>
      )
    }
  </div>

  <!-- Question Media -->
  {
    question.media_url && (
      <div class="question-media">
        {question.media_type === 'image' && (
          <img
            src={question.media_url}
            alt="Question media"
            class="max-w-full rounded-lg shadow-lg"
          />
        )}

        {question.media_type === 'audio' && (
          <audio controls class="w-full">
            <source src={question.media_url} type="audio/mpeg" />
          </audio>
        )}

        {question.media_type === 'video' && (
          <video controls class="w-full rounded-lg">
            <source src={question.media_url} type="video/mp4" />
          </video>
        )}
      </div>
    )
  }

  <!-- True/False Options -->
  <div class="grid grid-cols-2 gap-4">
    <!-- True Option -->
    <label
      class={`option-card p-6 rounded-lg border-2 transition-all cursor-pointer text-center ${
        savedAnswer === true ? 'border-success bg-success/10' : 'border-base-300 hover:bg-base-200'
      } ${readonly ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <input
        type="radio"
        name={`question-${question.id}`}
        value="true"
        checked={savedAnswer === true}
        disabled={readonly}
        class="radio-success radio hidden"
        data-answer-input
      />

      <div class="flex flex-col items-center gap-3">
        <div
          class={`w-16 h-16 rounded-full flex items-center justify-center ${
            savedAnswer === true ? 'bg-success text-success-content' : 'bg-base-300'
          }`}
        >
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <span class="text-xl font-bold">BENAR</span>
      </div>
    </label>

    <!-- False Option -->
    <label
      class={`option-card p-6 rounded-lg border-2 transition-all cursor-pointer text-center ${
        savedAnswer === false ? 'border-error bg-error/10' : 'border-base-300 hover:bg-base-200'
      } ${readonly ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <input
        type="radio"
        name={`question-${question.id}`}
        value="false"
        checked={savedAnswer === false}
        disabled={readonly}
        class="radio-error radio hidden"
        data-answer-input
      />

      <div class="flex flex-col items-center gap-3">
        <div
          class={`w-16 h-16 rounded-full flex items-center justify-center ${
            savedAnswer === false ? 'bg-error text-error-content' : 'bg-base-300'
          }`}
        >
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <span class="text-xl font-bold">SALAH</span>
      </div>
    </label>
  </div>
</div>

<style>
  .option-card {
    transition: all 0.2s ease;
  }

  .option-card:hover:not(.cursor-not-allowed) {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>

```

---

#### 📄 File: `./src/components/grading/AudioPlayer.astro`

```astro
---
// src/components/grading/AudioPlayer.astro
interface Props {
  url: string;
  answerId: number;
}

const { url, answerId } = Astro.props;
---

<div class="audio-player card bg-base-200">
  <div class="card-body">
    <h4 class="mb-2 font-semibold">Rekaman Audio Siswa</h4>

    <audio id={`audio-player-${answerId}`} class="mb-4 w-full" controls preload="metadata">
      <source src={url} type="audio/webm" />
      <source src={url} type="audio/mp4" />
      Browser Anda tidak mendukung audio player.
    </audio>

    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2">
        <button type="button" id={`play-btn-${answerId}`} class="btn btn-primary btn-sm">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
            ></path>
          </svg>
        </button>

        <button type="button" id={`pause-btn-${answerId}`} class="btn btn-ghost btn-sm hidden">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"
            ></path>
          </svg>
        </button>

        <input
          type="range"
          id={`speed-control-${answerId}`}
          min="0.5"
          max="2"
          step="0.25"
          value="1"
          class="range range-primary range-xs w-32"
        />
        <span id={`speed-display-${answerId}`} class="text-xs">1x</span>
      </div>

      <div class="flex items-center gap-2">
        <span id={`current-time-${answerId}`} class="text-xs">00:00</span>
        <span class="text-xs">/</span>
        <span id={`duration-${answerId}`} class="text-xs">00:00</span>
      </div>
    </div>

    <div class="mt-4">
      <label class="label">
        <span class="label-text text-xs">Waveform</span>
      </label>
      <div id={`waveform-${answerId}`} class="h-16 rounded bg-base-300"></div>
    </div>
  </div>
</div>

<script define:vars={{ answerId }}>
  const audio = document.getElementById(`audio-player-${answerId}`) as HTMLAudioElement;
  const playBtn = document.getElementById(`play-btn-${answerId}`);
  const pauseBtn = document.getElementById(`pause-btn-${answerId}`);
  const speedControl = document.getElementById(`speed-control-${answerId}`) as HTMLInputElement;
  const speedDisplay = document.getElementById(`speed-display-${answerId}`);
  const currentTimeEl = document.getElementById(`current-time-${answerId}`);
  const durationEl = document.getElementById(`duration-${answerId}`);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  playBtn?.addEventListener('click', () => {
    audio.play();
    playBtn.classList.add('hidden');
    pauseBtn?.classList.remove('hidden');
  });

  pauseBtn?.addEventListener('click', () => {
    audio.pause();
    pauseBtn.classList.add('hidden');
    playBtn?.classList.remove('hidden');
  });

  speedControl?.addEventListener('input', (e) => {
    const speed = parseFloat((e.target as HTMLInputElement).value);
    audio.playbackRate = speed;
    if (speedDisplay) speedDisplay.textContent = `${speed}x`;
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    pauseBtn?.classList.add('hidden');
    playBtn?.classList.remove('hidden');
  });
</script>

```

---

#### 📄 File: `./src/components/grading/GradingRubric.astro`

```astro
---
// src/components/grading/GradingRubric.astro
interface Props {
  questionId: number;
  maxPoints: number;
  rubric?: {
    excellent: { score: number; criteria: string };
    good: { score: number; criteria: string };
    fair: { score: number; criteria: string };
    poor: { score: number; criteria: string };
  };
}

const { questionId, maxPoints, rubric } = Astro.props;

const defaultRubric = rubric || {
  excellent: { score: maxPoints, criteria: 'Sangat baik, lengkap, dan akurat' },
  good: { score: Math.floor(maxPoints * 0.75), criteria: 'Baik, cukup lengkap' },
  fair: { score: Math.floor(maxPoints * 0.5), criteria: 'Cukup, perlu perbaikan' },
  poor: { score: Math.floor(maxPoints * 0.25), criteria: 'Kurang, banyak kekurangan' },
};
---

<div class="grading-rubric card bg-base-200">
  <div class="card-body">
    <h4 class="mb-4 font-semibold">Rubrik Penilaian</h4>

    <div class="space-y-2">
      <label class="label flex cursor-pointer items-start gap-3 rounded p-3 hover:bg-base-300">
        <input
          type="radio"
          name={`rubric-${questionId}`}
          value={defaultRubric.excellent.score}
          class="radio-success radio"
          data-rubric-input
        />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-success">Sangat Baik</span>
            <span class="badge badge-success">{defaultRubric.excellent.score} poin</span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">{defaultRubric.excellent.criteria}</p>
        </div>
      </label>

      <label class="label flex cursor-pointer items-start gap-3 rounded p-3 hover:bg-base-300">
        <input
          type="radio"
          name={`rubric-${questionId}`}
          value={defaultRubric.good.score}
          class="radio-info radio"
          data-rubric-input
        />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-info">Baik</span>
            <span class="badge badge-info">{defaultRubric.good.score} poin</span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">{defaultRubric.good.criteria}</p>
        </div>
      </label>

      <label class="label flex cursor-pointer items-start gap-3 rounded p-3 hover:bg-base-300">
        <input
          type="radio"
          name={`rubric-${questionId}`}
          value={defaultRubric.fair.score}
          class="radio-warning radio"
          data-rubric-input
        />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-warning">Cukup</span>
            <span class="badge badge-warning">{defaultRubric.fair.score} poin</span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">{defaultRubric.fair.criteria}</p>
        </div>
      </label>

      <label class="label flex cursor-pointer items-start gap-3 rounded p-3 hover:bg-base-300">
        <input
          type="radio"
          name={`rubric-${questionId}`}
          value={defaultRubric.poor.score}
          class="radio-error radio"
          data-rubric-input
        />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-error">Kurang</span>
            <span class="badge badge-error">{defaultRubric.poor.score} poin</span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">{defaultRubric.poor.criteria}</p>
        </div>
      </label>
    </div>

    <div class="divider">ATAU</div>

    <div class="form-control">
      <label class="label">
        <span class="label-text">Nilai Custom (0-{maxPoints})</span>
      </label>
      <input
        type="number"
        id={`custom-score-${questionId}`}
        name={`custom-score-${questionId}`}
        min="0"
        max={maxPoints}
        step="0.5"
        placeholder="Masukkan nilai..."
        class="input input-bordered"
        data-custom-score
      />
    </div>

    <div class="form-control mt-4">
      <label class="label">
        <span class="label-text">Catatan/Feedback (Opsional)</span>
      </label>
      <textarea
        id={`feedback-${questionId}`}
        name={`feedback-${questionId}`}
        placeholder="Berikan feedback untuk siswa..."
        rows="3"
        class="textarea textarea-bordered"
        data-feedback-input></textarea>
    </div>
  </div>
</div>

<script define:vars={{ questionId, maxPoints }}>
  const rubricInputs = document.querySelectorAll(`input[name="rubric-${questionId}"]`);
  const customScoreInput = document.getElementById(
    `custom-score-${questionId}`
  ) as HTMLInputElement;

  rubricInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (customScoreInput) customScoreInput.value = '';

      window.dispatchEvent(
        new CustomEvent('rubric-selected', {
          detail: {
            questionId,
            score: parseFloat((input as HTMLInputElement).value),
            feedback: (document.getElementById(`feedback-${questionId}`) as HTMLTextAreaElement)
              ?.value,
          },
        })
      );
    });
  });

  customScoreInput?.addEventListener('input', () => {
    rubricInputs.forEach((input) => {
      (input as HTMLInputElement).checked = false;
    });

    const score = parseFloat(customScoreInput.value);
    if (score >= 0 && score <= maxPoints) {
      window.dispatchEvent(
        new CustomEvent('rubric-selected', {
          detail: {
            questionId,
            score,
            feedback: (document.getElementById(`feedback-${questionId}`) as HTMLTextAreaElement)
              ?.value,
          },
        })
      );
    }
  });
</script>

```

---

#### 📄 File: `./src/components/grading/ManualGradingCard.astro`

```astro
---
// src/components/grading/ManualGradingCard.astro
import AudioPlayer from './AudioPlayer.astro';
import GradingRubric from './GradingRubric.astro';

interface Props {
  attempt: {
    id: number;
    student_name: string;
    student_id: string;
  };
  question: {
    id: number;
    question_text: string;
    question_html?: string;
    type: string;
    points: number;
  };
  answer: {
    id: number;
    answer_text?: string;
    answer_media_url?: string;
    answer_media_type?: 'audio' | 'video';
  };
}

const { attempt, question, answer } = Astro.props;
---

<div class="grading-card card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h3 class="card-title">{attempt.student_name}</h3>
        <p class="text-sm text-base-content/70">NIS: {attempt.student_id}</p>
      </div>
      <div class="badge badge-primary badge-lg">{question.points} poin</div>
    </div>

    <div class="divider"></div>

    <div class="mb-6">
      <h4 class="mb-2 font-semibold">Pertanyaan:</h4>
      {
        question.question_html ? (
          <div class="prose max-w-none" set:html={question.question_html} />
        ) : (
          <p>{question.question_text}</p>
        )
      }
    </div>

    <div class="mb-6">
      <h4 class="mb-2 font-semibold">Jawaban Siswa:</h4>

      {
        answer.answer_text && (
          <div class="whitespace-pre-wrap rounded bg-base-200 p-4">{answer.answer_text}</div>
        )
      }

      {
        answer.answer_media_url && answer.answer_media_type === 'audio' && (
          <AudioPlayer url={answer.answer_media_url} answerId={answer.id} />
        )
      }

      {
        answer.answer_media_url && answer.answer_media_type === 'video' && (
          <div class="mt-4">
            <video class="max-h-96 w-full rounded" controls preload="metadata">
              <source src={answer.answer_media_url} type="video/webm" />
              <source src={answer.answer_media_url} type="video/mp4" />
            </video>
          </div>
        )
      }
    </div>

    <GradingRubric questionId={question.id} maxPoints={question.points} />

    <div class="card-actions mt-6 justify-end">
      <button type="button" class="btn btn-ghost" data-skip-btn> Lewati </button>
      <button type="button" class="btn btn-primary" data-save-grade-btn> Simpan Nilai </button>
    </div>
  </div>
</div>

<script>
  const saveBtn = document.querySelector('[data-save-grade-btn]');
  const skipBtn = document.querySelector('[data-skip-btn]');

  saveBtn?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('save-grade'));
  });

  skipBtn?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('skip-grade'));
  });
</script>

```

---

#### 📄 File: `./src/components/layout/Footer.astro`

```astro
---
// src/components/layout/Footer.astro
---

<footer class="footer footer-center bg-base-200 p-10 text-base-content">
  <aside>
    <svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill-rule="evenodd"
      clip-rule="evenodd"
      class="inline-block fill-current"
    >
      <path
        d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"
      ></path>
    </svg>
    <p class="font-bold">
      Sistem Ujian Sekolah & Madrasah
      <br />
      Offline-First Examination System
    </p>
    <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
  </aside>
  <nav>
    <div class="grid grid-flow-col gap-4">
      <a class="link-hover link" href="/about">Tentang</a>
      <a class="link-hover link" href="/contact">Kontak</a>
      <a class="link-hover link" href="/privacy">Privasi</a>
      <a class="link-hover link" href="/terms">Ketentuan</a>
    </div>
  </nav>
</footer>

```

---

#### 📄 File: `./src/components/layout/Header.astro`

```astro
---
// src/components/layout/Header.astro
import { $authStore } from '@/stores/auth';

interface Props {
  hideNav?: boolean;
}

const { hideNav = false } = Astro.props;
---

<header class="navbar bg-base-100 shadow-md">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl normal-case">
      <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3 9v12h6v-7h6v7h6V9l-9-7z"></path>
      </svg>
      <span class="ml-2">Sistem Ujian</span>
    </a>
  </div>

  {
    !hideNav && (
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="avatar btn btn-circle btn-ghost">
            <div class="w-10 rounded-full">
              <svg class="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </label>
          <ul
            tabindex="0"
            class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <a href="/profile" class="justify-between">
                Profile
                <span class="badge">New</span>
              </a>
            </li>
            <li>
              <a href="/settings">Pengaturan</a>
            </li>
            <li>
              <button id="logout-btn">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    )
  }
</header>

<script>
  import { logout } from '@/lib/api/auth';

  const logoutBtn = document.getElementById('logout-btn');

  logoutBtn?.addEventListener('click', async () => {
    if (confirm('Yakin ingin logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  });
</script>

```

---

#### 📄 File: `./src/components/layout/MainLayout.astro`

```astro
---
// src/components/layout/MainLayout.astro
import Header from './Header.astro';
import Sidebar from './Sidebar.astro';
import Footer from './Footer.astro';

interface Props {
  title: string;
  hideNav?: boolean;
  hideSidebar?: boolean;
  role?: 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';
}

const { title, hideNav = false, hideSidebar = false, role } = Astro.props;
const currentPath = Astro.url.pathname;
---

<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - Sistem Ujian</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#3b82f6" />
  </head>
  <body>
    {!hideNav && <Header hideNav={hideNav} />}

    <div class="flex min-h-screen">
      {!hideSidebar && role && <Sidebar role={role} currentPath={currentPath} />}

      <main class="flex-1">
        <slot />
      </main>
    </div>

    {!hideNav && <Footer />}
  </body>
</html>

```

---

#### 📄 File: `./src/components/layout/Sidebar.astro`

```astro
---
// src/components/layout/Sidebar.astro
interface Props {
  role: 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';
  currentPath?: string;
}

const { role, currentPath = '' } = Astro.props;

const menuItems: Record<string, Array<{ label: string; href: string; icon: string }>> = {
  siswa: [
    {
      label: 'Dashboard',
      href: '/siswa/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Ujian',
      href: '/siswa/ujian',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Profile',
      href: '/siswa/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  ],
  guru: [
    {
      label: 'Dashboard',
      href: '/guru/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Soal',
      href: '/guru/soal',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Ujian',
      href: '/guru/ujian',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Penilaian',
      href: '/guru/grading',
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    },
    {
      label: 'Hasil',
      href: '/guru/hasil',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ],
  pengawas: [
    {
      label: 'Dashboard',
      href: '/pengawas/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Monitoring',
      href: '/pengawas/monitoring/live',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
  ],
  operator: [
    {
      label: 'Dashboard',
      href: '/operator/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    { label: 'Sesi', href: '/operator/sesi', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    {
      label: 'Ruang',
      href: '/operator/ruang',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Peserta',
      href: '/operator/peserta',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Laporan',
      href: '/operator/laporan',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
  ],
  superadmin: [
    {
      label: 'Dashboard',
      href: '/superadmin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Sekolah',
      href: '/superadmin/schools',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Pengguna',
      href: '/superadmin/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Pengaturan',
      href: '/superadmin/settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Audit Log',
      href: '/superadmin/audit-logs',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
  ],
};

const items = menuItems[role] || [];
---

<aside class="min-h-screen w-64 bg-base-200 p-4">
  <ul class="menu">
    {
      items.map((item) => (
        <li>
          <a href={item.href} class={currentPath.startsWith(item.href) ? 'active' : ''}>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            {item.label}
          </a>
        </li>
      ))
    }
  </ul>
</aside>

```

---

#### 📄 File: `./src/components/madrasah/ArabicKeyboard.astro`

```astro
---
// src/components/madrasah/ArabicKeyboard.astro
interface Props {
  targetInputId: string;
}

const { targetInputId } = Astro.props;

const arabicKeys = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['ذ', 'ّ', 'ُ', 'ِ', 'َ', 'ْ', 'ٌ', 'ٍ', 'ً', 'آ'],
];
---

<div class="arabic-keyboard card bg-base-200">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h4 class="font-semibold">Keyboard Arab</h4>
      <button type="button" id="toggle-keyboard" class="btn btn-ghost btn-sm">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
    </div>

    <div id="keyboard-container" class="space-y-2">
      {
        arabicKeys.map((row) => (
          <div class="flex justify-center gap-1">
            {row.map((key) => (
              <button type="button" class="btn btn-sm font-arabic text-xl" data-key={key}>
                {key}
              </button>
            ))}
          </div>
        ))
      }

      <div class="mt-4 flex justify-center gap-2">
        <button type="button" class="btn btn-sm" data-key=" "> Space </button>
        <button type="button" class="btn btn-warning btn-sm" id="backspace-btn">
          ⌫ Backspace
        </button>
        <button type="button" class="btn btn-error btn-sm" id="clear-btn"> Clear </button>
      </div>
    </div>
  </div>
</div>

<script define:vars={{ targetInputId }}>
  const keyboardContainer = document.getElementById('keyboard-container');
  const toggleBtn = document.getElementById('toggle-keyboard');
  const backspaceBtn = document.getElementById('backspace-btn');
  const clearBtn = document.getElementById('clear-btn');
  const targetInput = document.getElementById(targetInputId) as
    | HTMLInputElement
    | HTMLTextAreaElement;

  let isVisible = true;

  toggleBtn?.addEventListener('click', () => {
    isVisible = !isVisible;
    if (keyboardContainer) {
      keyboardContainer.style.display = isVisible ? 'block' : 'none';
    }
  });

  document.querySelectorAll('[data-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (!key || !targetInput) return;

      const start = targetInput.selectionStart || 0;
      const end = targetInput.selectionEnd || 0;
      const text = targetInput.value;

      targetInput.value = text.substring(0, start) + key + text.substring(end);
      targetInput.selectionStart = targetInput.selectionEnd = start + key.length;
      targetInput.focus();

      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  backspaceBtn?.addEventListener('click', () => {
    if (!targetInput) return;

    const start = targetInput.selectionStart || 0;
    const end = targetInput.selectionEnd || 0;
    const text = targetInput.value;

    if (start === end && start > 0) {
      targetInput.value = text.substring(0, start - 1) + text.substring(end);
      targetInput.selectionStart = targetInput.selectionEnd = start - 1;
    } else if (start !== end) {
      targetInput.value = text.substring(0, start) + text.substring(end);
      targetInput.selectionStart = targetInput.selectionEnd = start;
    }

    targetInput.focus();
    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  clearBtn?.addEventListener('click', () => {
    if (!targetInput) return;
    targetInput.value = '';
    targetInput.focus();
    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }
</style>

```

---

#### 📄 File: `./src/components/madrasah/HafalanRecorder.astro`

```astro
---
// src/components/madrasah/HafalanRecorder.astro
interface Props {
  surah: string;
  ayahRange: string;
  maxDuration?: number;
}

const { surah, ayahRange, maxDuration = 600 } = Astro.props;
---

<div class="hafalan-recorder card bg-base-200">
  <div class="card-body">
    <div class="mb-4 text-center">
      <h3 class="font-arabic text-lg font-bold">{surah}</h3>
      <p class="text-sm text-base-content/70">Ayat {ayahRange}</p>
    </div>

    <div class="alert alert-info mb-4">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div class="text-sm">
        <p class="font-semibold">Petunjuk Rekaman Hafalan:</p>
        <ul class="mt-1 list-inside list-disc">
          <li>Pastikan suara jelas dan tanpa noise</li>
          <li>Bacakan ayat dengan tartil</li>
          <li>Maksimal durasi: {maxDuration / 60} menit</li>
        </ul>
      </div>
    </div>

    <div id="recording-status" class="mb-4 hidden">
      <div class="flex items-center justify-between rounded bg-error/10 p-4">
        <div class="flex items-center gap-3">
          <div class="animate-pulse">
            <div class="h-3 w-3 rounded-full bg-error"></div>
          </div>
          <span class="font-semibold">Merekam...</span>
        </div>
        <div class="font-mono text-2xl" id="rec-timer">00:00</div>
      </div>
    </div>

    <div id="waveform-container" class="mb-4 hidden">
      <canvas id="waveform-canvas" class="h-32 w-full rounded bg-base-300"></canvas>
    </div>

    <div class="mb-4 flex justify-center gap-2">
      <button type="button" id="start-hafalan-rec" class="btn btn-primary btn-lg">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6"></circle>
        </svg>
        Mulai Rekam Hafalan
      </button>

      <button type="button" id="stop-hafalan-rec" class="btn btn-error btn-lg hidden">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <rect x="6" y="6" width="8" height="8"></rect>
        </svg>
        Stop
      </button>
    </div>

    <div id="playback-section" class="hidden">
      <div class="divider">Preview Hafalan</div>

      <audio id="hafalan-playback" class="mb-4 w-full" controls></audio>

      <div class="grid grid-cols-2 gap-2">
        <button type="button" id="retry-hafalan" class="btn btn-ghost"> Rekam Ulang </button>
        <button type="button" id="submit-hafalan" class="btn btn-success"> Submit Hafalan </button>
      </div>
    </div>
  </div>
</div>

<script define:vars={{ maxDuration }}>
  let mediaRecorder;
  let recordedChunks = [];
  let stream;
  let startTime;
  let timerInterval;
  let audioContext;
  let analyser;
  let dataArray;
  let animationId;

  const startBtn = document.getElementById('start-hafalan-rec');
  const stopBtn = document.getElementById('stop-hafalan-rec');
  const retryBtn = document.getElementById('retry-hafalan');
  const submitBtn = document.getElementById('submit-hafalan');
  const recordingStatus = document.getElementById('recording-status');
  const timerEl = document.getElementById('rec-timer');
  const playbackSection = document.getElementById('playback-section');
  const playback = document.getElementById('hafalan-playback') as HTMLAudioElement;
  const waveformContainer = document.getElementById('waveform-container');
  const waveformCanvas = document.getElementById('waveform-canvas') as HTMLCanvasElement;

  startBtn?.addEventListener('click', startRecording);
  stopBtn?.addEventListener('click', stopRecording);
  retryBtn?.addEventListener('click', retryRecording);
  submitBtn?.addEventListener('click', submitHafalan);

  async function startRecording() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setupAudioVisualizer(stream);

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      recordedChunks = [];
      mediaRecorder.start();
      startTime = Date.now();

      startBtn?.classList.add('hidden');
      stopBtn?.classList.remove('hidden');
      recordingStatus?.classList.remove('hidden');
      waveformContainer?.classList.remove('hidden');
      playbackSection?.classList.add('hidden');

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);

      setTimeout(() => {
        if (mediaRecorder?.state === 'recording') {
          stopRecording();
          alert(`Durasi maksimal ${maxDuration / 60} menit tercapai.`);
        }
      }, maxDuration * 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Gagal memulai rekaman. Pastikan izin mikrofon sudah diberikan.');
    }
  }

  function setupAudioVisualizer(audioStream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawWaveform();
  }

  function drawWaveform() {
    if (!waveformCanvas || !analyser) return;

    const ctx = waveformCanvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = (waveformCanvas.width = waveformCanvas.offsetWidth);
    const HEIGHT = (waveformCanvas.height = waveformCanvas.offsetHeight);

    animationId = requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(30, 30, 30)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(59, 130, 246)';
    ctx.beginPath();

    const sliceWidth = WIDTH / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
  }

  function stopRecording() {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
      stream?.getTracks().forEach((track) => track.stop());

      if (timerInterval) clearInterval(timerInterval);
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext) audioContext.close();

      startBtn?.classList.remove('hidden');
      stopBtn?.classList.add('hidden');
      recordingStatus?.classList.add('hidden');
      waveformContainer?.classList.add('hidden');
    }
  }

  function handleRecordingStop() {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);

    if (playback) {
      playback.src = url;
      playbackSection?.classList.remove('hidden');
    }

    window.hafalanBlob = blob;
    window.hafalanDuration = (Date.now() - startTime) / 1000;
  }

  function retryRecording() {
    recordedChunks = [];
    if (timerEl) timerEl.textContent = '00:00';
    playbackSection?.classList.add('hidden');
    startRecording();
  }

  function submitHafalan() {
    if (!window.hafalanBlob) return;

    window.dispatchEvent(
      new CustomEvent('hafalan-submitted', {
        detail: {
          blob: window.hafalanBlob,
          duration: window.hafalanDuration,
        },
      })
    );

    alert('Hafalan berhasil disubmit!');
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (timerEl) {
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }
</style>

```

---

#### 📄 File: `./src/components/madrasah/QuranDisplay.astro`

```astro
---
// src/components/madrasah/QuranDisplay.astro
interface Props {
  surah: string;
  ayahStart: number;
  ayahEnd: number;
  showTajwid?: boolean;
  showTransliteration?: boolean;
  showTranslation?: boolean;
}

const {
  surah,
  ayahStart,
  ayahEnd,
  showTajwid = true,
  showTransliteration = false,
  showTranslation = true,
} = Astro.props;
---

<div class="quran-display card bg-base-100" dir="rtl">
  <div class="card-body">
    <div class="surah-header mb-6 text-center">
      <h2 class="font-arabic text-3xl font-bold">{surah}</h2>
      <p class="mt-2 text-sm text-base-content/70">
        الآيات {ayahStart} - {ayahEnd}
      </p>
    </div>

    <div class="controls mb-4 flex justify-center gap-2" dir="ltr">
      <label class="label cursor-pointer gap-2">
        <input
          type="checkbox"
          id="toggle-tajwid"
          class="checkbox-primary checkbox checkbox-sm"
          checked={showTajwid}
        />
        <span class="label-text text-sm">Tajwid</span>
      </label>

      <label class="label cursor-pointer gap-2">
        <input
          type="checkbox"
          id="toggle-transliteration"
          class="checkbox-primary checkbox checkbox-sm"
          checked={showTransliteration}
        />
        <span class="label-text text-sm">Transliterasi</span>
      </label>

      <label class="label cursor-pointer gap-2">
        <input
          type="checkbox"
          id="toggle-translation"
          class="checkbox-primary checkbox checkbox-sm"
          checked={showTranslation}
        />
        <span class="label-text text-sm">Terjemahan</span>
      </label>
    </div>

    <div id="ayat-container" class="space-y-6">
      <div class="loading loading-spinner loading-lg mx-auto"></div>
    </div>

    <div class="audio-player mt-6" dir="ltr">
      <div class="mb-2 flex items-center gap-2">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
          ></path>
        </svg>
        <span class="text-sm font-semibold">Murattal</span>
      </div>
      <audio id="murattal-player" class="w-full" controls preload="metadata">
        <source src={`/api/quran/audio/${surah}/${ayahStart}`} type="audio/mpeg" />
      </audio>
    </div>
  </div>
</div>

<script define:vars={{ surah, ayahStart, ayahEnd, showTajwid }}>
  let currentShowTajwid = showTajwid;
  let currentShowTransliteration = false;
  let currentShowTranslation = true;

  const toggleTajwid = document.getElementById('toggle-tajwid') as HTMLInputElement;
  const toggleTransliteration = document.getElementById(
    'toggle-transliteration'
  ) as HTMLInputElement;
  const toggleTranslation = document.getElementById('toggle-translation') as HTMLInputElement;

  toggleTajwid?.addEventListener('change', (e) => {
    currentShowTajwid = (e.target as HTMLInputElement).checked;
    renderAyat();
  });

  toggleTransliteration?.addEventListener('change', (e) => {
    currentShowTransliteration = (e.target as HTMLInputElement).checked;
    renderAyat();
  });

  toggleTranslation?.addEventListener('change', (e) => {
    currentShowTranslation = (e.target as HTMLInputElement).checked;
    renderAyat();
  });

  async function loadAyat() {
    try {
      const response = await fetch(
        `/api/quran/${encodeURIComponent(surah)}/${ayahStart}/${ayahEnd}`
      );

      if (!response.ok) {
        throw new Error('Failed to load ayat');
      }

      const ayatData = await response.json();
      window.ayatData = ayatData;
      renderAyat();
    } catch (error) {
      console.error('Failed to load ayat:', error);
      const container = document.getElementById('ayat-container');
      if (container) {
        container.innerHTML = `
          <div class="alert alert-error">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Gagal memuat ayat. Silakan coba lagi.</span>
          </div>
        `;
      }
    }
  }

  function renderAyat() {
    const container = document.getElementById('ayat-container');
    if (!container || !window.ayatData) return;

    container.innerHTML = window.ayatData
      .map((ayat) => {
        let arabicText = ayat.text;

        if (currentShowTajwid) {
          arabicText = applyTajwidColors(arabicText);
        }

        return `
        <div class="ayat-item p-6 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
          <div class="flex items-start gap-4 mb-3">
            <span class="badge badge-primary badge-lg">${ayat.number}</span>
            <p class="text-3xl md:text-4xl font-quran leading-loose flex-1 text-right">
              ${arabicText}
            </p>
          </div>
          ${
            currentShowTransliteration
              ? `
            <p class="text-sm text-base-content/70 italic mb-2 text-left" dir="ltr">
              ${ayat.transliteration || ''}
            </p>
          `
              : ''
          }
          ${
            currentShowTranslation
              ? `
            <p class="text-base mt-3 text-left border-l-4 border-primary pl-4" dir="ltr">
              ${ayat.translation || ''}
            </p>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');
  }

  function applyTajwidColors(text) {
    const rules = [
      { pattern: /([نم])\s*([بم])/g, class: 'tajwid-ikhfa', name: 'Ikhfa' },
      { pattern: /([نملر])\s*([نملر])/g, class: 'tajwid-idgham', name: 'Idgham' },
      { pattern: /[قطبجد]/g, class: 'tajwid-qalqalah', name: 'Qalqalah' },
      { pattern: /~|ّ/g, class: 'tajwid-ghunnah', name: 'Ghunnah' },
      { pattern: /ا[َُِ]/g, class: 'tajwid-mad', name: 'Mad' },
    ];

    let result = text;

    rules.forEach((rule) => {
      result = result.replace(rule.pattern, (match) => {
        return `<span class="${rule.class}" title="${rule.name}">${match}</span>`;
      });
    });

    return result;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAyat);
  } else {
    loadAyat();
  }
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }

  .font-quran {
    font-family: 'Scheherazade', 'Amiri', serif;
    line-height: 2.5;
  }

  .tajwid-ikhfa {
    background: rgba(251, 191, 36, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
    cursor: help;
  }

  .tajwid-idgham {
    background: rgba(34, 197, 94, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
    cursor: help;
  }

  .tajwid-qalqalah {
    background: rgba(239, 68, 68, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
    cursor: help;
  }

  .tajwid-ghunnah {
    background: rgba(168, 85, 247, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
    cursor: help;
  }

  .tajwid-mad {
    background: rgba(59, 130, 246, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
    cursor: help;
  }
</style>

```

---

#### 📄 File: `./src/components/madrasah/TajwidMarker.astro`

```astro
---
// src/components/madrasah/TajwidMarker.astro
interface Props {
  text: string;
  highlightRules?: string[];
}

const { text, highlightRules = ['all'] } = Astro.props;

const tajwidRules = {
  ikhfa: { color: 'yellow', name: 'Ikhfa', description: 'Samar' },
  idgham: { color: 'green', name: 'Idgham', description: 'Memasukkan' },
  qalqalah: { color: 'red', name: 'Qalqalah', description: 'Memantul' },
  ghunnah: { color: 'purple', name: 'Ghunnah', description: 'Dengung' },
  mad: { color: 'blue', name: 'Mad', description: 'Panjang' },
  iqlab: { color: 'orange', name: 'Iqlab', description: 'Membalik' },
};
---

<div class="tajwid-marker">
  <div class="tajwid-legend mb-4">
    <h4 class="mb-2 font-semibold">Keterangan Tajwid:</h4>
    <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
      {
        Object.entries(tajwidRules).map(([key, rule]) => (
          <div class="flex items-center gap-2">
            <div
              class={`h-4 w-4 rounded border-2`}
              style={`background-color: ${rule.color}; opacity: 0.3;`}
            />
            <div>
              <span class="text-sm font-semibold">{rule.name}</span>
              <span class="ml-1 text-xs text-base-content/70">({rule.description})</span>
            </div>
          </div>
        ))
      }
    </div>
  </div>

  <div
    id="marked-text"
    class="rounded-lg bg-base-200 p-4 font-quran text-3xl leading-loose"
    dir="rtl"
  >
    {text}
  </div>

  <div class="mt-4">
    <button type="button" id="toggle-markers" class="btn btn-ghost btn-sm">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        ></path>
      </svg>
      <span id="toggle-text">Sembunyikan Tajwid</span>
    </button>
  </div>
</div>

<script define:vars={{ text, highlightRules }}>
  let showMarkers = true;
  const markedTextEl = document.getElementById('marked-text');
  const toggleBtn = document.getElementById('toggle-markers');
  const toggleText = document.getElementById('toggle-text');

  function applyTajwidMarkers(arabicText, showMarkers) {
    if (!showMarkers) {
      return arabicText;
    }

    const patterns = {
      ikhfa: { pattern: /([نم])\s*([بم])/g, class: 'bg-yellow-200/30' },
      idgham: { pattern: /([نملر])\s*([نملر])/g, class: 'bg-green-200/30' },
      qalqalah: { pattern: /[قطبجد]/g, class: 'bg-red-200/30' },
      ghunnah: { pattern: /[~ّ]/g, class: 'bg-purple-200/30' },
      mad: { pattern: /ا[َُِ]/g, class: 'bg-blue-200/30' },
      iqlab: { pattern: /ن\s*ب/g, class: 'bg-orange-200/30' },
    };

    let result = arabicText;

    Object.entries(patterns).forEach(([rule, config]) => {
      if (highlightRules.includes('all') || highlightRules.includes(rule)) {
        result = result.replace(config.pattern, (match) => {
          return `<span class="${config.class} px-1 rounded" data-tajwid="${rule}">${match}</span>`;
        });
      }
    });

    return result;
  }

  function updateDisplay() {
    if (markedTextEl) {
      markedTextEl.innerHTML = applyTajwidMarkers(text, showMarkers);
    }
    if (toggleText) {
      toggleText.textContent = showMarkers ? 'Sembunyikan Tajwid' : 'Tampilkan Tajwid';
    }
  }

  toggleBtn?.addEventListener('click', () => {
    showMarkers = !showMarkers;
    updateDisplay();
  });

  markedTextEl?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.tajwid) {
      const ruleName = target.dataset.tajwid;
      showTajwidInfo(ruleName);
    }
  });

  function showTajwidInfo(ruleName) {
    const rules = {
      ikhfa:
        'Ikhfa: Menyamarkan bunyi nun mati atau tanwin ketika bertemu dengan salah satu dari 15 huruf ikhfa.',
      idgham: 'Idgham: Memasukkan bunyi nun mati atau tanwin ke dalam huruf berikutnya.',
      qalqalah: 'Qalqalah: Memantulkan bunyi huruf ketika sukun.',
      ghunnah: 'Ghunnah: Mendengungkan bunyi nun atau mim bertasydid.',
      mad: 'Mad: Memanjangkan bacaan.',
      iqlab: 'Iqlab: Membalik bunyi nun mati menjadi mim ketika bertemu ba.',
    };

    alert(rules[ruleName] || 'Kaidah tajwid');
  }

  updateDisplay();
</script>

<style>
  .font-quran {
    font-family: 'Scheherazade', 'Amiri', serif;
  }

  [data-tajwid] {
    cursor: help;
    transition: all 0.2s;
  }

  [data-tajwid]:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>

```

---

#### 📄 File: `./src/components/monitoring/ActivityLogViewer.astro`

```astro
---
// src/components/monitoring/ActivityLogViewer.astro
interface Props {
  attemptId: number;
  logs?: Array<{
    id: number;
    event_type: string;
    event_data?: any;
    timestamp: string;
  }>;
}

const { attemptId, logs = [] } = Astro.props;

const eventTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  exam_started: {
    label: 'Ujian Dimulai',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-success',
  },
  exam_paused: {
    label: 'Ujian Dijeda',
    icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-warning',
  },
  exam_resumed: {
    label: 'Ujian Dilanjutkan',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-info',
  },
  exam_submitted: {
    label: 'Ujian Disubmit',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-success',
  },
  question_viewed: {
    label: 'Melihat Soal',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    color: 'text-base-content',
  },
  answer_changed: {
    label: 'Jawaban Diubah',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: 'text-info',
  },
  tab_switched: {
    label: 'Pindah Tab',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    color: 'text-error',
  },
  fullscreen_exited: {
    label: 'Keluar Fullscreen',
    icon: 'M6 18L18 6M6 6l12 12',
    color: 'text-error',
  },
  suspicious_activity: {
    label: 'Aktivitas Mencurigakan',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    color: 'text-error',
  },
};
---

<div class="activity-log-viewer card bg-base-100">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="card-title">Log Aktivitas</h3>
      <div class="flex gap-2">
        <button type="button" id="refresh-logs" class="btn btn-ghost btn-sm">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </button>
        <select id="filter-type" class="select select-bordered select-sm">
          <option value="all">Semua</option>
          <option value="suspicious">Mencurigakan</option>
          <option value="navigation">Navigasi</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div id="logs-container" class="space-y-2">
        {
          logs.length === 0 ? (
            <div class="py-8 text-center text-base-content/50">
              <svg
                class="mx-auto mb-2 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Belum ada log aktivitas</p>
            </div>
          ) : (
            logs.map((log) => {
              const eventInfo = eventTypeLabels[log.event_type] || {
                label: log.event_type,
                icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'text-base-content',
              };

              return (
                <div class="flex items-start gap-3 rounded bg-base-200 p-3 transition-colors hover:bg-base-300">
                  <svg
                    class={`h-5 w-5 flex-shrink-0 ${eventInfo.color}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d={eventInfo.icon}
                    />
                  </svg>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between">
                      <p class="text-sm font-semibold">{eventInfo.label}</p>
                      <span class="ml-2 text-xs text-base-content/70">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                    </div>

                    {log.event_data && (
                      <details class="mt-1">
                        <summary class="cursor-pointer text-xs text-base-content/70">
                          Detail
                        </summary>
                        <pre class="mt-1 overflow-x-auto rounded bg-base-300 p-2 text-xs">
                          {JSON.stringify(log.event_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })
          )
        }
      </div>
    </div>
  </div>
</div>

<script define:vars={{ attemptId }}>
  const refreshBtn = document.getElementById('refresh-logs');
  const filterSelect = document.getElementById('filter-type') as HTMLSelectElement;
  const logsContainer = document.getElementById('logs-container');

  async function loadLogs() {
    try {
      const filter = filterSelect?.value || 'all';
      const response = await fetch(`/api/monitoring/logs/${attemptId}?filter=${filter}`);
      const logs = await response.json();

      if (logsContainer) {
        renderLogs(logs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  function renderLogs(logs) {
    if (!logsContainer) return;

    if (logs.length === 0) {
      logsContainer.innerHTML = `
        <div class="text-center py-8 text-base-content/50">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p>Belum ada log aktivitas</p>
        </div>
      `;
      return;
    }

    logsContainer.innerHTML = logs
      .map((log) => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString('id-ID');
        return `
        <div class="flex items-start gap-3 p-3 bg-base-200 rounded hover:bg-base-300 transition-colors">
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <p class="font-semibold text-sm">${log.event_type}</p>
              <span class="text-xs text-base-content/70 ml-2">${timestamp}</span>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  refreshBtn?.addEventListener('click', loadLogs);
  filterSelect?.addEventListener('change', loadLogs);
</script>

```

---

#### 📄 File: `./src/components/monitoring/LiveMonitor.astro`

```astro
---
// src/components/monitoring/LiveMonitor.astro
interface Props {
  sessionId: number;
}

const { sessionId } = Astro.props;
---

<div class="live-monitor">
  <div class="mb-6">
    <div class="stats w-full shadow">
      <div class="stat">
        <div class="stat-title">Total Peserta</div>
        <div class="stat-value" id="total-participants">0</div>
      </div>

      <div class="stat">
        <div class="stat-title">Sedang Mengerjakan</div>
        <div class="stat-value text-success" id="active-participants">0</div>
      </div>

      <div class="stat">
        <div class="stat-title">Sudah Submit</div>
        <div class="stat-value text-info" id="submitted-participants">0</div>
      </div>

      <div class="stat">
        <div class="stat-title">Peringatan</div>
        <div class="stat-value text-warning" id="warning-count">0</div>
      </div>
    </div>
  </div>

  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-lg font-bold">Monitor Real-time</h3>
    <div class="flex gap-2">
      <div class="badge badge-success gap-2">
        <div class="h-2 w-2 animate-pulse rounded-full bg-success"></div>
        Live
      </div>
      <button type="button" id="toggle-auto-refresh" class="btn btn-ghost btn-sm">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" id="participants-grid">
    <div class="loading loading-spinner loading-lg col-span-full mx-auto"></div>
  </div>
</div>

<script define:vars={{ sessionId }}>
  let autoRefresh = true;
  let refreshInterval;

  async function loadParticipants() {
    try {
      const response = await fetch(`/api/monitoring/session/${sessionId}/live`);
      const data = await response.json();

      updateStats(data.stats);
      renderParticipants(data.participants);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }

  function updateStats(stats) {
    document.getElementById('total-participants').textContent = stats.total || 0;
    document.getElementById('active-participants').textContent = stats.active || 0;
    document.getElementById('submitted-participants').textContent = stats.submitted || 0;
    document.getElementById('warning-count').textContent = stats.warnings || 0;
  }

  function renderParticipants(participants) {
    const grid = document.getElementById('participants-grid');
    if (!grid) return;

    if (participants.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-8 text-base-content/50">
          <p>Belum ada peserta yang memulai ujian</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = participants
      .map((participant) => {
        const statusColor =
          {
            in_progress: 'badge-success',
            paused: 'badge-warning',
            submitted: 'badge-info',
          }[participant.status] || 'badge-ghost';

        const warningIcon =
          participant.warnings > 0
            ? `
        <div class="badge badge-error badge-sm">${participant.warnings}</div>
      `
            : '';

        return `
        <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold">${participant.name}</h4>
                <p class="text-xs text-base-content/70">${participant.student_id}</p>
              </div>
              ${warningIcon}
            </div>
            
            <div class="mt-3 space-y-2">
              <div class="flex justify-between text-sm">
                <span>Status:</span>
                <span class="badge ${statusColor} badge-sm">${participant.status_label}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span>Progress:</span>
                <span>${participant.answered}/${participant.total}</span>
              </div>
              
              <div class="progress progress-sm">
                <div 
                  class="progress-bar bg-primary" 
                  style="width: ${(participant.answered / participant.total) * 100}%"
                ></div>
              </div>
              
              <div class="flex justify-between text-xs text-base-content/70">
                <span>Waktu:</span>
                <span>${participant.time_remaining}</span>
              </div>
            </div>

            <div class="card-actions justify-end mt-3">
              <button 
                class="btn btn-xs btn-ghost"
                onclick="window.location.href='/pengawas/monitoring/student/${participant.attempt_id}'"
              >
                Detail
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  function startAutoRefresh() {
    refreshInterval = setInterval(loadParticipants, 5000);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }

  document.getElementById('toggle-auto-refresh')?.addEventListener('click', () => {
    autoRefresh = !autoRefresh;

    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  loadParticipants();
  if (autoRefresh) {
    startAutoRefresh();
  }

  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });
</script>

```

---

#### 📄 File: `./src/components/monitoring/StudentProgressCard.astro`

```astro
---
// src/components/monitoring/StudentProgressCard.astro
interface Props {
  student: {
    id: number;
    name: string;
    student_id: string;
    photo_url?: string;
  };
  progress: {
    attempt_id: number;
    status: string;
    answered: number;
    total_questions: number;
    time_remaining: number;
    warnings: number;
    last_activity: string;
  };
}

const { student, progress } = Astro.props;

const statusConfig = {
  not_started: { label: 'Belum Mulai', color: 'badge-ghost' },
  in_progress: { label: 'Mengerjakan', color: 'badge-success' },
  paused: { label: 'Dijeda', color: 'badge-warning' },
  submitted: { label: 'Selesai', color: 'badge-info' },
};

const status = statusConfig[progress.status] || statusConfig.not_started;
const progressPercentage = (progress.answered / progress.total_questions) * 100;
---

<div class="student-progress-card card bg-base-100 shadow-lg transition-all hover:shadow-xl">
  <div class="card-body">
    <div class="flex items-start gap-4">
      <div class="avatar">
        <div class="h-12 w-12 rounded-full">
          {
            student.photo_url ? (
              <img src={student.photo_url} alt={student.name} />
            ) : (
              <div class="bg-primary/20 flex h-full items-center justify-center">
                <span class="text-primary text-lg font-bold">{student.name.charAt(0)}</span>
              </div>
            )
          }
        </div>
      </div>

      <div class="flex-1">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">{student.name}</h3>
            <p class="text-sm text-base-content/70">{student.student_id}</p>
          </div>

          {
            progress.warnings > 0 && (
              <div class="tooltip" data-tip="Peringatan">
                <div class="badge badge-error gap-1">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {progress.warnings}
                </div>
              </div>
            )
          }
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm">Status:</span>
            <span class={`badge ${status.color} badge-sm`}>{status.label}</span>
          </div>

          <div>
            <div class="mb-1 flex justify-between text-sm">
              <span>Progress:</span>
              <span class="font-semibold">
                {progress.answered}/{progress.total_questions}
                <span class="ml-1 text-xs text-base-content/70">
                  ({progressPercentage.toFixed(0)}%)
                </span>
              </span>
            </div>
            <progress class="progress progress-primary w-full" value={progressPercentage} max="100"
            ></progress>
          </div>

          {
            progress.status === 'in_progress' && (
              <div class="flex justify-between text-sm">
                <span>Sisa Waktu:</span>
                <span class="font-mono font-semibold">
                  {Math.floor(progress.time_remaining / 60)}:
                  {(progress.time_remaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )
          }

          <div class="flex justify-between text-xs text-base-content/70">
            <span>Aktivitas Terakhir:</span>
            <span>{new Date(progress.last_activity).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        <div class="card-actions mt-4 justify-end">
          <button
            class="btn btn-ghost btn-sm"
            onclick={`window.location.href='/pengawas/monitoring/student/${progress.attempt_id}'`}
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            Detail
          </button>

          {
            progress.status === 'in_progress' && (
              <button
                class="btn btn-warning btn-sm"
                data-pause-student
                data-attempt-id={progress.attempt_id}
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Jeda
              </button>
            )
          }
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  document.querySelectorAll('[data-pause-student]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const attemptId = (e.currentTarget as HTMLElement).dataset.attemptId;

      if (confirm('Yakin ingin menjeda ujian siswa ini?')) {
        try {
          await fetch(`/api/monitoring/pause/${attemptId}`, {
            method: 'POST',
          });

          alert('Ujian berhasil dijeda');
          window.location.reload();
        } catch (error) {
          console.error('Failed to pause:', error);
          alert('Gagal menjeda ujian');
        }
      }
    });
  });
</script>

```

---

#### 📄 File: `./src/components/questions/MatchingEditor.astro`

```astro
---
// Editor untuk Soal Menjodohkan
---

<div id="pairs-container" class="space-y-4">
  <!-- Pairs will be injected here -->
</div>

<button type="button" id="add-pair-btn" class="btn btn-outline btn-sm mt-4 w-full border-dashed">
  + Tambah Pasangan
</button>

<template id="pair-template">
  <div class="pair-item grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-2 items-start bg-base-200 p-3 rounded-lg">
    
    <!-- Left Side -->
    <div class="form-control">
      <label class="label text-xs"><span class="label-text">Sisi Kiri (Pertanyaan)</span></label>
      <input type="text" class="input input-bordered input-sm w-full left-text" placeholder="Teks..." required />
      <input type="file" class="file-input file-input-bordered file-input-xs w-full mt-1 left-media" accept="image/*" />
    </div>

    <div class="self-center pt-6 text-base-content/50">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>

    <!-- Right Side -->
    <div class="form-control">
      <label class="label text-xs"><span class="label-text">Sisi Kanan (Jawaban)</span></label>
      <input type="text" class="input input-bordered input-sm w-full right-text" placeholder="Teks..." required />
      <input type="file" class="file-input file-input-bordered file-input-xs w-full mt-1 right-media" accept="image/*" />
    </div>

    <button type="button" class="btn btn-ghost btn-xs text-error self-center mt-6 remove-pair">✕</button>
  </div>
</template>

<script>
  const container = document.getElementById('pairs-container');
  const addBtn = document.getElementById('add-pair-btn');
  const template = document.getElementById('pair-template') as HTMLTemplateElement;
  
  function addPair() {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const item = clone.querySelector('.pair-item');
    const removeBtn = clone.querySelector('.remove-pair');
    
    removeBtn?.addEventListener('click', () => {
      item?.remove();
    });
    
    container?.appendChild(clone);
  }
  
  addBtn?.addEventListener('click', addPair);
  
  // Add initial pairs
  for(let i=0; i<2; i++) addPair();
</script>
```

---

#### 📄 File: `./src/components/questions/MediaUpload.astro`

```astro
---
interface Props {
  id: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

const { id, label = 'Upload Media', accept = 'image/*,audio/*,video/*', maxSizeMB = 5 } = Astro.props;
---

<div class="form-control w-full">
  <label class="label">
    <span class="label-text">{label}</span>
    <span class="label-text-alt">Max {maxSizeMB}MB</span>
  </label>
  <input 
    type="file" 
    id={id} 
    class="file-input file-input-bordered w-full" 
    accept={accept}
    data-max-size={maxSizeMB * 1024 * 1024}
  />
  <div id={`${id}-preview`} class="mt-4 hidden">
    <!-- Preview container -->
  </div>
</div>

<script define:vars={{ id }}>
  const input = document.getElementById(id);
  const preview = document.getElementById(`${id}-preview`);
  
  input?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate size
    const maxSize = parseInt(input.dataset.maxSize);
    if (file.size > maxSize) {
      alert(`File terlalu besar. Maksimal ${maxSize / (1024*1024)}MB`);
      input.value = '';
      return;
    }
    
    // Show preview
    if (preview) {
      preview.classList.remove('hidden');
      preview.innerHTML = '';
      
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'max-h-48 rounded-lg border';
        preview.appendChild(img);
      } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        audio.className = 'w-full';
        preview.appendChild(audio);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.className = 'max-h-48 rounded-lg border';
        preview.appendChild(video);
      }
    }
    
    // Dispatch event for parent form
    input.dispatchEvent(new CustomEvent('media-selected', { 
      bubbles: true, 
      detail: { file } 
    }));
  });
</script>
```

---

#### 📄 File: `./src/components/questions/OptionsEditor.astro`

```astro
---
// Editor untuk Pilihan Ganda
---

<div id="options-container" class="space-y-4">
  <!-- Option items will be injected here -->
</div>

<button type="button" id="add-option-btn" class="btn btn-outline btn-sm mt-4 w-full border-dashed">
  + Tambah Opsi
</button>

<template id="option-template">
  <div class="option-item flex gap-2 items-start bg-base-200 p-3 rounded-lg">
    <div class="pt-3">
      <input type="radio" name="correct_answer" class="radio radio-primary" title="Tandai sebagai jawaban benar" />
    </div>
    <div class="flex-1 space-y-2">
      <input type="text" class="input input-bordered input-sm w-full option-text" placeholder="Teks Opsi Jawaban" required />
      <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" /> 
        <div class="collapse-title text-xs font-medium min-h-0 py-2">
          Media & HTML (Opsional)
        </div>
        <div class="collapse-content text-sm">
          <textarea class="textarea textarea-bordered textarea-xs w-full mt-2 option-html" placeholder="HTML Content (MathJax/Latex)"></textarea>
          <input type="file" class="file-input file-input-bordered file-input-xs w-full mt-2 option-media" accept="image/*" />
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-ghost btn-xs text-error remove-option">✕</button>
  </div>
</template>

<script>
  const container = document.getElementById('options-container');
  const addBtn = document.getElementById('add-option-btn');
  const template = document.getElementById('option-template') as HTMLTemplateElement;
  
  let optionCount = 0;
  
  function addOption() {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const item = clone.querySelector('.option-item');
    const radio = clone.querySelector('input[type="radio"]') as HTMLInputElement;
    const removeBtn = clone.querySelector('.remove-option');
    
    radio.value = optionCount.toString();
    optionCount++;
    
    removeBtn?.addEventListener('click', () => {
      item?.remove();
    });
    
    container?.appendChild(clone);
  }
  
  addBtn?.addEventListener('click', addOption);
  
  // Add initial options (A, B, C, D)
  for(let i=0; i<4; i++) addOption();
</script>
```

---

#### 📄 File: `./src/components/questions/QuestionEditor.astro`

```astro
---
import MediaUpload from './MediaUpload.astro';
import OptionsEditor from './OptionsEditor.astro';
import Select from '@/components/ui/Select.astro';

interface Props {
  examId: string;
}

const { examId } = Astro.props;
---

<form id="question-form" class="space-y-8">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Konten Soal</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="type"
          label="Tipe Soal"
          options={[
            { value: 'multiple_choice', label: 'Pilihan Ganda' },
            { value: 'multiple_choice_complex', label: 'Pilihan Ganda Kompleks' },
            { value: 'true_false', label: 'Benar/Salah' },
            { value: 'matching', label: 'Menjodohkan' },
            { value: 'short_answer', label: 'Isian Singkat' },
            { value: 'essay', label: 'Uraian / Esai' },
          ]}
          required
        />
        
        <div class="form-control">
          <label class="label"><span class="label-text">Bobot Poin</span></label>
          <input type="number" name="points" value="1" min="0" class="input input-bordered" required />
        </div>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text">Pertanyaan (Teks)</span></label>
        <textarea name="question_text" class="textarea textarea-bordered h-24" required></textarea>
      </div>

      <div class="collapse collapse-arrow bg-base-200 rounded-box">
        <input type="checkbox" /> 
        <div class="collapse-title font-medium">
          Media & Rich Text Editor
        </div>
        <div class="collapse-content">
          <div class="form-control mb-4">
            <label class="label"><span class="label-text">Pertanyaan (HTML / Rich Text)</span></label>
            <textarea name="question_html" class="textarea textarea-bordered font-mono text-sm h-32" placeholder="<p>Gunakan tag HTML atau MathJax...</p>"></textarea>
          </div>
          <MediaUpload id="question-media" label="Media Pendukung Soal" />
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Jawaban</h2>
      
      <!-- Dynamic Answer Section based on Type -->
      <div id="answer-editor-container">
        <div id="editor-multiple_choice">
          <OptionsEditor />
        </div>
        <!-- Other editors would be conditionally shown here -->
      </div>
    </div>
  </div>

  <div class="flex justify-end gap-4">
    <button type="button" class="btn btn-ghost" onclick="history.back()">Batal</button>
    <button type="submit" class="btn btn-primary">Simpan Soal</button>
  </div>
</form>

<script>
  // Logic to handle form submission and type switching
  const typeSelect = document.getElementById('type');
  // Implementation for switching editors would go here
</script>
```

---

#### 📄 File: `./src/components/questions/TagSelector.astro`

```astro
---
interface Props {
  initialTags?: string[];
  name?: string;
}

const { initialTags = [], name = 'tags' } = Astro.props;
---

<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Tags / Kategori</span>
  </label>
  
  <div class="flex flex-wrap gap-2 mb-2" id="tags-container">
    {initialTags.map(tag => (
      <div class="badge badge-primary gap-2">
        {tag}
        <input type="hidden" name={`${name}[]`} value={tag} />
        <button type="button" class="btn btn-ghost btn-xs btn-circle text-white remove-tag">✕</button>
      </div>
    ))}
  </div>

  <div class="flex gap-2">
    <input 
      type="text" 
      id="tag-input" 
      class="input input-bordered input-sm flex-1" 
      placeholder="Ketik tag lalu tekan Enter..." 
    />
    <button type="button" id="add-tag-btn" class="btn btn-sm btn-ghost">Tambah</button>
  </div>
</div>

<script>
  const container = document.getElementById('tags-container');
  const input = document.getElementById('tag-input') as HTMLInputElement;
  const addBtn = document.getElementById('add-tag-btn');

  function createTag(text: string) {
    const div = document.createElement('div');
    div.className = 'badge badge-primary gap-2 animate-fade-in';
    div.innerHTML = `
      ${text}
      <input type="hidden" name="tags[]" value="${text}" />
      <button type="button" class="btn btn-ghost btn-xs btn-circle text-white remove-tag">✕</button>
    `;
    
    div.querySelector('.remove-tag')?.addEventListener('click', () => div.remove());
    return div;
  }

  function addTag() {
    const text = input.value.trim();
    if (text) {
      container?.appendChild(createTag(text));
      input.value = '';
    }
  }

  addBtn?.addEventListener('click', addTag);
  
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  });

  // Setup initial remove buttons
  document.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      (e.target as HTMLElement).closest('.badge')?.remove();
    });
  });
</script>
```

---

#### 📄 File: `./src/components/sync/ChecksumValidator.astro`

```astro
---
// src/components/sync/ChecksumValidator.astro
interface Props {
  data: any;
  expectedChecksum: string;
}

const { data, expectedChecksum } = Astro.props;
---

<div class="checksum-validator">
  <div id="validation-status" class="flex items-center gap-2 text-sm">
    <div class="loading loading-spinner loading-sm"></div>
    <span>Memvalidasi integritas data...</span>
  </div>
</div>

<script define:vars={{ data, expectedChecksum }}>
  import { generateChecksum } from '@/lib/offline/checksum';

  const statusEl = document.getElementById('validation-status');

  async function validate() {
    try {
      const actualChecksum = generateChecksum(data);

      if (actualChecksum === expectedChecksum) {
        if (statusEl) {
          statusEl.innerHTML = `
            <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            <span class="text-success">Data valid</span>
          `;
        }
        window.dispatchEvent(new CustomEvent('checksum:valid'));
      } else {
        if (statusEl) {
          statusEl.innerHTML = `
            <svg class="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-error">Data corrupt!</span>
          `;
        }
        window.dispatchEvent(new CustomEvent('checksum:invalid'));
      }
    } catch (error) {
      console.error('Checksum validation error:', error);
      if (statusEl) {
        statusEl.innerHTML = `
          <svg class="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span class="text-error">Validasi gagal</span>
        `;
      }
    }
  }

  validate();
</script>

```

---

#### 📄 File: `./src/components/sync/DownloadProgress.astro`

```astro
---
// src/components/sync/DownloadProgress.astro
interface Props {
  examId?: number;
}

const { examId } = Astro.props;
---

<div class="modal modal-open">
  <div class="modal-box">
    <h3 class="mb-4 text-lg font-bold">Mengunduh Ujian</h3>

    <div id="progress-container">
      <div class="space-y-4">
        <div id="phase-indicator" class="text-sm text-base-content/70"></div>

        <progress id="progress-bar" class="progress progress-primary w-full" value="0" max="100"
        ></progress>

        <div class="text-center">
          <p id="progress-text" class="text-lg font-bold">0%</p>
          <p id="progress-detail" class="mt-1 text-sm text-base-content/70"></p>
        </div>

        <div id="file-list" class="max-h-40 space-y-1 overflow-y-auto text-xs"></div>
      </div>
    </div>

    <div id="error-container" class="hidden">
      <div class="alert alert-error">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="font-bold">Download Gagal</p>
          <p id="error-message" class="text-sm"></p>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" onclick="window.location.reload()"> Coba Lagi </button>
        <button class="btn" onclick="window.history.back()"> Kembali </button>
      </div>
    </div>

    <div id="success-container" class="hidden">
      <div class="alert alert-success">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Download selesai! Ujian siap dimulai.</span>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" id="start-exam-btn"> Mulai Ujian </button>
      </div>
    </div>
  </div>
</div>

<script>
  import { downloadExam } from '@/lib/offline/download';

  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement;
  const progressText = document.getElementById('progress-text');
  const progressDetail = document.getElementById('progress-detail');
  const phaseIndicator = document.getElementById('phase-indicator');
  const fileList = document.getElementById('file-list');
  const errorContainer = document.getElementById('error-container');
  const successContainer = document.getElementById('success-container');
  const errorMessage = document.getElementById('error-message');

  const examId = parseInt(window.location.pathname.split('/').pop() || '0');

  async function startDownload() {
    try {
      await downloadExam(examId, (progress) => {
        if (progressBar) progressBar.value = progress.percentage;
        if (progressText) progressText.textContent = `${progress.percentage.toFixed(0)}%`;

        const phases = {
          preparing: 'Mempersiapkan...',
          exam_data: 'Mengunduh data ujian...',
          media_files: 'Mengunduh media...',
          complete: 'Selesai!',
        };

        if (phaseIndicator) phaseIndicator.textContent = phases[progress.phase];

        if (progress.phase === 'media_files' && progress.currentFile) {
          if (progressDetail) {
            progressDetail.textContent = `File ${progress.current} dari ${progress.total}`;
          }

          if (fileList) {
            const fileItem = document.createElement('div');
            fileItem.className = 'text-success flex items-center gap-1';
            fileItem.innerHTML = `
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span>${progress.currentFile.split('/').pop()}</span>
            `;
            fileList.appendChild(fileItem);
            fileList.scrollTop = fileList.scrollHeight;
          }
        }

        if (progress.phase === 'complete') {
          setTimeout(() => {
            document.getElementById('progress-container')?.classList.add('hidden');
            successContainer?.classList.remove('hidden');
          }, 500);
        }
      });
    } catch (error: any) {
      console.error('Download error:', error);
      document.getElementById('progress-container')?.classList.add('hidden');
      errorContainer?.classList.remove('hidden');
      if (errorMessage) {
        errorMessage.textContent = error.message || 'Terjadi kesalahan saat download';
      }
    }
  }

  document.getElementById('start-exam-btn')?.addEventListener('click', () => {
    window.location.href = `/siswa/ujian/${examId}`;
  });

  startDownload();
</script>

```

---

#### 📄 File: `./src/components/sync/SyncStatus.astro`

```astro
---
// src/components/sync/SyncStatus.astro
---

<div class="sync-status" id="sync-status">
  <div class="flex items-center gap-2 text-sm">
    <div id="sync-icon" class="h-4 w-4"></div>
    <span id="sync-text">Tersinkron</span>
  </div>

  <div id="sync-details" class="mt-2 hidden">
    <div class="space-y-1 text-xs">
      <div class="flex justify-between">
        <span>Selesai:</span>
        <span id="sync-completed" class="font-bold">0</span>
      </div>
      <div class="flex justify-between">
        <span>Pending:</span>
        <span id="sync-pending">0</span>
      </div>
      <div class="flex justify-between">
        <span>Gagal:</span>
        <span id="sync-failed" class="text-error">0</span>
      </div>
    </div>
    <progress id="sync-progress" class="progress-sm progress mt-2 w-full" value="0" max="100"
    ></progress>
  </div>
</div>

<script>
  import { $syncStore } from '@/stores/sync';
  import { syncManager } from '@/lib/offline/sync';

  const syncIcon = document.getElementById('sync-icon');
  const syncText = document.getElementById('sync-text');
  const syncDetails = document.getElementById('sync-details');
  const syncCompleted = document.getElementById('sync-completed');
  const syncPending = document.getElementById('sync-pending');
  const syncFailed = document.getElementById('sync-failed');
  const syncProgress = document.getElementById('sync-progress') as HTMLProgressElement;

  const icons = {
    idle: `<svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>`,
    syncing: `<svg class="w-4 h-4 text-info animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    error: `<svg class="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
  };

  $syncStore.subscribe((state) => {
    if (!syncIcon || !syncText) return;

    if (state.isSyncing) {
      syncIcon.innerHTML = icons.syncing;
      syncText.textContent = 'Menyinkronkan...';
      syncDetails?.classList.remove('hidden');
    } else if (state.error) {
      syncIcon.innerHTML = icons.error;
      syncText.textContent = 'Gagal sinkronisasi';
      syncDetails?.classList.remove('hidden');
    } else {
      syncIcon.innerHTML = icons.idle;
      syncText.textContent = 'Tersinkron';
      syncDetails?.classList.add('hidden');
    }

    if (state.progress) {
      if (syncCompleted) syncCompleted.textContent = state.progress.completed.toString();
      if (syncPending) syncPending.textContent = state.progress.pending.toString();
      if (syncFailed) syncFailed.textContent = state.progress.failed.toString();
      if (syncProgress) syncProgress.value = state.progress.percentage;
    }
  });

  syncManager.start();
</script>

```

---

#### 📄 File: `./src/components/sync/UploadQueue.astro`

```astro
---
// src/components/sync/UploadQueue.astro
---

<div class="upload-queue">
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-bold">Antrian Upload</h3>
    <button id="retry-all-btn" class="btn btn-sm btn-ghost">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      Retry Semua
    </button>
  </div>
  
  <div id="queue-list" class="space-y-2 max-h-96 overflow-y-auto"></div>
  
  <div id="empty-state" class="text-center py-8 text-base-content/50">
    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <p>Tidak ada item dalam antrian</p>
  </div>
</div>

<script>
  import { db } from '@/lib/db/schema';
  
  const queueList = document.getElementById('queue-list');
  const emptyState = document.getElementById('empty-state');
  
  async function loadQueue() {
    const items = await db.sync_queue
      .where('status')
      .anyOf(['pending', 'failed', 'processing'])
      .sortBy('created_at');
    
    if (!queueList) return;
    
    if (items.length === 0) {
      queueList.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      return;
    }
    
    queueList.classList.remove('hidden');
    emptyState?.classList.add('hidden');
    
    queueList.innerHTML = items.map(item => {
      const statusBadge = {
        pending: '<span class="badge badge-warning badge-sm">Pending</span>',
        processing: '<span class="badge badge-info badge-sm">Processing</span>',
        failed: '<span class="badge badge-error badge-sm">Failed</span>'
      }[item.status];
      
      const typeLabel = {
        answer: 'Jawaban',
        media: 'Media',
        activity: 'Aktivitas',
        submission: 'Submission'
      }[item.type];
      
      return `
        <div class="card bg-base-200 card-compact">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-semibold text-sm">${typeLabel}</p>
                <p class="text-xs text-base-content/70">
                  Attempt ID: ${item.attempt_id}
                </p>
                {item.error_message && `
                  <p class="text-xs text-error mt-1">${item.error_message}</p>
                `}
              </div>
              <div class="flex flex-col items-end gap-1">
                ${statusBadge}
                <span class="text-xs text-base-content/50">
                  Retry: ${item.retry_count}/${item.max_retries}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  document.getElementById('retry-all-btn')?.addEventListener('click', async () => {
    await db.sync_queue
      .where('status')
      .equals('failed')
      .modify({ status: 'pending', retry_count: 0 });
    
    loadQueue();
    window.dispatchEvent(new CustomEvent('sync:retry-all'));
  });
  
  loadQueue();
  
  window.addEventListener('sync:progress', () => {
    loadQueue();
  });
</script>
```

---

#### 📄 File: `./src/components/ui/Alert.astro`

```astro
---
// src/components/ui/Alert.astro
interface Props {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  class?: string;
}

const {
  type = 'info',
  title,
  dismissible = false,
  class: className = '',
} = Astro.props;

const typeClass = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}[type];
---

<div class:list={['alert', typeClass, className]} role="alert">
  <div class="flex-1">
    {title && <h3 class="font-bold">{title}</h3>}
    <div class="text-sm">
      <slot />
    </div>
  </div>
  
  {dismissible && (
    <button class="btn btn-sm btn-ghost" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Badge.astro`

```astro
---
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  outline?: boolean;
  class?: string;
}

const {
  variant = 'neutral',
  size = 'md',
  outline = false,
  class: className = '',
} = Astro.props;

const variantClass = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  ghost: 'badge-ghost',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  neutral: 'badge-neutral',
}[variant];

const sizeClass = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
}[size];
---

<div class:list={[
  'badge',
  variantClass,
  sizeClass,
  { 'badge-outline': outline },
  className
]}>
  <slot />
</div>
```

---

#### 📄 File: `./src/components/ui/Button.astro`

```astro
---
// src/components/ui/Button.astro
interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'error' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  class?: string;
}

const {
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  class: className = '',
} = Astro.props;

const variantClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  link: 'btn-link',
  error: 'btn-error',
  success: 'btn-success',
}[variant];

const sizeClass = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}[size];
---

<button
  type={type}
  class:list={[
    'btn',
    variantClass,
    sizeClass,
    { 'btn-block': block },
    { 'loading': loading },
    className,
  ]}
  disabled={disabled || loading}
>
  <slot />
</button>
```

---

#### 📄 File: `./src/components/ui/Card.astro`

```astro
---
// src/components/ui/Card.astro
interface Props {
  title?: string;
  bordered?: boolean;
  compact?: boolean;
  class?: string;
}

const {
  title,
  bordered = false,
  compact = false,
  class: className = '',
} = Astro.props;
---

<div class:list={[
  'card bg-base-100',
  { 'card-bordered': bordered },
  { 'card-compact': compact },
  'shadow-xl',
  className,
]}>
  {title && (
    <div class="card-body">
      <h2 class="card-title">{title}</h2>
      <slot />
    </div>
  )}
  
  {!title && (
    <div class="card-body">
      <slot />
    </div>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Input.astro`

```astro
---
// src/components/ui/Input.astro
interface Props {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
}

const {
  type = 'text',
  name,
  label,
  placeholder,
  value,
  required = false,
  disabled = false,
  error,
  class: className = '',
} = Astro.props;
---

<div class:list={['form-control', className]}>
  {label && (
    <label class="label" for={name}>
      <span class="label-text">
        {label}
        {required && <span class="text-error ml-1">*</span>}
      </span>
    </label>
  )}
  
  <input
    type={type}
    id={name}
    name={name}
    placeholder={placeholder}
    value={value}
    required={required}
    disabled={disabled}
    class:list={[
      'input input-bordered',
      { 'input-error': error },
    ]}
  />
  
  {error && (
    <label class="label">
      <span class="label-text-alt text-error">{error}</span>
    </label>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Loading.astro`

```astro
---
// src/components/ui/Loading.astro
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const {
  size = 'md',
  text,
  fullscreen = false,
} = Astro.props;

const sizeClass = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}[size];
---

{fullscreen ? (
  <div class="fixed inset-0 bg-base-200/80 flex items-center justify-center z-50">
    <div class="text-center">
      <span class:list={['loading loading-spinner', sizeClass]}></span>
      {text && <p class="mt-4 text-base-content">{text}</p>}
    </div>
  </div>
) : (
  <div class="flex items-center gap-2">
    <span class:list={['loading loading-spinner', sizeClass]}></span>
    {text && <span>{text}</span>}
  </div>
)}
```

---

#### 📄 File: `./src/components/ui/Modal.astro`

```astro
---
interface Props {
  id: string;
  title?: string;
  open?: boolean;
  closeOnClickOutside?: boolean;
}

const { id, title, open = false, closeOnClickOutside = true } = Astro.props;
---

<dialog id={id} class="modal" open={open}>
  <div class="modal-box">
    {closeOnClickOutside && (
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
    )}
    
    {title && <h3 class="font-bold text-lg mb-4">{title}</h3>}
    
    <div class="modal-content">
      <slot />
    </div>
    
    <div class="modal-action">
      <slot name="actions" />
    </div>
  </div>
  
  {closeOnClickOutside && (
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  )}
</dialog>
```

---

#### 📄 File: `./src/components/ui/Select.astro`

```astro
---
interface Props {
  name: string;
  label?: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
}

const {
  name,
  label,
  options,
  value,
  placeholder = 'Pilih salah satu...',
  required = false,
  disabled = false,
  error,
  class: className = '',
} = Astro.props;
---

<div class:list={['form-control', className]}>
  {label && (
    <label class="label" for={name}>
      <span class="label-text">
        {label}
        {required && <span class="text-error ml-1">*</span>}
      </span>
    </label>
  )}
  
  <select
    id={name}
    name={name}
    required={required}
    disabled={disabled}
    class:list={[
      'select select-bordered w-full',
      { 'select-error': error },
    ]}
  >
    <option value="" disabled selected={!value}>{placeholder}</option>
    {options.map((opt) => (
      <option value={opt.value} selected={opt.value === value} disabled={opt.disabled}>
        {opt.label}
      </option>
    ))}
  </select>
  
  {error && (
    <label class="label">
      <span class="label-text-alt text-error">{error}</span>
    </label>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Spinner.astro`

```astro
---
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  class?: string;
}

const { size = 'md', variant, class: className = '' } = Astro.props;

const sizeClass = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}[size];

const variantClass = variant ? `text-${variant}` : '';
---

<span class:list={['loading loading-spinner', sizeClass, variantClass, className]}></span>
```

---

#### 📄 File: `./src/components/ui/Table.astro`

```astro
---
interface Props {
  compact?: boolean;
  zebra?: boolean;
  class?: string;
}

const { compact = false, zebra = false, class: className = '' } = Astro.props;
---

<div class="overflow-x-auto">
  <table class:list={[
    'table',
    { 'table-xs': compact },
    { 'table-zebra': zebra },
    className
  ]}>
    <slot />
  </table>
</div>
```

---

#### 📄 File: `./src/components/ui/Tabs.astro`

```astro
---
interface Props {
  items: Array<{ id: string; label: string; active?: boolean }>;
  boxed?: boolean;
  bordered?: boolean;
  lifted?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  class?: string;
}

const { items, boxed, bordered, lifted, size, class: className = '' } = Astro.props;

const sizeClass = size ? `tabs-${size}` : '';
---

<div role="tablist" class:list={[
  'tabs',
  { 'tabs-boxed': boxed },
  { 'tabs-bordered': bordered },
  { 'tabs-lifted': lifted },
  sizeClass,
  className
]}>
  {items.map((item) => (
    <a
      role="tab"
      href={`#${item.id}`}
      class:list={['tab', { 'tab-active': item.active }]}
      data-tab-target={item.id}
    >
      {item.label}
    </a>
  ))}
</div>

<div class="tab-content-container mt-4">
  <slot />
</div>

<script>
  // Simple tab switching logic
  const tabs = document.querySelectorAll('[data-tab-target]');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all tabs in this group
      const parent = tab.parentElement;
      parent?.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
      
      // Add active class to clicked tab
      tab.classList.add('tab-active');
      
      // Hide all contents
      const targetId = tab.getAttribute('data-tab-target');
      const container = parent?.nextElementSibling;
      
      if (container) {
        // Assuming slot content has ids matching tab targets
        const contents = container.children;
        Array.from(contents).forEach((content) => {
          if (content.id === targetId) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      }
    });
  });
</script>
```

---

#### 📄 File: `./src/components/ui/Toast.astro`

```astro
---
// src/components/ui/Toast.astro
---

<div id="toast-container" class="toast toast-top toast-end z-50">
  <!-- Toasts will be injected here by store -->
</div>

<script>
  import { $toastStore, removeToast } from '@/stores/toast';

  const container = document.getElementById('toast-container');

  $toastStore.subscribe((state) => {
    if (!container) return;

    // Clear current toasts to prevent duplicates (simple implementation)
    // In a real React/Preact app this would be handled by VDOM
    container.innerHTML = '';

    state.messages.forEach((msg) => {
      const alertClass = {
        info: 'alert-info',
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-error',
      }[msg.type];

      const toastEl = document.createElement('div');
      toastEl.className = `alert ${alertClass} shadow-lg min-w-[300px] animate-slide-in`;
      toastEl.innerHTML = `
        <div>
          <span>${msg.message}</span>
        </div>
        <button class="btn btn-ghost btn-xs" data-dismiss="${msg.id}">✕</button>
      `;

      container.appendChild(toastEl);

      // Setup dismiss button
      toastEl.querySelector(`[data-dismiss="${msg.id}"]`)?.addEventListener('click', () => {
        removeToast(msg.id);
      });
    });
  });
</script>
```

---

#### 📄 File: `./src/components/ui/Tooltip.astro`

```astro
---
interface Props {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  class?: string;
}

const { text, position = 'top', class: className = '' } = Astro.props;
---

<div class:list={['tooltip', `tooltip-${position}`, className]} data-tip={text}>
  <slot />
</div>
```

---

### 📂 Sub-direktori: src/pages

#### 📄 File: `./src/pages/api/health.ts`

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};
```

---

#### 📄 File: `./src/pages/guru/dashboard.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import DashboardStats from '@/components/analytics/DashboardStats.astro';

// SSR Placeholder data
const stats = {
  totalExams: 12,
  activeExams: 3,
  completedExams: 150,
  averageScore: 78.5
};
---

<DashboardLayout title="Dashboard Guru" role="guru">
  <div class="space-y-8">
    <DashboardStats stats={stats} />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Aksi Cepat</h2>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <a href="/guru/soal/create" class="btn btn-outline btn-primary h-auto py-4 flex flex-col gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Buat Soal Baru
            </a>
            <a href="/guru/ujian/create" class="btn btn-outline btn-secondary h-auto py-4 flex flex-col gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Jadwalkan Ujian
            </a>
            <a href="/guru/grading" class="btn btn-outline btn-accent h-auto py-4 flex flex-col gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Koreksi Esai
            </a>
            <a href="/guru/hasil" class="btn btn-outline h-auto py-4 flex flex-col gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Lihat Hasil
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Ujian Aktif</h2>
          <ul class="menu bg-base-200 w-full rounded-box">
            <li>
              <a class="flex justify-between">
                <span>Matematika X-A</span>
                <span class="badge badge-success">Berjalan</span>
              </a>
            </li>
            <li>
              <a class="flex justify-between">
                <span>Biologi XI-IPA</span>
                <span class="badge badge-warning">Selesai</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/grading/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

// Mock Data
const pendingGrading = [
  { attemptId: 501, student: 'Budi Santoso', exam: 'Biologi XI-IPA', submittedAt: '2024-01-20 10:30', ungradedCount: 3 },
  { attemptId: 502, student: 'Siti Aminah', exam: 'Biologi XI-IPA', submittedAt: '2024-01-20 10:35', ungradedCount: 3 },
];
---

<DashboardLayout title="Koreksi Jawaban (Grading)" role="guru">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="alert alert-info shadow-sm mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Menampilkan daftar siswa yang memiliki jawaban Esai/Audio/Video yang belum dinilai.</span>
      </div>

      <Table zebra>
        <thead>
          <tr>
            <th>Siswa</th>
            <th>Ujian</th>
            <th>Waktu Submit</th>
            <th>Belum Dinilai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pendingGrading.map((item) => (
            <tr>
              <td class="font-semibold">{item.student}</td>
              <td>{item.exam}</td>
              <td>{item.submittedAt}</td>
              <td>
                <span class="badge badge-warning">{item.ungradedCount} soal</span>
              </td>
              <td>
                <a href={`/guru/grading/${item.attemptId}`} class="btn btn-sm btn-primary">
                  Mulai Koreksi
                </a>
              </td>
            </tr>
          ))}
          {pendingGrading.length === 0 && (
            <tr>
              <td colspan="5" class="text-center py-8 text-base-content/50">Tidak ada jawaban yang perlu dikoreksi.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/grading/[attemptId].astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import ManualGradingCard from '@/components/grading/ManualGradingCard.astro';

const { attemptId } = Astro.params;

// Mock Data Fetching (Replace with API call)
const attemptData = {
  id: Number(attemptId),
  student_name: 'Budi Santoso',
  student_id: '12345',
};

const questionsToGrade = [
  {
    question: { 
      id: 1, 
      question_text: 'Jelaskan dampak pemanasan global!', 
      type: 'essay', 
      points: 10 
    },
    answer: { 
      id: 101, 
      answer_text: 'Dampaknya adalah suhu bumi meningkat dan es mencair.' 
    }
  },
  {
    question: { 
      id: 2, 
      question_text: 'Bacakan Surah Al-Fatihah', 
      type: 'essay', 
      points: 20 
    },
    answer: { 
      id: 102, 
      answer_media_url: '/sample-audio.mp3', 
      answer_media_type: 'audio' 
    }
  }
];
---

<DashboardLayout title={`Koreksi: ${attemptData.student_name}`} role="guru">
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <a href="/guru/grading" class="btn btn-ghost gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Kembali ke Daftar
      </a>
      <div class="text-sm">
        Progress: <span id="grading-progress">1</span> / {questionsToGrade.length}
      </div>
    </div>

    <div id="grading-container">
      <!-- Only show first question initially, JS handles navigation -->
      {questionsToGrade.map((item, index) => (
        <div class={`grading-item ${index !== 0 ? 'hidden' : ''}`} data-index={index}>
          <ManualGradingCard 
            attempt={attemptData}
            question={item.question}
            answer={item.answer as any}
          />
        </div>
      ))}
    </div>

    <div id="completion-message" class="hidden card bg-base-100 shadow-xl text-center p-8">
      <h3 class="text-xl font-bold text-success mb-4">Semua soal telah dinilai!</h3>
      <button id="finish-grading-btn" class="btn btn-primary">Simpan & Selesai</button>
    </div>
  </div>

  <script>
    import { submitGrade, finishGradingAttempt } from '@/lib/api/grading';

    let currentIndex = 0;
    const items = document.querySelectorAll('.grading-item');
    const total = items.length;
    const attemptId = window.location.pathname.split('/').pop();

    window.addEventListener('rubric-selected', async (e: any) => {
      // Handle rubric selection (update local state)
      console.log('Score selected:', e.detail);
    });

    window.addEventListener('save-grade', async () => {
      // Logic to save grade to API
      // await submitGrade(...)
      
      // Move to next
      items[currentIndex].classList.add('hidden');
      currentIndex++;
      
      if (currentIndex < total) {
        items[currentIndex].classList.remove('hidden');
        document.getElementById('grading-progress')!.textContent = (currentIndex + 1).toString();
      } else {
        document.getElementById('grading-container')!.classList.add('hidden');
        document.getElementById('completion-message')!.classList.remove('hidden');
      }
    });

    document.getElementById('finish-grading-btn')?.addEventListener('click', async () => {
      if(attemptId) {
        await finishGradingAttempt(parseInt(attemptId));
        window.location.href = '/guru/grading';
      }
    });
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/hasil.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/soal/create.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import QuestionEditor from '@/components/questions/QuestionEditor.astro';

// Get exam_id from query param if adding to specific exam directly
const examId = Astro.url.searchParams.get('exam_id') || '';
---

<DashboardLayout title="Buat Soal Baru" role="guru">
  <div class="max-w-4xl mx-auto">
    <div class="text-sm breadcrumbs mb-4">
      <ul>
        <li><a href="/guru/dashboard">Dashboard</a></li>
        <li><a href="/guru/soal">Bank Soal</a></li>
        <li>Buat Baru</li>
      </ul>
    </div>

    <QuestionEditor examId={examId} />
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/soal/import.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
---

<DashboardLayout title="Import Soal dari Excel" role="guru">
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Upload Bank Soal</h2>
        
        <div class="alert alert-info mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="font-bold">Format Excel</h3>
            <div class="text-xs">Pastikan format sesuai template. Gambar harus diupload terpisah atau via URL.</div>
            <a href="/templates/template_soal.xlsx" class="link link-primary text-xs font-bold">Download Template Soal</a>
          </div>
        </div>

        <form id="import-form" class="space-y-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Pilih File Excel (.xlsx)</span>
            </label>
            <input type="file" name="file" class="file-input file-input-bordered w-full" accept=".xlsx,.xls" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Bank Soal Tujuan (Opsional)</span>
            </label>
            <select name="exam_id" class="select select-bordered">
              <option value="">Buat Bank Soal Baru</option>
              <option value="1">Matematika X-A</option>
              <option value="2">Biologi XI-IPA</option>
            </select>
          </div>

          <div class="card-actions justify-end">
            <a href="/guru/soal" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">
              <span class="loading loading-spinner loading-sm hidden" id="loading-spinner"></span>
              Upload & Proses
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script>
    import { importQuestions } from '@/lib/api/question';

    const form = document.getElementById('import-form') as HTMLFormElement;
    const spinner = document.getElementById('loading-spinner');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const file = formData.get('file') as File;
      const examId = formData.get('exam_id') ? parseInt(formData.get('exam_id') as string) : undefined;

      if (!file) return;

      try {
        spinner?.classList.remove('hidden');
        await importQuestions(file, examId);
        alert('Import berhasil!');
        window.location.href = '/guru/soal';
      } catch (error) {
        console.error(error);
        alert('Gagal mengimport soal.');
      } finally {
        spinner?.classList.add('hidden');
      }
    });
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/soal/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

// Mock Data
const questions = [
  { id: 101, text: 'Apa ibukota Indonesia?', type: 'multiple_choice', points: 5, tags: ['Geografi', 'Mudah'] },
  { id: 102, text: 'Jelaskan proses fotosintesis.', type: 'essay', points: 10, tags: ['Biologi', 'Sukar'] },
];
---

<DashboardLayout title="Bank Soal" role="guru">
  <div slot="actions" class="flex gap-2">
    <a href="/guru/soal/import" class="btn btn-secondary btn-sm">Import Excel</a>
    <a href="/guru/soal/create" class="btn btn-primary btn-sm">+ Buat Soal</a>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <input type="text" placeholder="Cari pertanyaan..." class="input input-bordered w-full" />
        <select class="select select-bordered w-full md:w-48">
          <option value="">Semua Tipe</option>
          <option value="multiple_choice">Pilihan Ganda</option>
          <option value="essay">Esai</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <th class="w-12">ID</th>
            <th>Pertanyaan</th>
            <th>Tipe</th>
            <th>Tags</th>
            <th>Poin</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr>
              <td>{q.id}</td>
              <td>
                <div class="line-clamp-2">{q.text}</div>
              </td>
              <td>
                <div class="badge badge-outline text-xs">{q.type}</div>
              </td>
              <td>
                <div class="flex gap-1 flex-wrap">
                  {q.tags.map(tag => <span class="badge badge-ghost badge-xs">{tag}</span>)}
                </div>
              </td>
              <td>{q.points}</td>
              <td>
                <a href={`/guru/soal/${q.id}/edit`} class="btn btn-square btn-xs btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/soal/[id]/edit.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import QuestionEditor from '@/components/questions/QuestionEditor.astro';

const { id } = Astro.params;
const questionId = id; 
---

<DashboardLayout title="Edit Soal" role="guru">
  <div class="max-w-4xl mx-auto">
    <div class="text-sm breadcrumbs mb-4">
      <ul>
        <li><a href="/guru/dashboard">Dashboard</a></li>
        <li><a href="/guru/soal">Bank Soal</a></li>
        <li>Edit Soal #{questionId}</li>
      </ul>
    </div>

    <!-- 
      Di aplikasi nyata, kita akan fetch data soal berdasarkan ID di sini (SSR)
      lalu mengirimkannya sebagai props ke QuestionEditor untuk pre-fill data.
    -->
    <QuestionEditor examId="" /> 
    
    <script>
      // Simulasi load data untuk edit
      console.log('Mode Edit aktif');
    </script>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/ujian/create.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';
import Button from '@/components/ui/Button.astro';
---

<DashboardLayout title="Buat Jadwal Ujian" role="guru">
  <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto">
    <div class="card-body">
      <form id="create-exam-form" class="space-y-6">
        
        <Input 
          name="title" 
          label="Nama Ujian" 
          placeholder="Contoh: Penilaian Akhir Semester Ganjil" 
          required 
        />

        <div class="form-control">
          <label class="label"><span class="label-text">Deskripsi</span></label>
          <textarea name="description" class="textarea textarea-bordered h-24"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            type="number" 
            name="duration_minutes" 
            label="Durasi (Menit)" 
            value="90" 
            required 
          />
          <Input 
            type="number" 
            name="passing_score" 
            label="KKM / Passing Grade" 
            value="75" 
            required 
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            type="datetime-local" 
            name="window_start_at" 
            label="Waktu Mulai" 
            required 
          />
          <Input 
            type="datetime-local" 
            name="window_end_at" 
            label="Waktu Selesai" 
            required 
          />
        </div>

        <div class="divider">Pengaturan Tambahan</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" name="randomize_questions" class="toggle toggle-primary" checked />
            <span class="label-text">Acak Soal</span>
          </label>

          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" name="show_results" class="toggle toggle-primary" />
            <span class="label-text">Tampilkan Nilai Setelah Selesai</span>
          </label>
          
          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" name="prevent_tab_switch" class="toggle toggle-error" checked />
            <span class="label-text">Cegah Pindah Tab (Security)</span>
          </label>
        </div>

        <div class="card-actions justify-end mt-8">
          <Button type="button" variant="ghost" onclick="history.back()">Batal</Button>
          <Button type="submit" variant="primary">Simpan & Lanjut ke Soal</Button>
        </div>
      </form>
    </div>
  </div>

  <script>
    import { apiClient } from '@/lib/api/client';

    const form = document.getElementById('create-exam-form') as HTMLFormElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Convert checkboxes
      data.randomize_questions = form.randomize_questions.checked;
      data.show_results = form.show_results.checked;

      try {
        const response = await apiClient.post('/teacher/exams', data);
        const newExamId = response.data.id;
        // Redirect to add questions
        window.location.href = `/guru/soal/create?exam_id=${newExamId}`;
      } catch (error) {
        alert('Gagal membuat ujian. Periksa input Anda.');
        console.error(error);
      }
    });
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/ujian/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';
import Button from '@/components/ui/Button.astro';

// Mock Data (Server Fetch in real app)
const exams = [
  { id: 1, title: 'Matematika Dasar', class: 'X-IPA', start: '2024-01-20 08:00', status: 'active', participants: 32 },
  { id: 2, title: 'Bahasa Indonesia', class: 'XI-IPS', start: '2024-01-21 10:00', status: 'scheduled', participants: 0 },
];
---

<DashboardLayout title="Manajemen Ujian" role="guru">
  <div slot="actions">
    <a href="/guru/ujian/create" class="btn btn-primary btn-sm">+ Jadwal Baru</a>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-2 mb-4">
        <input type="text" placeholder="Cari ujian..." class="input input-bordered w-full max-w-xs" />
        <select class="select select-bordered">
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Terjadwal</option>
          <option>Selesai</option>
        </select>
      </div>

      <Table zebra>
        <thead>
          <tr>
            <th>Judul</th>
            <th>Kelas</th>
            <th>Waktu Mulai</th>
            <th>Peserta</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr>
              <td class="font-bold">{exam.title}</td>
              <td>{exam.class}</td>
              <td>{exam.start}</td>
              <td>{exam.participants}</td>
              <td>
                <span class={`badge ${exam.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                  {exam.status}
                </span>
              </td>
              <td class="flex gap-2">
                <a href={`/guru/ujian/${exam.id}/edit`} class="btn btn-xs btn-ghost">Edit</a>
                <a href={`/guru/ujian/${exam.id}/preview`} class="btn btn-xs btn-ghost">Preview</a>
                <a href={`/guru/ujian/${exam.id}/statistics`} class="btn btn-xs btn-ghost">Stats</a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/ujian/[id]/edit.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';
import Button from '@/components/ui/Button.astro';

const { id } = Astro.params;
---

<DashboardLayout title="Edit Jadwal Ujian" role="guru">
  <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto">
    <div class="card-body">
      <h2 class="card-title mb-6">Edit Ujian #{id}</h2>
      
      <form id="edit-exam-form" class="space-y-6">
        <Input 
          name="title" 
          label="Nama Ujian" 
          value="Matematika Dasar" 
          required 
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            type="number" 
            name="duration_minutes" 
            label="Durasi (Menit)" 
            value="90" 
            required 
          />
          <Input 
            type="number" 
            name="passing_score" 
            label="KKM" 
            value="75" 
            required 
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            type="datetime-local" 
            name="window_start_at" 
            label="Waktu Mulai" 
            value="2024-01-20T08:00"
            required 
          />
          <Input 
            type="datetime-local" 
            name="window_end_at" 
            label="Waktu Selesai" 
            value="2024-01-20T10:00"
            required 
          />
        </div>

        <div class="card-actions justify-end mt-8">
          <Button type="button" variant="ghost" onclick="history.back()">Batal</Button>
          <Button type="submit" variant="primary">Simpan Perubahan</Button>
        </div>
      </form>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/ujian/[id]/preview.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import MultipleChoice from '@/components/exam/QuestionTypes/MultipleChoice.astro';
import Essay from '@/components/exam/QuestionTypes/Essay.astro';

const { id } = Astro.params;

// Mock Data Fetching
const exam = { title: 'Preview: Matematika Dasar' };
const questions = [
  { id: 1, type: 'multiple_choice', question_text: '1 + 1 = ?', options: [{id:1, option_text:'2'}, {id:2, option_text:'3'}] },
  { id: 2, type: 'essay', question_text: 'Jelaskan teori relativitas!' }
];
---

<DashboardLayout title={exam.title} role="guru">
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <span>Mode Preview: Jawaban tidak akan disimpan.</span>
    </div>

    {questions.map((q, index) => (
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="badge badge-neutral mb-2">Soal No. {index + 1}</div>
          {q.type === 'multiple_choice' && <MultipleChoice question={q as any} readonly={true} />}
          {q.type === 'essay' && <Essay question={q as any} readonly={true} />}
        </div>
      </div>
    ))}

    <div class="flex justify-center">
      <button onclick="history.back()" class="btn btn-primary">Kembali</button>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/guru/ujian/[id]/statistics.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import ExamStatistics from '@/components/analytics/ExamStatistics.astro';
import ItemAnalysisChart from '@/components/analytics/ItemAnalysisChart.astro';

const { id } = Astro.params;
const examId = parseInt(id || '0');

// Mock Data
const stats = {
  totalParticipants: 32,
  submitted: 30,
  averageScore: 78.5,
  highestScore: 95,
  lowestScore: 45,
  passingRate: 85,
  averageTime: 3600
};

const itemAnalysis = [
  { id: 1, number: 1, difficulty: 0.8, discrimination: 0.4, type: 'PG' },
  { id: 2, number: 2, difficulty: 0.2, discrimination: 0.1, type: 'PG' }, // Hard, low discrimination
  { id: 3, number: 3, difficulty: 0.5, discrimination: 0.6, type: 'Essay' },
];
---

<DashboardLayout title="Statistik Ujian" role="guru">
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Analisis Hasil</h2>
      <button class="btn btn-outline btn-sm gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Export Excel
      </button>
    </div>

    <ExamStatistics examId={examId} statistics={stats} />
    
    <div class="divider">Analisis Butir Soal</div>
    
    <ItemAnalysisChart examId={examId} questions={itemAnalysis} />
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/index.astro`

```astro
---
// src/pages/index.astro
---

<script>
  import { $authStore } from '@/stores/auth';
  
  const authState = $authStore.get();
  
  if (!authState.isAuthenticated) {
    window.location.href = '/login';
  } else {
    const role = authState.user?.role;
    
    switch (role) {
      case 'siswa':
        window.location.href = '/siswa/dashboard';
        break;
      case 'guru':
        window.location.href = '/guru/dashboard';
        break;
      case 'pengawas':
        window.location.href = '/pengawas/dashboard';
        break;
      case 'operator':
        window.location.href = '/operator/dashboard';
        break;
      case 'superadmin':
        window.location.href = '/superadmin/dashboard';
        break;
      default:
        window.location.href = '/login';
    }
  }
</script>
```

---

#### 📄 File: `./src/pages/login.astro`

```astro
---
// src/pages/login.astro
import Base from '@/layouts/Base.astro';
import Button from '@/components/ui/Button.astro';
import Input from '@/components/ui/Input.astro';
import Alert from '@/components/ui/Alert.astro';
---

<Base title="Login - Sistem Ujian">
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-4">
          Sistem Ujian Sekolah
        </h2>
        
        <div id="error-alert" class="hidden mb-4">
          <Alert type="error" dismissible>
            <span id="error-message"></span>
          </Alert>
        </div>
        
        <form id="login-form">
          <Input
            name="username"
            label="Username"
            placeholder="Masukkan username"
            required
          />
          
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Masukkan password"
            required
            class="mt-4"
          />
          
          <div class="form-control mt-6">
            <Button type="submit" block>
              <span id="login-text">Login</span>
              <span id="login-loading" class="loading loading-spinner loading-sm hidden"></span>
            </Button>
          </div>
        </form>
        
        <div class="text-center mt-4 text-sm text-base-content/70">
          <p>Pastikan koneksi internet stabil untuk login pertama kali</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    import { login } from '@/lib/api/auth';
    
    const form = document.getElementById('login-form') as HTMLFormElement;
    const errorAlert = document.getElementById('error-alert') as HTMLElement;
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    const loginText = document.getElementById('login-text') as HTMLElement;
    const loginLoading = document.getElementById('login-loading') as HTMLElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      errorAlert.classList.add('hidden');
      submitBtn.disabled = true;
      loginText.classList.add('hidden');
      loginLoading.classList.remove('hidden');
      
      const formData = new FormData(form);
      const credentials = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      };
      
      try {
        await login(credentials);
        
        window.location.href = '/siswa/dashboard';
      } catch (error: any) {
        errorMessage.textContent = error.response?.data?.error || 'Login gagal. Periksa username dan password Anda.';
        errorAlert.classList.remove('hidden');
        
        submitBtn.disabled = false;
        loginText.classList.remove('hidden');
        loginLoading.classList.add('hidden');
      }
    });
  </script>
</Base>
```

---

#### 📄 File: `./src/pages/offline.astro`

```astro
---
import MainLayout from '@/layouts/Auth.astro';
---

<MainLayout title="Offline - Tidak Ada Koneksi">
  <div class="text-center">
    <div class="mb-6 inline-block p-4 bg-base-200 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </div>
    
    <h1 class="text-3xl font-bold mb-2">Anda Sedang Offline</h1>
    <p class="mb-8 text-base-content/70">Koneksi internet terputus. Beberapa fitur mungkin tidak tersedia.</p>
    
    <div class="space-y-3">
      <a href="/siswa/dashboard" class="btn btn-primary w-full">
        Ke Dashboard (Mode Offline)
      </a>
      <button onclick="window.location.reload()" class="btn btn-ghost w-full">
        Coba Lagi
      </button>
    </div>
  </div>
</MainLayout>
```

---

#### 📄 File: `./src/pages/operator/dashboard.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import DashboardStats from '@/components/analytics/DashboardStats.astro';

// Mock Stats
const stats = {
  totalExams: 45,
  activeExams: 2,
  completedExams: 43,
  averageScore: 0 // Not relevant for operator usually
};
---

<DashboardLayout title="Dashboard Operator" role="operator">
  <div class="space-y-6">
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Total Siswa</div>
        <div class="stat-value">1,204</div>
        <div class="stat-desc">Terdaftar aktif</div>
      </div>
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Sesi Hari Ini</div>
        <div class="stat-value text-primary">4</div>
        <div class="stat-desc">2 Berjalan, 2 Menunggu</div>
      </div>
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Ruang Ujian</div>
        <div class="stat-value text-secondary">12</div>
        <div class="stat-desc">Digunakan</div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/operator/peserta/import" class="btn btn-outline btn-info h-auto py-4 flex flex-col">
        <span class="text-2xl">📥</span>
        <span>Import Peserta</span>
      </a>
      <a href="/operator/sesi/create" class="btn btn-outline btn-success h-auto py-4 flex flex-col">
        <span class="text-2xl">📅</span>
        <span>Buat Sesi</span>
      </a>
      <a href="/operator/ruang" class="btn btn-outline btn-warning h-auto py-4 flex flex-col">
        <span class="text-2xl">🏫</span>
        <span>Atur Ruang</span>
      </a>
      <a href="/operator/laporan" class="btn btn-outline btn-error h-auto py-4 flex flex-col">
        <span class="text-2xl">📊</span>
        <span>Cetak Kartu</span>
      </a>
    </div>

    <!-- Active Sessions Table -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Sesi Berjalan</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Sesi</th>
                <th>Waktu</th>
                <th>Ruang</th>
                <th>Status</th>
                <th>Peserta Login</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sesi 1 - Pagi</td>
                <td>07:30 - 09:30</td>
                <td>Lab Komputer 1</td>
                <td><span class="badge badge-success">Aktif</span></td>
                <td>32/36</td>
              </tr>
              <tr>
                <td>Sesi 1 - Pagi</td>
                <td>07:30 - 09:30</td>
                <td>Lab Komputer 2</td>
                <td><span class="badge badge-success">Aktif</span></td>
                <td>35/36</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/laporan.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
---

<DashboardLayout title="Laporan & Cetak" role="operator">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    
    <!-- Kartu Peserta -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Kartu Peserta</h2>
        <p>Cetak kartu login peserta ujian dengan QR Code.</p>
        <div class="form-control mt-4">
          <label class="label"><span class="label-text">Pilih Kelas</span></label>
          <select class="select select-bordered select-sm">
            <option>Semua Kelas</option>
            <option>XII IPA 1</option>
          </select>
        </div>
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-primary btn-sm">Cetak PDF</button>
        </div>
      </div>
    </div>

    <!-- Daftar Hadir -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Daftar Hadir</h2>
        <p>Cetak daftar hadir peserta per ruang/sesi.</p>
        <div class="form-control mt-4">
          <label class="label"><span class="label-text">Pilih Sesi</span></label>
          <select class="select select-bordered select-sm">
            <option>Sesi 1</option>
            <option>Sesi 2</option>
          </select>
        </div>
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-primary btn-sm">Cetak PDF</button>
        </div>
      </div>
    </div>

    <!-- Berita Acara -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Berita Acara</h2>
        <p>Generate berita acara pelaksanaan ujian.</p>
        <div class="card-actions justify-end mt-auto">
          <button class="btn btn-primary btn-sm">Buat Laporan</button>
        </div>
      </div>
    </div>

  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/peserta/import.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
---

<DashboardLayout title="Import Peserta" role="operator">
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Upload Data Peserta</h2>
        
        <div class="alert alert-info mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="font-bold">Format Excel</h3>
            <div class="text-xs">Gunakan template yang disediakan agar data terbaca dengan benar.</div>
            <a href="/templates/template_peserta.xlsx" class="link link-primary text-xs font-bold">Download Template</a>
          </div>
        </div>

        <form class="space-y-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Pilih File Excel (.xlsx / .csv)</span>
            </label>
            <input type="file" class="file-input file-input-bordered w-full" accept=".xlsx,.xls,.csv" />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="checkbox" class="checkbox checkbox-primary" />
              <span class="label-text">Update data jika NIS sudah ada</span>
            </label>
          </div>

          <div class="card-actions justify-end">
            <a href="/operator/peserta" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Upload & Proses</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/peserta/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

// Mock Data
const students = [
  { id: 1, nis: '1001', name: 'Adi Pratama', class: 'XII IPA 1', status: 'active' },
  { id: 2, nis: '1002', name: 'Budi Santoso', class: 'XII IPA 1', status: 'active' },
  { id: 3, nis: '1003', name: 'Citra Dewi', class: 'XII IPA 2', status: 'inactive' },
];
---

<DashboardLayout title="Data Peserta" role="operator">
  <div slot="actions" class="flex gap-2">
    <a href="/operator/peserta/import" class="btn btn-success btn-sm text-white">Import Excel</a>
    <button class="btn btn-primary btn-sm">+ Tambah Manual</button>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-4 mb-4">
        <input type="text" placeholder="Cari Nama / NIS..." class="input input-bordered w-full max-w-xs" />
        <select class="select select-bordered">
          <option value="">Semua Kelas</option>
          <option>XII IPA 1</option>
          <option>XII IPA 2</option>
        </select>
      </div>

      <Table zebra>
        <thead>
          <tr>
            <th>NIS</th>
            <th>Nama Lengkap</th>
            <th>Kelas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr>
              <td>{s.nis}</td>
              <td class="font-bold">{s.name}</td>
              <td>{s.class}</td>
              <td>
                <span class={`badge ${s.status === 'active' ? 'badge-success' : 'badge-ghost'} badge-sm`}>
                  {s.status}
                </span>
              </td>
              <td>
                <button class="btn btn-xs btn-ghost">Edit</button>
                <button class="btn btn-xs btn-ghost text-error">Reset Pass</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div class="flex justify-center mt-4">
        <div class="join">
          <button class="join-item btn btn-sm">«</button>
          <button class="join-item btn btn-sm btn-active">1</button>
          <button class="join-item btn btn-sm">2</button>
          <button class="join-item btn btn-sm">»</button>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/ruang/create.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';
---

<DashboardLayout title="Tambah Ruang Ujian" role="operator">
  <div class="max-w-xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form class="space-y-4">
          <Input name="name" label="Nama Ruang" placeholder="Contoh: Lab Komputer 1" required />
          <Input type="number" name="capacity" label="Kapasitas Peserta" placeholder="36" required />
          
          <div class="form-control">
            <label class="label"><span class="label-text">Pengawas Default (Opsional)</span></label>
            <select class="select select-bordered">
              <option value="">Pilih Pengawas...</option>
              <option value="1">Budi Santoso</option>
              <option value="2">Siti Aminah</option>
            </select>
          </div>

          <div class="card-actions justify-end mt-6">
            <a href="/operator/ruang" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/ruang/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

const rooms = [
  { id: 1, name: 'Lab Komputer 1', capacity: 36, proctor: 'Budi Santoso' },
  { id: 2, name: 'Lab Komputer 2', capacity: 36, proctor: 'Siti Aminah' },
];
---

<DashboardLayout title="Manajemen Ruang" role="operator">
  <div slot="actions">
    <a href="/operator/ruang/create" class="btn btn-primary btn-sm">+ Tambah Ruang</a>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <Table zebra>
        <thead>
          <tr>
            <th>Nama Ruang</th>
            <th>Kapasitas</th>
            <th>Pengawas Default</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr>
              <td>{r.name}</td>
              <td>{r.capacity} Siswa</td>
              <td>{r.proctor}</td>
              <td>
                <button class="btn btn-xs btn-ghost">Edit</button>
                <button class="btn btn-xs btn-error btn-outline">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/ruang/[id]/edit.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';

const { id } = Astro.params;
---

<DashboardLayout title="Edit Ruang" role="operator">
  <div class="max-w-xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Edit Ruang #{id}</h2>
        <form class="space-y-4">
          <Input name="name" label="Nama Ruang" value="Lab Komputer 1" required />
          <Input type="number" name="capacity" label="Kapasitas Peserta" value="36" required />
          
          <div class="form-control">
            <label class="label"><span class="label-text">Pengawas Default</span></label>
            <select class="select select-bordered">
              <option value="1" selected>Budi Santoso</option>
              <option value="2">Siti Aminah</option>
            </select>
          </div>

          <div class="card-actions justify-end mt-6">
            <a href="/operator/ruang" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/sesi/create.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';
---

<DashboardLayout title="Tambah Sesi Ujian" role="operator">
  <div class="max-w-xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form class="space-y-4">
          <Input name="name" label="Nama Sesi" placeholder="Contoh: Sesi 1 - Pagi" required />
          
          <div class="grid grid-cols-2 gap-4">
            <Input type="time" name="start_time" label="Jam Mulai" required />
            <Input type="time" name="end_time" label="Jam Selesai" required />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="checkbox" class="toggle toggle-success" checked />
              <span class="label-text">Aktifkan Sesi</span>
            </label>
          </div>

          <div class="card-actions justify-end mt-6">
            <a href="/operator/sesi" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/sesi/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

const sessions = [
  { id: 1, name: 'Sesi 1 (Pagi)', time: '07:30 - 09:30', status: 'Aktif' },
  { id: 2, name: 'Sesi 2 (Siang)', time: '10:00 - 12:00', status: 'Menunggu' },
];
---

<DashboardLayout title="Manajemen Sesi" role="operator">
  <div slot="actions">
    <a href="/operator/sesi/create" class="btn btn-primary btn-sm">+ Tambah Sesi</a>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <Table zebra>
        <thead>
          <tr>
            <th>Nama Sesi</th>
            <th>Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr>
              <td>{s.name}</td>
              <td>{s.time}</td>
              <td>
                <span class={`badge ${s.status === 'Aktif' ? 'badge-success' : 'badge-ghost'}`}>{s.status}</span>
              </td>
              <td>
                <button class="btn btn-xs btn-ghost">Edit</button>
                <button class="btn btn-xs btn-error btn-outline">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/operator/sesi/[id]/edit.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';

const { id } = Astro.params;
---

<DashboardLayout title="Edit Sesi" role="operator">
  <div class="max-w-xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Edit Sesi #{id}</h2>
        <form class="space-y-4">
          <Input name="name" label="Nama Sesi" value="Sesi 1 - Pagi" required />
          
          <div class="grid grid-cols-2 gap-4">
            <Input type="time" name="start_time" label="Jam Mulai" value="07:30" required />
            <Input type="time" name="end_time" label="Jam Selesai" value="09:30" required />
          </div>

          <div class="card-actions justify-end mt-6">
            <a href="/operator/sesi" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/pengawas/dashboard.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';

const activeSessions = [
  { id: 1, name: 'Ujian Matematika - XII IPA 1', time: '08:00 - 10:00', room: 'Lab 1', status: 'Berjalan' },
  { id: 2, name: 'Ujian Biologi - XII IPA 2', time: '08:00 - 10:00', room: 'Lab 2', status: 'Berjalan' },
];
---

<DashboardLayout title="Dashboard Pengawas" role="pengawas">
  <div class="space-y-6">
    <div class="alert alert-info shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <div>
        <h3 class="font-bold">Jadwal Hari Ini</h3>
        <div class="text-xs">Anda memiliki 2 sesi ujian yang harus diawasi hari ini.</div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Sesi Aktif</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Nama Sesi</th>
                <th>Waktu</th>
                <th>Ruang</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map(session => (
                <tr>
                  <td class="font-bold">{session.name}</td>
                  <td>{session.time}</td>
                  <td>{session.room}</td>
                  <td><span class="badge badge-success animate-pulse">{session.status}</span></td>
                  <td>
                    <a href={`/pengawas/monitoring/live?session_id=${session.id}`} class="btn btn-sm btn-primary">
                      Monitor Live
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/pengawas/monitoring/live.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import LiveMonitor from '@/components/monitoring/LiveMonitor.astro';
import Select from '@/components/ui/Select.astro';

// Fetch active sessions (Server Side)
// const sessions = await getActiveSessions(); 
// Mock data:
const sessions = [
  { value: 1, label: 'Sesi 1 - Matematika X-A' },
  { value: 2, label: 'Sesi 1 - Biologi XI-IPA' }
];
---

<DashboardLayout title="Live Monitoring" role="pengawas">
  <div class="flex flex-col h-[calc(100vh-8rem)]">
    
    <!-- Filter Bar -->
    <div class="bg-base-100 p-4 rounded-lg shadow mb-4 flex gap-4 items-end">
      <div class="w-64">
        <Select 
          name="session_id" 
          label="Pilih Sesi Ujian" 
          options={sessions}
        />
      </div>
      <button id="load-session-btn" class="btn btn-primary">Muat Data</button>
    </div>

    <!-- Monitor Area -->
    <div id="monitor-container" class="flex-1 overflow-hidden relative">
      <div class="absolute inset-0 flex items-center justify-center text-base-content/30">
        <p class="text-lg">Pilih sesi untuk mulai memantau</p>
      </div>
    </div>

  </div>

  <script>
    const loadBtn = document.getElementById('load-session-btn');
    const select = document.getElementById('session_id') as HTMLSelectElement;
    const container = document.getElementById('monitor-container');

    loadBtn?.addEventListener('click', () => {
      const sessionId = select.value;
      if (!sessionId || !container) return;

      // Clear container
      container.innerHTML = '<div class="flex justify-center p-10"><span class="loading loading-spinner loading-lg"></span></div>';

      // Load LiveMonitor component dynamically (Simulated via Astro Island approach usually, but here we replace HTML)
      // In a real Astro app with client:load, we would pass the prop.
      // Since we are inside a script, we might redirect or fetch partial HTML.
      
      // For this blueprint, let's assume we redirect to a specific monitoring page or fetch data
      // A better approach in Astro is using a query param to re-render the server component
      window.location.href = `?session_id=${sessionId}`;
    });
  </script>

  {Astro.url.searchParams.get('session_id') && (
    <div slot="default">
      <!-- This overrides the content if session_id exists -->
       <div class="mb-4">
         <a href="/pengawas/monitoring/live" class="btn btn-sm btn-ghost mb-2">← Kembali Pilih Sesi</a>
         <LiveMonitor sessionId={parseInt(Astro.url.searchParams.get('session_id')!)} />
       </div>
    </div>
  )}
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/pengawas/monitoring/session/[id].astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import StudentProgressCard from '@/components/monitoring/StudentProgressCard.astro';

const { id } = Astro.params;

// Mock Data
const students = [
  {
    student: { id: 1, name: 'Adi Pratama', student_id: '1001' },
    progress: { attempt_id: 101, status: 'in_progress', answered: 15, total_questions: 40, time_remaining: 1800, warnings: 0, last_activity: new Date().toISOString() }
  },
  {
    student: { id: 2, name: 'Budi Santoso', student_id: '1002' },
    progress: { attempt_id: 102, status: 'paused', answered: 10, total_questions: 40, time_remaining: 2000, warnings: 2, last_activity: new Date().toISOString() }
  }
];
---

<DashboardLayout title={`Monitoring Sesi #${id}`} role="pengawas">
  <div class="mb-6 flex justify-between items-center">
    <div class="flex gap-2">
      <div class="badge badge-lg badge-primary">Total: 36</div>
      <div class="badge badge-lg badge-success">Online: 34</div>
      <div class="badge badge-lg badge-error">Offline: 2</div>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-sm btn-warning">Force Finish All</button>
      <a href="/pengawas/monitoring/live" class="btn btn-sm btn-ghost">Kembali</a>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {students.map(item => (
      <StudentProgressCard student={item.student} progress={item.progress as any} />
    ))}
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/siswa/dashboard.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import DashboardStats from '@/components/analytics/DashboardStats.astro';
import { db } from '@/lib/db/schema';

// Mock data for SSR (in real app, fetch from API or DB if client-side)
const stats = {
  totalExams: 0,
  activeExams: 0,
  completedExams: 0,
  averageScore: 0
};
---

<DashboardLayout title="Dashboard Siswa" role="siswa">
  <div class="space-y-8">
    <!-- Stats Overview -->
    <DashboardStats stats={stats} />

    <!-- Active Exams Section -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">Ujian Tersedia</h2>
          <a href="/siswa/ujian" class="btn btn-sm btn-ghost">Lihat Semua</a>
        </div>
        
        <div id="active-exams-list" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="loading loading-spinner loading-lg mx-auto col-span-full"></div>
        </div>
      </div>
    </div>

    <!-- Recent Results -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Riwayat Terakhir</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>Tanggal</th>
                <th>Nilai</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="history-list">
              <!-- Populated by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    import { db } from '@/lib/db/schema';
    import { getAvailableExams } from '@/lib/api/exam';

    async function loadDashboardData() {
      try {
        // Load local data first
        const downloadedExams = await db.downloaded_exams.toArray();
        const container = document.getElementById('active-exams-list');
        
        if (container) {
          if (downloadedExams.length === 0) {
            container.innerHTML = `
              <div class="col-span-full text-center py-8 text-base-content/50">
                <p>Belum ada ujian yang didownload.</p>
                <a href="/siswa/ujian" class="btn btn-primary btn-sm mt-2">Cari Ujian</a>
              </div>
            `;
          } else {
            container.innerHTML = downloadedExams.map(exam => `
              <div class="card bg-base-200">
                <div class="card-body p-4">
                  <h3 class="font-bold">Ujian #${exam.exam_id}</h3>
                  <div class="text-xs text-base-content/70 mt-1">
                    Downloaded: ${new Date(exam.downloaded_at).toLocaleDateString()}
                  </div>
                  <div class="card-actions justify-end mt-3">
                    <a href="/siswa/ujian/${exam.exam_id}" class="btn btn-primary btn-sm">Mulai</a>
                  </div>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadDashboardData();
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/siswa/profile.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import { db } from '@/lib/db/schema';

// Mock user data (would normally come from auth store/middleware)
const user = {
  name: 'Ahmad Siswa',
  nis: '12345678',
  class: 'XII IPA 1',
  email: 'ahmad@sekolah.sch.id',
  avatar: null
};
---

<DashboardLayout title="Profil Saya" role="siswa">
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <div class="avatar placeholder mb-4">
          <div class="bg-neutral text-neutral-content rounded-full w-24">
            <span class="text-3xl">{user.name.charAt(0)}</span>
          </div>
        </div>
        
        <h2 class="card-title text-2xl">{user.name}</h2>
        <p class="text-base-content/70">{user.nis} • {user.class}</p>
        
        <div class="divider"></div>
        
        <div class="w-full text-left space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input type="text" value={user.email} class="input input-bordered" disabled />
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text">Password</span></label>
            <button class="btn btn-outline btn-sm w-full">Ganti Password</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h3 class="card-title text-lg">Statistik Perangkat</h3>
        <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-title">Storage Terpakai</div>
            <div class="stat-value text-sm" id="storage-usage">Calculating...</div>
          </div>
          <div class="stat">
            <div class="stat-title">Ujian Offline</div>
            <div class="stat-value text-sm" id="offline-count">0 File</div>
          </div>
        </div>
        <div class="card-actions justify-end mt-4">
          <button id="clear-data-btn" class="btn btn-error btn-sm text-white">Hapus Data Offline</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    import { db } from '@/lib/db/schema';
    import { formatFileSize } from '@/lib/utils/format';

    async function loadStats() {
      const exams = await db.downloaded_exams.count();
      const media = await db.media_files.count();
      
      document.getElementById('offline-count')!.textContent = `${exams} Ujian (${media} Media)`;
      
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        document.getElementById('storage-usage')!.textContent = formatFileSize(estimate.usage || 0);
      }
    }

    document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
      if(confirm('Yakin ingin menghapus semua data ujian offline? Anda harus mendownload ulang nanti.')) {
        await db.downloaded_exams.clear();
        await db.media_files.clear();
        alert('Data berhasil dihapus.');
        loadStats();
      }
    });

    loadStats();
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/siswa/ujian/download.astro`

```astro
---
import MainLayout from '@/layouts/MainLayout.astro';
import DownloadProgress from '@/components/sync/DownloadProgress.astro';

const examId = Astro.url.searchParams.get('id');

if (!examId) {
  return Astro.redirect('/siswa/ujian');
}
---

<MainLayout title="Download Ujian" hideNav={true}>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">Persiapan Ujian Offline</h1>
        <p class="text-base-content/70">Mohon tunggu, sedang mengunduh paket soal dan media...</p>
      </div>

      <DownloadProgress examId={parseInt(examId)} />
      
      <div class="mt-8 text-center text-sm text-base-content/50">
        <p>Pastikan koneksi internet stabil selama proses download.</p>
        <p>Jangan tutup halaman ini.</p>
      </div>
    </div>
  </div>
</MainLayout>
```

---

#### 📄 File: `./src/pages/siswa/ujian/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';
---

<DashboardLayout title="Daftar Ujian" role="siswa">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-2 mb-4">
        <input type="text" placeholder="Cari ujian..." class="input input-bordered w-full max-w-xs" />
        <select class="select select-bordered">
          <option>Semua Mata Pelajaran</option>
          <option>Matematika</option>
          <option>Bahasa Indonesia</option>
        </select>
      </div>

      <Table zebra>
        <thead>
          <tr>
            <th>Nama Ujian</th>
            <th>Durasi</th>
            <th>Jendela Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="exam-list-body">
          <tr>
            <td colspan="5" class="text-center">Memuat daftar ujian...</td>
          </tr>
        </tbody>
      </Table>
    </div>
  </div>

  <script>
    import { getAvailableExams } from '@/lib/api/exam';
    import { db } from '@/lib/db/schema';

    async function loadExams() {
      try {
        const exams = await getAvailableExams();
        const downloaded = await db.downloaded_exams.toArray();
        const downloadedIds = new Set(downloaded.map(d => d.exam_id));
        
        const tbody = document.getElementById('exam-list-body');
        if (!tbody) return;

        if (exams.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada ujian tersedia saat ini.</td></tr>';
          return;
        }

        tbody.innerHTML = exams.map((exam: any) => {
          const isDownloaded = downloadedIds.has(exam.id);
          const actionBtn = isDownloaded
            ? `<a href="/siswa/ujian/${exam.id}" class="btn btn-success btn-xs">Kerjakan</a>`
            : `<a href="/siswa/ujian/download?id=${exam.id}" class="btn btn-primary btn-xs">Download</a>`;

          return `
            <tr>
              <td class="font-semibold">${exam.title}</td>
              <td>${exam.duration_minutes} menit</td>
              <td class="text-sm">
                ${new Date(exam.window_start_at).toLocaleDateString()} - 
                ${new Date(exam.window_end_at).toLocaleDateString()}
              </td>
              <td>
                ${isDownloaded 
                  ? '<span class="badge badge-success badge-sm">Siap Offline</span>' 
                  : '<span class="badge badge-ghost badge-sm">Online</span>'}
              </td>
              <td>${actionBtn}</td>
            </tr>
          `;
        }).join('');
      } catch (error) {
        console.error(error);
        const tbody = document.getElementById('exam-list-body');
        if(tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-error">Gagal memuat data. Periksa koneksi internet.</td></tr>';
      }
    }

    loadExams();
  </script>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/siswa/ujian/result.astro`

```astro
---
import MainLayout from '@/layouts/MainLayout.astro';
import { formatScore } from '@/lib/utils/format';

const attemptId = Astro.url.searchParams.get('attemptId');
---

<MainLayout title="Hasil Ujian">
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="max-w-2xl mx-auto space-y-6">
      
      <!-- Status Card -->
      <div class="card bg-base-100 shadow-xl text-center">
        <div class="card-body items-center">
          <div class="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 class="card-title text-2xl">Ujian Selesai!</h2>
          <p class="text-base-content/70">Jawaban Anda telah berhasil disimpan.</p>
          
          <div class="divider"></div>
          
          <div id="result-content" class="w-full">
            <div class="loading loading-spinner loading-md"></div>
            <span class="text-sm">Memuat hasil...</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <a href="/siswa/dashboard" class="btn btn-primary">Kembali ke Dashboard</a>
      </div>
    </div>
  </div>

  <script>
    import { db } from '@/lib/db/schema';
    import { apiClient } from '@/lib/api/client';

    const attemptId = new URLSearchParams(window.location.search).get('attemptId');
    const resultContainer = document.getElementById('result-content');

    async function loadResult() {
      if (!resultContainer || !attemptId) return;

      try {
        // Coba ambil dari server dulu jika online
        if (navigator.onLine) {
          try {
            const response = await apiClient.get(`/student/attempts/${attemptId}/result`);
            renderResult(response.data);
            return;
          } catch (e) {
            console.log('Server result not ready, checking local...');
          }
        }

        // Fallback ke data lokal (estimasi) atau pesan pending
        const attempt = await db.exam_states.get(parseInt(attemptId));
        
        if (attempt) {
           resultContainer.innerHTML = `
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h3 class="font-bold">Menunggu Sinkronisasi</h3>
                <div class="text-xs">Jawaban tersimpan di perangkat. Nilai akan muncul setelah sinkronisasi selesai.</div>
              </div>
            </div>
           `;
        }
      } catch (error) {
        resultContainer.innerHTML = '<p class="text-error">Gagal memuat hasil.</p>';
      }
    }

    function renderResult(data: any) {
      if (!resultContainer) return;
      
      if (!data.show_score) {
        resultContainer.innerHTML = `
          <p class="italic text-base-content/60">Nilai untuk ujian ini disembunyikan oleh guru.</p>
        `;
        return;
      }

      resultContainer.innerHTML = `
        <div class="stats shadow w-full">
          <div class="stat place-items-center">
            <div class="stat-title">Nilai Akhir</div>
            <div class="stat-value text-primary">${data.score}</div>
            <div class="stat-desc">Dari 100</div>
          </div>
          
          <div class="stat place-items-center">
            <div class="stat-title">Benar</div>
            <div class="stat-value text-success text-2xl">${data.correct_count}</div>
          </div>
          
          <div class="stat place-items-center">
            <div class="stat-title">Salah</div>
            <div class="stat-value text-error text-2xl">${data.incorrect_count}</div>
          </div>
        </div>
      `;
    }

    loadResult();
  </script>
</MainLayout>
```

---

#### 📄 File: `./src/pages/siswa/ujian/[id].astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/audit-logs.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

const logs = [
  { id: 1, user: 'admin_sma1', action: 'LOGIN', ip: '192.168.1.10', time: '2024-01-20 07:00' },
  { id: 2, user: 'guru_bio', action: 'CREATE_EXAM', ip: '192.168.1.15', time: '2024-01-20 08:30' },
];
---

<DashboardLayout title="Audit Logs" role="superadmin">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-4 mb-4">
        <input type="text" placeholder="Filter User / Action..." class="input input-bordered w-full max-w-xs" />
        <input type="date" class="input input-bordered" />
      </div>

      <Table zebra compact>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>User</th>
            <th>Action</th>
            <th>IP Address</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr>
              <td class="font-mono text-xs">{log.time}</td>
              <td class="font-bold">{log.user}</td>
              <td><span class="badge badge-outline badge-sm">{log.action}</span></td>
              <td class="font-mono text-xs">{log.ip}</td>
              <td><button class="btn btn-xs btn-ghost">View</button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/dashboard.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import DashboardStats from '@/components/analytics/DashboardStats.astro';

const stats = {
  totalExams: 1500, // Total exams across all schools
  activeExams: 45,
  completedExams: 1455,
  averageScore: 0
};
---

<DashboardLayout title="Superadmin Dashboard" role="superadmin">
  <div class="space-y-8">
    
    <!-- System Health -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Total Sekolah</div>
        <div class="stat-value text-primary">12</div>
        <div class="stat-desc">2 Non-aktif</div>
      </div>
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Total User</div>
        <div class="stat-value text-secondary">4.5k</div>
        <div class="stat-desc">Siswa & Guru</div>
      </div>
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">Storage</div>
        <div class="stat-value">45%</div>
        <div class="stat-desc">200GB / 500GB</div>
      </div>
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-title">CPU Load</div>
        <div class="stat-value text-success">12%</div>
        <div class="stat-desc">Normal</div>
      </div>
    </div>

    <!-- Schools List -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Daftar Sekolah</h2>
          <a href="/superadmin/schools/create" class="btn btn-primary btn-sm">+ Tambah Sekolah</a>
        </div>
        
        <div class="overflow-x-auto mt-4">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Sekolah</th>
                <th>Subdomain</th>
                <th>Paket</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>SMA Negeri 1 Jakarta</td>
                <td>sman1jkt</td>
                <td>Premium</td>
                <td><span class="badge badge-success">Aktif</span></td>
                <td><button class="btn btn-xs">Manage</button></td>
              </tr>
              <tr>
                <td>2</td>
                <td>MAN 2 Bandung</td>
                <td>man2bdg</td>
                <td>Basic</td>
                <td><span class="badge badge-success">Aktif</span></td>
                <td><button class="btn btn-xs">Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/schools/create.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';
---

<DashboardLayout title="Tambah Sekolah Baru" role="superadmin">
  <div class="max-w-3xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form class="space-y-6">
          <h2 class="card-title">Informasi Sekolah</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Nama Sekolah" required />
            <Input name="npsn" label="NPSN" />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">Alamat Lengkap</span></label>
            <textarea class="textarea textarea-bordered"></textarea>
          </div>

          <div class="divider">Konfigurasi Sistem</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text">Subdomain</span></label>
              <div class="join">
                <input type="text" placeholder="sekolah" class="input input-bordered join-item w-full" />
                <span class="btn btn-disabled join-item">.exam.app</span>
              </div>
            </div>
            <Input name="max_students" type="number" label="Limit Siswa" value="500" />
          </div>

          <div class="divider">Akun Administrator</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="admin_name" label="Nama Admin" required />
            <Input name="admin_email" type="email" label="Email Admin" required />
            <Input name="admin_password" type="password" label="Password Default" required />
          </div>

          <div class="card-actions justify-end mt-6">
            <button type="button" class="btn btn-ghost" onclick="history.back()">Batal</button>
            <button type="submit" class="btn btn-primary">Buat Sekolah</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/schools/index.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';
---

<DashboardLayout title="Manajemen Sekolah" role="superadmin">
  <div slot="actions">
    <a href="/superadmin/schools/create" class="btn btn-primary btn-sm">+ Sekolah Baru</a>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <Table zebra>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nama Sekolah</th>
            <th>Subdomain</th>
            <th>Admin Email</th>
            <th>Siswa</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Mock Data -->
          <tr>
            <td><div class="avatar"><div class="w-8 rounded"><img src="https://placehold.co/100" /></div></div></td>
            <td class="font-bold">SMA 1 Contoh</td>
            <td>sma1</td>
            <td>admin@sma1.sch.id</td>
            <td>500</td>
            <td><span class="badge badge-success">Active</span></td>
            <td>
              <a href="/superadmin/schools/1/edit" class="btn btn-xs btn-info">Edit</a>
              <button class="btn btn-xs btn-error">Suspend</button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/schools/[id]/edit.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Input from '@/components/ui/Input.astro';

const { id } = Astro.params;
---

<DashboardLayout title="Edit Sekolah" role="superadmin">
  <div class="max-w-3xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Edit Sekolah #{id}</h2>
        <form class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Nama Sekolah" value="SMA Negeri 1 Jakarta" required />
            <Input name="subdomain" label="Subdomain" value="sman1jkt" disabled />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <span class="label-text">Status Sekolah</span>
              <input type="checkbox" class="toggle toggle-success" checked />
              <span class="label-text font-bold text-success">Aktif</span>
            </label>
          </div>

          <div class="divider">Paket Langganan</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text">Paket</span></label>
              <select class="select select-bordered">
                <option value="basic">Basic</option>
                <option value="premium" selected>Premium</option>
              </select>
            </div>
            <Input name="max_students" type="number" label="Limit Siswa" value="1000" />
          </div>

          <div class="card-actions justify-end mt-6">
            <a href="/superadmin/schools" class="btn btn-ghost">Batal</a>
            <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/settings.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
---

<DashboardLayout title="Pengaturan Sistem" role="superadmin">
  <div class="max-w-4xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Konfigurasi Global</h2>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Mode Maintenance</span>
            <input type="checkbox" class="toggle toggle-error" />
          </label>
          <label class="label">
            <span class="label-text-alt">Aktifkan untuk mencegah login user selain superadmin.</span>
          </label>
        </div>

        <div class="divider"></div>

        <h3 class="font-bold">Backup & Restore</h3>
        <div class="flex gap-4 mt-2">
          <button class="btn btn-primary btn-sm">Backup Database</button>
          <button class="btn btn-outline btn-sm">Restore Database</button>
        </div>

        <div class="divider"></div>

        <h3 class="font-bold">Cache Management</h3>
        <div class="flex gap-4 mt-2">
          <button class="btn btn-warning btn-sm">Clear Redis Cache</button>
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>
```

---

#### 📄 File: `./src/pages/superadmin/users.astro`

```astro
---
import DashboardLayout from '@/layouts/Dashboard.astro';
import Table from '@/components/ui/Table.astro';

// Mock Data
const users = [
  { id: 1, username: 'admin_sma1', role: 'operator', school: 'SMA 1', status: 'active' },
  { id: 2, username: 'guru_bio', role: 'guru', school: 'SMA 1', status: 'active' },
];
---

<DashboardLayout title="Manajemen User Global" role="superadmin">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-4 mb-4">
        <input type="text" placeholder="Cari user..." class="input input-bordered w-full max-w-xs" />
        <select class="select select-bordered">
          <option value="">Semua Role</option>
          <option value="operator">Operator</option>
          <option value="guru">Guru</option>
        </select>
      </div>

      <Table zebra>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Sekolah</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr>
              <td class="font-bold">{u.username}</td>
              <td><span class="badge badge-outline">{u.role}</span></td>
              <td>{u.school}</td>
              <td><span class="badge badge-success badge-xs"></span> {u.status}</td>
              <td>
                <button class="btn btn-xs">Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
</DashboardLayout>
```

---

### 📂 Sub-direktori: src/layouts

#### 📄 File: `./src/layouts/Auth.astro`

```astro
---
import '@/styles/global.css';
import Toast from '@/components/ui/Toast.astro';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="id" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-base-200 min-h-screen flex items-center justify-center">
    <Toast />
    <main class="w-full max-w-md p-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary mb-2">ExamApp</h1>
        <p class="text-base-content/70">Sistem Ujian Sekolah & Madrasah</p>
      </div>
      <slot />
    </main>
  </body>
</html>
```

---

#### 📄 File: `./src/layouts/Base.astro`

```astro
---
// src/layouts/Base.astro
import '@/styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Sistem Ujian Sekolah' } = Astro.props;
---

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    
    <meta name="theme-color" content="#3b82f6" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  </head>
  <body>
    <slot />
    
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('Service Worker registered:', registration);
          },
          (error) => {
            console.error('Service Worker registration failed:', error);
          }
        );
      }
      
      import { $uiStore } from '@/stores/ui';
      
      $uiStore.subscribe((state) => {
        document.documentElement.setAttribute('data-theme', state.theme);
        
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        if (state.fontSize === 'small') document.documentElement.classList.add('text-sm');
        if (state.fontSize === 'large') document.documentElement.classList.add('text-lg');
        
        if (state.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      });
      
      const initialState = $uiStore.get();
      document.documentElement.setAttribute('data-theme', initialState.theme);
    </script>
  </body>
</html>
```

---

#### 📄 File: `./src/layouts/Dashboard.astro`

```astro
---
import MainLayout from './MainLayout.astro';

interface Props {
  title: string;
  role: 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';
}

const { title, role } = Astro.props;
---

<MainLayout title={title} role={role}>
  <div class="p-6 max-w-7xl mx-auto">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">{title}</h1>
        <p class="text-sm text-base-content/70">Selamat datang kembali</p>
      </div>
      <div class="flex gap-2">
        <slot name="actions" />
      </div>
    </header>
    
    <slot />
  </div>
</MainLayout>
```

---

#### 📄 File: `./src/layouts/Exam.astro`

```astro
---
import '@/styles/global.css';
import Toast from '@/components/ui/Toast.astro';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="id" class="exam-mode">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - Ujian</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#3b82f6" />
    <style>
      /* Exam specific styles to prevent cheating/distractions */
      body {
        user-select: none;
        -webkit-user-select: none;
      }
      .exam-content {
        user-select: text;
        -webkit-user-select: text;
      }
    </style>
  </head>
  <body class="bg-base-100 min-h-screen flex flex-col">
    <Toast />
    <slot />
    
    <script>
      // Prevent basic copy/paste and context menu
      document.addEventListener('contextmenu', event => event.preventDefault());
      document.addEventListener('copy', event => event.preventDefault());
      document.addEventListener('cut', event => event.preventDefault());
      document.addEventListener('paste', event => event.preventDefault());
    </script>
  </body>
</html>
```

---

### 📂 Sub-direktori: src/lib

#### 📄 File: `./src/lib/api/analytics.ts`

```typescript
import { apiClient } from './client';

export async function getDashboardStats() {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
}

export async function getExamAnalytics(examId: number) {
  const response = await apiClient.get(`/analytics/exam/${examId}`);
  return response.data;
}

export async function getStudentProgress(studentId: number) {
  const response = await apiClient.get(`/analytics/student/${studentId}`);
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/auth.ts`

```typescript
// src/lib/api/auth.ts
import { apiClient } from './client';
import { generateDeviceFingerprint } from '@/lib/utils/device';
import { db } from '@/lib/db/schema';
import { $authStore, setAuth, clearAuth } from '@/stores/auth';
import type { LoginResponse } from '@/types/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const deviceFingerprint = await generateDeviceFingerprint();

  const response = await apiClient.post<LoginResponse>('/auth/login', {
    ...credentials,
    device_fingerprint: deviceFingerprint,
  });

  const { access_token, refresh_token, user, school } = response.data;

  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  await db.users.put(user);
  await db.schools.put(school);

  setAuth({
    isAuthenticated: true,
    user,
    school,
    accessToken: access_token,
  });

  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  clearAuth();

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const { access_token } = response.data;

  localStorage.setItem('access_token', access_token);

  setAuth({
    ...$authStore.get(),
    accessToken: access_token,
  });

  return access_token;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function checkAuth(): Promise<boolean> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return false;
  }

  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}
```

---

#### 📄 File: `./src/lib/api/client.ts`

```typescript
// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { $authStore } from '@/stores/auth';

// Base URL from environment variable
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authState = $authStore.get();
    
    if (authState.accessToken) {
      config.headers.Authorization = `Bearer ${authState.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - try to refresh token
      // If refresh fails, redirect to login
      const authState = $authStore.get();
      
      if (authState.isAuthenticated) {
        try {
          // Attempt token refresh
          const { refreshAccessToken } = await import('./auth');
          const newToken = await refreshAccessToken();
          
          // Retry the original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(error.config);
          }
        } catch (refreshError) {
          // Refresh failed - logout
          const { logout } = await import('./auth');
          await logout();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

#### 📄 File: `./src/lib/api/exam.ts`

```typescript
// src/lib/api/exam.ts
import { apiClient } from './client';
import type { Exam, ExamAttempt } from '@/types/exam';
import type { ExamDownloadResponse } from '@/types/api';

export async function getAvailableExams() {
  const response = await apiClient.get<Exam[]>('/student/exams');
  return response.data;
}

export async function getExamById(examId: number) {
  const response = await apiClient.get<Exam>(`/student/exams/${examId}`);
  return response.data;
}

export async function prepareExam(examId: number) {
  const response = await apiClient.post<{ attempt_id: number }>(`/student/exams/${examId}/prepare`);
  return response.data;
}

export async function downloadExamData(examId: number) {
  const response = await apiClient.get<ExamDownloadResponse>(`/student/exams/${examId}/download`);
  return response.data;
}

export async function getExamAttempt(attemptId: number) {
  const response = await apiClient.get<ExamAttempt>(`/student/attempts/${attemptId}`);
  return response.data;
}

export async function submitExam(attemptId: number, data: any) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/submit`, data);
  return response.data;
}

export async function saveAnswers(attemptId: number, answers: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/answers`, {
    answers,
  });
  return response.data;
}

export async function saveActivityLogs(attemptId: number, events: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/activity`, {
    events,
  });
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/grading.ts`

```typescript
import { apiClient } from './client';

export interface GradePayload {
  score: number;
  feedback?: string;
}

export async function getPendingGrading(examId?: number) {
  const params = examId ? { exam_id: examId } : {};
  const response = await apiClient.get('/teacher/grading/pending', { params });
  return response.data;
}

export async function getStudentAttemptForGrading(attemptId: number) {
  const response = await apiClient.get(`/teacher/grading/attempt/${attemptId}`);
  return response.data;
}

export async function submitGrade(answerId: number, payload: GradePayload) {
  const response = await apiClient.post(`/teacher/grading/answer/${answerId}`, payload);
  return response.data;
}

export async function finishGradingAttempt(attemptId: number) {
  const response = await apiClient.post(`/teacher/grading/attempt/${attemptId}/finish`);
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/media.ts`

```typescript
import { apiClient } from './client';

export async function uploadMedia(file: File, type: 'image' | 'audio' | 'video') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data; // Returns { url: string, id: string }
}

export async function getMediaUrl(mediaId: string) {
  // Logic to handle signed URLs if using S3, or direct URL
  return `/api/media/${mediaId}`;
}
```

---

#### 📄 File: `./src/lib/api/monitoring.ts`

```typescript
import { apiClient } from './client';

export async function getActiveSessions() {
  const response = await apiClient.get('/proctor/sessions/active');
  return response.data;
}

export async function getSessionLiveStats(sessionId: number) {
  const response = await apiClient.get(`/proctor/sessions/${sessionId}/live`);
  return response.data;
}

export async function getStudentLiveStatus(attemptId: number) {
  const response = await apiClient.get(`/proctor/monitoring/student/${attemptId}`);
  return response.data;
}

export async function pauseStudentExam(attemptId: number, reason: string) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/pause`, { reason });
  return response.data;
}

export async function resumeStudentExam(attemptId: number) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/resume`);
  return response.data;
}

export async function forceFinishExam(attemptId: number) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/finish`);
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/question.ts`

```typescript
import { apiClient } from './client';
import type { Question } from '@/types/question';

export async function getQuestions(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  tags?: string[] 
}) {
  const response = await apiClient.get('/teacher/questions', { params });
  return response.data;
}

export async function getQuestionById(id: number) {
  const response = await apiClient.get<Question>(`/teacher/questions/${id}`);
  return response.data;
}

export async function createQuestion(data: Partial<Question>) {
  const response = await apiClient.post('/teacher/questions', data);
  return response.data;
}

export async function updateQuestion(id: number, data: Partial<Question>) {
  const response = await apiClient.put(`/teacher/questions/${id}`, data);
  return response.data;
}

export async function deleteQuestion(id: number) {
  const response = await apiClient.delete(`/teacher/questions/${id}`);
  return response.data;
}

export async function importQuestions(file: File, examId?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (examId) formData.append('exam_id', examId.toString());

  const response = await apiClient.post('/teacher/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/student.ts`

```typescript
import { apiClient } from './client';
import type { Student } from '@/types/user';

export async function getStudentProfile() {
  const response = await apiClient.get<Student>('/student/profile');
  return response.data;
}

export async function updateStudentProfile(data: Partial<Student>) {
  const response = await apiClient.put('/student/profile', data);
  return response.data;
}

export async function changePassword(password: string, newPassword: string) {
  const response = await apiClient.post('/student/change-password', {
    current_password: password,
    new_password: newPassword
  });
  return response.data;
}

export async function getStudentResults() {
  const response = await apiClient.get('/student/results');
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/sync.ts`

```typescript
import { apiClient } from './client';

export async function checkServerStatus() {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

export async function syncBatch(items: any[]) {
  const response = await apiClient.post('/sync/batch', { items });
  return response.data;
}

export async function getSyncConfig() {
  const response = await apiClient.get('/sync/config');
  return response.data;
}
```

---

#### 📄 File: `./src/lib/config/app.ts`

```typescript
export const appConfig = {
  name: 'ExamApp',
  version: '1.0.0',
  description: 'Sistem Ujian Sekolah & Madrasah Offline-First',
  api: {
    baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
  },
  exam: {
    autoSaveInterval: 30000, // 30 detik
    maxMediaSize: 100 * 1024 * 1024, // 100MB
    warningThresholds: {
      storage: 2 * 1024 * 1024 * 1024, // 2GB
      battery: 0.2, // 20%
    }
  },
  features: {
    enablePWA: true,
    enableOffline: true,
    enableDeviceLock: true,
  }
};
```

---

#### 📄 File: `./src/lib/config/theme.ts`

```typescript
export const themes = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    neutral: '#3d4451',
    'base-100': '#ffffff',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    neutral: '#2a2e37',
    'base-100': '#1d232a',
  },
};

export const fontSizes = {
  small: '0.875rem',
  medium: '1rem',
  large: '1.125rem',
};
```

---

#### 📄 File: `./src/lib/constants/api.ts`

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  EXAM: {
    LIST: '/student/exams',
    DETAIL: (id: number) => `/student/exams/${id}`,
    DOWNLOAD: (id: number) => `/student/exams/${id}/download`,
    SUBMIT: (id: number) => `/student/attempts/${id}/submit`,
  },
  MEDIA: {
    UPLOAD: '/media/upload',
    CHUNK: '/media/chunk',
  },
} as const;
```

---

#### 📄 File: `./src/lib/constants/exam.ts`

```typescript
export const EXAM_STATUS = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_CHOICE_COMPLEX: 'multiple_choice_complex',
  TRUE_FALSE: 'true_false',
  MATCHING: 'matching',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
} as const;

export const MAX_EXAM_DURATION_MINUTES = 300; // 5 hours
export const MIN_EXAM_DURATION_MINUTES = 10;
```

---

#### 📄 File: `./src/lib/constants/media.ts`

```typescript
export const ALLOWED_MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  AUDIO: ['audio/webm', 'audio/mp3', 'audio/wav'],
  VIDEO: ['video/webm', 'video/mp4'],
};

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 500 * 1024 * 1024, // 500MB
};

export const RECORDING_CONSTRAINTS = {
  AUDIO: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  },
  VIDEO: {
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
    },
  },
};
```

---

#### 📄 File: `./src/lib/constants/storage.ts`

```typescript
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  FONT_SIZE: 'font_size',
  DEVICE_ID: 'device_id',
  EXAM_STATE_PREFIX: 'exam_state_',
} as const;

export const DB_NAME = 'ExamDB';
export const DB_VERSION = 1;
```

---

#### 📄 File: `./src/lib/constants/validation.ts`

```typescript
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  MAX_LOGIN_ATTEMPTS: 5,
};

export const ERROR_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  NETWORK_ERROR: 'Gagal terhubung ke server',
};
```

---

#### 📄 File: `./src/lib/db/encryption.ts`

```typescript
// src/lib/db/encryption.ts
import CryptoJS from 'crypto-js';

// Secret key - in production, this should be derived from user credentials
// For now, we use a fixed key (NOT SECURE FOR PRODUCTION)
const SECRET_KEY = 'exam-app-secret-key-2024';

/**
 * Encrypt data using AES
 */
export function encrypt(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES
 */
export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data using SHA256
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate random IV for encryption
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}
```

---

#### 📄 File: `./src/lib/db/indexedDB.ts`

```typescript
import { db } from './schema';

// Helper functions to interact with Dexie DB safely
export async function saveExamState(attemptId: number, state: any) {
  try {
    await db.exam_states.put({ ...state, attempt_id: attemptId });
  } catch (error) {
    console.error('Failed to save exam state to IndexedDB', error);
  }
}

export async function getExamState(attemptId: number) {
  return await db.exam_states.get(attemptId);
}

export async function clearExamState(attemptId: number) {
  return await db.exam_states.delete(attemptId);
}
```

---

#### 📄 File: `./src/lib/db/migrations.ts`

```typescript
import { db } from './schema';

export async function runMigrations() {
  // Cek versi DB saat ini
  const currentVersion = db.verno;
  
  console.log(`Current DB Version: ${currentVersion}`);
  
  // Dexie menangani migrasi skema secara otomatis melalui deklarasi version() di schema.ts
  // File ini digunakan jika ada manipulasi data yang kompleks saat upgrade versi
  
  // Contoh:
  // if (currentVersion < 2) { 
  //   await db.transaction('rw', db.exam_answers, async () => {
  //     // Transform data logic here
  //   });
  // }
}
```

---

#### 📄 File: `./src/lib/db/queries.ts`

```typescript
// src/lib/db/queries.ts
import { db } from './schema';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';

/**
 * Get all answers for an attempt
 */
export async function getAnswersByAttempt(attemptId: number): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Get unsynced answers
 */
export async function getUnsyncedAnswers(): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Mark answer as synced
 */
export async function markAnswerSynced(answerId: number): Promise<void> {
  await db.exam_answers.update(answerId, { synced: true });
}

/**
 * Get activity logs for an attempt
 */
export async function getActivityLogsByAttempt(attemptId: number): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('attempt_id')
    .equals(attemptId)
    .sortBy('timestamp');
}

/**
 * Get unsynced activity logs
 */
export async function getUnsyncedActivityLogs(): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('failed')
    .filter(item => item.retry_count < item.max_retries)
    .sortBy('priority');
}

/**
 * Get sync queue items by attempt
 */
export async function getSyncItemsByAttempt(attemptId: number): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Clear all data (for logout)
 */
export async function clearAllData(): Promise<void> {
  await db.exam_answers.clear();
  await db.activity_logs.clear();
  await db.sync_queue.clear();
  await db.exam_states.clear();
  await db.downloaded_exams.clear();
  await db.media_files.clear();
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}
```

---

#### 📄 File: `./src/lib/db/schema.ts`

```typescript
// src/lib/db/schema.ts
import Dexie, { Table } from 'dexie';
import type { School, User } from '@/types/user';
import type { DownloadedExam, MediaFile } from '@/types/exam';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';
import type { ExamState } from '@/types/exam';

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super('ExamDB');

    this.version(1).stores({
      schools: 'id, subdomain',
      users: 'id, school_id, username',
      downloaded_exams: 'exam_id, attempt_id, downloaded_at',
      media_files: 'id, url, downloaded',
      exam_answers: '++id, attempt_id, question_id, synced',
      activity_logs: '++id, attempt_id, timestamp, synced',
      sync_queue: '++id, attempt_id, type, status, priority',
      exam_states: 'attempt_id',
    });
  }
}

export const db = new ExamDatabase();
```

---

#### 📄 File: `./src/lib/exam/activityLogger.ts`

```typescript
// src/lib/exam/activityLogger.ts
import { db } from '@/lib/db/schema';
import type { ActivityLog, ActivityEventType } from '@/types/activity';

export class ActivityLogger {
  private attemptId: number;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  async log(eventType: ActivityEventType, eventData?: any): Promise<void> {
    const log: ActivityLog = {
      attempt_id: this.attemptId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date(),
      synced: false,
    };

    await db.activity_logs.add(log);
  }

  async getLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .sortBy('timestamp');
  }

  async getUnsyncedLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .and(log => !log.synced)
      .sortBy('timestamp');
  }

  async markSynced(logIds: number[]): Promise<void> {
    for (const id of logIds) {
      await db.activity_logs.update(id, { synced: true });
    }
  }
}
```

---

#### 📄 File: `./src/lib/exam/autoSave.ts`

```typescript
// src/lib/exam/autoSave.ts
export class AutoSaveManager {
  private attemptId: number;
  private intervalId: number | null = null;
  private isPaused: boolean = false;
  private onSaveCallback: (() => Promise<void>) | null = null;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  start(intervalMs: number, onSave: () => Promise<void>): void {
    this.onSaveCallback = onSave;
    this.isPaused = false;

    this.intervalId = window.setInterval(async () => {
      if (!this.isPaused && this.onSaveCallback) {
        try {
          await this.onSaveCallback();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, intervalMs);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async saveNow(): Promise<void> {
    if (this.onSaveCallback) {
      await this.onSaveCallback();
    }
  }
}
```

---

#### 📄 File: `./src/lib/exam/controller.ts`

```typescript
// src/lib/exam/controller.ts
import { db } from '@/lib/db/schema';
import type { Exam, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';
import type { ExamAnswer } from '@/types/answer';

export class ExamController {
  private exam: Exam;
  private questions: Question[];
  private attemptId: number;
  private currentQuestionIndex: number = 0;
  private answers: Map<number, ExamAnswer> = new Map();
  private flags: Set<number> = new Set();

  constructor(exam: Exam, questions: Question[], attemptId: number) {
    this.exam = exam;
    this.questions = questions;
    this.attemptId = attemptId;
  }

  async start(): Promise<void> {
    await this.saveState();
  }

  async loadState(): Promise<void> {
    const state = await db.exam_states.get(this.attemptId);
    
    if (state) {
      this.currentQuestionIndex = state.current_question_index;
      this.flags = new Set(state.flags);
      
      for (const [questionId, answer] of Object.entries(state.answers)) {
        this.answers.set(parseInt(questionId), answer as ExamAnswer);
      }
    }
    
    const savedAnswers = await db.exam_answers
      .where('attempt_id')
      .equals(this.attemptId)
      .toArray();
    
    savedAnswers.forEach(answer => {
      this.answers.set(answer.question_id, answer);
    });
  }

  async saveState(): Promise<void> {
    const answersObj: Record<number, any> = {};
    this.answers.forEach((answer, questionId) => {
      answersObj[questionId] = answer;
    });

    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: this.currentQuestionIndex,
      time_remaining_seconds: 0,
      started_at: new Date(),
      answers: answersObj,
      flags: Array.from(this.flags),
    };

    await db.exam_states.put(state);
  }

  getCurrentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.saveState();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveState();
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      this.saveState();
    }
  }

  saveAnswer(questionId: number, answer: ExamAnswer): void {
    this.answers.set(questionId, answer);
    this.saveState();
  }

  getAnswer(questionId: number): ExamAnswer | undefined {
    return this.answers.get(questionId);
  }

  getAnswers(): ExamAnswer[] {
    return Array.from(this.answers.values());
  }

  toggleFlag(questionId: number): void {
    if (this.flags.has(questionId)) {
      this.flags.delete(questionId);
    } else {
      this.flags.add(questionId);
    }
    this.saveState();
  }

  isFlagged(questionId: number): boolean {
    return this.flags.has(questionId);
  }

  getAnsweredCount(): number {
    return this.answers.size;
  }

  isAnswered(questionId: number): boolean {
    return this.answers.has(questionId);
  }

  getAttemptId(): number {
    return this.attemptId;
  }

  getExam(): Exam {
    return this.exam;
  }
}
```

---

#### 📄 File: `./src/lib/exam/navigation.ts`

```typescript
// Helper logic for navigation state
export function calculateProgress(total: number, answered: number): number {
  if (total === 0) return 0;
  return Math.round((answered / total) * 100);
}

export function getUnansweredQuestions(questions: any[], answers: Record<number, any>): number[] {
  return questions
    .filter(q => !answers[q.id])
    .map(q => q.id);
}
```

---

#### 📄 File: `./src/lib/exam/randomizer.ts`

```typescript
import type { Question, QuestionOption } from '@/types/question';

/**
 * Fisher-Yates Shuffle Algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function randomizeQuestions(questions: Question[]): Question[] {
  return shuffleArray(questions);
}

export function randomizeOptions(options: QuestionOption[]): QuestionOption[] {
  return shuffleArray(options);
}

export function prepareExamForStudent(questions: Question[], randomizeQ: boolean, randomizeO: boolean): Question[] {
  let processedQuestions = randomizeQ ? randomizeQuestions(questions) : [...questions];

  if (randomizeO) {
    processedQuestions = processedQuestions.map(q => {
      if (q.type === 'multiple_choice' || q.type === 'multiple_choice_complex') {
        return {
          ...q,
          options: randomizeOptions(q.options)
        };
      }
      return q;
    });
  }

  return processedQuestions;
}
```

---

#### 📄 File: `./src/lib/exam/stateManager.ts`

```typescript
import { db } from '@/lib/db/schema';
import type { ExamState } from '@/types/exam';

export class ExamStateManager {
  private attemptId: number;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  async saveState(
    currentQuestionIndex: number, 
    timeRemaining: number, 
    answers: Record<number, any>, 
    flags: number[]
  ) {
    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: currentQuestionIndex,
      time_remaining_seconds: timeRemaining,
      started_at: new Date(), // Should be original start time ideally
      answers,
      flags
    };

    await db.exam_states.put(state);
  }

  async loadState(): Promise<ExamState | undefined> {
    return await db.exam_states.get(this.attemptId);
  }

  async clearState() {
    return await db.exam_states.delete(this.attemptId);
  }
}
```

---

#### 📄 File: `./src/lib/exam/timer.ts`

```typescript
// src/lib/exam/timer.ts
export class TimerController {
  private timeRemaining: number;
  private intervalId: number | null = null;
  private onTickCallback: ((timeRemaining: number) => void) | null = null;
  private isPaused: boolean = false;

  constructor(durationSeconds: number) {
    this.timeRemaining = durationSeconds;
  }

  start(onTick: (timeRemaining: number) => void): void {
    this.onTickCallback = onTick;
    this.isPaused = false;

    this.intervalId = window.setInterval(() => {
      if (!this.isPaused && this.timeRemaining > 0) {
        this.timeRemaining--;
        this.onTickCallback?.(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.stop();
      }
    }, 1000);

    this.onTickCallback(this.timeRemaining);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  setTimeRemaining(seconds: number): void {
    this.timeRemaining = seconds;
  }

  addTime(seconds: number): void {
    this.timeRemaining += seconds;
  }

  subtractTime(seconds: number): void {
    this.timeRemaining = Math.max(0, this.timeRemaining - seconds);
  }
}
```

---

#### 📄 File: `./src/lib/exam/validator.ts`

```typescript
import type { Question } from '@/types/question';
import type { ExamAnswer } from '@/types/answer';

export function validateAnswer(question: Question, answer: any): boolean {
  if (!answer) return false;

  switch (question.type) {
    case 'multiple_choice':
      return typeof answer === 'number'; // Expect option ID
    
    case 'multiple_choice_complex':
      return Array.isArray(answer) && answer.length > 0;
    
    case 'true_false':
      return typeof answer === 'boolean';
    
    case 'short_answer':
      return typeof answer === 'string' && answer.trim().length > 0;
    
    case 'essay':
      // Basic check, essay usually needs manual grading or just check if not empty
      return typeof answer === 'string' && answer.trim().length > 0;
      
    case 'matching':
      // Check if all pairs are matched (optional strictness)
      return typeof answer === 'object' && Object.keys(answer).length > 0;
      
    default:
      return false;
  }
}

export function isExamComplete(questions: Question[], answers: Record<number, ExamAnswer>): boolean {
  return questions.every(q => {
    const ans = answers[q.id];
    // Check if answer exists and has content
    // Note: This is a simple check. Depending on requirements, 
    // we might allow submitting with empty answers.
    return !!ans; 
  });
}
```

---

#### 📄 File: `./src/lib/hooks/useAuth.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useAutoSave.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { AutoSaveManager } from '@/lib/exam/autoSave';

// Hook untuk React Components (jika menggunakan React Islands)
export function useAutoSave(attemptId: number, onSave: () => Promise<void>, interval: number = 30000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const managerRef = useRef<AutoSaveManager | null>(null);

  useEffect(() => {
    managerRef.current = new AutoSaveManager(attemptId);
    
    managerRef.current.start(interval, async () => {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    });

    return () => {
      managerRef.current?.stop();
    };
  }, [attemptId, interval, onSave]);

  const saveNow = async () => {
    setIsSaving(true);
    try {
      await managerRef.current?.saveNow();
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, lastSaved, saveNow };
}
```

---

#### 📄 File: `./src/lib/hooks/useDeviceWarnings.ts`

```typescript
import { useState, useEffect } from 'react';
import { checkStorageSpace } from '@/lib/utils/storage';
import { getBatteryStatus } from '@/lib/utils/device';
import { appConfig } from '@/lib/config/app';

export function useDeviceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([]);

  const checkStatus = async () => {
    const newWarnings: string[] = [];

    // Cek Storage
    const storage = await checkStorageSpace();
    if (storage.available < appConfig.exam.warningThresholds.storage) {
      newWarnings.push('Ruang penyimpanan hampir penuh. Mohon hapus beberapa data.');
    }

    // Cek Baterai
    const battery = await getBatteryStatus();
    if (battery && !battery.charging && battery.level < appConfig.exam.warningThresholds.battery) {
      newWarnings.push('Baterai lemah. Mohon hubungkan charger.');
    }

    setWarnings(newWarnings);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Cek setiap menit
    return () => clearInterval(interval);
  }, []);

  return { warnings };
}
```

---

#### 📄 File: `./src/lib/hooks/useExam.ts`

```typescript
import { useStore } from '@nanostores/react';
import { $examStore, nextQuestion, previousQuestion, goToQuestion, setAnswer } from '@/stores/exam';
import { $answersStore } from '@/stores/answers';

export function useExam() {
  const examState = useStore($examStore);
  const answersState = useStore($answersStore);

  return {
    exam: examState.exam,
    currentQuestion: examState.questions[examState.currentQuestionIndex],
    currentIndex: examState.currentQuestionIndex,
    totalQuestions: examState.questions.length,
    answers: answersState.answers,
    
    // Actions
    nextQuestion,
    previousQuestion,
    goToQuestion,
    setAnswer: (questionId: number, value: any) => {
      // Logic wrapper to update store
      // Implementation depends on answer structure
    }
  };
}
```

---

#### 📄 File: `./src/lib/hooks/useLocalStorage.ts`

```typescript
import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

---

#### 📄 File: `./src/lib/hooks/useMediaRecorder.ts`

```typescript
import { useState, useCallback, useRef } from 'react'; // Jika menggunakan React/Preact
// Atau versi Vanilla JS class untuk penggunaan langsung di Astro script

export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  public onStop: ((blob: Blob, duration: number) => void) | null = null;
  public onDataAvailable: ((data: Blob) => void) | null = null;
  private startTime: number = 0;

  async start(type: 'audio' | 'video'): Promise<MediaStream> {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: { facingMode: 'user', width: 1280, height: 720 } };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const mimeType = type === 'audio' 
        ? 'audio/webm;codecs=opus' 
        : 'video/webm;codecs=vp9';

      // Fallback mime types checking could go here

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.chunks = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
          this.onDataAvailable?.(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        const duration = (Date.now() - this.startTime) / 1000;
        this.onStop?.(blob, duration);
        this.cleanup();
      };

      this.mediaRecorder.start(1000); // Collect chunks every second
      this.startTime = Date.now();
      
      return this.stream;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
```

---

#### 📄 File: `./src/lib/hooks/useOnlineStatus.ts`

```typescript
import { useState, useEffect } from 'react'; // Assuming React/Preact usage in islands, or just pure JS logic below

// Pure JS implementation for Astro scripts
export class OnlineStatusTracker {
  private listeners: ((isOnline: boolean) => void)[] = [];
  public isOnline: boolean;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public subscribe(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

export const onlineStatus = new OnlineStatusTracker();
```

---

#### 📄 File: `./src/lib/hooks/useTimer.ts`

```typescript
// Utility untuk timer ujian
export class ExamTimer {
  private remainingSeconds: number;
  private intervalId: number | null = null;
  private onTick: (seconds: number) => void;
  private onTimeUp: () => void;

  constructor(initialSeconds: number, onTick: (s: number) => void, onTimeUp: () => void) {
    this.remainingSeconds = initialSeconds;
    this.onTick = onTick;
    this.onTimeUp = onTimeUp;
  }

  start() {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      this.remainingSeconds--;
      this.onTick(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onTimeUp();
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  sync(serverSeconds: number) {
    // Logic untuk sinkronisasi waktu jika ada selisih besar
    if (Math.abs(this.remainingSeconds - serverSeconds) > 5) {
      this.remainingSeconds = serverSeconds;
    }
  }
}
```

---

#### 📄 File: `./src/lib/hooks/useToast.ts`

```typescript
import { showToast, removeToast, clearToasts } from '@/stores/toast';

export function useToast() {
  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
    remove: removeToast,
    clear: clearToasts,
  };
}
```

---

#### 📄 File: `./src/lib/media/compress.ts`

```typescript
// Simple image compression using Canvas
export async function compressImage(file: File, quality: number = 0.7, maxWidth: number = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
```

---

#### 📄 File: `./src/lib/media/download.ts`

```typescript
// Utility untuk mendownload media dari URL dan menyimpannya sebagai Blob
export async function fetchMediaAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch media: ${url}`);
  return await response.blob();
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}
```

---

#### 📄 File: `./src/lib/media/player.ts`

```typescript
// Helper class untuk mengontrol media playback
export class MediaController {
  private element: HTMLMediaElement;

  constructor(element: HTMLMediaElement) {
    this.element = element;
  }

  play() {
    return this.element.play();
  }

  pause() {
    this.element.pause();
  }

  setSpeed(rate: number) {
    this.element.playbackRate = rate;
  }

  seek(time: number) {
    this.element.currentTime = time;
  }
}
```

---

#### 📄 File: `./src/lib/media/recorder.ts`

```typescript
// Wrapper for MediaRecorder API to handle browser inconsistencies
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  
  async start(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };
    
    this.mediaRecorder.start();
    return stream;
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('Recorder not initialized');
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
}
```

---

#### 📄 File: `./src/lib/media/stream.ts`

```typescript
// Helper untuk mendapatkan media stream
export async function getMediaStream(audio: boolean = true, video: boolean = false): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
      video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices.', error);
    throw error;
  }
}

export function stopMediaStream(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop());
}
```

---

#### 📄 File: `./src/lib/media/upload.ts`

```typescript
import { apiClient } from '@/lib/api/client';

const CHUNK_SIZE = 1024 * 1024; // 1MB

export async function uploadMediaChunked(
  attemptId: number,
  answerId: number,
  file: Blob,
  checksum: string,
  onProgress: (progress: number) => void
) {
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  const uploadId = `${attemptId}-${answerId}-${Date.now()}`;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', i.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('checksum', checksum); // Send checksum with final chunk or init

    await apiClient.post(`/student/attempts/${attemptId}/answers/${answerId}/media-chunk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const progress = Math.round(((i + 1) / totalChunks) * 100);
    onProgress(progress);
  }
  
  return { success: true, uploadId };
}
```

---

#### 📄 File: `./src/lib/offline/cache.ts`

```typescript
export const CACHE_NAME = 'exam-assets-v1';

export async function cacheAssets(urls: string[]) {
  if ('caches' in window) {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
  }
}

export async function clearOldCaches(currentCache: string) {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== currentCache) return caches.delete(key);
      })
    );
  }
}
```

---

#### 📄 File: `./src/lib/offline/checksum.ts`

```typescript
// src/lib/offline/checksum.ts
import CryptoJS from 'crypto-js';

export function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}

export async function sha256ArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateChecksum(data: any, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
}

export async function generateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}

export async function generateBlobChecksum(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}
```

---

#### 📄 File: `./src/lib/offline/compress.ts`

```typescript
// src/lib/offline/compress.ts
import pako from 'pako';

export function compressData(data: string): Uint8Array {
  return pako.deflate(data);
}

export function decompressData(compressed: Uint8Array): string {
  return pako.inflate(compressed, { to: 'string' });
}

export function compressJSON(obj: any): Uint8Array {
  const jsonString = JSON.stringify(obj);
  return compressData(jsonString);
}

export function decompressJSON(compressed: Uint8Array): any {
  const jsonString = decompressData(compressed);
  return JSON.parse(jsonString);
}

export function base64Encode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data));
}

export function base64Decode(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
```

---

#### 📄 File: `./src/lib/offline/download.ts`

```typescript
// src/lib/offline/download.ts
import { apiClient } from '@/lib/api/client';
import { db } from '@/lib/db/schema';
import { encrypt } from '@/lib/db/encryption';
import { generateChecksum, sha256ArrayBuffer } from './checksum';
import type { DownloadProgress } from '@/types/sync';
import type { MediaFile } from '@/types/exam';

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  try {
    onProgress?.({
      phase: 'preparing',
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(`/student/exams/${examId}/prepare`);
    const { attempt_id } = prepareResponse.data;

    onProgress?.({
      phase: 'exam_data',
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(`/student/exams/${examId}/download`);
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error('Checksum validation failed');
    }

    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    onProgress?.({
      phase: 'media_files',
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: 'media_files',
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    onProgress?.({
      phase: 'complete',
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`,
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}

export async function deleteDownloadedExam(examId: number): Promise<void> {
  await db.downloaded_exams.where('exam_id').equals(examId).delete();
  
  const mediaFiles = await db.media_files.toArray();
  for (const file of mediaFiles) {
    await db.media_files.delete(file.id);
  }
}
```

---

#### 📄 File: `./src/lib/offline/queue.ts`

```typescript
import { db } from '@/lib/db/schema';
import type { SyncQueueItem } from '@/types/sync';

export async function addToQueue(
  type: SyncQueueItem['type'],
  data: any,
  priority: number = 1
) {
  const item: SyncQueueItem = {
    type,
    data,
    priority,
    retry_count: 0,
    max_retries: 5,
    status: 'pending',
    created_at: new Date()
  };

  // @ts-ignore - Dexie types sometimes tricky with auto-increment
  return await db.sync_queue.add(item);
}

export async function getNextBatch(limit: number = 10) {
  return await db.sync_queue
    .where('status')
    .equals('pending')
    .sortBy('priority') 
    .then(items => items.reverse().slice(0, limit));
}

export async function markAsProcessed(id: number) {
  return await db.sync_queue.update(id, {
    status: 'completed',
    processed_at: new Date()
  });
}

export async function markAsFailed(id: number, error: string) {
  const item = await db.sync_queue.get(id);
  if (!item) return;

  const newRetryCount = item.retry_count + 1;
  const status = newRetryCount >= item.max_retries ? 'failed' : 'pending';

  return await db.sync_queue.update(id, {
    status,
    retry_count: newRetryCount,
    error_message: error
  });
}
```

---

#### 📄 File: `./src/lib/offline/sync.ts`

```typescript
// src/lib/offline/sync.ts
import { db } from '@/lib/db/schema';
import { apiClient } from '@/lib/api/client';
import type { SyncQueueItem, SyncProgress } from '@/types/sync';

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const pendingItems = await db.sync_queue
        .where('status')
        .equals('pending')
        .or('status')
        .equals('failed')
        .filter(item => item.retry_count < item.max_retries)
        .sortBy('priority');

      for (const item of pendingItems.reverse()) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      await db.sync_queue.update(item.id!, { status: 'processing' });

      switch (item.type) {
        case 'answer':
          await this.syncAnswer(item);
          break;
        case 'media':
          await this.syncMedia(item);
          break;
        case 'activity':
          await this.syncActivity(item);
          break;
        case 'submission':
          await this.syncSubmission(item);
          break;
      }

      await db.sync_queue.update(item.id!, {
        status: 'completed',
        processed_at: new Date(),
      });

      window.dispatchEvent(
        new CustomEvent('sync:progress', {
          detail: { item, status: 'completed' },
        })
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        await db.sync_queue.update(item.id!, {
          status: 'failed',
          retry_count: newRetryCount,
          error_message: error.message,
        });

        window.dispatchEvent(
          new CustomEvent('sync:error', {
            detail: { item, error: error.message },
          })
        );
      } else {
        await db.sync_queue.update(item.id!, {
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answers } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/answers`, { answers });
  }

  private async syncMedia(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;
    
    const formData = new FormData();
    formData.append('file', media_blob);
    formData.append('checksum', checksum);
    
    await apiClient.post(`/student/attempts/${attempt_id}/answers/${answer_id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  private async syncActivity(item: SyncQueueItem): Promise<void> {
    const { attempt_id, events } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/activity`, { events });
  }

  private async syncSubmission(item: SyncQueueItem): Promise<void> {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at,
      answers,
      activity_logs,
    });
  }

  async getSyncStatus(attemptId: number): Promise<SyncProgress> {
    const items = await db.sync_queue
      .where('attempt_id')
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const failed = items.filter(i => i.status === 'failed').length;
    const pending = items.filter(i => i.status === 'pending' || i.status === 'processing').length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

export const syncManager = new SyncManager();
```

---

#### 📄 File: `./src/lib/utils/crypto.ts`

```typescript
import CryptoJS from 'crypto-js';

const SALT = import.meta.env.PUBLIC_CRYPTO_SALT || 'default-salt';

export function hashString(str: string): string {
  return CryptoJS.SHA256(str + SALT).toString();
}

export function generateRandomString(length: number = 16): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

// Obfuscation sederhana untuk local storage (bukan enkripsi tingkat tinggi)
export function obfuscate(text: string): string {
  return btoa(text);
}

export function deobfuscate(text: string): string {
  try {
    return atob(text);
  } catch {
    return '';
  }
}
```

---

#### 📄 File: `./src/lib/utils/device.ts`

```typescript
// src/lib/utils/device.ts
import CryptoJS from 'crypto-js';

/**
 * Generate unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || '0');

  // 7. Canvas fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ExamApp', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ExamApp', 4, 17);
    components.push(canvas.toDataURL());
  }

  // 8. WebGL fingerprint
  try {
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    // WebGL not supported
  }

  // Combine and hash
  const fingerprint = components.join('|||');
  return CryptoJS.SHA256(fingerprint).toString();
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cpuCores: navigator.hardwareConcurrency || 0,
  };
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
}

/**
 * Get battery status
 */
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
} | null> {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
      };
    } catch (error) {
      console.error('Failed to get battery status:', error);
      return null;
    }
  }
  return null;
}
```

---

#### 📄 File: `./src/lib/utils/error.ts`

```typescript
export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Network Error') || 
    error.message.includes('Failed to fetch') ||
    error.name === 'NetworkError'
  );
}
```

---

#### 📄 File: `./src/lib/utils/format.ts`

```typescript
// src/lib/utils/format.ts
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

---

#### 📄 File: `./src/lib/utils/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: this.context,
      message,
      data
    };
  }

  info(message: string, data?: any) {
    if (import.meta.env.DEV) {
      console.log(`[INFO] [${this.context}] ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] [${this.context}] ${message}`, error || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] [${this.context}] ${message}`, data || '');
  }
}

export const logger = new Logger();
export const createLogger = (context: string) => new Logger(context);
```

---

#### 📄 File: `./src/lib/utils/network.ts`

```typescript
// src/lib/utils/network.ts
export function isOnline(): boolean {
  return navigator.onLine;
}

export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}

export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function checkConnection(url: string = '/api/health'): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function getConnectionType(): string {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || 'unknown';
}
```

---

#### 📄 File: `./src/lib/utils/storage.ts`

```typescript
// src/lib/utils/storage.ts
export async function checkStorageSpace(): Promise<{
  available: number;
  total: number;
  used: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      available: (estimate.quota || 0) - (estimate.usage || 0),
      total: estimate.quota || 0,
      used: estimate.usage || 0,
    };
  }
  
  return {
    available: 0,
    total: 0,
    used: 0,
  };
}

export async function getStorageUsageGB(): Promise<number> {
  const storage = await checkStorageSpace();
  return storage.used / (1024 ** 3);
}

export async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  const storage = await checkStorageSpace();
  return storage.available >= requiredBytes;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return await navigator.storage.persist();
  }
  return false;
}

export async function isPersisted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    return await navigator.storage.persisted();
  }
  return false;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

---

#### 📄 File: `./src/lib/utils/time.ts`

```typescript
// src/lib/utils/time.ts
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  
  return `${minutes} menit`;
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm');
}

export function getTimeRemaining(endDate: Date | string): number {
  return Math.max(0, differenceInSeconds(new Date(endDate), new Date()));
}

export function isWithinTimeWindow(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}
```

---

#### 📄 File: `./src/lib/utils/validation.ts`

```typescript
// src/lib/utils/validation.ts
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20;
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
```

---

### 📂 Sub-direktori: src/stores

#### 📄 File: `./src/stores/activity.ts`

```typescript
// src/stores/activity.ts
import { atom } from 'nanostores';
import type { ActivityLog } from '@/types/activity';

interface ActivityState {
  logs: ActivityLog[];
  pendingSync: number;
}

const initialState: ActivityState = {
  logs: [],
  pendingSync: 0,
};

export const $activityStore = atom<ActivityState>(initialState);

export function addActivityLog(log: ActivityLog): void {
  const state = $activityStore.get();
  $activityStore.set({
    logs: [...state.logs, log],
    pendingSync: state.pendingSync + 1,
  });
}

export function clearActivityLogs(): void {
  $activityStore.set(initialState);
}

export function decrementPendingSync(): void {
  const state = $activityStore.get();
  $activityStore.set({
    ...state,
    pendingSync: Math.max(0, state.pendingSync - 1),
  });
}
```

---

#### 📄 File: `./src/stores/answers.ts`

```typescript
// src/stores/answers.ts
import { atom } from 'nanostores';
import { db } from '@/lib/db/schema';
import type { ExamAnswer } from '@/types/answer';

interface AnswersState {
  answers: Record<number, ExamAnswer>;
  isDirty: boolean;
  lastSaved: Date | null;
}

const initialState: AnswersState = {
  answers: {},
  isDirty: false,
  lastSaved: null,
};

export const $answersStore = atom<AnswersState>(initialState);

export function setAnswer(questionId: number, answer: ExamAnswer): void {
  const state = $answersStore.get();
  $answersStore.set({
    ...state,
    answers: {
      ...state.answers,
      [questionId]: answer,
    },
    isDirty: true,
  });
}

export function getAnswer(questionId: number): ExamAnswer | undefined {
  return $answersStore.get().answers[questionId];
}

export function getAllAnswers(): ExamAnswer[] {
  return Object.values($answersStore.get().answers);
}

export function setAnswers(answers: Record<number, ExamAnswer>): void {
  $answersStore.set({
    ...$answersStore.get(),
    answers,
  });
}

export async function loadAnswers(attemptId: number): Promise<void> {
  const answers = await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
  
  const answersMap: Record<number, ExamAnswer> = {};
  answers.forEach(answer => {
    answersMap[answer.question_id] = answer;
  });
  
  $answersStore.set({
    answers: answersMap,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export async function saveAnswers(attemptId: number): Promise<void> {
  const state = $answersStore.get();
  
  if (!state.isDirty) {
    return;
  }
  
  const answers = Object.values(state.answers);
  
  await db.exam_answers.bulkPut(answers);
  
  $answersStore.set({
    ...state,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function markSaved(): void {
  $answersStore.set({
    ...$answersStore.get(),
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function clearAnswers(): void {
  $answersStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/auth.ts`

```typescript
// src/stores/auth.ts
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { User, School } from '@/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  school: School | null;
  accessToken: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  school: null,
  accessToken: null,
};

// Create persistent atom for auth state
export const $authStore = persistentAtom<AuthState>('auth', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Getters
export function getUser(): User | null {
  return $authStore.get().user;
}

export function getSchool(): School | null {
  return $authStore.get().school;
}

export function getAccessToken(): string | null {
  return $authStore.get().accessToken;
}

export function isAuthenticated(): boolean {
  return $authStore.get().isAuthenticated;
}

// Actions
export function setAuth(data: Partial<AuthState>): void {
  $authStore.set({
    ...$authStore.get(),
    ...data,
  });
}

export function clearAuth(): void {
  $authStore.set(initialState);
}

export function setUser(user: User): void {
  $authStore.set({
    ...$authStore.get(),
    user,
  });
}

export function setSchool(school: School): void {
  $authStore.set({
    ...$authStore.get(),
    school,
  });
}

export function setAccessToken(token: string): void {
  $authStore.set({
    ...$authStore.get(),
    accessToken: token,
  });
}
```

---

#### 📄 File: `./src/stores/exam.ts`

```typescript
// src/stores/exam.ts
import { atom, computed } from 'nanostores';
import type { Exam, ExamAttempt, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';

interface CurrentExamState {
  exam: Exam | null;
  attempt: ExamAttempt | null;
  questions: Question[];
  currentQuestionIndex: number;
  flags: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CurrentExamState = {
  exam: null,
  attempt: null,
  questions: [],
  currentQuestionIndex: 0,
  flags: [],
  isLoading: false,
  error: null,
};

export const $examStore = atom<CurrentExamState>(initialState);

// Computed values
export const $currentQuestion = computed($examStore, (state) => {
  if (state.questions.length === 0) return null;
  return state.questions[state.currentQuestionIndex] || null;
});

export const $totalQuestions = computed($examStore, (state) => {
  return state.questions.length;
});

export const $hasNext = computed($examStore, (state) => {
  return state.currentQuestionIndex < state.questions.length - 1;
});

export const $hasPrevious = computed($examStore, (state) => {
  return state.currentQuestionIndex > 0;
});

// Actions
export function setExam(exam: Exam): void {
  $examStore.set({
    ...$examStore.get(),
    exam,
  });
}

export function setAttempt(attempt: ExamAttempt): void {
  $examStore.set({
    ...$examStore.get(),
    attempt,
  });
}

export function setQuestions(questions: Question[]): void {
  $examStore.set({
    ...$examStore.get(),
    questions,
  });
}

export function setCurrentQuestionIndex(index: number): void {
  const state = $examStore.get();
  if (index >= 0 && index < state.questions.length) {
    $examStore.set({
      ...state,
      currentQuestionIndex: index,
    });
  }
}

export function nextQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex < state.questions.length - 1) {
    setCurrentQuestionIndex(state.currentQuestionIndex + 1);
  }
}

export function previousQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex > 0) {
    setCurrentQuestionIndex(state.currentQuestionIndex - 1);
  }
}

export function goToQuestion(index: number): void {
  setCurrentQuestionIndex(index);
}

export function toggleFlag(questionId: number): void {
  const state = $examStore.get();
  const flags = [...state.flags];
  const index = flags.indexOf(questionId);
  
  if (index > -1) {
    flags.splice(index, 1);
  } else {
    flags.push(questionId);
  }
  
  $examStore.set({
    ...state,
    flags,
  });
}

export function isFlagged(questionId: number): boolean {
  return $examStore.get().flags.includes(questionId);
}

export function setLoading(isLoading: boolean): void {
  $examStore.set({
    ...$examStore.get(),
    isLoading,
  });
}

export function setError(error: string | null): void {
  $examStore.set({
    ...$examStore.get(),
    error,
  });
}

export function resetExam(): void {
  $examStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/offline.ts`

```typescript
// src/stores/offline.ts
import { atom } from 'nanostores';
import type { DownloadedExam } from '@/types/exam';

interface OfflineState {
  downloadedExams: DownloadedExam[];
  isDownloading: boolean;
  currentDownload: number | null;
  downloadProgress: number;
}

const initialState: OfflineState = {
  downloadedExams: [],
  isDownloading: false,
  currentDownload: null,
  downloadProgress: 0,
};

export const $offlineStore = atom<OfflineState>(initialState);

export function setDownloadedExams(exams: DownloadedExam[]): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadedExams: exams,
  });
}

export function addDownloadedExam(exam: DownloadedExam): void {
  const state = $offlineStore.get();
  $offlineStore.set({
    ...state,
    downloadedExams: [...state.downloadedExams, exam],
  });
}

export function setDownloading(isDownloading: boolean, examId?: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    isDownloading,
    currentDownload: isDownloading ? examId || null : null,
    downloadProgress: isDownloading ? 0 : 100,
  });
}

export function setDownloadProgress(progress: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadProgress: progress,
  });
}

export function clearOfflineData(): void {
  $offlineStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/sync.ts`

```typescript
// src/stores/sync.ts
import { atom } from 'nanostores';
import type { SyncProgress } from '@/types/sync';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  progress: SyncProgress | null;
  lastSync: Date | null;
  error: string | null;
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
  isSyncing: false,
  progress: null,
  lastSync: null,
  error: null,
};

export const $syncStore = atom<SyncState>(initialState);

export function setOnlineStatus(isOnline: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isOnline,
  });
}

export function setSyncing(isSyncing: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing,
  });
}

export function setSyncProgress(progress: SyncProgress): void {
  $syncStore.set({
    ...$syncStore.get(),
    progress,
  });
}

export function setSyncCompleted(): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    progress: null,
    lastSync: new Date(),
    error: null,
  });
}

export function setSyncError(error: string): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    error,
  });
}

export function clearSyncError(): void {
  $syncStore.set({
    ...$syncStore.get(),
    error: null,
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setOnlineStatus(true));
  window.addEventListener('offline', () => setOnlineStatus(false));
}
```

---

#### 📄 File: `./src/stores/timer.ts`

```typescript
// src/stores/timer.ts
import { atom } from 'nanostores';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedAt: number | null;
}

const initialState: TimerState = {
  timeRemaining: 0,
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
};

export const $timerStore = atom<TimerState>(initialState);

export function setTimeRemaining(seconds: number): void {
  $timerStore.set({
    ...$timerStore.get(),
    timeRemaining: seconds,
  });
}

export function startTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
  });
}

export function pauseTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: true,
    pausedAt: Date.now(),
  });
}

export function resumeTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: false,
    pausedAt: null,
  });
}

export function stopTimer(): void {
  $timerStore.set(initialState);
}

export function decrementTime(): void {
  const state = $timerStore.get();
  if (state.timeRemaining > 0) {
    $timerStore.set({
      ...state,
      timeRemaining: state.timeRemaining - 1,
    });
  }
}
```

---

#### 📄 File: `./src/stores/toast.ts`

```typescript
// src/stores/toast.ts
import { atom } from 'nanostores';
import type { ToastMessage } from '@/types/common';

interface ToastState {
  messages: ToastMessage[];
}

const initialState: ToastState = {
  messages: [],
};

export const $toastStore = atom<ToastState>(initialState);

export function showToast(
  type: ToastMessage['type'],
  message: string,
  duration: number = 3000
): void {
  const id = Date.now().toString();
  const toast: ToastMessage = { id, type, message, duration };
  
  const state = $toastStore.get();
  $toastStore.set({
    messages: [...state.messages, toast],
  });
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function removeToast(id: string): void {
  const state = $toastStore.get();
  $toastStore.set({
    messages: state.messages.filter(m => m.id !== id),
  });
}

export function clearToasts(): void {
  $toastStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/ui.ts`

```typescript
// src/stores/ui.ts
import { persistentAtom } from '@nanostores/persistent';
import type { Theme, FontSize } from '@/types/common';

interface UIState {
  theme: Theme;
  fontSize: FontSize;
  highContrast: boolean;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  sidebarOpen: true,
};

export const $uiStore = persistentAtom<UIState>('ui-settings', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setTheme(theme: Theme): void {
  $uiStore.set({ ...$uiStore.get(), theme });
  
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function setFontSize(fontSize: FontSize): void {
  $uiStore.set({ ...$uiStore.get(), fontSize });
  
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') document.documentElement.classList.add('text-sm');
    if (fontSize === 'large') document.documentElement.classList.add('text-lg');
  }
}

export function toggleHighContrast(): void {
  const current = $uiStore.get();
  const newValue = !current.highContrast;
  $uiStore.set({ ...current, highContrast: newValue });
  
  if (typeof document !== 'undefined') {
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
}

export function toggleSidebar(): void {
  const current = $uiStore.get();
  $uiStore.set({ ...current, sidebarOpen: !current.sidebarOpen });
}

export function setSidebarOpen(isOpen: boolean): void {
  $uiStore.set({ ...$uiStore.get(), sidebarOpen: isOpen });
}
```

---

### 📂 Sub-direktori: src/types

#### 📄 File: `./src/types/activity.ts`

```typescript
// src/types/activity.ts
export type ActivityEventType =
  | 'exam_started'
  | 'exam_paused'
  | 'exam_resumed'
  | 'exam_submitted'
  | 'question_viewed'
  | 'answer_changed'
  | 'tab_switched'
  | 'fullscreen_exited'
  | 'suspicious_activity'
  | 'media_played'
  | 'media_recorded';

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: ActivityEventType;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SuspiciousActivity {
  type: 'copy_attempt' | 'paste_attempt' | 'screenshot' | 'tab_switch' | 'fullscreen_exit';
  timestamp: Date;
  details?: string;
}
```

---

#### 📄 File: `./src/types/answer.ts`

```typescript
// src/types/answer.ts
export interface BaseAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answered_at: Date;
  synced: boolean;
}

export interface MultipleChoiceAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_id: number;
}

export interface MultipleChoiceComplexAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_ids: number[];
}

export interface TrueFalseAnswer extends BaseAnswer {
  answer_text?: string;
  selected_value: boolean;
}

export interface MatchingAnswer extends BaseAnswer {
  answer_json: Record<number, number>; // left_id => right_id
}

export interface ShortAnswerAnswer extends BaseAnswer {
  answer_text: string;
}

export interface EssayAnswer extends BaseAnswer {
  answer_text?: string;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answer_media_url?: string;
  answer_media_duration?: number;
}

export type Answer =
  | MultipleChoiceAnswer
  | MultipleChoiceComplexAnswer
  | TrueFalseAnswer
  | MatchingAnswer
  | ShortAnswerAnswer
  | EssayAnswer;

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface GradedAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_url?: string;
  points_earned: number;
  points_possible: number;
  is_correct: boolean;
  graded_by?: number;
  graded_at?: string;
  feedback?: string;
}
```

---

#### 📄 File: `./src/types/api.ts`

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: import('./user').User;
  school: import('./user').School;
}

export interface ExamDownloadResponse {
  exam: import('./exam').Exam;
  questions: import('./question').Question[];
  media_files: import('./exam').MediaFile[];
  checksum: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}
```

---

#### 📄 File: `./src/types/common.ts`

```typescript
// src/types/common.ts
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface DeviceWarning {
  type: 'storage' | 'battery' | 'network' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
```

---

#### 📄 File: `./src/types/exam.ts`

```typescript
// src/types/exam.ts
export interface Exam {
  id: number;
  school_id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  show_results: boolean;
  allow_review: boolean;
  max_attempts: number;
  window_start_at: string;
  window_end_at: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  id: number;
  exam_id: number;
  name: string;
  start_time: string;
  end_time: string;
  room_id?: number;
  proctors: number[];
  created_at: string;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  user_id: number;
  session_id?: number;
  started_at: string;
  submitted_at?: string;
  time_remaining_seconds: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'submitted' | 'graded';
  score?: number;
  total_score: number;
  device_fingerprint: string;
  ip_address?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string;
  checksum: string;
  size: number;
  type: 'image' | 'audio' | 'video';
  downloaded: boolean;
}
```

---

#### 📄 File: `./src/types/media.ts`

```typescript
// src/types/media.ts
export type MediaRecorderType = 'audio' | 'video';
export type MediaRecorderState = 'inactive' | 'recording' | 'paused';

export interface MediaRecorderOptions {
  type: MediaRecorderType;
  maxDuration: number; // in seconds
  maxSize?: number; // in bytes
  mimeType?: string;
}

export interface RecordedMedia {
  blob: Blob;
  duration: number;
  type: MediaRecorderType;
  size: number;
  mimeType: string;
}

export interface MediaPlayerOptions {
  url: string;
  type: 'audio' | 'video';
  repeatable?: boolean;
  maxPlays?: number;
}

export interface MediaPlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playCount: number;
  maxPlays?: number;
}
```

---

#### 📄 File: `./src/types/question.ts`

```typescript
// src/types/question.ts
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_choice_complex'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'essay';

export type MediaType = 'image' | 'audio' | 'video';

export interface BaseQuestion {
  id: number;
  exam_id: number;
  type: QuestionType;
  question_text: string;
  question_html?: string;
  points: number;
  order_number: number;
  media_url?: string;
  media_type?: MediaType;
  media_repeatable?: boolean;
  media_max_plays?: number;
  created_at: string;
  updated_at: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: QuestionOption[];
}

export interface MultipleChoiceComplexQuestion extends BaseQuestion {
  type: 'multiple_choice_complex';
  options: QuestionOption[];
  min_selections?: number;
  max_selections?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correct_answer: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  max_length?: number;
  case_sensitive?: boolean;
  correct_answers?: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  min_words?: number;
  max_words?: number;
  require_media?: boolean;
  media_type?: 'audio' | 'video';
  max_media_duration?: number; // in seconds
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleChoiceComplexQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | ShortAnswerQuestion
  | EssayQuestion;

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_html?: string;
  is_correct: boolean;
  order_number: number;
  media_url?: string;
}

export interface MatchingPair {
  id: number;
  question_id: number;
  left_text: string;
  right_text: string;
  left_media_url?: string;
  right_media_url?: string;
  order_number: number;
}

export interface QuestionTag {
  id: number;
  name: string;
  color?: string;
}
```

---

#### 📄 File: `./src/types/sync.ts`

```typescript
// src/types/sync.ts
export type SyncItemType = 'answer' | 'media' | 'activity' | 'submission';
export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: SyncItemType;
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: SyncStatus;
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  percentage: number;
}

export interface DownloadProgress {
  phase: 'preparing' | 'exam_data' | 'media_files' | 'complete';
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export interface UploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
  currentChunk?: number;
  totalChunks?: number;
}
```

---

#### 📄 File: `./src/types/user.ts`

```typescript
// src/types/user.ts
export type UserRole = 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  role: 'siswa';
  student_id: string;
  class_id?: number;
  class_name?: string;
}

export interface Teacher extends User {
  role: 'guru';
  teacher_id: string;
  subjects?: string[];
}

export interface Proctor extends User {
  role: 'pengawas';
}

export interface Operator extends User {
  role: 'operator';
}

export interface SuperAdmin extends User {
  role: 'superadmin';
}
```

---

### 📂 Sub-direktori: src/styles

#### 📄 File: `./src/styles/animations.css`

```css
/* src/styles/animations.css */

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Pulse for Recording */
@keyframes recordingPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.recording-active {
  animation: recordingPulse 2s infinite;
}

/* Shake for Error */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
```

---

#### 📄 File: `./src/styles/arabic.css`

```css
/* src/styles/arabic.css */

/* Define Arabic Fonts */
@font-face {
  font-family: 'Amiri';
  src: url('/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Scheherazade';
  src: url('/fonts/Scheherazade-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Utility Classes */
.font-arabic {
  font-family: 'Amiri', serif;
  line-height: 1.8;
}

.font-quran {
  font-family: 'Scheherazade', serif;
  line-height: 2.2;
}

/* RTL Support */
.rtl {
  direction: rtl;
  text-align: right;
}

/* Quranic Text Specifics */
.ayat-number {
  font-family: sans-serif;
  font-size: 0.8em;
  border: 1px solid currentColor;
  border-radius: 50%;
  padding: 2px 6px;
  margin: 0 5px;
  display: inline-block;
}
```

---

#### 📄 File: `./src/styles/global.css`

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-base-100 text-base-content;
  }
  
  html {
    @apply scroll-smooth;
  }
}

@layer components {
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    @apply w-2;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-base-200;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-base-300 rounded-full;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-base-content/20;
  }
  
  /* Exam container - no select */
  .exam-no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Loading spinner */
  .spinner {
    @apply inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin;
  }
  
  /* High contrast mode */
  .high-contrast {
    @apply contrast-125;
  }
  
  .high-contrast * {
    @apply border-2;
  }
}

@layer utilities {
  /* Text utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  /* Focus visible */
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  }
  
  /* Truncate multiline */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Print styles */
@media print {
  body {
    @apply bg-white text-black;
  }
  
  .no-print {
    display: none !important;
  }
}
```

---

#### 📄 File: `./src/styles/print.css`

```css
/* src/styles/print.css */
@media print {
  /* Sembunyikan elemen navigasi dan UI yang tidak perlu */
  header, 
  aside, 
  footer, 
  .no-print, 
  .btn, 
  .modal, 
  .toast,
  .breadcrumbs {
    display: none !important;
  }

  /* Reset layout */
  body, main {
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
    color: black;
    display: block;
  }

  /* Atur tipografi untuk cetak */
  body {
    font-size: 12pt;
    line-height: 1.5;
  }

  /* Penanganan Page Break */
  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Soal Ujian */
  .question-item {
    page-break-inside: avoid;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  /* Tampilkan URL link (opsional) */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
  }
}
```

---

#### 📄 File: `./src/styles/themes.css`

```css
/* src/styles/themes.css */

/* Custom Theme Variables Override */
:root {
  --rounded-box: 1rem;
  --rounded-btn: 0.5rem;
  --rounded-badge: 1.9rem;
  --animation-btn: 0.25s;
  --animation-input: 0.2s;
  --btn-focus-scale: 0.95;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: 0.5rem;
}

/* High Contrast Mode Overrides */
.high-contrast {
  --p: 220 100% 40%; /* Darker Primary */
  --bc: 0 0% 0%; /* Blacker Content */
  --b1: 0 0% 100%; /* Whiter Background */
}

.high-contrast .btn {
  border-width: 2px;
}

.high-contrast .input, 
.high-contrast .select, 
.high-contrast .textarea {
  border-width: 2px;
  border-color: black;
}
```

---

### 📂 Sub-direktori: src/middleware

#### 📄 File: `./src/middleware/auth.ts`

```typescript
import { defineMiddleware } from "astro:middleware";

export const authMiddleware = defineMiddleware(async ({ cookies, redirect, locals }, next) => {
  const token = cookies.get("access_token");

  // Logic validasi token sederhana
  if (token) {
    locals.isAuthenticated = true;
    // Di real app, decode JWT untuk dapat user info
    // locals.user = decode(token.value);
  } else {
    locals.isAuthenticated = false;
  }

  return next();
});
```

---

#### 📄 File: `./src/middleware/index.ts`

```typescript
import { defineMiddleware } from "astro:middleware";

// Daftar rute publik yang tidak butuh login
const PUBLIC_ROUTES = ['/login', '/offline', '/api/health', '/manifest.json'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;
  const token = cookies.get("access_token")?.value;
  
  // 1. Cek Public Routes
  if (PUBLIC_ROUTES.some(route => url.pathname.startsWith(route)) || url.pathname.match(/\.(css|js|jpg|png|svg|ico)$/)) {
    return next();
  }

  // 2. Auth Check
  if (!token) {
    return redirect("/login");
  }

  // Di aplikasi nyata, kita akan memvalidasi/decode token JWT di sini
  // Untuk simulasi, kita anggap token menyimpan role secara sederhana atau kita fetch user
  // Contoh decoding JWT sederhana (tidak aman untuk production tanpa verify signature)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    locals.user = payload; // Simpan user di locals agar bisa diakses di page
    
    const userRole = payload.role;
    const path = url.pathname;

    // 3. Role Based Access Control (RBAC)
    if (path.startsWith('/guru') && userRole !== 'guru') return redirect('/');
    if (path.startsWith('/siswa') && userRole !== 'siswa') return redirect('/');
    if (path.startsWith('/pengawas') && userRole !== 'pengawas') return redirect('/');
    if (path.startsWith('/operator') && userRole !== 'operator') return redirect('/');
    if (path.startsWith('/superadmin') && userRole !== 'superadmin') return redirect('/');

  } catch (e) {
    // Token invalid
    return redirect("/login");
  }

  return next();
});
```

---

#### 📄 File: `./src/middleware/role.ts`

```typescript
import { defineMiddleware } from "astro:middleware";

export const roleMiddleware = defineMiddleware(async ({ url, locals, redirect }, next) => {
  // Asumsi locals.user sudah di-set oleh authMiddleware sebelumnya
  const user = locals.user as any;
  const path = url.pathname;

  // Jika tidak ada user (belum login), biarkan authMiddleware yang handle redirect
  if (!user) return next();

  // Role Guard Logic
  if (path.startsWith('/guru') && user.role !== 'guru') return redirect('/403');
  if (path.startsWith('/siswa') && user.role !== 'siswa') return redirect('/403');
  if (path.startsWith('/pengawas') && user.role !== 'pengawas') return redirect('/403');
  if (path.startsWith('/operator') && user.role !== 'operator') return redirect('/403');
  if (path.startsWith('/superadmin') && user.role !== 'superadmin') return redirect('/403');

  return next();
});
```

---

#### 📄 File: `./src/middleware/tenant.ts`

```typescript
import { defineMiddleware } from "astro:middleware";

export const tenantMiddleware = defineMiddleware(async ({ request, locals }, next) => {
  const url = new URL(request.url);
  const hostname = url.hostname; // misal: sman1.exam.app

  // Logic ekstraksi subdomain
  const parts = hostname.split('.');
  let subdomain = 'www';

  // Asumsi domain utama adalah exam.app (2 parts) atau localhost (1 part)
  // Jika parts > 2, berarti ada subdomain
  if (parts.length > 2 && parts[0] !== 'www') {
    subdomain = parts[0];
  }

  // Simpan di locals untuk diakses di page/component
  locals.tenant = subdomain;

  // Di aplikasi nyata, kita bisa cek ke DB/Cache apakah tenant valid disini
  // if (!isValidTenant(subdomain)) return new Response('Tenant not found', { status: 404 });
  
  return next();
});
```

---

#### 📄 File: `./src/env.d.ts`

```typescript
/// <reference path="../.astro/types.d.ts" />
```

---

## 📁 Direktori: public

**Static assets** - Service worker, manifest, robots.txt

### 📄 File: `./public/manifest.json`

```json
{
  "name": "Exam System - Sistem Ujian Sekolah",
  "short_name": "ExamApp",
  "description": "Offline-First Examination System for Schools and Madrasah",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "productivity"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Go to dashboard",
      "url": "/siswa/dashboard",
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Ujian Saya",
      "short_name": "Ujian",
      "description": "View my exams",
      "url": "/siswa/ujian",
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

---

### 📄 File: `./public/robots.txt`

```
User-agent: *
Disallow: /api/
Disallow: /siswa/
Disallow: /guru/
Disallow: /pengawas/
Disallow: /operator/
Disallow: /superadmin/
Allow: /

```

---

### 📄 File: `./public/service-worker.js`

```javascript
// public/service-worker.js
const CACHE_NAME = 'exam-app-v1';
const OFFLINE_CACHE = 'exam-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/login',
  '/offline',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for failed API calls
            return new Response(
              JSON.stringify({ error: 'You are offline' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Cache for future use
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Message event - for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
```

---

## 📁 Direktori: ROOT

**Root configuration files** - Astro config, Tailwind config, package.json

### 📄 File: `./astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  
  output: 'hybrid', // SSR for dynamic pages, SSG for static
  
  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Code splitting for better performance
            'exam-engine': [
              './src/lib/exam/controller',
              './src/lib/exam/autoSave',
              './src/lib/exam/timer',
            ],
            'media': [
              './src/lib/media/recorder',
              './src/lib/media/player',
              './src/lib/media/upload',
            ],
            'offline': [
              './src/lib/offline/download',
              './src/lib/offline/sync',
              './src/lib/db/indexedDB',
            ],
            'charts': ['chart.js'],
          },
        },
      },
      // Optimize for mobile
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ['dexie', 'axios', 'chart.js'],
    },
  },

  server: {
    port: 3000,
    host: true,
  },

  compressHTML: true,
});

```

---

### 📄 File: `./generate.sh`

````bash
#!/bin/bash
# generate-frontend-blueprint.sh - Generator Blueprint Otomatis untuk Astro Frontend
set -euo pipefail

OUT="frontend-blueprint.md"
ROOT="."

# Pola eksklusi disesuaikan dengan struktur Astro project
EXCLUDE_PATTERNS=( 
  "./.git/*" 
  "./.astro/*" 
  "./.yarn/*" 
  "./.vscode/*" 
  "./README.md" 
  "./.gitignore"
  "./.env"
  "./.env.example"
  "./.env.local"
  "./.env.production"
  "./.gitattributes"
  "./.yarnrc.yml"
  "./.DS_Store"
  "./node_modules/*" 
  "./dist/*"
  "./public/images/*"
  "./public/videos/*"
  "./public/icons/*"
  "./public/fonts/*"
  "./package-lock.json" 
  "./pnpm-lock.yaml"
  "./yarn.lock"
  "./.prettierrc"
  "./.eslintrc.js"
  "./.eslintrc.cjs"
  "./LICENSE"
  "./$OUT" 
  "./generate-backend-blueprint.sh"
  "./generate-frontend-blueprint.sh"
  # Eksklusi file media
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.mov"
  "*.db" "*.sqlite" "*.csv"
  "*.lock" "*.log"
)

# Fungsi untuk menentukan bahasa berdasarkan ekstensi file
lang_for_ext() {
  case "$1" in
    astro)      printf "astro" ;;
    tsx)        printf "tsx" ;;
    ts)         printf "typescript" ;;
    jsx)        printf "jsx" ;;
    js)         printf "javascript" ;;
    mjs)        printf "javascript" ;;
    cjs)        printf "javascript" ;;
    json)       printf "json" ;;
    md)         printf "markdown" ;;
    mdx)        printf "markdown" ;;
    html)       printf "html" ;;
    css)        printf "css" ;;
    scss)       printf "scss" ;;
    yml|yaml)   printf "yaml" ;;
    sh)         printf "bash" ;;
    conf)       printf "nginx" ;;
    Dockerfile) printf "dockerfile" ;;
    *)          printf "" ;;
  esac
}

# Fungsi untuk menghitung jumlah backticks maksimal dalam file
count_max_backticks() {
  local file="$1"
  local max=3
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*(\`+) ]]; then
      local count=${#BASH_REMATCH[1]}
      if [ "$count" -ge "$max" ]; then
        max=$((count + 1))
      fi
    fi
  done < "$file"
  
  echo "$max"
}

# Inisialisasi file output dengan header
cat > "$OUT" << 'HEADER'
# Frontend Blueprint - Astro Exam System

> Auto-generated blueprint untuk frontend Astro
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Multi-Tenant Web Application

## 📋 Informasi Project

- **Framework**: Astro (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **PWA**: Service Worker enabled
- **Target**: Android WebView optimized

---

HEADER

# Kumpulkan semua file
files=()
while IFS= read -r -d '' f; do
  skip=false
  for pat in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$f" == $pat ]]; then
      skip=true
      break
    fi
  done
  $skip && continue
  files+=("$f")
done < <(find "$ROOT" -type f -print0)

if [ "${#files[@]}" -eq 0 ]; then
  echo "Tidak ada file ditemukan untuk diproses."
  exit 0
fi

# Kelompokkan file berdasarkan direktori utama
declare -A groups
for f in "${files[@]}"; do
  p="${f#./}"
  if [[ "$p" == */* ]]; then
    top="${p%%/*}"
  else
    top="ROOT"
  fi
  rel="./${p}"
  if [ -z "${groups[$top]:-}" ]; then
    groups[$top]="$rel"
  else
    groups[$top]="${groups[$top]}"$'\n'"$rel"
  fi
done

# Urutan prioritas direktori untuk Astro Frontend
priority_dirs=(
  "src"
  "public"
  "ROOT"
)
processed_dirs=()

# Fungsi untuk memproses file
process_files() {
  local dir="$1"
  local files_list="$2"
  
  # Header direktori
  printf "## 📁 Direktori: %s\n\n" "$dir" >> "$OUT"
  
  # Deskripsi direktori
  case "$dir" in
    "src")
      printf "**Core application code** - Components, pages, layouts, lib, stores\n\n" >> "$OUT"
      ;;
    "public")
      printf "**Static assets** - Service worker, manifest, robots.txt\n\n" >> "$OUT"
      ;;
    "ROOT")
      printf "**Root configuration files** - Astro config, Tailwind config, package.json\n\n" >> "$OUT"
      ;;
  esac
  
  # Sub-direktori khusus untuk src/
  if [ "$dir" == "src" ]; then
    # Kelompokkan file src berdasarkan sub-direktori
    declare -A src_groups
    
    while IFS= read -r file; do
      if [[ "$file" =~ ^\./src/([^/]+)/ ]]; then
        subdir="${BASH_REMATCH[1]}"
        if [ -z "${src_groups[$subdir]:-}" ]; then
          src_groups[$subdir]="$file"
        else
          src_groups[$subdir]="${src_groups[$subdir]}"$'\n'"$file"
        fi
      else
        # File langsung di src/
        if [ -z "${src_groups[_root]:-}" ]; then
          src_groups[_root]="$file"
        else
          src_groups[_root]="${src_groups[_root]}"$'\n'"$file"
        fi
      fi
    done <<< "$files_list"
    
    # Urutan sub-direktori src
    src_priority=("components" "pages" "layouts" "lib" "stores" "types" "styles" "middleware" "_root")
    
    for subdir in "${src_priority[@]}"; do
      if [ -n "${src_groups[$subdir]:-}" ]; then
        if [ "$subdir" != "_root" ]; then
          printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
        fi
        
        mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
        
        for file in "${flist[@]}"; do
          case "$file" in
            "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
          esac
          
          filename="$(basename -- "$file")"
          if [[ "$filename" == *.* ]]; then
            ext="${filename##*.}"
          else
            ext="$filename"
          fi
          
          lang="$(lang_for_ext "$ext")"
          
          printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
          
          # Hitung jumlah backticks yang dibutuhkan
          backtick_count=$(count_max_backticks "$file")
          backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
          
          if [ -n "$lang" ]; then
            printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
          else
            printf '%s\n' "$backticks" >> "$OUT"
          fi
          
          sed 's/\r$//' "$file" >> "$OUT"
          printf '\n%s\n\n' "$backticks" >> "$OUT"
          printf -- "---\n\n" >> "$OUT"
        done
      fi
    done
    
    # Proses sub-direktori lainnya
    for subdir in "${!src_groups[@]}"; do
      skip=false
      for sp in "${src_priority[@]}"; do
        if [ "$subdir" == "$sp" ]; then
          skip=true
          break
        fi
      done
      $skip && continue
      
      printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
      
      mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
      
      for file in "${flist[@]}"; do
        case "$file" in
          "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
        esac
        
        filename="$(basename -- "$file")"
        if [[ "$filename" == *.* ]]; then
          ext="${filename##*.}"
        else
          ext="$filename"
        fi
        
        lang="$(lang_for_ext "$ext")"
        
        printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
        
        backtick_count=$(count_max_backticks "$file")
        backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
        
        if [ -n "$lang" ]; then
          printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
        else
          printf '%s\n' "$backticks" >> "$OUT"
        fi
        
        sed 's/\r$//' "$file" >> "$OUT"
        printf '\n%s\n\n' "$backticks" >> "$OUT"
        printf -- "---\n\n" >> "$OUT"
      done
    done
    
  else
    # Proses direktori non-src seperti biasa
    mapfile -t flist < <(printf '%s\n' "$files_list" | sort -V)
    
    for file in "${flist[@]}"; do
      case "$file" in
        "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
      esac
      
      filename="$(basename -- "$file")"
      if [[ "$filename" == *.* ]]; then
        ext="${filename##*.}"
      else
        ext="$filename"
      fi
      
      lang="$(lang_for_ext "$ext")"
      
      printf "### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
      
      backtick_count=$(count_max_backticks "$file")
      backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
      
      if [ -n "$lang" ]; then
        printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
      else
        printf '%s\n' "$backticks" >> "$OUT"
      fi
      
      sed 's/\r$//' "$file" >> "$OUT"
      printf '\n%s\n\n' "$backticks" >> "$OUT"
      printf -- "---\n\n" >> "$OUT"
    done
  fi
}

# Proses direktori berdasarkan prioritas
for priority in "${priority_dirs[@]}"; do
  if [ -n "${groups[$priority]:-}" ]; then
    process_files "$priority" "${groups[$priority]}"
    processed_dirs+=("$priority")
  fi
done

# Proses direktori lainnya yang tidak ada dalam prioritas
IFS=$'\n'
for top in $(printf '%s\n' "${!groups[@]}" | sort -V); do
  # Skip jika sudah diproses
  skip=false
  for pd in "${processed_dirs[@]}"; do
    if [ "$top" == "$pd" ]; then
      skip=true
      break
    fi
  done
  $skip && continue
  
  process_files "$top" "${groups[$top]}"
done

# Footer
cat >> "$OUT" << 'FOOTER'

---

## 📊 Summary

**Generated**: $(date)
**Total Directories**: ${#groups[@]}
**Total Files**: ${#files[@]}

## 🎯 Key Features

- ✅ Offline-first architecture
- ✅ IndexedDB for local storage
- ✅ Media recording (audio/video)
- ✅ Auto-save every 30 seconds
- ✅ Sync queue with retry
- ✅ Device fingerprinting
- ✅ Activity logging
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Arabic/Quran support
- ✅ PWA installable
- ✅ Android WebView optimized

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

## 📱 Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
2. **`/siswa/ujian/download`** - Exam download manager
3. **`/login`** - Authentication with device lock

---
*Auto-generated by generate-frontend-blueprint.sh*
FOOTER

echo "✅ Selesai! File '$OUT' telah dibuat (Mode: Astro Frontend)"
echo "📁 Direktori yang diproses: ${#groups[@]}"
echo "📄 Total file: ${#files[@]}"
echo ""
echo "💡 Tips:"
echo "   - Upload file ini ke Claude untuk analisis kode"
echo "   - Gunakan untuk dokumentasi proyek"
echo "   - Bagikan dengan tim untuk onboarding"
````

---

### 📄 File: `./package.json`

```json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "description": "Offline-First Exam System Frontend - Multi-Tenant",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint src --ext .ts,.astro",
    "lint:fix": "eslint src --ext .ts,.astro --fix",
    "format": "prettier --write \"src/**/*.{ts,astro,css}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/node": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.6.0",
    "nanostores": "^0.10.0",
    "@nanostores/persistent": "^0.10.0",
    "@nanostores/router": "^0.15.0",
    "dexie": "^3.2.4",
    "axios": "^1.6.5",
    "chart.js": "^4.4.1",
    "date-fns": "^3.2.0",
    "crypto-js": "^4.2.0",
    "zod": "^3.22.4",
    "clsx": "^2.1.0",
    "pako": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/crypto-js": "^4.2.2",
    "@types/pako": "^2.0.3",
    "typescript": "^5.3.3",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "eslint-plugin-astro": "^0.31.3",
    "prettier": "^3.2.4",
    "prettier-plugin-astro": "^0.13.0",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

---

### 📄 File: `./tailwind.config.cjs`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        quran: ['Scheherazade', 'Amiri', 'serif'],
      },
      
      fontSize: {
        // Support for font size adjustment
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },

      colors: {
        // Custom color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },

  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#3d4451',
          'base-100': '#ffffff',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#2a2e37',
          'base-100': '#1d232a',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
  },
};

```

---

### 📄 File: `./todo-frontend.md`

````markdown
# FRONTEND DEVELOPMENT PROMPT - Sistem Asesmen Sekolah/Madrasah

## 🎯 PROJECT OVERVIEW

Bangun frontend aplikasi menggunakan **Astro** untuk sistem asesmen/ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**. Frontend ini akan dibungkus dalam **Android WebView** untuk distribusi sebagai aplikasi native.

---

## 📋 CORE REQUIREMENTS

### Tech Stack

- **Framework:** Astro (SSR/SSG)
- **Styling:** TailwindCSS + DaisyUI
- **State Management:** Nanostores
- **Offline Storage:** IndexedDB (Dexie.js)
- **PWA:** Service Worker
- **Media Recording:** MediaRecorder API
- **Build Target:** Android WebView (WebView-optimized bundle)

### Key Features

1. **Offline-First Architecture** - Download soal, offline exam, sync jawaban
2. **Multi-Tenant** - Subdomain-based tenant routing
3. **6 Question Types** dengan multimedia support
4. **Media Recording** - Audio/Video recording (max 5 min, max 1GB)
5. **Real-time Auto-save** - Save jawaban setiap 30 detik
6. **Timer & Countdown** - Per-user duration tracking
7. **Activity Logging** - Track semua user activity
8. **Responsive Design** - Mobile-first (Android focus)
9. **Accessibility** - Font size, dark mode, keyboard navigation
10. **Arabic/Islamic Features** - Quran display, tajwid marking

---

## 🗂️ PROJECT STRUCTURE

```
exam-frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Sidebar.astro
│   │   │   ├── Footer.astro
│   │   │   └── MainLayout.astro
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.astro
│   │   │   └── DeviceLockWarning.astro
│   │   │
│   │   ├── exam/
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── MultipleChoice.astro
│   │   │   │   ├── MultipleChoiceComplex.astro
│   │   │   │   ├── TrueFalse.astro
│   │   │   │   ├── Matching.astro
│   │   │   │   ├── ShortAnswer.astro
│   │   │   │   └── Essay.astro
│   │   │   │
│   │   │   ├── MediaPlayer.astro          // Audio/Video player (repeatable)
│   │   │   ├── MediaRecorder.astro        // Recording component
│   │   │   ├── QuestionNavigation.astro   // Question list sidebar
│   │   │   ├── ExamTimer.astro            // Countdown timer
│   │   │   ├── AutoSaveIndicator.astro    // "Saving..." indicator
│   │   │   ├── ProgressBar.astro          // Progress tracker
│   │   │   └── ExamInstructions.astro     // Pre-exam instructions
│   │   │
│   │   ├── sync/
│   │   │   ├── DownloadProgress.astro     // Download progress bar
│   │   │   ├── SyncStatus.astro           // Sync status widget
│   │   │   ├── UploadQueue.astro          // Upload queue viewer
│   │   │   └── ChecksumValidator.astro    // Data integrity check
│   │   │
│   │   ├── monitoring/
│   │   │   ├── LiveMonitor.astro          // Real-time monitoring (pengawas)
│   │   │   ├── StudentProgressCard.astro  // Per-student progress
│   │   │   └── ActivityLogViewer.astro    // Activity log list
│   │   │
│   │   ├── grading/
│   │   │   ├── ManualGradingCard.astro    // Essay/media grading UI
│   │   │   ├── AudioPlayer.astro          // Play student recording
│   │   │   └── GradingRubric.astro        // Scoring rubric
│   │   │
│   │   ├── questions/
│   │   │   ├── QuestionEditor.astro       // Rich question editor
│   │   │   ├── MediaUpload.astro          // Media file uploader
│   │   │   ├── OptionsEditor.astro        // Multiple choice options
│   │   │   ├── MatchingEditor.astro       // Matching pairs editor
│   │   │   └── TagSelector.astro          // Tag multiselect
│   │   │
│   │   ├── analytics/
│   │   │   ├── DashboardStats.astro       // Dashboard widgets
│   │   │   ├── ExamStatistics.astro       // Exam analytics
│   │   │   ├── ItemAnalysisChart.astro    // Item analysis visualization
│   │   │   └── StudentProgress.astro      // Student progress chart
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Input.astro
│   │   │   ├── Select.astro
│   │   │   ├── Modal.astro
│   │   │   ├── Alert.astro
│   │   │   ├── Toast.astro
│   │   │   ├── Card.astro
│   │   │   ├── Table.astro
│   │   │   ├── Tabs.astro
│   │   │   └── Loading.astro
│   │   │
│   │   └── madrasah/
│   │       ├── QuranDisplay.astro         // Quran text with tajwid
│   │       ├── TajwidMarker.astro         // Highlight tajwid rules
│   │       ├── ArabicKeyboard.astro       // Virtual Arabic keyboard
│   │       └── HafalanRecorder.astro      // Hafalan recording UI
│   │
│   ├── pages/
│   │   ├── index.astro                    // Landing page
│   │   ├── login.astro                    // Login page
│   │   │
│   │   ├── siswa/
│   │   │   ├── dashboard.astro
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── download.astro         // Download page
│   │   │   │   ├── [id].astro             // Exam page (THE MOST IMPORTANT!)
│   │   │   │   └── result.astro           // Hasil ujian
│   │   │   └── profile.astro
│   │   │
│   │   ├── guru/
│   │   │   ├── dashboard.astro
│   │   │   ├── soal/
│   │   │   │   ├── index.astro            // List soal
│   │   │   │   ├── create.astro           // Buat soal baru
│   │   │   │   ├── [id]/edit.astro        // Edit soal
│   │   │   │   └── import.astro           // Import Excel
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── create.astro           // Buat ujian
│   │   │   │   ├── [id]/edit.astro        // Edit ujian
│   │   │   │   ├── [id]/preview.astro     // Preview ujian
│   │   │   │   └── [id]/statistics.astro  // Analytics
│   │   │   ├── grading/
│   │   │   │   ├── index.astro            // List pending grading
│   │   │   │   └── [attemptId].astro      // Grade siswa
│   │   │   └── hasil.astro                // Hasil per ujian
│   │   │
│   │   ├── pengawas/
│   │   │   ├── dashboard.astro
│   │   │   └── monitoring/
│   │   │       ├── live.astro             // Live monitoring
│   │   │       └── session/[id].astro     // Monitor session
│   │   │
│   │   ├── operator/
│   │   │   ├── dashboard.astro
│   │   │   ├── sesi/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── ruang/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── peserta/
│   │   │   │   ├── index.astro
│   │   │   │   └── import.astro
│   │   │   └── laporan.astro
│   │   │
│   │   └── superadmin/
│   │       ├── dashboard.astro
│   │       ├── schools/
│   │       │   ├── index.astro
│   │       │   ├── create.astro
│   │       │   └── [id]/edit.astro
│   │       ├── users.astro
│   │       ├── settings.astro
│   │       └── audit-logs.astro
│   │
│   ├── stores/
│   │   ├── auth.ts                        // Nanostores - Auth state
│   │   ├── exam.ts                        // Current exam state
│   │   ├── answers.ts                     // Answers state (persisted)
│   │   ├── sync.ts                        // Sync queue & status
│   │   ├── offline.ts                     // Offline data cache
│   │   ├── timer.ts                       // Exam timer state
│   │   ├── ui.ts                          // UI state (theme, font size, etc)
│   │   └── activity.ts                    // Activity log queue
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  // Axios instance with interceptors
│   │   │   ├── auth.ts                    // Auth endpoints
│   │   │   ├── exam.ts                    // Exam endpoints
│   │   │   ├── question.ts                // Question endpoints
│   │   │   ├── sync.ts                    // Sync endpoints
│   │   │   └── grading.ts                 // Grading endpoints
│   │   │
│   │   ├── db/
│   │   │   ├── indexedDB.ts               // IndexedDB wrapper (Dexie)
│   │   │   ├── schema.ts                  // DB schema definition
│   │   │   ├── encryption.ts              // AES encryption/decryption
│   │   │   └── migrations.ts              // DB version migrations
│   │   │
│   │   ├── offline/
│   │   │   ├── download.ts                // Background download manager
│   │   │   ├── sync.ts                    // Sync manager
│   │   │   ├── queue.ts                   // Upload queue manager
│   │   │   ├── compress.ts                // Compression utils
│   │   │   └── checksum.ts                // Checksum validation
│   │   │
│   │   ├── exam/
│   │   │   ├── randomizer.ts              // Question & option randomizer
│   │   │   ├── validator.ts               // Answer validator
│   │   │   ├── autoSave.ts                // Auto-save manager
│   │   │   ├── timer.ts                   // Timer controller
│   │   │   └── navigation.ts              // Question navigation logic
│   │   │
│   │   ├── media/
│   │   │   ├── recorder.ts                // MediaRecorder wrapper
│   │   │   ├── player.ts                  // Media player controller
│   │   │   ├── upload.ts                  // Chunked upload
│   │   │   └── compress.ts                // Media compression
│   │   │
│   │   ├── utils/
│   │   │   ├── network.ts                 // Network detection
│   │   │   ├── device.ts                  // Device fingerprint
│   │   │   ├── time.ts                    // Time validation
│   │   │   ├── storage.ts                 // Storage management
│   │   │   ├── validation.ts              // Form validation
│   │   │   └── format.ts                  // Date/number formatting
│   │   │
│   │   └── hooks/
│   │       ├── useExam.ts                 // Exam state hook
│   │       ├── useTimer.ts                // Timer hook
│   │       ├── useAutoSave.ts             // Auto-save hook
│   │       ├── useMediaRecorder.ts        // Recording hook
│   │       ├── useOnlineStatus.ts         // Network status hook
│   │       └── useDeviceWarnings.ts       // Battery/storage warnings
│   │
│   ├── types/
│   │   ├── exam.ts                        // Exam types
│   │   ├── question.ts                    // Question types
│   │   ├── answer.ts                      // Answer types
│   │   ├── user.ts                        // User types
│   │   ├── sync.ts                        // Sync types
│   │   └── api.ts                         // API response types
│   │
│   ├── styles/
│   │   ├── global.css                     // Global styles
│   │   ├── arabic.css                     // Arabic/Quran fonts
│   │   └── print.css                      // Print styles (for export)
│   │
│   └── middleware/
│       ├── auth.ts                        // Auth middleware
│       └── role.ts                        // Role-based access
│
├── public/
│   ├── service-worker.js                  // PWA service worker
│   ├── manifest.json                      // PWA manifest
│   ├── fonts/
│   │   ├── Amiri-Regular.ttf              // Arabic font
│   │   └── Scheherazade-Regular.ttf       // Quranic font
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

---

## 🗄️ INDEXEDDB SCHEMA (Dexie.js)

```typescript
// src/lib/db/schema.ts
import Dexie, { Table } from "dexie";

// Interfaces
export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
}

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: "siswa" | "guru" | "pengawas" | "operator" | "superadmin";
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string; // IndexedDB blob reference
  checksum: string;
  size: number;
  type: "image" | "audio" | "video";
  downloaded: boolean;
}

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: "audio" | "video";
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: string;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: "answer" | "media" | "activity" | "submission";
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super("ExamDB");

    this.version(1).stores({
      schools: "id, subdomain",
      users: "id, school_id, username",
      downloaded_exams: "exam_id, attempt_id, downloaded_at",
      media_files: "id, url, downloaded",
      exam_answers: "++id, attempt_id, question_id, synced",
      activity_logs: "++id, attempt_id, timestamp, synced",
      sync_queue: "++id, attempt_id, type, status, priority",
      exam_states: "attempt_id",
    });
  }
}

export const db = new ExamDatabase();
```

---

## 🔐 AUTHENTICATION & DEVICE LOCKING

### Login Flow

```typescript
// src/lib/api/auth.ts
import { apiClient } from "./client";
import { generateDeviceFingerprint } from "../utils/device";
import { db } from "../db/schema";
import { $authStore } from "@/stores/auth";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  school: School;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  // Generate device fingerprint
  const deviceFingerprint = await generateDeviceFingerprint();

  // Login API call
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    ...credentials,
    device_fingerprint: deviceFingerprint,
  });

  const { access_token, refresh_token, user, school } = response.data;

  // Store tokens in localStorage (encrypted)
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  // Store user & school in IndexedDB
  await db.users.put(user);
  await db.schools.put(school);

  // Update auth store
  $authStore.set({
    isAuthenticated: true,
    user,
    school,
    accessToken: access_token,
  });

  return response.data;
}

export async function logout() {
  // Call logout API
  await apiClient.post("/auth/logout");

  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Clear IndexedDB (keep downloaded exams for now)
  // await db.delete();

  // Reset auth store
  $authStore.set({
    isAuthenticated: false,
    user: null,
    school: null,
    accessToken: null,
  });

  // Redirect to login
  window.location.href = "/login";
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await apiClient.post<{ access_token: string }>(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    },
  );

  const { access_token } = response.data;

  // Update stored token
  localStorage.setItem("access_token", access_token);

  return access_token;
}
```

### Device Fingerprinting

```typescript
// src/lib/utils/device.ts
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || "0");

  // 7. Canvas fingerprint
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("ExamApp", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("ExamApp", 4, 17);
    components.push(canvas.toDataURL());
  }

  // Combine and hash
  const fingerprint = components.join("|||");
  const hash = await sha256(fingerprint);

  return hash;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
```

---

## 📥 OFFLINE DOWNLOAD FLOW

### Download Manager

```typescript
// src/lib/offline/download.ts
import { apiClient } from "../api/client";
import { db } from "../db/schema";
import { encrypt } from "../db/encryption";
import { generateChecksum } from "./checksum";

export interface DownloadProgress {
  phase: "preparing" | "exam_data" | "media_files" | "complete";
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  try {
    // Phase 1: Prepare exam
    onProgress?.({
      phase: "preparing",
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(
      `/student/exams/${examId}/prepare`,
    );
    const { attempt_id } = prepareResponse.data;

    // Phase 2: Download exam data
    onProgress?.({
      phase: "exam_data",
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(
      `/student/exams/${examId}/download`,
    );
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    // Validate checksum
    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error("Checksum validation failed");
    }

    // Encrypt sensitive data
    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    // Store in IndexedDB
    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    // Phase 3: Download media files
    onProgress?.({
      phase: "media_files",
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: "media_files",
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    // Complete
    onProgress?.({
      phase: "complete",
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    // Download file as blob
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    // Validate checksum
    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    // Store blob in IndexedDB
    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`, // Reference to blob
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });

    // Store actual blob (Dexie handles this automatically)
    // If needed, can store in separate blobs table
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}
```

---

## 📝 EXAM PAGE (THE MOST CRITICAL!)

```astro
---
// src/pages/siswa/ujian/[id].astro
import MainLayout from '@/components/layout/MainLayout.astro';
import QuestionNavigation from '@/components/exam/QuestionNavigation.astro';
import ExamTimer from '@/components/exam/ExamTimer.astro';
import AutoSaveIndicator from '@/components/exam/AutoSaveIndicator.astro';

// Question type components
import MultipleChoice from '@/components/exam/QuestionTypes/MultipleChoice.astro';
import MultipleChoiceComplex from '@/components/exam/QuestionTypes/MultipleChoiceComplex.astro';
import TrueFalse from '@/components/exam/QuestionTypes/TrueFalse.astro';
import Matching from '@/components/exam/QuestionTypes/Matching.astro';
import ShortAnswer from '@/components/exam/QuestionTypes/ShortAnswer.astro';
import Essay from '@/components/exam/QuestionTypes/Essay.astro';

const { id } = Astro.params;
---

<MainLayout title="Ujian" hideNav={true}>
  <div id="exam-container" class="h-screen flex flex-col overflow-hidden">

    <!-- Header: Timer & Auto-save -->
    <div class="bg-base-200 p-4 flex justify-between items-center">
      <ExamTimer />
      <AutoSaveIndicator />
      <button id="submit-btn" class="btn btn-primary">Submit Ujian</button>
    </div>

    <div class="flex flex-1 overflow-hidden">

      <!-- Sidebar: Question Navigation -->
      <aside class="w-64 bg-base-100 border-r overflow-y-auto">
        <QuestionNavigation />
      </aside>

      <!-- Main: Question Display -->
      <main id="question-area" class="flex-1 overflow-y-auto p-6">
        <!-- Question will be dynamically rendered here -->
        <div id="current-question"></div>
      </main>

    </div>

  </div>

  <!-- Modals -->
  <div id="pause-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Ujian Dijeda</h3>
      <p class="py-4">Ujian dijeda karena Anda keluar dari tampilan ujian.</p>
      <div class="modal-action">
        <button class="btn btn-primary" id="resume-btn">Lanjutkan Ujian</button>
      </div>
    </div>
  </div>

  <div id="submit-confirm-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Konfirmasi Submit</h3>
      <p class="py-4">
        Anda telah menjawab <span id="answered-count">0</span> dari <span id="total-count">0</span> soal.
        <br>Yakin ingin submit ujian?
      </p>
      <div class="modal-action">
        <button class="btn" id="cancel-submit">Batal</button>
        <button class="btn btn-primary" id="confirm-submit">Ya, Submit</button>
      </div>
    </div>
  </div>

  <script>
    // Import dependencies
    import { db } from '@/lib/db/schema';
    import { decrypt } from '@/lib/db/encryption';
    import { ExamController } from '@/lib/exam/controller';
    import { AutoSaveManager } from '@/lib/exam/autoSave';
    import { TimerController } from '@/lib/exam/timer';
    import { ActivityLogger } from '@/lib/exam/activityLogger';

    // Initialize
    const examId = parseInt(window.location.pathname.split('/').pop()!);
    let examController: ExamController;
    let autoSaveManager: AutoSaveManager;
    let timerController: TimerController;
    let activityLogger: ActivityLogger;

    async function initExam() {
      try {
        // Load exam from IndexedDB
        const downloadedExam = await db.downloaded_exams.get(examId);
        if (!downloadedExam) {
          alert('Ujian belum didownload. Silakan download terlebih dahulu.');
          window.location.href = '/siswa/ujian';
          return;
        }

        // Decrypt exam data
        const exam = JSON.parse(decrypt(downloadedExam.exam_data));
        const questions = JSON.parse(decrypt(downloadedExam.questions));

        // Initialize controllers
        examController = new ExamController(exam, questions, downloadedExam.attempt_id);
        autoSaveManager = new AutoSaveManager(downloadedExam.attempt_id);
        timerController = new TimerController(exam.duration_minutes * 60);
        activityLogger = new ActivityLogger(downloadedExam.attempt_id);

        // Load saved state (if exam was paused)
        await examController.loadState();

        // Start exam
        await examController.start();
        await activityLogger.log('exam_started', { timestamp: new Date() });

        // Start timer
        timerController.start((timeRemaining) => {
          updateTimerDisplay(timeRemaining);

          // Auto-submit when time runs out
          if (timeRemaining === 0) {
            handleAutoSubmit();
          }

          // Warnings
          if (timeRemaining === 600) { // 10 minutes
            showTimeWarning('10 menit lagi!');
          }
          if (timeRemaining === 300) { // 5 minutes
            showTimeWarning('5 menit lagi!');
          }
          if (timeRemaining === 60) { // 1 minute
            showTimeWarning('1 menit lagi!');
          }
        });

        // Start auto-save (every 30 seconds)
        autoSaveManager.start(30000, async () => {
          const answers = examController.getAnswers();
          await db.exam_answers.bulkPut(answers);
          showAutoSaveIndicator();
        });

        // Render first question
        renderCurrentQuestion();

        // Setup event listeners
        setupEventListeners();

        // Detect activity
        setupActivityDetection();

      } catch (error) {
        console.error('Failed to initialize exam:', error);
        alert('Gagal memuat ujian. Silakan coba lagi.');
      }
    }

    function renderCurrentQuestion() {
      const question = examController.getCurrentQuestion();
      const questionArea = document.getElementById('current-question')!;

      // Clear previous content
      questionArea.innerHTML = '';

      // Render question based on type
      let componentHTML = '';

      switch (question.type) {
        case 'multiple_choice':
          componentHTML = renderMultipleChoice(question);
          break;
        case 'multiple_choice_complex':
          componentHTML = renderMultipleChoiceComplex(question);
          break;
        case 'true_false':
          componentHTML = renderTrueFalse(question);
          break;
        case 'matching':
          componentHTML = renderMatching(question);
          break;
        case 'short_answer':
          componentHTML = renderShortAnswer(question);
          break;
        case 'essay':
          componentHTML = renderEssay(question);
          break;
      }

      questionArea.innerHTML = componentHTML;

      // Load saved answer if exists
      const savedAnswer = examController.getAnswer(question.id);
      if (savedAnswer) {
        populateAnswer(question.type, savedAnswer);
      }

      // Setup answer change listeners
      setupAnswerListeners(question);

      // Log activity
      activityLogger.log('question_viewed', { question_id: question.id });
    }

    function setupAnswerListeners(question: any) {
      // Listen for answer changes
      const answerElements = document.querySelectorAll('[data-answer-input]');

      answerElements.forEach(element => {
        element.addEventListener('change', async () => {
          const answer = collectAnswer(question.type);
          examController.saveAnswer(question.id, answer);
          await activityLogger.log('answer_changed', {
            question_id: question.id,
            timestamp: new Date()
          });
        });
      });
    }

    function setupEventListeners() {
      // Navigation buttons
      document.getElementById('prev-btn')?.addEventListener('click', () => {
        examController.previousQuestion();
        renderCurrentQuestion();
      });

      document.getElementById('next-btn')?.addEventListener('click', () => {
        examController.nextQuestion();
        renderCurrentQuestion();
      });

      // Submit button
      document.getElementById('submit-btn')?.addEventListener('click', () => {
        showSubmitConfirmation();
      });

      document.getElementById('confirm-submit')?.addEventListener('click', async () => {
        await handleSubmit();
      });

      // Question navigation (sidebar)
      document.querySelectorAll('[data-question-index]').forEach(el => {
        el.addEventListener('click', (e) => {
          const index = parseInt((e.target as HTMLElement).dataset.questionIndex!);
          examController.goToQuestion(index);
          renderCurrentQuestion();
        });
      });
    }

    function setupActivityDetection() {
      // Detect tab/window switch
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          await activityLogger.log('tab_switched', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          autoSaveManager.pause();
          showPauseModal('Anda keluar dari tampilan ujian');
        }
      });

      // Detect fullscreen exit
      document.addEventListener('fullscreenchange', async () => {
        if (!document.fullscreenElement) {
          await activityLogger.log('fullscreen_exited', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          showPauseModal('Anda keluar dari fullscreen');
        }
      });

      // Prevent copy-paste
      document.addEventListener('copy', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'copy_attempt',
          timestamp: new Date()
        });
      });

      document.addEventListener('paste', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'paste_attempt',
          timestamp: new Date()
        });
      });

      // Detect right-click
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    function showPauseModal(reason: string) {
      const modal = document.getElementById('pause-modal') as HTMLDialogElement;
      modal.querySelector('p')!.textContent = `Ujian dijeda. Alasan: ${reason}`;
      modal.showModal();

      // Resume button
      document.getElementById('resume-btn')?.addEventListener('click', async () => {
        await activityLogger.log('resume_triggered', { timestamp: new Date() });
        timerController.resume();
        autoSaveManager.resume();
        modal.close();
      }, { once: true });
    }

    async function handleSubmit() {
      try {
        // Stop timer & auto-save
        timerController.stop();
        autoSaveManager.stop();

        // Get all answers
        const answers = examController.getAnswers();

        // Save to IndexedDB
        await db.exam_answers.bulkPut(answers);

        // Mark as submitted (will be synced when online)
        const attemptId = examController.getAttemptId();
        await db.sync_queue.add({
          attempt_id: attemptId,
          type: 'submission',
          data: {
            submitted_at: new Date(),
            answers: answers,
            activity_logs: await activityLogger.getLogs(),
          },
          priority: 5, // Highest priority
          retry_count: 0,
          max_retries: 10,
          status: 'pending',
          created_at: new Date(),
        });

        // Log submission
        await activityLogger.log('exam_submitted', {
          timestamp: new Date(),
          answer_count: answers.length
        });

        // Show success message
        alert('Ujian berhasil disubmit! Data akan disinkronkan saat online.');

        // Redirect to result page
        window.location.href = `/siswa/ujian/result?attemptId=${attemptId}`;

      } catch (error) {
        console.error('Submit failed:', error);
        alert('Gagal submit ujian. Data telah disimpan dan akan dicoba lagi.');
      }
    }

    async function handleAutoSubmit() {
      alert('Waktu habis! Ujian akan disubmit otomatis.');
      await handleSubmit();
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExam);
    } else {
      initExam();
    }
  </script>

</MainLayout>
```

---

## 📤 SYNC & UPLOAD FLOW

```typescript
// src/lib/offline/sync.ts
import { db, SyncQueueItem } from "../db/schema";
import { apiClient } from "../api/client";
import { uploadMediaChunked } from "../media/upload";

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start() {
    // Check every 30 seconds if there's anything to sync
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    // Also try immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      // Get pending items, sorted by priority (high to low)
      const pendingItems = await db.sync_queue
        .where("status")
        .equals("pending")
        .or("status")
        .equals("failed")
        .filter((item) => item.retry_count < item.max_retries)
        .sortBy("priority");

      for (const item of pendingItems.reverse()) {
        // High priority first
        await this.processItem(item);
      }
    } catch (error) {
      console.error("Sync queue processing failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem) {
    try {
      // Update status to processing
      await db.sync_queue.update(item.id!, { status: "processing" });

      switch (item.type) {
        case "answer":
          await this.syncAnswer(item);
          break;
        case "media":
          await this.syncMedia(item);
          break;
        case "activity":
          await this.syncActivity(item);
          break;
        case "submission":
          await this.syncSubmission(item);
          break;
      }

      // Mark as completed
      await db.sync_queue.update(item.id!, {
        status: "completed",
        processed_at: new Date(),
      });

      // Emit sync progress event
      window.dispatchEvent(
        new CustomEvent("sync:progress", {
          detail: { item, status: "completed" },
        }),
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      // Increment retry count
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        // Max retries reached, mark as failed
        await db.sync_queue.update(item.id!, {
          status: "failed",
          retry_count: newRetryCount,
          error_message: error.message,
        });

        // Emit error event
        window.dispatchEvent(
          new CustomEvent("sync:error", {
            detail: { item, error: error.message },
          }),
        );
      } else {
        // Reset to pending for retry
        await db.sync_queue.update(item.id!, {
          status: "pending",
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem) {
    const { attempt_id, answers } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/answers`, {
      answers: answers,
    });
  }

  private async syncMedia(item: SyncQueueItem) {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;

    // Chunked upload
    await uploadMediaChunked(
      attempt_id,
      answer_id,
      media_blob,
      checksum,
      (progress) => {
        window.dispatchEvent(
          new CustomEvent("sync:media-progress", {
            detail: { item, progress },
          }),
        );
      },
    );
  }

  private async syncActivity(item: SyncQueueItem) {
    const { attempt_id, events } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/activity`, {
      events: events,
    });
  }

  private async syncSubmission(item: SyncQueueItem) {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at: submitted_at,
      answers: answers,
      activity_logs: activity_logs,
    });
  }

  async getSyncStatus(attemptId: number) {
    const items = await db.sync_queue
      .where("attempt_id")
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const pending = items.filter(
      (i) => i.status === "pending" || i.status === "processing",
    ).length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

// Initialize global sync manager
export const syncManager = new SyncManager();
```

---

## 🎤 MEDIA RECORDER COMPONENT

```astro
---
// src/components/exam/MediaRecorder.astro
interface Props {
  type: 'audio' | 'video';
  maxDuration: number; // seconds
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

const { type, maxDuration = 300 } = Astro.props; // Default 5 minutes
---

<div class="media-recorder card bg-base-200 p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-bold">{type === 'audio' ? 'Rekam Audio' : 'Rekam Video'}</h3>
    <div class="text-lg font-mono" id="rec-timer">00:00</div>
  </div>

  {type === 'video' && (
    <video id="preview" class="w-full h-64 bg-black rounded mb-4" autoplay muted></video>
  )}

  {type === 'audio' && (
    <div class="h-32 flex items-center justify-center bg-base-300 rounded mb-4">
      <div id="audio-visualizer" class="flex gap-1">
        <!-- Audio bars will be rendered here -->
      </div>
    </div>
  )}

  <div class="flex gap-2 justify-center">
    <button id="start-rec" class="btn btn-error">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="6"/>
      </svg>
      Mulai Rekam
    </button>

    <button id="stop-rec" class="btn btn-primary" disabled>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <rect x="6" y="6" width="8" height="8"/>
      </svg>
      Stop
    </button>

    <button id="retry-rec" class="btn btn-ghost" disabled>Ulangi</button>
  </div>

  <div id="playback-area" class="mt-4 hidden">
    <h4 class="font-semibold mb-2">Preview Rekaman</h4>
    {type === 'audio' ? (
      <audio id="playback-audio" class="w-full" controls></audio>
    ) : (
      <video id="playback-video" class="w-full rounded" controls></video>
    )}

    <div class="mt-2 flex gap-2 justify-end">
      <button id="confirm-rec" class="btn btn-success">Gunakan Rekaman Ini</button>
    </div>
  </div>
</div>

<script define:vars={{ type, maxDuration }}>
  let mediaRecorder;
  let recordedChunks = [];
  let stream;
  let startTime;
  let timerInterval;
  let recordingBlob;

  const startBtn = document.getElementById('start-rec');
  const stopBtn = document.getElementById('stop-rec');
  const retryBtn = document.getElementById('retry-rec');
  const confirmBtn = document.getElementById('confirm-rec');
  const timerEl = document.getElementById('rec-timer');
  const playbackArea = document.getElementById('playback-area');

  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  retryBtn.addEventListener('click', retryRecording);
  confirmBtn.addEventListener('click', confirmRecording);

  async function startRecording() {
    try {
      // Request permissions
      const constraints = type === 'audio'
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };

      stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Setup preview
      if (type === 'video') {
        document.getElementById('preview').srcObject = stream;
      }

      // Setup MediaRecorder
      const options = type === 'audio'
        ? { mimeType: 'audio/webm;codecs=opus' }
        : { mimeType: 'video/webm;codecs=vp9' };

      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      // Start recording
      recordedChunks = [];
      mediaRecorder.start();
      startTime = Date.now();

      // Update UI
      startBtn.disabled = true;
      stopBtn.disabled = false;
      retryBtn.disabled = true;
      playbackArea.classList.add('hidden');

      // Start timer
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);

      // Auto-stop at max duration
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          stopRecording();
          alert(`Durasi maksimal ${maxDuration / 60} menit tercapai.`);
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Gagal memulai rekaman. Pastikan izin mikrofon/kamera sudah diberikan.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Stop timer
      clearInterval(timerInterval);

      // Update UI
      startBtn.disabled = false;
      stopBtn.disabled = true;
      retryBtn.disabled = false;
    }
  }

  function handleRecordingStop() {
    // Create blob
    const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
    recordingBlob = new Blob(recordedChunks, { type: mimeType });

    // Calculate duration
    const duration = (Date.now() - startTime) / 1000;

    // Show playback
    const playbackEl = type === 'audio'
      ? document.getElementById('playback-audio')
      : document.getElementById('playback-video');

    playbackEl.src = URL.createObjectURL(recordingBlob);
    playbackArea.classList.remove('hidden');
  }

  function retryRecording() {
    // Reset
    recordedChunks = [];
    recordingBlob = null;
    timerEl.textContent = '00:00';
    playbackArea.classList.add('hidden');

    // Start new recording
    startRecording();
  }

  function confirmRecording() {
    if (!recordingBlob) return;

    const duration = (Date.now() - startTime) / 1000;

    // Call parent callback
    if (window.onRecordingComplete) {
      window.onRecordingComplete(recordingBlob, duration);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('recording-complete', {
      detail: { blob: recordingBlob, duration, type }
    }));
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Warning colors
    const remaining = maxDuration - elapsed;
    if (remaining <= 60) {
      timerEl.classList.add('text-error');
    } else if (remaining <= 120) {
      timerEl.classList.add('text-warning');
    }
  }
</script>

<style>
  #audio-visualizer {
    width: 200px;
    height: 80px;
  }

  #audio-visualizer > div {
    width: 4px;
    background: currentColor;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { height: 20%; }
    50% { height: 100%; }
  }
</style>
```

---

## 🌙 DARK MODE & ACCESSIBILITY

```typescript
// src/stores/ui.ts
import { atom } from "nanostores";

interface UIState {
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
}

export const $uiStore = atom<UIState>({
  theme: "light",
  fontSize: "medium",
  highContrast: false,
});

// Load from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("ui-settings");
  if (saved) {
    $uiStore.set(JSON.parse(saved));
  }
}

// Save to localStorage on change
$uiStore.subscribe((state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ui-settings", JSON.stringify(state));

    // Apply theme
    document.documentElement.setAttribute("data-theme", state.theme);

    // Apply font size
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
    );
    if (state.fontSize === "small")
      document.documentElement.classList.add("text-sm");
    if (state.fontSize === "large")
      document.documentElement.classList.add("text-lg");

    // Apply high contrast
    if (state.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }
});

export function setTheme(theme: "light" | "dark") {
  $uiStore.set({ ...$uiStore.get(), theme });
}

export function setFontSize(fontSize: "small" | "medium" | "large") {
  $uiStore.set({ ...$uiStore.get(), fontSize });
}

export function toggleHighContrast() {
  const current = $uiStore.get();
  $uiStore.set({ ...current, highContrast: !current.highContrast });
}
```

---

## 🕌 MADRASAH FEATURES

### Quran Display

```astro
---
// src/components/madrasah/QuranDisplay.astro
interface Props {
  surah: string;
  ayahStart: number;
  ayahEnd: number;
  showTajwid?: boolean;
  showTransliteration?: boolean;
}

const { surah, ayahStart, ayahEnd, showTajwid = true, showTransliteration = false } = Astro.props;
---

<div class="quran-display" dir="rtl">
  <div class="surah-header text-center mb-4">
    <h2 class="text-2xl font-arabic">{surah}</h2>
    <p class="text-sm text-base-content/70">Ayat {ayahStart} - {ayahEnd}</p>
  </div>

  <div id="ayat-container" class="space-y-4">
    <!-- Ayat akan dimuat via JS -->
  </div>

  <div class="audio-player mt-4">
    <audio id="murattal-player" class="w-full" controls>
      <source src={`/api/quran/audio/${surah}/${ayahStart}`} type="audio/mpeg">
    </audio>
  </div>
</div>

<script define:vars={{ surah, ayahStart, ayahEnd, showTajwid }}>
  async function loadAyat() {
    try {
      // Fetch ayat from API or local storage
      const response = await fetch(`/api/quran/${surah}/${ayahStart}/${ayahEnd}`);
      const ayatData = await response.json();

      const container = document.getElementById('ayat-container');

      ayatData.forEach(ayat => {
        const ayatDiv = document.createElement('div');
        ayatDiv.className = 'ayat-item p-4 bg-base-200 rounded';

        // Arabic text with tajwid
        let arabicText = ayat.text;
        if (showTajwid) {
          arabicText = applyTajwidColors(arabicText);
        }

        ayatDiv.innerHTML = `
          <div class="flex items-start gap-3">
            <span class="badge badge-primary">${ayat.number}</span>
            <p class="text-3xl font-arabic leading-loose flex-1">${arabicText}</p>
          </div>
          ${showTransliteration ? `
            <p class="text-sm text-base-content/70 mt-2 italic">${ayat.transliteration}</p>
          ` : ''}
          <p class="text-sm mt-2">${ayat.translation}</p>
        `;

        container.appendChild(ayatDiv);
      });

    } catch (error) {
      console.error('Failed to load ayat:', error);
    }
  }

  function applyTajwidColors(text) {
    // Apply tajwid color coding
    // Ikhfa (yellow), Idgham (green), Qalqalah (red), etc.
    // This requires tajwid rules database

    // Simplified example:
    return text
      .replace(/([نم])\s*([بم])/g, '<span class="tajwid-ikhfa">$1 $2</span>')
      .replace(/([نملر])\s*([نملر])/g, '<span class="tajwid-idgham">$1 $2</span>');
  }

  loadAyat();
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }

  .tajwid-ikhfa {
    background: rgba(255, 235, 59, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-idgham {
    background: rgba(76, 175, 80, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-qalqalah {
    background: rgba(244, 67, 54, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }
</style>
```

---

## 📊 ANALYTICS & CHARTS

```typescript
// src/lib/analytics/charts.ts
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function createScoreDistributionChart(
  canvasId: string,
  scores: number[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  // Create distribution bins
  const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const distribution = bins.map((bin, i) => {
    if (i === bins.length - 1) return 0;
    return scores.filter((s) => s >= bin && s < bins[i + 1]).length;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1]}`),
      datasets: [
        {
          label: "Jumlah Siswa",
          data: distribution,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Distribusi Nilai",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

export function createItemAnalysisChart(
  canvasId: string,
  questions: { difficulty: number; discrimination: number; label: string }[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Soal",
          data: questions.map((q) => ({
            x: q.difficulty,
            y: q.discrimination,
          })),
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          pointRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Item Analysis (Difficulty vs Discrimination)",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const q = questions[context.dataIndex];
              return `${q.label}: D=${q.difficulty.toFixed(2)}, Disc=${q.discrimination.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Difficulty Index (P)",
          },
          min: 0,
          max: 1,
        },
        y: {
          title: {
            display: true,
            text: "Discrimination Index (D)",
          },
          min: -1,
          max: 1,
        },
      },
    },
  });
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Code Splitting

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],

  output: "hybrid", // SSR for dynamic pages, SSG for static

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "exam-engine": [
              "./src/lib/exam/controller",
              "./src/lib/exam/autoSave",
              "./src/lib/exam/timer",
            ],
            media: [
              "./src/lib/media/recorder",
              "./src/lib/media/player",
              "./src/lib/media/upload",
            ],
            offline: [
              "./src/lib/offline/download",
              "./src/lib/offline/sync",
              "./src/lib/db/indexedDB",
            ],
          },
        },
      },
    },
  },
});
```

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import questionImage from '@/assets/question.jpg';
---

<Image
  src={questionImage}
  alt="Question image"
  width={800}
  height={600}
  format="webp"
  loading="lazy"
/>
```

### Service Worker (PWA)

```javascript
// public/service-worker.js
const CACHE_NAME = "exam-app-v1";
const OFFLINE_CACHE = "exam-offline-v1";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/fonts/Amiri-Regular.ttf",
  // Add more static assets
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        }),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache for future use
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});
```

---

## 🚨 ERROR HANDLING & WARNINGS

```typescript
// src/lib/utils/warnings.ts
export async function checkDeviceRequirements() {
  const warnings = [];

  // 1. Check storage
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const availableGB = (estimate.quota - estimate.usage) / 1024 ** 3;

    if (availableGB < 2) {
      warnings.push({
        type: "storage",
        severity: "error",
        message: `Storage tersisa hanya ${availableGB.toFixed(2)} GB. Minimal 2 GB diperlukan. Silakan kosongkan storage.`,
      });
    }
  }

  // 2. Check battery
  if ("getBattery" in navigator) {
    const battery = await (navigator as any).getBattery();

    if (battery.level < 0.2 && !battery.charging) {
      warnings.push({
        type: "battery",
        severity: "warning",
        message: `Baterai tersisa ${(battery.level * 100).toFixed(0)}%. Charge device Anda.`,
      });
    }
  }

  // 3. Check internet (for download phase)
  if (!navigator.onLine) {
    warnings.push({
      type: "network",
      severity: "error",
      message:
        "Tidak ada koneksi internet. Silakan hubungkan ke WiFi untuk download soal.",
    });
  }

  // 4. Check browser compatibility
  if (!("indexedDB" in window)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung fitur offline. Gunakan browser terbaru.",
    });
  }

  if (!("mediaDevices" in navigator)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung rekaman media. Gunakan browser terbaru.",
    });
  }

  return warnings;
}

export function showWarningModal(warnings: any[]) {
  const modal = document.createElement("div");
  modal.className = "modal modal-open";

  const hasErrors = warnings.some((w) => w.severity === "error");

  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="font-bold text-lg">${hasErrors ? "Perhatian!" : "Peringatan"}</h3>
      <div class="py-4 space-y-2">
        ${warnings
          .map(
            (w) => `
          <div class="alert ${w.severity === "error" ? "alert-error" : "alert-warning"}">
            <span>${w.message}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="modal-action">
        ${
          hasErrors
            ? `
          <button class="btn" onclick="window.location.href='/siswa/dashboard'">Kembali</button>
        `
            : `
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Lanjutkan</button>
        `
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
```

---

## 🎨 TAILWIND & DAISYUI CONFIG

```javascript
// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Amiri", "Traditional Arabic", "serif"],
        quran: ["Scheherazade", "serif"],
      },
      fontSize: {
        // Support for zoom in/out
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
};
```

---

## 📱 ANDROID WEBVIEW INTEGRATION

### MainActivity.java (Example)

```java
package com.example.examapp;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.JavascriptInterface;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // Enable JavaScript
        webView.getSettings().setJavaScriptEnabled(true);

        // Enable DOM storage (for IndexedDB)
        webView.getSettings().setDomStorageEnabled(true);

        // Enable database
        webView.getSettings().setDatabaseEnabled(true);

        // Enable geolocation
        webView.getSettings().setGeolocationEnabled(true);

        // Enable media playback
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

        // Set user agent
        webView.getSettings().setUserAgentString(
            webView.getSettings().getUserAgentString() + " ExamApp/1.0"
        );

        // Set WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false; // Let WebView handle the URL
            }
        });

        // Set WebChromeClient for permissions
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Auto-grant mic/camera permissions for exam
                request.grant(request.getResources());
            }
        });

        // Add JavaScript interface for native features
        webView.addJavascriptInterface(new NativeBridge(), "Android");

        // Load app
        webView.loadUrl("https://exam.app");
    }

    public class NativeBridge {
        @JavascriptInterface
        public String getDeviceInfo() {
            JSONObject info = new JSONObject();
            info.put("model", Build.MODEL);
            info.put("os", "Android " + Build.VERSION.RELEASE);
            info.put("manufacturer", Build.MANUFACTURER);
            return info.toString();
        }

        @JavascriptInterface
        public boolean checkStorageSpace() {
            StatFs stat = new StatFs(Environment.getDataDirectory().getPath());
            long availableBytes = stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
            long availableGB = availableBytes / (1024 * 1024 * 1024);
            return availableGB >= 2;
        }

        @JavascriptInterface
        public int getBatteryLevel() {
            IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent battery = registerReceiver(null, filter);
            int level = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
            int scale = battery.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
            return (int) ((level / (float) scale) * 100);
        }
    }
}
```

---

## ✅ DEPLOYMENT CHECKLIST

### Build Configuration

```bash
# package.json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.0.0",
    "nanostores": "^0.10.0",
    "@nanostores/react": "^0.7.0",
    "dexie": "^3.2.0",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

### Environment Variables

```bash
# .env.production
PUBLIC_API_URL=https://api.exam.app
PUBLIC_SCHOOL_SUBDOMAIN=your-school
PUBLIC_APP_VERSION=1.0.0
```

### Build & Deploy

```bash
# Build for production
npm run build

# Output will be in /dist

# Test production build
npm run preview

# Deploy to server
rsync -avz --delete dist/ user@server:/var/www/exam-frontend/
```

---

## 🎯 SUCCESS CRITERIA

Frontend is production-ready when:

1. ✅ All pages implemented and responsive
2. ✅ Offline download & sync working flawlessly
3. ✅ Exam page fully functional (all question types)
4. ✅ Media recorder working (audio & video)
5. ✅ Auto-save working reliably
6. ✅ Timer accurate and persistent
7. ✅ Activity logging complete
8. ✅ Dark mode & accessibility features working
9. ✅ Load time < 3s on 3G
10. ✅ Bundle size < 1MB (initial load)
11. ✅ PWA installable
12. ✅ Works offline 100%
13. ✅ Compatible with Android WebView
14. ✅ No console errors
15. ✅ Security best practices followed

---

## 📚 ADDITIONAL NOTES

### Best Practices

1. **Always encrypt** exam data in IndexedDB
2. **Always validate** checksums for downloaded content
3. **Always log** user activities during exam
4. **Always save** exam state (resume-able)
5. **Always show** sync status to user
6. **Never** send sensitive data unencrypted
7. **Never** store tokens in localStorage unencrypted
8. **Never** trust client time (validate with server)

### Testing Checklist

- [ ] Test on various Android devices (5 min, 7 inch, 10 inch)
- [ ] Test offline mode (airplane mode)
- [ ] Test with slow network (3G)
- [ ] Test with limited storage (<2GB)
- [ ] Test battery drain during exam
- [ ] Test app kill & resume
- [ ] Test media recording quality
- [ ] Test chunked upload for large files
- [ ] Test sync retry mechanism
- [ ] Test time validation
- [ ] Test device lock (single device)
- [ ] Test all question types
- [ ] Test dark mode
- [ ] Test font size adjustment
- [ ] Test Arabic/Quran display

---

## 🚀 PRIORITY IMPLEMENTATION ORDER

### Phase 1: MVP (Essential)

1. Authentication & device lock
2. Exam download system
3. Basic exam page (at least multiple choice)
4. Timer & auto-save
5. Offline storage (IndexedDB)
6. Basic sync mechanism
7. Answer submission

### Phase 2: Core Features

8. All 6 question types
9. Media player (for question media)
10. Media recorder (audio/video answers)
11. Activity logging
12. Question navigation
13. Chunked upload
14. Retry mechanism

### Phase 3: Advanced

15. Analytics dashboard
16. Grading interface
17. Monitoring (for pengawas)
18. Import/export features
19. Madrasah features (Quran, tajwid)
20. Dark mode & accessibility

### Phase 4: Polish

21. Performance optimization
22. PWA features
23. Error handling improvements
24. UI/UX refinements
25. Documentation

---

## 🎉 FINAL NOTES

This is a **complex, mission-critical frontend** for an exam system. The most important aspects are:

1. **Reliability** - Must work 100% offline
2. **Data integrity** - Never lose student answers
3. **Security** - Protect exam content
4. **Performance** - Smooth on low-end devices
5. **User experience** - Stress-free for students

Take your time to implement features correctly. Test thoroughly before deployment. The exam experience will make or break this system!

**GOOD LUCK BUILDING! 🚀**

````

---

### 📄 File: `./tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/lib/utils/*"],
      "@api/*": ["src/lib/api/*"],
      "@db/*": ["src/lib/db/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["astro/client"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---


---

## 📊 Summary

**Generated**: $(date)
**Total Directories**: ${#groups[@]}
**Total Files**: ${#files[@]}

## 🎯 Key Features

- ✅ Offline-first architecture
- ✅ IndexedDB for local storage
- ✅ Media recording (audio/video)
- ✅ Auto-save every 30 seconds
- ✅ Sync queue with retry
- ✅ Device fingerprinting
- ✅ Activity logging
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Arabic/Quran support
- ✅ PWA installable
- ✅ Android WebView optimized

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

## 📱 Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
2. **`/siswa/ujian/download`** - Exam download manager
3. **`/login`** - Authentication with device lock

---
*Auto-generated by generate-frontend-blueprint.sh*
