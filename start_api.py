#!/usr/bin/env python3
"""
Simple script to start the API server
"""
import subprocess
import sys
import os

# Get the project directory (script's parent directory)
project_dir = os.path.dirname(os.path.abspath(__file__))

print("Starting HealthSphere AI API Server...")
print(f"Project Directory: {project_dir}")
print(f"Backend URL: http://localhost:5001")

# Change to project directory
os.chdir(project_dir)

# Run the API using the current Python interpreter via uvicorn
subprocess.run([sys.executable, "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "5001", "--reload"])
