export async function GET() {
  return Response.json({ message: "EcoPost auth endpoint ready" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return Response.json({
    message: "Autenticación recibida",
    payload: body,
  });
}
