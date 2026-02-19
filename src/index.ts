import express from 'express';
import { TEXT } from './config/env';
import { getLogger } from './logger/logger';
import { JobScheduler } from './scheduler/jobScheduler';
import { queryExample } from './db/postgres';
import routes from './routes';

const log = getLogger('index');
const app = express();
app.use(express.json());

// Todas las rutas bajo /api
app.use('/api', routes);

// Equivalente a print_text()
function printText(): void {
  log.info(`TEXT: ${TEXT}`);
}

// Job que se ejecuta según SCHEDULE_STR
async function scheduledJob(): Promise<void> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const data = await queryExample(oneDayAgo, now);
  log.info(`Scheduled job fetched ${data.length} rows.`);
}

// Arranque
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  log.info(`Server listening on port ${PORT}`);
  printText();

  const scheduler = new JobScheduler(scheduledJob);
  scheduler.start();
});