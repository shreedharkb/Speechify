# SBERT Grading Service

A microservice for semantic grading of student answers using Sentence-BERT (SBERT).

## Overview

This service uses the `all-MiniLM-L6-v2` model from sentence-transformers to calculate semantic similarity between student answers and correct answers. It provides:

- **Semantic Understanding**: Recognizes that "H2O" and "water" are the same
- **Context Awareness**: Uses the question text to improve grading accuracy
- **Fast & Offline**: No API keys needed, runs completely offline
- **Lightweight**: Small model size (~80MB) with fast inference

## Model Information

- **Model**: `all-MiniLM-L6-v2`
- **Size**: ~80MB
- **Speed**: ~3000 sentences/second on CPU
- **Quality**: Maps sentences to 384-dimensional vectors
- **Use Case**: Semantic similarity, clustering, information retrieval

## API Endpoints

### Health Check
```bash
GET /health
```

Returns service status and model information.

### Grade Single Answer
```bash
POST /grade
Content-Type: application/json

{
  "questionText": "What is photosynthesis?",
  "studentAnswer": "Process where plants make food from sunlight",
  "correctAnswer": "Process by which plants convert light energy into chemical energy",
  "threshold": 0.85
}
```

Returns:
```json
{
  "isCorrect": true,
  "similarityScore": 0.8943,
  "explanation": "Good match - answer conveys the correct meaning"
}
```

### Batch Grade Multiple Answers
```bash
POST /batch-grade
Content-Type: application/json

{
  "threshold": 0.85,
  "answers": [
    {
      "questionText": "...",
      "studentAnswer": "...",
      "correctAnswer": "..."
    }
  ]
}
```

## Running Locally

### With Python (Direct)
```bash
cd sbert-service
pip install -r requirements.txt
python app.py
```

The service will be available at `http://localhost:5002`

### With Docker
```bash
cd sbert-service
docker build -t sbert-service .
docker run -p 5002:5002 sbert-service
```

### With Docker Compose
```bash
docker-compose up sbert-service
```

## Testing

Test the service:
```bash
curl -X POST http://localhost:5002/grade \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the capital of France?",
    "studentAnswer": "paris",
    "correctAnswer": "Paris",
    "threshold": 0.85
  }'
```

## Threshold Guidelines

- **0.95-1.0**: Exact or near-exact semantic match
- **0.90-0.95**: Very strong match, core concepts identical
- **0.85-0.90**: Good match, correct meaning (recommended for quizzes)
- **0.70-0.85**: Partial match, some correct concepts
- **Below 0.70**: Weak or no match

## Advantages Over Gemini API

✅ **No API Keys Required** - Works completely offline
✅ **No API Costs** - Free to use, unlimited requests
✅ **Privacy** - Student answers never leave your server
✅ **Fast** - No network latency, instant responses
✅ **Reliable** - No API rate limits or outages
✅ **Consistent** - Deterministic results (same inputs = same output)

## Technical Details

### How It Works

1. **Text Encoding**: Student and correct answers are encoded into 384-dimensional vectors
2. **Cosine Similarity**: Calculate the cosine similarity between the two vectors
3. **Context Enhancement**: Also considers question text for better context
4. **Score Calculation**: Uses the higher of direct similarity or context-aware similarity
5. **Threshold Application**: Compares score against threshold to determine correctness

### Model Performance

- **Speed**: ~3000 sentences/second on CPU, even faster on GPU
- **Memory**: ~500MB RAM including model and embeddings
- **Accuracy**: Trained on 1B+ sentence pairs for semantic similarity

## Troubleshooting

### Model Download Issues
If the model fails to download during build, you can pre-download it:
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

### Memory Issues
If running on limited memory, consider:
- Using a smaller model like `paraphrase-MiniLM-L3-v2` (17MB)
- Reducing batch sizes
- Adding swap space

### Slow Performance
To improve speed:
- Use GPU if available (automatically detected)
- Increase worker processes in production
- Enable batch processing for multiple answers
