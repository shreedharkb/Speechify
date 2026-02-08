# Prisma Migration Guide

## What Has Been Done

Successfully integrated Prisma ORM into your project for better database migration management and type-safe queries.

### 1. Installed Dependencies
- **prisma** (dev dependency) - CLI for migrations
- **@prisma/client** - Runtime client for database queries

### 2. Created Prisma Configuration
- **prisma/schema.prisma** - Database schema definition with all models
- **prisma.config.ts** - Prisma configuration file
- **config/prisma.js** - Prisma Client singleton instance
- **.env** - Updated with DATABASE_URL

### 3. Created New Prisma Models
All models have been recreated to use Prisma Client:
- **models/User.prisma.js** - User operations
- **models/QuizEvent.prisma.js** - Quiz event operations
- **models/QuizAttempt.prisma.js** - Quiz attempt operations
- **models/Quiz.prisma.js** - Legacy quiz operations

### 4. Created Model Index
- **models/index.js** - Central export file with both legacy and Prisma models

### 5. Initialized Migrations
- Created initial migration from existing database
- Marked as applied (since database already exists)

## Database Schema

Prisma now manages these tables:
- **users** - Students and teachers
- **quiz_events** - Quiz events (current system)
- **questions** - Questions for quiz events
- **quiz_attempts** - Student quiz submissions
- **attempt_answers** - Individual answers with audio storage (BYTEA + file path)
- **quizzes** - Legacy quiz table
- **quiz_questions** - Legacy quiz questions

## How to Use

### Option 1: Gradual Migration (Recommended)

The new models are available alongside the old ones. You can switch controllers one at a time:

```javascript
// Instead of:
const User = require('./models/User');

// Use:
const { User } = require('./models/index');
// or
const User = require('./models/User.prisma');
```

### Option 2: Switch All at Once

Update all controller imports to use the new Prisma models from `models/index.js`.

### Example: Using Prisma Models

**Old way (raw SQL):**
```javascript
const User = require('./models/User');
const user = await User.findByEmail(email);
```

**New way (Prisma):**
```javascript
const { User } = require('./models/index');
const user = await User.findByEmail(email); // Same API!
```

The API is identical for most operations, so minimal code changes needed!

## Creating New Migrations

When you need to modify the database schema:

### 1. Update Schema
Edit `prisma/schema.prisma` with your changes:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  // Add new field:
  phone String?
}
```

### 2. Create Migration
```bash
npx prisma migrate dev --name add_phone_field
```

This will:
- Generate SQL migration file
- Apply it to database
- Regenerate Prisma Client

### 3. View Migration Status
```bash
npx prisma migrate status
```

## Prisma Studio (Database GUI)

View and edit your database with a beautiful UI:

```bash
npx prisma studio
```

Opens at http://localhost:5555

## Common Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Pull schema changes from database
npx prisma db pull

# Push schema changes without migration
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format
```

## Benefits of Prisma

1. **Type Safety** - Full TypeScript support (if you migrate to TS)
2. **Auto-completion** - IntelliSense for all queries
3. **Migration Management** - Track all schema changes
4. **No SQL Injection** - Parameterized queries by default
5. **Relationships** - Easy to work with related data
6. **Validation** - Schema validation at runtime
7. **Database GUI** - Prisma Studio for data management

## Next Steps

1. **Test Prisma Models**: Try using the new models in development
2. **Switch Controllers**: Gradually update controllers to use Prisma
3. **Remove Legacy Code**: Once stable, remove old model files
4. **Add Validation**: Use Prisma's validation features
5. **Consider TypeScript**: Prisma works best with TypeScript

## Rollback Plan

If you need to revert to the old system:

1. Keep using imports from old model files:
   ```javascript
   const User = require('./models/User'); // Not User.prisma
   ```

2. The old models still work! Nothing has been broken.

## Important Notes

- **Both systems work**: Legacy raw SQL models and Prisma models coexist
- **No data loss**: All data remains in PostgreSQL
- **Same database**: Both systems connect to the same database
- **Gradual migration**: Switch at your own pace
- **Backup first**: Always backup before schema changes

## Troubleshooting

### Prisma Client not found
```bash
npx prisma generate
```

### Schema out of sync
```bash
npx prisma db pull
npx prisma generate
```

### Migration conflicts
```bash
npx prisma migrate resolve --rolled-back migration_name
```

## Documentation

- Prisma Docs: https://www.prisma.io/docs
- Migrate Guide: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Prisma Client API: https://www.prisma.io/docs/concepts/components/prisma-client
