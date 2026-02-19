import 'dotenv/config';

export const DB_CONFIG = {
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host:     process.env.POSTGRES_HOST,
  port:     Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB,
};

export const SCHEDULE_STR   = process.env.SCHEDULE_STR ?? '* * * * *';
export const TEXT           = process.env.TEXT ?? 'TEST SCRIPT';
export const ENABLE_DATABASE = process.env.ENABLE_DATABASE !== '0';