import 'dotenv/config';

export const SCHEDULE_STR    = process.env.SCHEDULE_STR    ?? '* * * * *';
export const TEXT            = process.env.TEXT            ?? 'TEST SCRIPT';
export const ENABLE_DATABASE = process.env.ENABLE_DATABASE !== '0';
export const DB_SCHEMA       = process.env.DB_SCHEMA       ?? 'public';
export const DB_TABLE        = process.env.DB_TABLE        ?? 'sensor_data';