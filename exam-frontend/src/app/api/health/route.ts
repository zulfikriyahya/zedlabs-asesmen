export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
