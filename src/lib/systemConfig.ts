import fs from 'fs';
import path from 'path';
import prisma from './prisma';

const CONFIG_FILE = path.join(process.cwd(), 'system_config.json');

export const DEFAULT_CONFIG = {
  platformName: 'EcoPost Gastro POS',
  supportEmail: 'admin@ecopost.local',
  currency: 'COP ($)',
  standardPlanPrice: 69000,
  proPlanPrice: 119000,
  enterprisePlanPrice: 249000,
  trialDays: 7,
  allowSelfRegistration: true,
  youtubeApiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'TU_CLAVE_DE_YOUTUBE_AQUI'),
  // Datos Bancarios de Transferencia Directa (Cualquier Banco o Billetera)
  bankName: 'Bancolombia',
  bankAccount: '123-456789-01',
  bankType: 'Ahorros',
  bankHolder: 'EcoPost SAS (NIT: 901.234.567-8)',
  bancolombiaAccount: '123-456789-01',
  bancolombiaType: 'Ahorros',
  bancolombiaHolder: 'EcoPost SAS (NIT: 901.234.567-8)',
  nequiNumber: '300 123 4567',
  nequiHolder: 'EcoPost Colombia',
  daviplataNumber: '',
  daviplataHolder: '',
  paymentInstructions: 'Realiza la transferencia desde tu app bancaria o billetera y registra el número de comprobante o referencia para validación y activación inmediata.',
  // Pasarela de Pagos Online Wompi (Bancolombia)
  wompiPublicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '',
  wompiSandbox: true,
  stripePublicKey: '',
  stripeSecretKey: '',
};

/**
 * Lee la configuración global desde PostgreSQL (modelo SystemConfig).
 * Si la tabla está vacía o hay fallback, migra desde system_config.json o retorna DEFAULT_CONFIG.
 */
export async function readConfig(): Promise<typeof DEFAULT_CONFIG & Record<string, any>> {
  try {
    const configRecord = await prisma.systemConfig.findUnique({
      where: { id: 'default' },
    });

    if (configRecord && configRecord.data && typeof configRecord.data === 'object') {
      return { ...DEFAULT_CONFIG, ...(configRecord.data as Record<string, any>) };
    }

    // Si la tabla en PostgreSQL está vacía, migramos datos existentes de system_config.json
    let merged = { ...DEFAULT_CONFIG };
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const legacyData = JSON.parse(raw);
        merged = { ...DEFAULT_CONFIG, ...legacyData };
      } catch (fileErr) {
        console.error('Error leyendo system_config.json legado:', fileErr);
      }
    }

    // Persistimos en PostgreSQL el registro único con id "default"
    try {
      await prisma.systemConfig.upsert({
        where: { id: 'default' },
        create: { id: 'default', data: merged },
        update: { data: merged },
      });
    } catch (saveErr) {
      console.error('Error inicializando SystemConfig en PostgreSQL:', saveErr);
    }

    return merged;
  } catch (e) {
    console.error('Error reading SystemConfig from PostgreSQL:', e);

    // Respaldo de contingencia: si la base de datos no responde, intentar archivo local
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      } catch {}
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Guarda la configuración global en PostgreSQL (modelo SystemConfig con id = "default").
 * También actualiza una copia local en system_config.json como respaldo de contingencia.
 */
export async function writeConfig(newConfig: any): Promise<boolean> {
  const merged = { ...DEFAULT_CONFIG, ...newConfig };

  try {
    // 1. Guardar en PostgreSQL
    await prisma.systemConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        data: merged,
      },
      update: {
        data: merged,
      },
    });

    // 2. Guardar respaldo local en system_config.json
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('No se pudo escribir archivo local system_config.json (solo PostgreSQL activo):', fsErr);
    }

    return true;
  } catch (e) {
    console.error('Error saving SystemConfig to PostgreSQL:', e);

    // Respaldo si falla PostgreSQL
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  }
}
