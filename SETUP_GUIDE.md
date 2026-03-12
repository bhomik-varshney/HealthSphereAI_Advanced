# HealthSphere AI - Setup Guide

This guide will help you connect your React frontend with the Flask backend API.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│                     │         │                      │
│  React Frontend     │◄───────►│  Flask API Backend   │
│  (Vite + TypeScript)│  HTTP   │  (Python + Flask)    │
│                     │         │                      │
│  Port: 5173         │         │  Port: 5000          │
└─────────────────────┘         └──────────────────────┘
                                          │
                                          ▼
                                ┌────────────────────┐
                                │  AI Services       │
                                │  - Groq LLM        │
                                │  - Google Maps     │
                                │  - OCR/NER         │
                                └────────────────────┘
```

## Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- Groq API key (already configured)

## Backend Setup

### 1. Install Python Dependencies

```bash
# Navigate to project root
cd "/Users/bhomikvarshney/PycharmProjects/pythonProject(google maps scraper)"

# Install all required packages
pip install -r requirements.txt

# Download spaCy language model for NER
python -m spacy download en_core_web_sm
```

### 2. Install Tesseract (for OCR)

**macOS:**

```bash
brew install tesseract
```

**Ubuntu/Debian:**

```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download installer from: https://github.com/UB-Mannheim/tesseract/wiki

### 3. Start the Flask API Server

```bash
python api.py
```

The API will start on `http://localhost:5000`

**Available Endpoints:**

- `GET /api/health` - Health check
- `POST /api/ask-ai` - Chat with HealthSphere AI
- `POST /api/analyze-report` - Analyze medical reports (PDF/Image)
- `POST /api/hospitals/search` - Search for hospitals
- `POST /api/hospitals/geocode` - Convert coordinates to address

## Frontend Setup

### 1. Install Node Dependencies

```bash
# Navigate to frontend directory
cd healthsphere-ui

# Install packages
npm install
```

### 2. Configure Environment

The `.env` file has already been created with the default configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update this to your deployed API URL.

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Connection

### 1. Test Backend API

Open a new terminal and test the API:

```bash
# Health check
curl http://localhost:5000/api/health

# Test chat
curl -X POST http://localhost:5000/api/ask-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "What is diabetes?", "session_id": "test123"}'
```

### 2. Test Frontend

1. Open your browser to `http://localhost:5173`
2. Navigate to "Ask AI" page
3. Try sending a message
4. Try uploading a medical report (PDF or image)
5. Navigate to "Hospital Finder"
6. Try searching for hospitals in your city

## Running Both Services

**Option 1: Two Terminals**

Terminal 1 (Backend):

```bash
cd "/Users/bhomikvarshney/PycharmProjects/pythonProject(google maps scraper)"
python api.py
```

Terminal 2 (Frontend):

```bash
cd "/Users/bhomikvarshney/PycharmProjects/pythonProject(google maps scraper)/healthsphere-ui"
npm run dev
```

**Option 2: Background Process (macOS/Linux)**

```bash
# Start backend in background
cd "/Users/bhomikvarshney/PycharmProjects/pythonProject(google maps scraper)"
python api.py &

# Start frontend
cd healthsphere-ui
npm run dev
```

## Features Connected

### ✅ Ask AI (Chat)

- Real-time chat with HealthSphere AI
- Medical questions and answers
- Symptom analysis
- Treatment suggestions
- Session-based conversation memory

### ✅ Report Analysis

- Upload medical reports (PDF/Image)
- OCR text extraction
- Named Entity Recognition (NER)
- AI-powered analysis
- Health recommendations

### ✅ Hospital Finder

- Text-based location search
- Interactive map-based search
- Real-time scraping from Google Maps
- Displays: name, phone, website, address
- Export results to CSV

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

- Ensure Flask-CORS is installed: `pip install flask-cors`
- Check that `api.py` has `CORS(app)` enabled
- Verify the API is running on port 5000

### API Connection Failed

- Check if backend is running: `curl http://localhost:5000/api/health`
- Verify `.env` file has correct `VITE_API_URL`
- Check browser console for error messages

### Scraper Issues

- Ensure Playwright browsers are installed: `playwright install`
- Check `scraper.py` is in the project root
- Verify output directory exists

### Report Analysis Fails

- Install Tesseract: `brew install tesseract` (macOS)
- Download spaCy model: `python -m spacy download en_core_web_sm`
- Check file format (PDF, PNG, JPG only)

## API Security Notes

⚠️ **Important:** The Groq API key is currently hardcoded in `api.py`. For production:

1. Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_api_key_here
```

2. Update `api.py` to load from environment:

```python
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('GROQ_API_KEY')
```

3. Install python-dotenv:

```bash
pip install python-dotenv
```

## Production Deployment

### Backend (Flask API)

- Use production WSGI server (Gunicorn, uWSGI)
- Set up environment variables
- Configure proper CORS origins
- Add rate limiting
- Use Redis for session storage

### Frontend (React)

```bash
cd healthsphere-ui
npm run build
# Deploy dist/ folder to hosting service
```

Recommended hosting:

- Backend: Railway, Heroku, AWS EC2, DigitalOcean
- Frontend: Vercel, Netlify, Cloudflare Pages

## Development Tips

### Hot Reload

Both services support hot reload:

- Frontend: Vite automatically reloads on file changes
- Backend: Flask debug mode reloads on Python file changes

### Debugging

- Backend logs: Check terminal running `api.py`
- Frontend logs: Check browser DevTools console
- Network requests: Check DevTools Network tab

### Adding New Features

1. Add endpoint in `api.py`
2. Add function in `src/services/api.ts`
3. Use in React components
4. Test end-to-end

## Need Help?

Check logs in both terminals for error messages. Most issues are related to:

- Missing dependencies
- Port conflicts (5000 or 5173 already in use)
- API key issues
- File permissions

---

**Your HealthSphere AI is now connected! 🎉**

Visit `http://localhost:5173` to start using your integrated application.
