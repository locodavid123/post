import { config } from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/rateLimit";
import { validateAdminSecret } from "@/lib/auth";

config();

export async function POST(request: Request) {
  // Limitador de intentos por IP (máximo 10 intentos cada 15 minutos)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`register:${clientIp}`, 10, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

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
    name,
    adminSecret,
  } = body;

  // Basic validation
  if (!email || !password) {
    return Response.json({ message: "Email y contraseña son obligatorios." }, { status: 400 });
  }

  // Validación 100% en backend de ADMIN_SECRET
  let role = "USER";
  if (adminSecret) {
    if (validateAdminSecret(adminSecret)) {
      role = "ADMIN";
    } else {
      return Response.json(
        { message: "Clave secreta de administrador inválida." },
        { status: 403 }
      );
    }
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ message: "El usuario ya existe." }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const resolvedName = managerName || name || businessName || null;

    // Find or create business (if provided)
    // IMPORTANT: only link by promoCode to avoid accidental grouping by name.
    let businessId = null;
    if (promoCode) {
      const b = await prisma.business.findUnique({ where: { code: promoCode } });
      if (b) businessId = b.id;
    }

    if (!businessId) {
      // Cada nuevo usuario registrado obtiene su propio comercio con 1 semana (7 días) de prueba gratuita
      const finalBizName = businessName?.trim() || `Restaurante de ${resolvedName || 'Nuevo Usuario'}`;
      const code = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

      const b = await prisma.business.create({
        data: {
          name: finalBizName,
          phone: phone || null,
          code,
          plan: 'FREE',
          planStatus: 'ACTIVE',
          planExpiresAt: trialExpiresAt,
          billingCycle: 'monthly',
        },
      });
      businessId = b.id;

      // Crear mesas iniciales limpias (todas disponibles y sin comandas) para el nuevo comercio
      const initialTables = [
        { tableId: "1", capacity: 4 },
        { tableId: "2", capacity: 2 },
        { tableId: "3", capacity: 4 },
        { tableId: "4", capacity: 6 },
        { tableId: "5", capacity: 2 },
        { tableId: "6", capacity: 4 },
      ];

      for (const t of initialTables) {
        await prisma.tableSession.create({
          data: {
            businessId,
            tableId: t.tableId,
            nickname: `Mesa ${t.tableId}`,
            capacity: t.capacity,
            status: "free",
          },
        });
      }

      // Crear categorías iniciales para el nuevo comercio
      const defaultCategories = [
        { name: "Hamburguesas", icon: "🍔" },
        { name: "Entradas", icon: "🍟" },
        { name: "Bebidas", icon: "🍺" },
        { name: "Postres", icon: "🍰" },
      ];

      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: {
            businessId,
            name: cat.name,
            icon: cat.icon,
          },
        });
      }
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
