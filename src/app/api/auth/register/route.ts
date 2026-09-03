import { config } from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

config();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  // UI sends: businessName, managerName, phone, email, password, promoCode, acceptTerms
  // also support: name, adminSecret
  const {
    businessName,
    managerName,
    phone,
    email,
    password,
    promoCode,
    acceptTerms,
    name,
    adminSecret,
  } = body;

  // Basic validation
  if (!email || !password) {
    return Response.json({ message: "Email y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ message: "El usuario ya existe." }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const resolvedName = managerName || name || businessName || null;
    const role = adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET ? "ADMIN" : "USER";

    // Find or create business (if provided)
    // IMPORTANT: only link by promoCode to avoid accidental grouping by name.
    let businessId = null;
    if (promoCode) {
      const b = await prisma.business.findUnique({ where: { code: promoCode } });
      if (b) businessId = b.id;
    }

    if (!businessId && businessName) {
      // Create a new business (do NOT search by name to avoid accidental joins)
      const code = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      const b = await prisma.business.create({ data: { name: businessName, phone: phone || null, code } });
      businessId = b.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: resolvedName,
        password: hash,
        role,
        businessId,
      },
    });

    // Do not return password hash
    const { password: _p, ...safeUser } = user;

    // create JWT and set cookie
    const token = signToken({ id: safeUser.id, role: safeUser.role, businessId: safeUser.businessId });
    const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;

    return new Response(JSON.stringify({ message: "Cuenta creada correctamente.", user: safeUser }), {
      status: 201,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error creando usuario." }, { status: 500 });
  }
}
