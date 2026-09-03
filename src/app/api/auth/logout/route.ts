export async function POST(request: Request) {
  // Clear cookie
  const cookie = `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  return new Response(JSON.stringify({ message: 'Logged out' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } });
}
