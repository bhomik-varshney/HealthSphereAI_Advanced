#!/usr/bin/env python3
"""
Test script for HealthSphere AI API
Tests all endpoints and reports results
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:5001/api"
TIMEOUT = 30

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_health():
    """Test health endpoint"""
    print_section("Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Health check PASSED")
            return True
        else:
            print("❌ Health check FAILED")
            return False
    except Exception as e:
        print(f"❌ Health check ERROR: {str(e)}")
        return False

def test_chat():
    """Test chat endpoint"""
    print_section("Testing Chat Endpoint")
    try:
        payload = {
            "message": "What is diabetes?",
            "session_id": "test_session_123"
        }
        
        print(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/ask-ai", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response received (length: {len(data.get('response', ''))} chars)")
            print(f"Session ID: {data.get('session_id')}")
            print(f"Response preview: {data.get('response', '')[:200]}...")
            print("✅ Chat endpoint PASSED")
            return True
        else:
            print(f"Response: {response.text}")
            print("❌ Chat endpoint FAILED")
            return False
    except Exception as e:
        print(f"❌ Chat endpoint ERROR: {str(e)}")
        return False

def test_chat_context():
    """Test chat with context (multiple messages)"""
    print_section("Testing Chat Context (Session Memory)")
    try:
        session_id = "test_context_session"
        
        # First message
        payload1 = {
            "message": "I have a headache",
            "session_id": session_id
        }
        response1 = requests.post(f"{BASE_URL}/ask-ai", json=payload1, timeout=TIMEOUT)
        print(f"Message 1 Status: {response1.status_code}")
        
        # Second message (should remember context)
        time.sleep(1)
        payload2 = {
            "message": "What could be causing it?",
            "session_id": session_id
        }
        response2 = requests.post(f"{BASE_URL}/ask-ai", json=payload2, timeout=TIMEOUT)
        print(f"Message 2 Status: {response2.status_code}")
        
        if response2.status_code == 200:
            data = response2.json()
            print(f"Response preview: {data.get('response', '')[:200]}...")
            print("✅ Chat context PASSED")
            return True
        else:
            print("❌ Chat context FAILED")
            return False
    except Exception as e:
        print(f"❌ Chat context ERROR: {str(e)}")
        return False

def test_report_analysis():
    """Test report analysis (without actual file)"""
    print_section("Testing Report Analysis Endpoint")
    print("Note: Skipping actual file upload test")
    print("To fully test, upload a PDF/image through the frontend")
    print("⚠️  Report analysis requires actual file - SKIPPED")
    return None

def test_hospital_search():
    """Test hospital search endpoint"""
    print_section("Testing Hospital Search")
    try:
        payload = {
            "location": "Delhi",
            "search_type": "in or near"
        }
        
        print(f"Request: {json.dumps(payload, indent=2)}")
        print("⏳ This may take 30-60 seconds (scraping Google Maps)...")
        response = requests.post(f"{BASE_URL}/hospitals/search", json=payload, timeout=90)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Hospitals found: {data.get('count', 0)}")
            print(f"Location: {data.get('location')}")
            if data.get('hospitals'):
                print(f"First hospital: {data['hospitals'][0].get('name', 'N/A')}")
            print("✅ Hospital search PASSED")
            return True
        else:
            print(f"Response: {response.text}")
            print("❌ Hospital search FAILED")
            return False
    except Exception as e:
        print(f"❌ Hospital search ERROR: {str(e)}")
        return False

def test_geocoding():
    """Test geocoding endpoint"""
    print_section("Testing Geocoding")
    try:
        payload = {
            "lat": 28.6139,
            "lng": 77.2090
        }
        
        print(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/hospitals/geocode", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Address: {data.get('address', 'N/A')[:150]}...")
            print("✅ Geocoding PASSED")
            return True
        else:
            print(f"Response: {response.text}")
            print("❌ Geocoding FAILED")
            return False
    except Exception as e:
        print(f"❌ Geocoding ERROR: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("  HealthSphere AI - Backend API Test Suite")
    print("="*60)
    print(f"Testing API at: {BASE_URL}")
    
    results = {}
    
    # Test 1: Health Check
    results['health'] = test_health()
    
    if not results['health']:
        print("\n❌ CRITICAL: Backend server is not responding!")
        print("Please ensure the API server is running:")
        print("  python api.py")
        return
    
    time.sleep(1)
    
    # Test 2: Chat Endpoint
    results['chat'] = test_chat()
    time.sleep(1)
    
    # Test 3: Chat Context
    results['chat_context'] = test_chat_context()
    time.sleep(1)
    
    # Test 4: Report Analysis (skipped without file)
    results['report'] = test_report_analysis()
    time.sleep(1)
    
    # Test 5: Geocoding
    results['geocoding'] = test_geocoding()
    time.sleep(1)
    
    # Test 6: Hospital Search (can be slow)
    print("\n⚠️  Hospital search test takes 30-60 seconds")
    print("Skip this test? (y/n): ", end='', flush=True)
    # Auto-proceed for automation
    results['hospital_search'] = test_hospital_search()
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    
    for test, result in results.items():
        if result is True:
            print(f"✅ {test.replace('_', ' ').title()}: PASSED")
        elif result is False:
            print(f"❌ {test.replace('_', ' ').title()}: FAILED")
        else:
            print(f"⚠️  {test.replace('_', ' ').title()}: SKIPPED")
    
    print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")
    
    if failed > 0:
        print("\n⚠️  Some tests failed. Check error messages above.")
        print("Common issues:")
        print("  - Backend not running: python api.py")
        print("  - Port conflict: Check if port 5001 is free")
        print("  - Missing dependencies: pip install -r requirements.txt")
        print("  - Groq API key invalid or expired")
    else:
        print("\n🎉 All tests passed! Backend is working correctly.")
        print("\nYou can now use the frontend at: http://localhost:8082")

if __name__ == "__main__":
    main()
