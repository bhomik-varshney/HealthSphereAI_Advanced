#!/usr/bin/env python3
"""Test report analysis functionality"""
import requests
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Create a sample medical report PDF
def create_sample_report():
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add medical report content
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "MEDICAL LABORATORY REPORT")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, 720, "Patient: John Doe")
    c.drawString(100, 700, "Date: January 31, 2026")
    c.drawString(100, 680, "Test: Complete Blood Count (CBC)")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, 650, "Test Results:")
    
    c.setFont("Helvetica", 11)
    y = 630
    results = [
        "Hemoglobin: 13.5 g/dL (Normal: 13.5-17.5)",
        "White Blood Cells: 8500/µL (Normal: 4000-11000)",
        "Red Blood Cells: 4.8 million/µL (Normal: 4.5-5.5)",
        "Platelets: 250,000/µL (Normal: 150,000-400,000)",
        "Glucose (Fasting): 126 mg/dL (Normal: 70-100) - ELEVATED",
        "HbA1c: 7.2% (Normal: <5.7%) - ELEVATED",
        "Cholesterol: 220 mg/dL (Normal: <200) - ELEVATED",
    ]
    
    for result in results:
        c.drawString(120, y, result)
        y -= 20
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(100, y - 20, "Clinical Interpretation:")
    c.setFont("Helvetica", 10)
    c.drawString(120, y - 40, "Elevated glucose and HbA1c levels suggest diabetes.")
    c.drawString(120, y - 55, "Cholesterol levels are above normal range.")
    c.drawString(120, y - 70, "Recommend consultation with physician.")
    
    c.save()
    buffer.seek(0)
    return buffer

print("\n" + "="*70)
print("  TESTING REPORT ANALYSIS FEATURE")
print("="*70)

# Test 1: Create and test with PDF
print("\n1. Creating sample medical report PDF...")
pdf_buffer = create_sample_report()
print("   ✓ Sample PDF created with diabetes indicators")

print("\n2. Uploading PDF to /api/analyze-report...")
try:
    files = {'file': ('medical_report.pdf', pdf_buffer, 'application/pdf')}
    response = requests.post(
        'http://localhost:5001/api/analyze-report',
        files=files,
        timeout=30
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n   ✅ Report analysis SUCCESS!")
        print(f"\n   📄 Extracted Text: {data['extracted_text'][:150]}...")
        print(f"\n   🔍 Entities Found: {len(data['entities'])} entities")
        if data['entities']:
            print(f"      First few: {data['entities'][:3]}")
        print(f"\n   📊 Analysis Length: {len(data['analysis'])} chars")
        print(f"   Analysis Preview:\n      {data['analysis'][:200]}...")
        print(f"\n   📝 Summary: {data['summary']}")
    else:
        print(f"   ❌ FAILED: {response.text}")
        
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n" + "="*70)
print("  REPORT ANALYSIS TEST COMPLETE")
print("="*70)
print("\n💡 To test in frontend:")
print("   1. Go to http://localhost:8080/ask-ai")
print("   2. Click the file icon on the right sidebar")
print("   3. Upload any PDF or image with medical text")
print("   4. View the AI analysis results")
