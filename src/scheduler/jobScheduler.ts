import cron, { ScheduledTask } from 'node-cron';
import { SCHEDULE_STR } from '../config/env';
import { getLogger } from '../logger/logger';

const log = getLogger('JobScheduler');

// Equivalente a la clase JobScheduler de Python
export class JobScheduler {
  private task: ScheduledTask | null = null;

  constructor(private readonly jobFn: () => void | Promise<void>) {
    if (typeof jobFn !== 'function') {
      throw new TypeError('jobFn must be a callable function.');
    }
    this._configure();
  }

  private _configure(): void {
    if (!cron.validate(SCHEDULE_STR)) {
      throw new Error(`Invalid cron expression: '${SCHEDULE_STR}'`);
    }

    // node-cron usa formato de 5 campos (igual que crontab estándar)
    this.task = cron.schedule(SCHEDULE_STR, async () => {
      log.info(`Running job: ${this.jobFn.name}`);
      try {
        await this.jobFn();
      } catch (err: any) {
        log.error(`Job '${this.jobFn.name}' failed: ${err.message}`);
      }
    }, { scheduled: false }); // No arranca solo, esperamos a start()

    log.info(`Scheduler configured for '${this.jobFn.name}' with schedule: '${SCHEDULE_STR}'`);
  }

  start(): void {
    log.info('Starting scheduler. Press Ctrl+C to exit.');
    this.task?.start();

    // Graceful shutdown (equivalente al try/except KeyboardInterrupt)
    process.on('SIGINT',  () => this._shutdown());
    process.on('SIGTERM', () => this._shutdown());
  }

  private _shutdown(): void {
    log.info('Scheduler shutting down gracefully.');
    this.task?.stop();
    process.exit(0);
  }

  toString(): string {
    return `JobScheduler(job='${this.jobFn.name}', schedule='${SCHEDULE_STR}')`;
  }
}