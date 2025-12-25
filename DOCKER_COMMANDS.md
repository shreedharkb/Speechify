# Docker Container Commands

## Start Both Containers

```bash
# Start both containers
docker-compose up -d

# Or start individually
docker-compose up -d postgres
docker-compose up -d whisper-service
```

## Check Container Status

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Check health status
docker-compose ps
```

## Stop Containers

```bash
# Stop both containers
docker-compose down

# Stop individual containers
docker-compose stop postgres
docker-compose stop whisper-service
```

## Restart Containers

```bash
# Restart both
docker-compose restart

# Restart individual
docker-compose restart postgres
docker-compose restart whisper-service
```

## View Logs

```bash
# View logs for both
docker-compose logs -f

# View logs for specific container
docker-compose logs -f postgres
docker-compose logs -f whisper-service
```

## Rebuild Containers

```bash
# Rebuild and restart whisper service
docker-compose up -d --build whisper-service

# Rebuild both (if needed)
docker-compose up -d --build
```

## Remove Everything (⚠️ Deletes Data)

```bash
# Stop and remove containers + volumes
docker-compose down -v

# Remove only containers (keep data)
docker-compose down
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all containers in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose ps` | List containers with status |
| `docker-compose logs -f` | Follow logs from all containers |
| `docker-compose restart` | Restart all containers |
| `docker-compose down -v` | Remove containers and volumes |
