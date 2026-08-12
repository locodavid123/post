import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '123456'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'ecopost'}`;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const client = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client;
}

export default client;