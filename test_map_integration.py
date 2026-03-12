#!/usr/bin/env python3
"""
Test Map Integration - Hospital Finder
Tests the map-based hospital search functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def test_geocoding():
    """Test reverse geocoding (coordinates to address)"""
    print("=" * 70)
    print("TEST 1: Reverse Geocoding (Map Click Simulation)")
    print("=" * 70)
    
    # Simulate clicking on Delhi on the map
    test_coords = {
        "lat": 28.6139,
        "lng": 77.2090
    }
    
    print(f"\n📍 Testing coordinates: {test_coords['lat']}, {test_coords['lng']}")
    print("   (Simulating map click in New Delhi area)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/hospitals/geocode",
            json=test_coords,
            timeout=10
        )
        
        if response.status_code == 200:
            address = response.json().get("address")
            print(f"\n✅ Geocoding successful!")
            print(f"   Address: {address}")
            return address
        else:
            print(f"\n❌ Geocoding failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None

def test_map_hospital_search():
    """Test hospital search from map location"""
    print("\n" + "=" * 70)
    print("TEST 2: Map-Based Hospital Search")
    print("=" * 70)
    
    # First, get address from coordinates
    address = test_geocoding()
    
    if not address:
        print("\n⚠️  Skipping hospital search due to geocoding failure")
        return
    
    print(f"\n🔍 Searching for hospitals near: {address}")
    print("   This may take 30-60 seconds...")
    
    search_data = {
        "location": address,
        "search_type": "hospitals in or near"
    }
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/hospitals/search",
            json=search_data,
            timeout=120  # 2 minutes timeout for scraping
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Search completed in {elapsed_time:.1f} seconds")
            print(f"\n📊 Results:")
            print(f"   • Found: {result.get('count', 0)} hospitals")
            print(f"   • Location: {result.get('location', 'N/A')}")
            
            # Display first 3 hospitals
            hospitals = result.get("hospitals", [])
            if hospitals:
                print(f"\n🏥 Sample Results (showing first 3):")
                for i, hospital in enumerate(hospitals[:3], 1):
                    print(f"\n   {i}. {hospital.get('name', 'Unknown')}")
                    if hospital.get('address'):
                        print(f"      📍 {hospital['address']}")
                    if hospital.get('phone'):
                        print(f"      📞 {hospital['phone']}")
                    if hospital.get('website'):
                        print(f"      🌐 {hospital['website']}")
            
            return result
        else:
            print(f"\n❌ Search failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except requests.Timeout:
        print(f"\n⚠️  Request timed out after 120 seconds")
        print("   Google Maps scraping can take time, this might still be working...")
        return None
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None

def test_health_check():
    """Test if backend is running"""
    print("=" * 70)
    print("PRELIMINARY: Backend Health Check")
    print("=" * 70)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not reachable: {str(e)}")
        return False

def main():
    print("\n" + "🗺️  " * 15)
    print("     MAP INTEGRATION TEST SUITE - HOSPITAL FINDER")
    print("🗺️  " * 15 + "\n")
    
    # Check if backend is running
    if not test_health_check():
        print("\n⚠️  Please start the backend server first:")
        print("   cd /path/to/project && .venv/bin/python -m uvicorn api:app --port 5001")
        return
    
    print("\n" + "-" * 70 + "\n")
    
    # Test geocoding
    test_geocoding()
    
    print("\n" + "-" * 70 + "\n")
    
    # Test hospital search (includes geocoding)
    test_map_hospital_search()
    
    print("\n" + "=" * 70)
    print("TEST SUITE COMPLETE")
    print("=" * 70)
    print("\n📋 Summary:")
    print("   ✓ Geocoding: Converts map clicks to addresses")
    print("   ✓ Hospital Search: Finds nearby healthcare facilities")
    print("\n🎯 Frontend Usage:")
    print("   1. Open http://localhost:8080/hospital-finder")
    print("   2. Click 'Use Map' tab")
    print("   3. Click anywhere on the map")
    print("   4. Click 'Search Hospitals Near This Location'")
    print("   5. Wait 30-60 seconds for results")
    print("\n")

if __name__ == "__main__":
    main()
