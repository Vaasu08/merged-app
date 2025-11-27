#!/bin/bash
# Test ML Backend with Real Resumes
# Scores all resumes in test_resumes directory and generates report

RESUME_DIR="/home/mitul/merged-app/test_resumes"
API_URL="http://localhost:8000/api/ats-score"
OUTPUT_FILE="/tmp/resume_test_results.txt"

echo "=================================================="
echo "ML Backend Resume Testing"
echo "=================================================="
echo ""

# Check if server is running
echo "Checking server status..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it first:"
    echo "   cd /home/mitul/merged-app/ml-backend"
    echo "   nohup /home/mitul/merged-app/ml-backend/venv/bin/python app.py > /tmp/ml-backend.log 2>&1 &"
    exit 1
fi

echo ""
echo "Testing resumes from: $RESUME_DIR"
echo ""

# Clear output file
> "$OUTPUT_FILE"

# Counter
count=0
total_score=0

# Process each resume file
for file in "$RESUME_DIR"/*.{pdf,docx,txt,PDF,DOCX,TXT}; do
    # Skip if no files found
    [ -f "$file" ] || continue
    
    count=$((count + 1))
    filename=$(basename "$file")
    
    echo "[$count] Testing: $filename"
    echo "----------------------------------------"
    
    # Call API
    response=$(curl -s -X POST "$API_URL" -F "file=@$file" 2>&1)
    
    # Check if response is valid JSON
    if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
        # Parse response
        overall_score=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['overall_score'])" 2>/dev/null)
        confidence=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['confidence'])" 2>/dev/null)
        
        # Breakdown scores
        keywords=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['breakdown']['keywords'])" 2>/dev/null)
        experience=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['breakdown']['experience'])" 2>/dev/null)
        formatting=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['breakdown']['formatting'])" 2>/dev/null)
        skills=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['breakdown']['skills'])" 2>/dev/null)
        structure=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['breakdown']['structure'])" 2>/dev/null)
        
        # Suggestions
        suggestions=$(echo "$response" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['suggestions']))" 2>/dev/null)
        
        # Display results
        echo "  Overall Score: $overall_score/100"
        echo "  Confidence: $(python3 -c "print(f'{$confidence * 100:.0f}%')" 2>/dev/null || echo "${confidence}")"
        echo "  Breakdown:"
        echo "    - Keywords: $keywords"
        echo "    - Experience: $experience"
        echo "    - Formatting: $formatting"
        echo "    - Skills: $skills"
        echo "    - Structure: $structure"
        echo "  Suggestions: $suggestions items"
        echo ""
        
        # Add to total
        total_score=$(python3 -c "print($total_score + $overall_score)")
        
        # Save to file
        echo "=== $filename ===" >> "$OUTPUT_FILE"
        echo "$response" | python3 -m json.tool >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
    else
        echo "  ❌ Error processing resume"
        echo "  Response: $response"
        echo ""
    fi
done

echo "=================================================="
echo "Summary"
echo "=================================================="
echo "Total Resumes Tested: $count"

if [ $count -gt 0 ]; then
    avg_score=$(python3 -c "print(round($total_score / $count, 1))")
    echo "Average Score: $avg_score/100"
    echo ""
    echo "Detailed results saved to: $OUTPUT_FILE"
    echo ""
    echo "View full results:"
    echo "  cat $OUTPUT_FILE"
else
    echo "No resume files found in $RESUME_DIR"
    echo ""
    echo "Supported formats: PDF, DOCX, TXT"
fi

echo "=================================================="
