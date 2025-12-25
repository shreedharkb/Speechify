# PostgreSQL Database Setup

This project uses PostgreSQL running in a Docker container for the quiz application database.

## Quick Start

1. **Start PostgreSQL Container**
   ```bash
   docker-compose up -d postgres
   ```

2. **Verify Database is Running**
   ```bash
   docker-compose ps
   docker logs quiz-postgres-db
   ```

3. **Connect to Database**
   ```bash
   docker exec -it quiz-postgres-db psql -U quiz_admin -d quiz_app
   ```

## Database Configuration

- **Container Name:** `quiz-postgres-db`
- **Port:** `5432` (mapped to host)
- **Database Name:** `quiz_app`
- **User:** `quiz_admin`
- **Password:** `quiz_secure_password` (⚠️ Change in production!)

## Connection Details

### Connection String
```
postgresql://quiz_admin:quiz_secure_password@localhost:5432/quiz_app
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cd Backend
cp .env.example .env
```

## Database Schema

The schema is automatically initialized when the container starts for the first time. It includes:

### Tables
- `users` - User accounts (students and teachers)
- `quiz_events` - Quiz events created by teachers
- `questions` - Questions for quiz events
- `quiz_attempts` - Student quiz attempts
- `attempt_answers` - Individual answers for each attempt
- `quizzes` (legacy) - Old quiz model
- `quiz_questions` (legacy) - Old quiz questions

### Views
- `active_quiz_events` - Currently active quizzes with stats
- `student_quiz_results` - Student performance data
- `teacher_quiz_statistics` - Teacher quiz analytics

## Useful Commands

### Stop Database
```bash
docker-compose stop postgres
```

### Restart Database
```bash
docker-compose restart postgres
```

### View Logs
```bash
docker-compose logs -f postgres
```

### Backup Database
```bash
docker exec quiz-postgres-db pg_dump -U quiz_admin quiz_app > backup.sql
```

### Restore Database
```bash
docker exec -i quiz-postgres-db psql -U quiz_admin quiz_app < backup.sql
```

### Reset Database (⚠️ Deletes all data)
```bash
docker-compose down -v
docker-compose up -d postgres
```

## PostgreSQL Client Tools

### Connect via psql (CLI)
```bash
docker exec -it quiz-postgres-db psql -U quiz_admin -d quiz_app
```

### Common psql Commands
- `\dt` - List all tables
- `\d table_name` - Describe table structure
- `\dv` - List all views
- `\l` - List all databases
- `\du` - List all users
- `\q` - Quit psql

### Example Queries
```sql
-- View all users
SELECT * FROM users;

-- View active quizzes
SELECT * FROM active_quiz_events;

-- View student results
SELECT * FROM student_quiz_results;

-- Get quiz leaderboard
SELECT 
    u.name, 
    qa.score, 
    qa.submitted_at
FROM quiz_attempts qa
JOIN users u ON qa.student_id = u.id
WHERE qa.quiz_event_id = 1
ORDER BY qa.score DESC, qa.submitted_at ASC
LIMIT 10;
```

## GUI Tools (Optional)

You can connect to the database using:
- **pgAdmin** - https://www.pgadmin.org/
- **DBeaver** - https://dbeaver.io/
- **DataGrip** - https://www.jetbrains.com/datagrip/
- **VS Code Extension** - PostgreSQL by Chris Kolkman

Connection settings:
- Host: `localhost`
- Port: `5432`
- Database: `quiz_app`
- Username: `quiz_admin`
- Password: `quiz_secure_password`

## Production Considerations

Before deploying to production:

1. **Change the password** in `docker-compose.yml`
2. **Use environment variables** instead of hardcoded credentials
3. **Enable SSL connections**
4. **Set up regular backups**
5. **Configure proper resource limits**
6. **Implement connection pooling** in your application
7. **Monitor database performance**

## Troubleshooting

### Container won't start
```bash
docker-compose logs postgres
docker-compose down -v
docker-compose up -d postgres
```

### Can't connect to database
```bash
# Check if container is running
docker-compose ps

# Check container logs
docker-compose logs postgres

# Verify port is accessible
netstat -an | findstr 5432
```

### Permission denied errors
```bash
# Reset volumes
docker-compose down -v
docker volume rm speechify_postgres-data
docker-compose up -d postgres
```

## Migration from MongoDB

If you're migrating from MongoDB, you'll need to:

1. Export data from MongoDB
2. Transform the data structure to match SQL schema
3. Import into PostgreSQL

A migration script can be created if needed.
