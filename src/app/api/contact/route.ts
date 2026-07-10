export async function POST(req: Request) {
  try {
    const body = await req.json();
    // In a real app we'd enqueue/send an email or persist the message.
    console.log("Contact form received:", body);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
