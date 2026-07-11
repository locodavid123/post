import { databaseConfig } from "../../../../config/database";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { businessName, managerName, phone, email, password, promoCode, acceptTerms } = body;

  if (!businessName || !managerName || !email || !password || !acceptTerms) {
    return Response.json(
      { message: "Completa los campos obligatorios y acepta los términos." },
      { status: 400 }
    );
  }

  // Aquí se puede conectar con PostgreSQL usando databaseConfig en el futuro.
  return Response.json({
    message: "Cuenta creada correctamente.",
    user: {
      businessName,
      managerName,
      email,
      phone,
      promoCode,
    },
    db: {
      dialect: databaseConfig.dialect,
      host: databaseConfig.host,
      port: databaseConfig.port,
    },
  });
}
