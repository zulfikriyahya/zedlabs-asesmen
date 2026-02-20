export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('refresh_token');
  res.cookies.delete('access_token');
  return res;
}
