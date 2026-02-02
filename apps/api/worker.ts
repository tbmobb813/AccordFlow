// Worker launcher
import { startWorker } from './src/jobs/worker';

async function main(): Promise<void> {
  try {
    await startWorker();
  } catch (err) {
    console.error('Failed to start worker:', err);
    process.exitCode = 1;
  }
}

void main();
