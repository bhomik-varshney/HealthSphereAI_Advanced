# HealthSphere AI - Quick Start

## 🚀 Quick Start (Single Command)

```bash
./start.sh
```

This starts both backend and frontend automatically!

## 📝 Manual Start

### Backend (Terminal 1)

```bash
python api.py
# Runs on: http://localhost:5000
```

### Frontend (Terminal 2)

```bash
cd healthsphere-ui
npm run dev
# Runs on: http://localhost:5173
```

## 🔗 Connected Services

| Feature             | Frontend           | Backend Endpoint              | Status |
| ------------------- | ------------------ | ----------------------------- | ------ |
| **AI Chat**         | `/ask-ai`          | `POST /api/ask-ai`            | ✅     |
| **Report Analysis** | `/ask-ai`          | `POST /api/analyze-report`    | ✅     |
| **Hospital Search** | `/hospital-finder` | `POST /api/hospitals/search`  | ✅     |
| **Geocoding**       | `/hospital-finder` | `POST /api/hospitals/geocode` | ✅     |

## 🛠 Tech Stack

**Backend:**

- Flask (REST API)
- Groq AI (LLM - Llama 3.3 70B)
- Playwright (Web scraping)
- spaCy (NER)
- Tesseract (OCR)
- pdfplumber (PDF parsing)

**Frontend:**

- React + TypeScript
- Vite (Build tool)
- shadcn/ui (Components)
- TailwindCSS (Styling)

## 📡 API Examples

### Chat

```bash
curl -X POST http://localhost:5000/api/ask-ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the symptoms of diabetes?",
    "session_id": "user123"
  }'
```

### Analyze Report

```bash
curl -X POST http://localhost:5000/api/analyze-report \
  -F "file=@medical_report.pdf"
```

### Search Hospitals

```bash
curl -X POST http://localhost:5000/api/hospitals/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "New York",
    "search_type": "in or near"
  }'
```

## 📂 Project Structure

```
.
├── api.py                    # Flask backend
├── scraper.py               # Google Maps scraper
├── requirements.txt         # Python dependencies
├── start.sh                 # Startup script
├── healthsphere-ui/         # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AskAI.tsx           ✅ Connected
│   │   │   └── HospitalFinder.tsx  ✅ Connected
│   │   └── services/
│   │       └── api.ts              ✅ API Layer
│   └── .env                 # Frontend config
└── output/                  # Scraped hospital data
```

## 🎯 What's Connected

### 1. Ask AI Page

- ✅ Real-time chat with Groq AI
- ✅ Medical report upload & analysis
- ✅ OCR for images
- ✅ PDF text extraction
- ✅ Session-based conversation

### 2. Hospital Finder Page

- ✅ Text-based location search
- ✅ Interactive map selection
- ✅ Real-time Google Maps scraping
- ✅ Geocoding (lat/lng → address)
- ✅ CSV export

## 🐛 Troubleshooting

| Issue              | Solution                                       |
| ------------------ | ---------------------------------------------- |
| CORS errors        | Ensure Flask-CORS is installed                 |
| Port 5000 busy     | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Port 5173 busy     | Kill process: `lsof -ti:5173 \| xargs kill -9` |
| "Module not found" | Run `pip install -r requirements.txt`          |
| Scraper fails      | Run `playwright install`                       |
| OCR not working    | Install Tesseract: `brew install tesseract`    |

## 📚 Documentation

- Full setup guide: `SETUP_GUIDE.md`
- API documentation: Check `api.py` docstrings
- Frontend components: `healthsphere-ui/src/components/`

---

**Need help?** Check the logs in both terminal windows!
