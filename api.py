"""
FastAPI server for HealthSphere AI
Exposes AI services as REST API endpoints for React frontend
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import AIMessage, HumanMessage
from langchain_groq import ChatGroq
import subprocess
import sys
import pandas as pd
import os
import pdfplumber
import pytesseract
import spacy
from PIL import Image
from io import BytesIO
from typing import Optional, List, Tuple, Iterator
import requests
import re
import time

app = FastAPI(title="HealthSphere AI API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI model
API_KEY = os.environ.get("GROQ_API_KEY", "")
llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=API_KEY)

# Load spaCy model for NER
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("Warning: spaCy model not loaded. Run: python -m spacy download en_core_web_sm")
    nlp = None

# Store chat sessions
chat_sessions = {}

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

class HospitalSearchRequest(BaseModel):
    location: str
    search_type: str = "in or near"

class GeocodeRequest(BaseModel):
    lat: float
    lng: float

class HealthResponse(BaseModel):
    status: str
    service: str


CALENDAR_AGENT_URL = os.environ.get("CALENDAR_AGENT_URL", "http://localhost:8000/calendar")
STREAM_CHUNK_SIZE = int(os.environ.get("ASK_AI_STREAM_CHUNK_SIZE", "24"))
STREAM_DELAY_MS = int(os.environ.get("ASK_AI_STREAM_DELAY_MS", "45"))


def is_health_reminder_request(message: str) -> bool:
    """Heuristic detection for medicine/health reminder scheduling requests."""
    text = message.lower()

    reminder_terms = [
        "remind", "reminder", "set reminder", "schedule", "add event",
        "calendar", "alert", "notify", "notification"
    ]
    health_terms = [
        "medicine", "medication", "tablet", "pill", "dose", "insulin",
        "vitamin", "syrup", "capsule", "doctor", "appointment", "checkup",
        "bp", "blood pressure", "sugar", "glucose", "workout", "walk",
        "health"
    ]

    has_reminder_intent = any(term in text for term in reminder_terms)
    has_health_context = any(term in text for term in health_terms)

    # Support direct scheduling statements like:
    # "take BP medicine at 1pm tomorrow"
    instruction_terms = [
        "take", "have", "do", "start", "continue", "check", "measure",
        "i need to", "i have to", "need to", "every day", "daily", "every"
    ]
    temporal_terms = [
        "today", "tomorrow", "tonight", "morning", "afternoon", "evening",
        "night", "monday", "tuesday", "wednesday", "thursday", "friday",
        "saturday", "sunday", "weekly", "monthly", "at ", "on ", "by "
    ]
    time_pattern = r"\b\d{1,2}(:\d{2})?\s?(am|pm)\b"

    has_instruction_intent = any(term in text for term in instruction_terms)
    has_temporal_context = any(term in text for term in temporal_terms) or bool(re.search(time_pattern, text))
    direct_health_schedule_intent = has_health_context and has_instruction_intent and has_temporal_context

    return (has_reminder_intent and has_health_context) or direct_health_schedule_intent


def create_health_calendar_reminder(message: str, session_id: str) -> Tuple[bool, str]:
    """Forward reminder requests to the calendar agent service."""
    try:
        payload = {
            "message": message,
            "thread_id": f"healthsphere_{session_id}"
        }

        response = requests.post(CALENDAR_AGENT_URL, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()

        calendar_text = data.get("response", "")
        has_error = bool(data.get("error"))

        if has_error:
            return False, f"I could not create that reminder due to a calendar error: {data.get('error')}"

        return True, (
            "I created your health reminder in Google Calendar.\n\n"
            f"Calendar agent response: {calendar_text}"
        )

    except requests.exceptions.RequestException as exc:
        return False, (
            "I understood your reminder request, but the calendar service is unreachable right now. "
            "Please ensure the calendar agent is running on port 8000, then try again. "
            f"Details: {exc}"
        )
    except Exception as exc:
        return False, f"I could not create the reminder due to an unexpected error: {exc}"


def get_chat_history(session_id: str):
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    return chat_sessions[session_id]


def build_medical_prompt(message: str, formatted_history: str) -> str:
    return f"""
You are **HealthSphere AI**, an expert medical AI specializing in **healthcare, medicine, and human biology**.
Your goal is to provide **accurate, science-backed answers** to **all medical-related questions**, including:
- Medical conditions, symptoms, and treatments
- Human anatomy and physiology
- Neuroscience and mental health
- Pharmacology and common medications
- Medical research and advancements
- First aid and emergency care
- Nutrition and preventive healthcare

### **Previous Conversation:**
{formatted_history}

---

### **User's Query:**
{message}

---

### **Response Strategy:**

1️⃣ **Medical Explanation & Diagnosis:**
   - If the user asks a **general medical question**, provide a **concise, factual answer**.
   - If the user **describes symptoms**, suggest **possible medical conditions** based on symptoms.
   - If necessary, ask for **one additional investigation or symptom clarification**.

2️⃣ **Treatment & Remedies:**
   - After identifying possible conditions, **suggest treatments**.
   - Include **simple home remedies, lifestyle changes, and precautions**.
   - Suggest **over-the-counter medications (if applicable and safe)**.

3️⃣ **User Engagement & Next Steps:**
   - Ask the user if they **want to explore possible medications and remedies**.
   - If they agree, **list safe and general treatment options**.
   - Remind them to **consult a healthcare provider for confirmation**.

---

⚠️ **Important Notes:**
- **Do NOT provide final diagnoses.** Clearly state that this is an **AI-based assumption**.
- Keep responses **concise, supportive, and medically accurate**.
- Always **recommend consulting a medical professional for confirmation**.
"""


def _chunk_to_text(chunk) -> str:
    content = getattr(chunk, "content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, dict):
                text = item.get("text", "")
                if text:
                    texts.append(text)
        return "".join(texts)
    return str(content) if content else ""


def _yield_small_chunks(text: str, chunk_size: int = STREAM_CHUNK_SIZE) -> Iterator[str]:
    """Split large model chunks so frontend updates are visibly incremental."""
    if not text:
        return

    for i in range(0, len(text), chunk_size):
        yield text[i:i + chunk_size]


def stream_chat_response(message: str, session_id: str) -> Iterator[str]:
    chat_history = get_chat_history(session_id)

    if is_health_reminder_request(message):
        _, reminder_response = create_health_calendar_reminder(message, session_id)
        chat_history.append(HumanMessage(content=message))
        chat_history.append(AIMessage(content=reminder_response))
        yield reminder_response
        return

    formatted_history = "\n".join([
        f"User: {msg.content}" if isinstance(msg, HumanMessage)
        else f"AI: {msg.content}"
        for msg in chat_history
    ])
    prompt_template = build_medical_prompt(message, formatted_history)

    chunks: List[str] = []
    try:
        for chunk in llm.stream(prompt_template):
            piece = _chunk_to_text(chunk)
            if piece:
                chunks.append(piece)
                for small_piece in _yield_small_chunks(piece):
                    yield small_piece
                    if STREAM_DELAY_MS > 0:
                        time.sleep(STREAM_DELAY_MS / 1000.0)
    except Exception as e:
        error_text = f"I hit an issue while generating a response: {e}"
        chunks.append(error_text)
        yield error_text
    finally:
        final_response = "".join(chunks).strip()
        if final_response:
            chat_history.append(HumanMessage(content=message))
            chat_history.append(AIMessage(content=final_response))


@app.get('/api/health', response_model=HealthResponse)
async def health_check():
    return {"status": "healthy", "service": "HealthSphere AI API"}


@app.post('/api/ask-ai', response_model=ChatResponse)
async def ask_ai(request: ChatRequest):
    try:
        message = request.message
        session_id = request.session_id
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        chat_history = get_chat_history(session_id)

        # Route medicine/health reminder requests to Google Calendar agent.
        if is_health_reminder_request(message):
            success, reminder_response = create_health_calendar_reminder(message, session_id)

            chat_history.append(HumanMessage(content=message))
            chat_history.append(AIMessage(content=reminder_response))

            return {
                "response": reminder_response,
                "session_id": session_id
            }
        
        formatted_history = "\n".join([
            f"User: {msg.content}" if isinstance(msg, HumanMessage) 
            else f"AI: {msg.content}" 
            for msg in chat_history
        ])
        prompt_template = build_medical_prompt(message, formatted_history)
        
        response = llm.invoke(prompt_template).content
        
        chat_history.append(HumanMessage(content=message))
        chat_history.append(AIMessage(content=response))
        
        return {
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"Error in ask_ai: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/ask-ai/stream')
async def ask_ai_stream(request: ChatRequest):
    try:
        message = request.message
        session_id = request.session_id

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        return StreamingResponse(
            stream_chat_response(message, session_id),
            media_type='text/plain; charset=utf-8',
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        print(f"Error in ask_ai_stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/analyze-report')
async def analyze_report(file: UploadFile = File(...)):
    try:
        file_type = file.content_type
        content = await file.read()
        
        print(f"Analyzing file: {file.filename}, type: {file_type}, size: {len(content)} bytes")
        
        # Validate file type
        if file_type == "application/pdf":
            extracted_text = extract_text_from_pdf(BytesIO(content))
        elif file_type in ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp"]:
            extracted_text = extract_text_from_image(BytesIO(content))
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format: {file_type}. Please upload PDF, PNG, JPG, or other image formats."
            )
        
        # Check if text was extracted (more lenient - at least 5 characters)
        if not extracted_text or len(extracted_text.strip()) < 5:
            error_msg = f"Could not extract text from the file. "
            if file_type == "application/pdf":
                error_msg += "The PDF might be scanned or image-based. Try converting it to an image (PNG/JPG) first."
            else:
                error_msg += "The image might be too blurry, low resolution, or doesn't contain readable text. Try using a clearer image."
            error_msg += f" Extracted: {len(extracted_text) if extracted_text else 0} characters."
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Extract entities using NER
        entities = []
        if nlp:
            try:
                doc = nlp(extracted_text[:5000])  # Limit text for NER to avoid memory issues
                entities = [(ent.text, ent.label_) for ent in doc.ents]
            except Exception as e:
                print(f"NER processing warning: {e}")
                # Continue without entities if NER fails
        
        prompt_template = f"""
Analyze the given medical report and extract key health insights.

### 📜 Extracted Report Data:
{extracted_text}

### 🔍 Detected Entities (Named Entity Recognition - NLU):
- **NLU data extracted:** {entities if entities else 'No entities detected'}

### 🔎 Your Tasks:
1. **Identify Any Abnormalities** in the report.
2. **Identify Disease (if any). Tell if it is severe or not.**
3. **List Major Symptoms the User May Feel** based on detected conditions.
4. **Provide Health Improvement Suggestions** with lifestyle changes, diet, or precautions.

⚠️ **Important:**
- Keep the response concise and medically accurate.
- Maintain an empathetic and supportive tone.
"""
        
        analysis = llm.invoke(prompt_template).content
        
        summary_prompt = f"""
You are a medical expert AI. Given the following medical report analysis, summarize the key findings, diagnosis, and important recommendations in less than 100 words. Ensure the summary is clear, professional, and easy to understand.

Medical Report Analysis:
{analysis}

Summary (under 100 words):
"""
        
        summary = llm.invoke(summary_prompt).content
        
        return {
            "analysis": analysis,
            "summary": summary,
            "extracted_text": extracted_text[:500],
            "entities": entities
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error in analyze_report: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
        result = text.strip()
        print(f"PDF extraction: {len(result)} characters extracted")
        return result
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        raise


def extract_text_from_image(file):
    """Extract text from image using OCR with preprocessing"""
    try:
        image = Image.open(file)
        print(f"Image opened: {image.format}, size: {image.size}, mode: {image.mode}")
        
        # Convert to RGB if necessary
        if image.mode not in ['RGB', 'L']:
            print(f"Converting image from {image.mode} to RGB")
            image = image.convert('RGB')
        
        # Try multiple OCR configurations for better results
        configs = [
            '',  # Default
            '--psm 6',  # Assume uniform block of text
            '--psm 3',  # Fully automatic page segmentation
        ]
        
        best_text = ""
        for config in configs:
            try:
                text = pytesseract.image_to_string(image, config=config)
                if text and len(text.strip()) > len(best_text):
                    best_text = text.strip()
            except Exception as e:
                print(f"OCR config '{config}' failed: {e}")
                continue
        
        result = best_text
        print(f"Image OCR extraction: {len(result)} characters extracted")
        
        if not result:
            print("Warning: No text extracted from image. Image might be too blurry or contain no text.")
        
        return result
    except Exception as e:
        print(f"Error extracting image text: {e}")
        import traceback
        traceback.print_exc()
        raise


@app.post('/api/hospitals/search')
async def search_hospitals(request: HospitalSearchRequest):
    try:
        location = request.location
        search_type = request.search_type
        
        if not location:
            raise HTTPException(status_code=400, detail="Location is required")
        
        # Use virtual environment's Python with proper command list
        python_exe = sys.executable
        search_query = f"hospitals {search_type} {location}"
        command = [python_exe, "scraper.py", "-s", search_query, "-t", "50"]
        process = subprocess.run(command, capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail={
                "error": "Scraper encountered an error",
                "details": process.stderr
            })
        
        file_path = f"output/hospitals_data_hospitals_{search_type.replace(' ', '_')}_{location.replace(' ', '_')}.csv"
        
        try:
            data = pd.read_csv(file_path)
            
            if data.empty:
                return {
                    "hospitals": [],
                    "count": 0,
                    "location": location,
                    "message": "No hospitals found in this area"
                }
            
            # Replace NaN values with None for JSON compatibility
            data = data.where(pd.notnull(data), None)
            hospitals = data.to_dict('records')
            
            return {
                "hospitals": hospitals,
                "count": len(hospitals),
                "location": location,
                "scraper_output": process.stdout
            }
            
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail={
                "error": "No hospitals data found",
                "message": "The scraper may have encountered an issue or no results were found"
            })
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail={
                "error": "Invalid location",
                "message": "There is no such place or you have entered wrong location"
            })
            
    except Exception as e:
        print(f"Error in search_hospitals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/hospitals/geocode')
async def geocode_location(request: GeocodeRequest):
    try:
        import requests
        
        lat = request.lat
        lng = request.lng
        
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
        headers = {"User-Agent": "HealthSphere-Hospital-Finder/1.0"}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            address = data.get("display_name", None)
            
            if address:
                return {"address": address}
            else:
                raise HTTPException(status_code=404, detail="No address found")
        else:
            raise HTTPException(status_code=500, detail="Geocoding service error")
            
    except Exception as e:
        print(f"Error in geocode_location: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    
    os.makedirs('output', exist_ok=True)
    
    print("Starting HealthSphere AI API Server...")
    print("API will be available at http://localhost:5001")
    print("Docs available at http://localhost:5001/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info")
