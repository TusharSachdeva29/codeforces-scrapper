#!/bin/bash

# Change to project directory
cd "$(dirname "$0")/.."

# Log file setup
LOG_FILE="logs/potd_population.log"
mkdir -p logs

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Make API call to populate problems
log "Starting POTD population"

# Run the Node.js script to fetch and update POTD
node scripts/populateProblems.js >> "$LOG_FILE" 2>&1

# Make API call to cron endpoint
curl -X GET \
  "http://localhost:3000/api/cron/daily-problems" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    log "POTD population completed successfully"
else
    log "Error: POTD population failed with exit code $EXIT_CODE"
fi
