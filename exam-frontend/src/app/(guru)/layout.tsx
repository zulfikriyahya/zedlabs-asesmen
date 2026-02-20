import { MainLayout } from '@/components/layout/MainLayout';

const GURU_NAV = [
  { href: '/guru/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/guru/soal', label: 'Bank Soal', icon: 'file-text' },
  { href: '/guru/ujian', label: 'Paket Ujian', icon: 'book-open' },
  { href: '/guru/grading', label: 'Penilaian', icon: 'check-circle' },
  { href: '/guru/hasil', label: 'Hasil', icon: 'bar-chart' },
];

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout navItems={GURU_NAV} role="TEACHER">
      {children}
    </MainLayout>
  );
}
