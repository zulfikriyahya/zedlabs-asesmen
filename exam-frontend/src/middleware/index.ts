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