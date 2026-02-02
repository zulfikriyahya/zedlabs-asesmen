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