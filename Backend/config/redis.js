const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Required for Bull queue
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('Redis connection failed after 10 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  }
};

// Main Redis client for caching
const redis = new Redis(redisConfig);

// Subscriber client for pub/sub (required by Bull)
const redisSubscriber = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

// Cache utility functions
const cache = {
  // Get cached value
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set cached value with expiration (default 5 minutes)
  async set(key, value, expireSeconds = 300) {
    try {
      await redis.setex(key, expireSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete cached value
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete all keys matching pattern
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return false;
    }
  },

  // Generate cache key for grading
  gradingKey(questionId, answer) {
    const hash = Buffer.from(answer.toLowerCase().trim()).toString('base64').slice(0, 32);
    return `grade:${questionId}:${hash}`;
  },

  // Generate cache key for transcription
  transcriptionKey(audioHash) {
    return `transcribe:${audioHash}`;
  }
};

// Rate limiting utility
const rateLimiter = {
  // Check if request is rate limited
  async isLimited(key, maxRequests = 10, windowSeconds = 60) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      return current > maxRequests;
    } catch (error) {
      console.error('Rate limiter error:', error);
      return false; // Allow on error
    }
  },

  // Get remaining requests
  async getRemaining(key, maxRequests = 10) {
    try {
      const current = await redis.get(key);
      return Math.max(0, maxRequests - (parseInt(current) || 0));
    } catch (error) {
      return maxRequests;
    }
  }
};

module.exports = {
  redis,
  redisSubscriber,
  redisConfig,
  cache,
  rateLimiter
};
