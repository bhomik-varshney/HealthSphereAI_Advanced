#!/usr/bin/env python3
"""
Simple script to start the API server in the background
"""
import subprocess
import sys
import os

# Get the project directory
project_dir = "/Users/bhomikvarshney/PycharmProjects/pythonProject(google maps scraper)"
python_path = f"{project_dir}/.venv/bin/python"
api_path = f"{project_dir}/api.py"

print("Starting HealthSphere AI API Server...")
print(f"Backend URL: http://localhost:5001")

# Start the server
os.chdir(project_dir)
subprocess.run([python_path, api_path])
