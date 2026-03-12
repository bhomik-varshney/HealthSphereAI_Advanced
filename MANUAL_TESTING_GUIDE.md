# Frontend Manual Testing Guide

## Services Status ✅

- **Backend**: Running on http://localhost:5001
- **Frontend**: Running on http://localhost:8080

## Automated Tests Results ✅

All API integration tests passed:

- ✅ Health check
- ✅ Ask AI chat with context memory
- ✅ Geocoding for map-based search

---

## Manual Testing Checklist

### 1. Test Ask AI Page (http://localhost:8080/ask-ai)

#### Chat Functionality:

- [ ] **Open Ask AI page** - Page should load without errors
- [ ] **Send a message** - Type "What are the symptoms of diabetes?" and click send
  - Expected: AI should respond with detailed information about diabetes symptoms
  - Response should appear within 2-5 seconds
- [ ] **Test context memory** - Send follow-up: "What about treatment?"
  - Expected: AI should reference previous diabetes discussion
  - Should understand context without repeating "diabetes" question
- [ ] **Test multiple messages** - Have a conversation with 3-5 exchanges
  - Expected: All messages should display correctly in chat window
  - Scroll should auto-scroll to latest message

#### Report Analysis:

- [ ] **Click report analysis sidebar** (File icon on right)
- [ ] **Upload a PDF file** - Any PDF document (medical report preferred)
  - Expected: File should show "Processing..." status
  - Then show "Complete" with analysis results
- [ ] **Upload an image** - Try PNG or JPG file
  - Expected: OCR should extract text and show analysis
- [ ] **Test error handling** - Upload a non-supported file (e.g., .txt)
  - Expected: Should show appropriate error message

### 2. Test Hospital Finder Page (http://localhost:8080/hospitals)

#### Text-based Search:

- [ ] **Open Hospital Finder page** - Page should load with search form
- [ ] **Search for a location** - Type "Delhi" and click "Search Hospitals"
  - Expected:
    - Status should show "Scraping Google Maps..."
    - Takes 30-60 seconds
    - Shows scraping logs in real-time
    - Displays hospitals in table/card view
- [ ] **Verify hospital data** - Check if results show:
  - Hospital name
  - Address
  - Rating
  - Phone number
  - Website (if available)
- [ ] **Search another location** - Try "Gurgaon" or "Mumbai"
  - Expected: New results should replace old ones

#### Map-based Search:

- [ ] **Click on the map** - Click anywhere on the India map
  - Expected:
    - Shows "Geocoding location..." message
    - Address appears below map
    - Automatically triggers hospital search for that location
- [ ] **Verify geocoded address** - Should show full address with city/state/pincode
- [ ] **Check hospital results** - Should show hospitals near clicked location

### 3. Test Other Pages

#### Home Page (http://localhost:8080/):

- [ ] **Load home page** - Should show welcome message and feature cards
- [ ] **Click navigation links** - Test all navigation menu items

#### About Page (http://localhost:8080/about):

- [ ] **Load about page** - Should show information about HealthSphere AI

#### Fitness Page (http://localhost:8080/fitness):

- [ ] **Load fitness page** - Should show fitness tracking features

### 4. Test Error Scenarios

#### Network Errors:

- [ ] **Stop backend** - Run: `lsof -ti:5001 | xargs kill -9`
- [ ] **Try to chat** - Send a message in Ask AI
  - Expected: Should show error message "Failed to get response"
- [ ] **Restart backend** - Run: `cd /Users/bhomikvarshney/PycharmProjects/pythonProject\(google\ maps\ scraper\) && nohup .venv/bin/uvicorn api:app --host 0.0.0.0 --port 5001 > backend.log 2>&1 &`
- [ ] **Try again** - Should work normally

#### Invalid Inputs:

- [ ] **Empty message** - Try to send empty chat message
  - Expected: Input should be disabled or show validation
- [ ] **Invalid location** - Search for "asdfghjkl" in hospital finder
  - Expected: Should show "No hospitals found" or error message

### 5. Test UI/UX Elements

#### Responsive Design:

- [ ] **Resize browser window** - Test different screen sizes
  - Expected: UI should adapt (mobile/tablet/desktop views)

#### Loading States:

- [ ] **Check loading indicators** - Verify spinners appear during:
  - Chat message sending
  - Hospital search
  - Report analysis
  - Geocoding

#### Navigation:

- [ ] **Test sidebar navigation** - Click all menu items
  - Expected: Should navigate without page reload (React Router)
- [ ] **Test browser back/forward** - Should work correctly

---

## Common Issues & Solutions

### Issue: Frontend shows blank white screen

**Solution**:

```bash
cd healthsphere-ui
rm -rf node_modules/.vite
npm run dev
```

### Issue: Chat not responding

**Solution**: Check browser console (F12) for errors

- Verify API URL in `.env`: `VITE_API_URL=http://localhost:5001/api`
- Check backend is running: `curl http://localhost:5001/api/health`

### Issue: Hospital search fails

**Solution**:

- Ensure playwright is installed: `.venv/bin/pip list | grep playwright`
- Check backend logs: `tail -f backend.log`

### Issue: CORS errors in browser console

**Solution**: Backend CORS is configured for all origins, but verify:

- Backend logs show the request
- Frontend is using correct API URL

---

## Expected Response Times

| Feature         | Expected Time | Notes                        |
| --------------- | ------------- | ---------------------------- |
| Chat message    | 2-5 seconds   | Depends on Groq API response |
| Report analysis | 3-10 seconds  | Depends on file size and OCR |
| Geocoding       | 1-2 seconds   | Fast API call                |
| Hospital search | 30-60 seconds | Real Google Maps scraping    |

---

## Testing Complete? ✅

Once all tests pass:

1. ✅ Frontend properly connected to backend
2. ✅ All API endpoints working
3. ✅ Chat with context memory functioning
4. ✅ Hospital search with real-time scraping
5. ✅ Error handling working correctly

## Quick Test Commands

```bash
# Check services are running
curl http://localhost:5001/api/health
curl http://localhost:8080 | head -20

# Run automated tests
cd /Users/bhomikvarshney/PycharmProjects/pythonProject\(google\ maps\ scraper\)
.venv/bin/python test_frontend_integration.py

# Start services (if stopped)
# Backend:
nohup .venv/bin/uvicorn api:app --host 0.0.0.0 --port 5001 > backend.log 2>&1 &

# Frontend:
cd healthsphere-ui && npm run dev
```

---

**Ready to test!** Open http://localhost:8080 in your browser and follow this checklist.
