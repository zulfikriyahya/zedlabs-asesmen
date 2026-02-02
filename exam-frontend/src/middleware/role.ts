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