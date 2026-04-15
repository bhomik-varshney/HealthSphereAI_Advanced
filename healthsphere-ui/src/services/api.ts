/**
 * API Service Layer for HealthSphere AI
 * Handles all communication with the Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Chat message type for AI conversations
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Hospital data from scraper
 */
export interface Hospital {
  name: string;
  phone?: string;
  website?: string;
  address: string;
}

/**
 * Chat API request/response types
 */
interface AskAIRequest {
  message: string;
  session_id: string;
}

interface AskAIResponse {
  response: string;
  session_id: string;
}

/**
 * Report analysis response type
 */
interface ReportAnalysisResponse {
  analysis: string;
  summary: string;
  extracted_text: string;
  entities: Array<[string, string]>;
}

/**
 * Hospital search response type
 */
interface HospitalSearchResponse {
  hospitals: Hospital[];
  count: number;
  location: string;
  scraper_output?: string;
  message?: string;
}

/**
 * Geocoding response type
 */
interface GeocodeResponse {
  address: string;
}

/**
 * Generic error response
 */
interface ErrorResponse {
  error: string;
  message?: string;
  details?: string;
}

/**
 * Helper function to handle API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'An unexpected error occurred',
    }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
}

/**
 * Send a chat message to HealthSphere AI
 * @param message - User's message
 * @param sessionId - Unique session ID to maintain conversation context
 * @returns AI response
 */
export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/ask-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    } as AskAIRequest),
  });

  const data = await handleResponse<AskAIResponse>(response);
  return data.response;
}

/**
 * Stream a chat response token-by-token from HealthSphere AI.
 * @param message - User's message
 * @param sessionId - Unique session ID
 * @param onChunk - Called for each streamed text chunk
 * @returns Full assembled AI response
 */
export async function sendChatMessageStream(
  message: string,
  sessionId: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/ask-ai/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    } as AskAIRequest),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'An unexpected error occurred',
    }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming is not supported by this browser/environment.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      fullText += chunk;
      onChunk(chunk);
    }
  }

  return fullText;
}

/**
 * Analyze a medical report (PDF or image)
 * @param file - Medical report file (PDF, PNG, or JPG)
 * @returns Analysis results including detailed analysis and summary
 */
export async function analyzeReport(file: File): Promise<ReportAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze-report`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<ReportAnalysisResponse>(response);
}

/**
 * Search for hospitals at a specific location
 * @param location - City or address to search
 * @param searchType - Optional search type (default: "in or near")
 * @returns List of hospitals with details
 */
export async function searchHospitals(
  location: string,
  searchType: string = 'in or near'
): Promise<HospitalSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/hospitals/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location,
      search_type: searchType,
    }),
  });

  return handleResponse<HospitalSearchResponse>(response);
}

/**
 * Convert coordinates to address using reverse geocoding
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted address
 */
export async function geocodeLocation(
  lat: number,
  lng: number
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/hospitals/geocode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lng }),
  });

  const data = await handleResponse<GeocodeResponse>(response);
  return data.address;
}

/**
 * Generate a unique session ID for chat
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
