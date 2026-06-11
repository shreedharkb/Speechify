const Queue = require('bull');
const Redis = require('ioredis');

// Helper to create robust Redis connections for Bull
function createRedisClient(type) {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });
  }
  return new Redis({ host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null });
}

const queueOptions = {
  createClient: createRedisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
    timeout: 120000
  }
};

// Create queues for AI services
const whisperQueue = new Queue('whisper-transcription', queueOptions);
const sbertQueue = new Queue('sbert-grading', queueOptions);

// Queue event handlers
whisperQueue.on('completed', (job, result) => {
  console.log(`✅ Whisper job ${job.id} completed`);
});

whisperQueue.on('failed', (job, err) => {
  console.error(`❌ Whisper job ${job.id} failed:`, err.message);
});

whisperQueue.on('stalled', (job) => {
  console.warn(`⚠️ Whisper job ${job.id} stalled`);
});

sbertQueue.on('completed', (job, result) => {
  console.log(`✅ SBERT job ${job.id} completed`);
});

sbertQueue.on('failed', (job, err) => {
  console.error(`❌ SBERT job ${job.id} failed:`, err.message);
});

// Queue statistics
async function getQueueStats() {
  const [whisperWaiting, whisperActive, whisperCompleted, whisperFailed] = await Promise.all([
    whisperQueue.getWaitingCount(),
    whisperQueue.getActiveCount(),
    whisperQueue.getCompletedCount(),
    whisperQueue.getFailedCount()
  ]);

  const [sbertWaiting, sbertActive, sbertCompleted, sbertFailed] = await Promise.all([
    sbertQueue.getWaitingCount(),
    sbertQueue.getActiveCount(),
    sbertQueue.getCompletedCount(),
    sbertQueue.getFailedCount()
  ]);

  return {
    whisper: {
      waiting: whisperWaiting,
      active: whisperActive,
      completed: whisperCompleted,
      failed: whisperFailed
    },
    sbert: {
      waiting: sbertWaiting,
      active: sbertActive,
      completed: sbertCompleted,
      failed: sbertFailed
    }
  };
}

// Add job to whisper queue with priority
async function queueTranscription(audioData, options = {}) {
  const job = await whisperQueue.add('transcribe', audioData, {
    priority: options.priority || 1,
    ...options
  });
  return job;
}

// Add job to SBERT queue
async function queueGrading(gradingData, options = {}) {
  const job = await sbertQueue.add('grade', gradingData, {
    priority: options.priority || 1,
    ...options
  });
  return job;
}

// Wait for job completion with timeout
async function waitForJob(job, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Job timeout'));
    }, timeoutMs);

    job.finished()
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

const quizQueue = new Queue('quiz-grading', queueOptions);

quizQueue.on('completed', (job, result) => {
  console.log(`✅ Quiz Grading job ${job.id} completed`);
});

quizQueue.on('failed', (job, err) => {
  console.error(`❌ Quiz Grading job ${job.id} failed:`, err.message);
});

// Add job to quiz queue
async function queueQuizGrading(quizData, options = {}) {
  const job = await quizQueue.add('grade-quiz', quizData, {
    priority: options.priority || 1,
    ...options
  });
  return job;
}

// Clean old jobs
async function cleanQueues() {
  await whisperQueue.clean(3600000, 'completed'); // Clean completed jobs older than 1 hour
  await whisperQueue.clean(86400000, 'failed'); // Clean failed jobs older than 24 hours
  await sbertQueue.clean(3600000, 'completed');
  await sbertQueue.clean(86400000, 'failed');
  await quizQueue.clean(3600000, 'completed');
  await quizQueue.clean(86400000, 'failed');
}

// Graceful shutdown
async function closeQueues() {
  await whisperQueue.close();
  await sbertQueue.close();
  await quizQueue.close();
}

module.exports = {
  whisperQueue,
  sbertQueue,
  quizQueue,
  getQueueStats,
  queueTranscription,
  queueGrading,
  queueQuizGrading,
  waitForJob,
  cleanQueues,
  closeQueues
};
