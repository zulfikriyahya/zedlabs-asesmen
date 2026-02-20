import type { Metadata } from 'next';
import '@/app/global.css';

export const metadata: Metadata = {
  title: { default: 'Sistem Ujian', template: '%s | Sistem Ujian' },
  description: 'Sistem Ujian Offline-First untuk Sekolah dan Madrasah',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-base-100 font-sans antialiased">{children}</body>
    </html>
  );
}
