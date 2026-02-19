import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ENABLE_DATABASE } from '../config/env';
import { getLogger } from '../logger/logger';

const log = getLogger('prisma');

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient | null = ENABLE_DATABASE
  ? createPrismaClient()
  : null;

if (!ENABLE_DATABASE) {
  log.warn('ENABLE_DATABASE=0 — running without PostgreSQL, mock data will be used.');
}

export type SensorRow = {
  id: number;
  timestamp: Date;
  temperature: Prisma.Decimal | null;
  humidity: Prisma.Decimal | null;
};

const MOCK_ROWS: SensorRow[] = [
  { id: 1, timestamp: new Date(), temperature: new Prisma.Decimal(22.5), humidity: new Prisma.Decimal(60) },
  { id: 2, timestamp: new Date(), temperature: new Prisma.Decimal(23.1), humidity: new Prisma.Decimal(58) },
];

export async function queryExample(dateInit: Date, dateEnd: Date): Promise<SensorRow[]> {
  if (!prisma) {
    log.warn(`queryExample called in mock mode (${dateInit.toISOString()} → ${dateEnd.toISOString()})`);
    return MOCK_ROWS;
  }

  try {
    const rows = await prisma.sensorData.findMany({
      where: { timestamp: { gte: dateInit, lte: dateEnd } },
      orderBy: { timestamp: 'asc' },
    });
    log.info(`Fetched data correctly: from ${dateInit.toISOString()} to ${dateEnd.toISOString()}.`);
    return rows;
  } catch (err: any) {
    log.error(`Failed to fetch data from the database: ${err.message}`);
    throw err;
  }
}