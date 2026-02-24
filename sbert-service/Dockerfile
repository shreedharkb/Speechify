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

# Download the SBERT model during build (so it's cached in the image)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY app.py .

# Expose port
EXPOSE 5002

# Run with Gunicorn for production (8 workers for 200+ concurrent users)
# gevent worker handles async I/O efficiently
CMD ["gunicorn", "--workers", "8", "--worker-class", "gevent", "--bind", "0.0.0.0:5002", "--timeout", "120", "--keep-alive", "5", "app:app"]
