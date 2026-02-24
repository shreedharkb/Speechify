const Queue = require('bull');
const { redisConfig } = require('../config/redis');

// Create queues for AI services
const whisperQueue = new Queue('whisper-transcription', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,
    timeout: 120000 // 2 minute timeout for transcription
  }
});

const sbertQueue = new Queue('sbert-grading', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: 100,
    removeOnFail: 50,
    timeout: 60000 // 1 minute timeout for grading
  }
});

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

// Clean old jobs
async function cleanQueues() {
  await whisperQueue.clean(3600000, 'completed'); // Clean completed jobs older than 1 hour
  await whisperQueue.clean(86400000, 'failed'); // Clean failed jobs older than 24 hours
  await sbertQueue.clean(3600000, 'completed');
  await sbertQueue.clean(86400000, 'failed');
}

// Graceful shutdown
async function closeQueues() {
  await whisperQueue.close();
  await sbertQueue.close();
}

module.exports = {
  whisperQueue,
  sbertQueue,
  getQueueStats,
  queueTranscription,
  queueGrading,
  waitForJob,
  cleanQueues,
  closeQueues
};
