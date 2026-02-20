import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-lg text-base-content/60">Halaman tidak ditemukan</p>
      <Link href="/" className="btn btn-primary btn-sm">Kembali ke Beranda</Link>
    </div>
  )
}
