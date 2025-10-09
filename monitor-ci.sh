#!/bin/bash

echo "Monitoring CI Run 18382904309..."
echo "Started at: $(date)"
echo "---"

for i in {1..10}; do
  sleep 60

  STATUS=$(gh run view 18382904309 --json jobs 2>/dev/null | jq -r '.jobs[0] | "\(.status)"' 2>/dev/null)
  CURRENT_STEP=$(gh run view 18382904309 --json jobs 2>/dev/null | jq -r '.jobs[0].steps[] | select(.status == "in_progress") | .name' 2>/dev/null || echo "none")
  JOB_COUNT=$(gh run view 18382904309 --json jobs 2>/dev/null | jq '.jobs | length' 2>/dev/null || echo "0")
  TIME=$(date +"%H:%M:%S")

  echo "[$TIME] Setup: $STATUS | Current step: $CURRENT_STEP | Total jobs: $JOB_COUNT"

  # If setup completed or more jobs appeared, show all jobs
  if [[ "$STATUS" == "completed" ]] || [[ "$JOB_COUNT" -gt 1 ]]; then
    echo "---"
    echo "Setup completed or other jobs started! Full status:"
    gh run view 18382904309 --json jobs | jq -r '.jobs[] | "\(.name): \(.status) (\(.conclusion // "running"))"'
    break
  fi
done

echo "---"
echo "Monitoring complete at: $(date)"
