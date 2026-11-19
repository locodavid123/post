import { describe, it, expect, beforeAll } from 'vitest';
import prisma from './prisma';
import { readConfig, writeConfig, DEFAULT_CONFIG } from './systemConfig';

describe('SystemConfig in PostgreSQL with Prisma', () => {
  it('reads config from database or returns DEFAULT_CONFIG', async () => {
    const config = await readConfig();
    expect(config).toBeDefined();
    expect(config.currency).toBe('COP ($)');
    expect(config.platformName).toBeDefined();
  });

  it('persists changes into PostgreSQL SystemConfig table', async () => {
    const customName = `EcoPost Test ${Date.now()}`;
    const ok = await writeConfig({ platformName: customName });
    expect(ok).toBe(true);

    // Verify directly in DB
    const record = await prisma.systemConfig.findUnique({
      where: { id: 'default' },
    });
    expect(record).not.toBeNull();
    expect((record?.data as any)?.platformName).toBe(customName);

    // Verify through readConfig
    const reloaded = await readConfig();
    expect(reloaded.platformName).toBe(customName);

    // Revert to original platform name
    await writeConfig({ platformName: DEFAULT_CONFIG.platformName });
  });
});
