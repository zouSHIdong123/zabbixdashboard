#!/bin/bash

echo "Starting Zabbix Dashboard..."
echo "Open your browser and go to: http://localhost:8000"

# Start a simple HTTP server
cd /workspace/zabbix-dashboard
python3 -m http.server 8000