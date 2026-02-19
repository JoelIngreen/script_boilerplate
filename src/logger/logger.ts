import winston from 'winston';
import path from 'node:path';
import fs from 'node:fs';

function toServiceString(service: unknown): string {
  if (typeof service === 'string') return service;
  if (service === undefined || service === null) return 'app';
  try {
    return JSON.stringify(service);
  } catch {
    return String(service);
  }
}

// Equivalente a UniqueMessageFilter (evita logs consecutivos idénticos)
const uniqueMessageFilter = winston.format((info) => {
  const msg = `${info.level}:${info.message}`;
  if ((uniqueMessageFilter as any)._last === msg) return false;
  (uniqueMessageFilter as any)._last = msg;
  return info;
})();

const colorize = winston.format.colorize({ all: true });

const fmt = winston.format.combine(
  uniqueMessageFilter,
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const timestamp = (info as any).timestamp ?? '';
    const level = String((info as any).level ?? '').padEnd(5);
    const message = String((info as any).message ?? '');
    const service = toServiceString((info as any).service);

    return `${timestamp} | ${level} | ${service} | ${message}`;
  })
);

// Directorio de logs
const logDir = path.resolve(__dirname, '../../log');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'app' },
  transports: [
    // Consola con colores
    new winston.transports.Console({
      format: winston.format.combine(colorize, fmt),
    }),
    // Fichero (rotación simple por cantidad; para diaria usar winston-daily-rotate-file)
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      format: fmt,
      maxFiles: 5,
    }),
  ],
});

// Factory para obtener un logger con nombre de módulo
export const getLogger = (name: string) => logger.child({ service: name });
