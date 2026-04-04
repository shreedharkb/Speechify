const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL directly - works with both local and Render deployments
const prisma_local = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prisma_local;

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
