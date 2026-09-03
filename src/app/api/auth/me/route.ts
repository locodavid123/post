import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
