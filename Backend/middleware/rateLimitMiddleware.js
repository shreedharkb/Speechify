const { rateLimiter } = require('../config/redis');

/**
 * Rate limiting middleware using Redis
 * @param {Object} options
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {number} options.windowSeconds - Time window in seconds (default: 60)
 * @param {string} options.keyPrefix - Prefix for rate limit key (default: 'ratelimit')
 * @param {Function} options.keyGenerator - Custom key generator function
 */
function rateLimit(options = {}) {
  const {
    maxRequests = 100,
    windowSeconds = 60,
    keyPrefix = 'ratelimit',
    keyGenerator = null
  } = options;

  return async (req, res, next) => {
    try {
      // Generate rate limit key based on IP or user
      let key;
      if (keyGenerator) {
        key = keyGenerator(req);
      } else {
        const identifier = req.user?.id || req.ip || 'anonymous';
        key = `${keyPrefix}:${identifier}`;
      }

      const isLimited = await rateLimiter.isLimited(key, maxRequests, windowSeconds);
      const remaining = await rateLimiter.getRemaining(key, maxRequests);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + windowSeconds
      });

      if (isLimited) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${windowSeconds} seconds.`,
          retryAfter: windowSeconds
        });
      }

      next();
    } catch (error) {
      // On Redis error, allow the request (fail open)
      console.error('Rate limiting error:', error);
      next();
    }
  };
}

// Specific rate limiters for different endpoints
const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowSeconds: 60,
  keyPrefix: 'api'
});

const authRateLimit = rateLimit({
  maxRequests: 10,
  windowSeconds: 60,
  keyPrefix: 'auth'
});

const whisperRateLimit = rateLimit({
  maxRequests: 20, // 20 transcriptions per minute per user
  windowSeconds: 60,
  keyPrefix: 'whisper'
});

const gradingRateLimit = rateLimit({
  maxRequests: 50, // 50 grading requests per minute per user
  windowSeconds: 60,
  keyPrefix: 'grading'
});

module.exports = {
  rateLimit,
  apiRateLimit,
  authRateLimit,
  whisperRateLimit,
  gradingRateLimit
};
