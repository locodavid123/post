import fs from 'fs';
import path from 'path';

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

export function readConfig() {
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

export function writeConfig(newConfig: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing system_config.json:', e);
    return false;
  }
}
