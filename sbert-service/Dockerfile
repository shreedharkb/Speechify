FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Expose port
EXPOSE 5002

# Run with Gunicorn for production
# Using 1 worker with sync class to fit within free tier memory limits (512MB)
# The SBERT model is loaded once per worker, so fewer workers = less memory
CMD ["gunicorn", "--workers", "1", "--worker-class", "sync", "--bind", "0.0.0.0:5002", "--timeout", "120", "app:app"]
