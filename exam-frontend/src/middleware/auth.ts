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