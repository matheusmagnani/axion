import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq';
import { redisConnection } from './connection.js';

interface RegisteredQueue {
  queue: Queue;
  worker: Worker;
}

class QueueManagerSingleton {
  private queues = new Map<string, RegisteredQueue>();

  registerQueue(
    name: string,
    processor: Processor,
    opts?: Partial<WorkerOptions>,
  ) {
    if (this.queues.has(name)) return;

    const queue = new Queue(name, { connection: redisConnection });

    const worker = new Worker(name, processor, {
      connection: redisConnection,
      concurrency: 1,
      ...opts,
    });

    worker.on('failed', (job, err) => {
      console.error(`[Queue:${name}] Job ${job?.id} failed:`, err.message);
    });

    worker.on('completed', (job) => {
      console.log(`[Queue:${name}] Job ${job.id} completed`);
    });

    this.queues.set(name, { queue, worker });
    console.log(`[Queue:${name}] registered`);
  }

  async addJob<T>(queueName: string, data: T): Promise<string> {
    const registered = this.queues.get(queueName);
    if (!registered) {
      throw new Error(`Queue "${queueName}" not registered`);
    }

    const job = await registered.queue.add(queueName, data, {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    });

    return job.id!;
  }

  async shutdown() {
    for (const [name, { queue, worker }] of this.queues) {
      console.log(`[Queue:${name}] shutting down...`);
      await worker.close();
      await queue.close();
    }
    this.queues.clear();
  }
}

export const queueManager = new QueueManagerSingleton();
