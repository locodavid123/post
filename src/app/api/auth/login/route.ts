import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ message: "Email y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return Response.json({ message: "Usuario no encontrado." }, { status: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return Response.json({ message: "Credenciales inválidas." }, { status: 401 });

    const { password: _p, ...safeUser } = user as any;
    return Response.json({ message: "Autenticado", user: safeUser });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error en autenticación." }, { status: 500 });
  }
}
