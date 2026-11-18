import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

const CONFIG_FILE = path.join(process.cwd(), 'system_config.json');

const DEFAULT_CONFIG = {
  platformName: 'EcoPost Gastro POS',
  supportEmail: 'admin@ecopost.local',
  currency: 'COP ($)',
  standardPlanPrice: 69000,
  proPlanPrice: 119000,
  trialDays: 7,
  allowSelfRegistration: true,
  youtubeApiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'TU_CLAVE_DE_YOUTUBE_AQUI'),
  stripePublicKey: '',
  stripeSecretKey: '',
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error reading system_config.json:', e);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(newConfig: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing system_config.json:', e);
    return false;
  }
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const config = readConfig();
  // Mask secret key if set
  const safeConfig = {
    ...config,
    stripeSecretKey: config.stripeSecretKey ? '••••••••••••••••' : '',
  };
  return NextResponse.json(safeConfig);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const current = readConfig();

    const updated = {
      ...current,
      platformName: body.platformName !== undefined ? String(body.platformName).trim() : current.platformName,
      supportEmail: body.supportEmail !== undefined ? String(body.supportEmail).trim() : current.supportEmail,
      currency: body.currency !== undefined ? String(body.currency).trim() : current.currency,
      standardPlanPrice: body.standardPlanPrice !== undefined ? Number(body.standardPlanPrice) : current.standardPlanPrice,
      proPlanPrice: body.proPlanPrice !== undefined ? Number(body.proPlanPrice) : current.proPlanPrice,
      allowSelfRegistration: body.allowSelfRegistration !== undefined ? Boolean(body.allowSelfRegistration) : current.allowSelfRegistration,
      stripePublicKey: body.stripePublicKey !== undefined ? String(body.stripePublicKey).trim() : current.stripePublicKey,
      stripeSecretKey: body.stripeSecretKey && !body.stripeSecretKey.includes('••••') ? String(body.stripeSecretKey).trim() : current.stripeSecretKey,
    };

    writeConfig(updated);
    return NextResponse.json({ message: 'Configuración guardada con éxito', config: updated });
  } catch (err) {
    console.error('Error saving config:', err);
    return NextResponse.json({ message: 'Error al guardar configuración' }, { status: 500 });
  }
}
