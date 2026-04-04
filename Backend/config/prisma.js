const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Use DATABASE_URL if available (Render), otherwise individual env vars (local)
let pool;

if (process.env.DATABASE_URL) {
  // Render provides full URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  // Local development uses individual vars
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'quiz_admin',
    password: process.env.DB_PASSWORD || 'quiz_secure_password',
    database: process.env.DB_NAME || 'quiz_app',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

const adapter = new PrismaPg(pool);

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test the connection
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL database via Prisma!');
  })
  .catch((err) => {
    console.error('Failed to connect to database via Prisma:', err);
  });

module.exports = prisma;
