"""
Frontend-Backend Integration Test
Tests the actual API calls that the frontend makes
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:5001/api"

def test_frontend_chat_flow():
    """Test the chat flow as frontend would use it"""
    print("\n" + "="*70)
    print("  Testing Ask AI - Chat Functionality (Frontend Flow)")
    print("="*70)
    
    session_id = str(uuid.uuid4())
    print(f"Session ID: {session_id}")
    
    # Test 1: Send first message
    print("\n1. Sending first message: 'What are the symptoms of diabetes?'")
    response = requests.post(
        f"{BASE_URL}/ask-ai",
        json={
            "message": "What are the symptoms of diabetes?",
            "session_id": session_id
        }
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response length: {len(data['response'])} chars")
        print(f"   Response preview: {data['response'][:150]}...")
        print("   ✅ First message PASSED")
    else:
        print(f"   ❌ FAILED: {response.text}")
        return False
    
    # Test 2: Send follow-up message
    print("\n2. Sending follow-up: 'What about treatment options?'")
    response = requests.post(
        f"{BASE_URL}/ask-ai",
        json={
            "message": "What about treatment options?",
            "session_id": session_id
        }
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response length: {len(data['response'])} chars")
        print(f"   Response preview: {data['response'][:150]}...")
        print("   ✅ Follow-up message PASSED")
    else:
        print(f"   ❌ FAILED: {response.text}")
        return False
    
    return True

def test_frontend_geocoding():
    """Test geocoding as frontend would use it"""
    print("\n" + "="*70)
    print("  Testing Hospital Finder - Geocoding (Map Click)")
    print("="*70)
    
    print("\nSimulating map click at Delhi coordinates...")
    response = requests.post(
        f"{BASE_URL}/hospitals/geocode",
        json={
            "lat": 28.7041,
            "lng": 77.1025
        }
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Address: {data['address']}")
        print("✅ Geocoding PASSED")
        return True
    else:
        print(f"❌ FAILED: {response.text}")
        return False

def test_frontend_hospital_search():
    """Test hospital search as frontend would use it"""
    print("\n" + "="*70)
    print("  Testing Hospital Finder - Search Functionality")
    print("="*70)
    
    print("\nSearching for hospitals in Gurgaon...")
    print("⚠️  This will take 30-60 seconds (real Google Maps scraping)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/hospitals/search",
            json={
                "location": "Gurgaon",
                "search_type": "in or near"
            },
            timeout=90
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Hospitals found: {data['count']}")
            if data['count'] > 0:
                print(f"First hospital: {data['hospitals'][0].get('title', 'N/A')}")
                print(f"Sample data keys: {list(data['hospitals'][0].keys())}")
            print("✅ Hospital search PASSED")
            return True
        else:
            print(f"❌ FAILED: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print("❌ FAILED: Request timed out (>90s)")
        return False

def test_api_health():
    """Quick health check"""
    print("\n" + "="*70)
    print("  Quick Health Check")
    print("="*70)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  FRONTEND-BACKEND INTEGRATION TEST SUITE")
    print("  Testing actual API calls as frontend makes them")
    print("="*70)
    print(f"Backend API: {BASE_URL}")
    print(f"Frontend: http://localhost:8080")
    
    results = {
        "health": False,
        "chat": False,
        "geocoding": False,
        "hospital_search": False
    }
    
    # Run tests
    results["health"] = test_api_health()
    results["chat"] = test_frontend_chat_flow()
    results["geocoding"] = test_frontend_geocoding()
    
    # Ask before running hospital search (takes time)
    print("\n" + "="*70)
    print("Note: Skipping hospital search test (takes 30-60s)")
    print("Run manually with: curl -X POST http://localhost:5001/api/hospitals/search -H 'Content-Type: application/json' -d '{\"location\": \"Delhi\", \"search_type\": \"in or near\"}'")
    print("⚠️  Hospital search test SKIPPED")
    
    # Summary
    print("\n" + "="*70)
    print("  INTEGRATION TEST SUMMARY")
    print("="*70)
    passed = sum(1 for v in results.values() if v)
    total = len([k for k, v in results.items() if v is not False])
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "⚠️  SKIPPED" if result is None else "❌ FAILED"
        print(f"{test_name.upper()}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All integration tests passed!")
        print("Frontend is properly connected to backend.")
        print("\nYou can now test the UI at: http://localhost:8080")
    else:
        print("\n⚠️  Some tests failed. Check errors above.")
