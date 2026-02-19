import { Pool } from 'pg';
import { DB_CONFIG, ENABLE_DATABASE, DB_SCHEMA, DB_TABLE } from '../config/env';
import { getLogger } from '../logger/logger';

const log = getLogger('postgres');

const pool: Pool | null = ENABLE_DATABASE ? new Pool(DB_CONFIG) : null;

pool?.on('error', (err) => {
  log.error(`Unexpected DB pool error: ${err.message}`);
});

if (!ENABLE_DATABASE) {
  log.warn('ENABLE_DATABASE=0 — running without PostgreSQL, mock data will be used.');
}

export interface SensorRow {
  id: number;
  timestamp: Date;
  temperature: number;
  humidity: number;
}

const MOCK_ROWS: SensorRow[] = [
  { id: 1, timestamp: new Date(), temperature: 22.5, humidity: 60 },
  { id: 2, timestamp: new Date(), temperature: 23.1, humidity: 58 },
];

export async function queryExample(dateInit: Date, dateEnd: Date): Promise<SensorRow[]> {
  if (!pool) {
    log.warn(`queryExample called in mock mode (${dateInit.toISOString()} → ${dateEnd.toISOString()})`);
    return MOCK_ROWS;
  }

  const sql = `
    SELECT id, timestamp, temperature, humidity
    FROM ${DB_SCHEMA}.${DB_TABLE}
    WHERE timestamp BETWEEN $1 AND $2
  `;
  try {
    const { rows } = await pool.query<SensorRow>(sql, [dateInit, dateEnd]);
    log.info(`Fetched data correctly: from ${dateInit.toISOString()} to ${dateEnd.toISOString()}.`);
    return rows;
  } catch (err: any) {
    log.error(`Failed to fetch data from the database: ${err.message}`);
    throw err;
  }
}

export { pool };