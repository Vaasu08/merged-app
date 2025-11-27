#!/bin/bash

echo "Testing Industry-Grade ATS Model with Real Resumes"
echo "=================================================="
echo ""

RESUMES_DIR="/home/mitul/merged-app/test_resumes"
API_URL="http://localhost:8000/api/ats-score"

for resume in "$RESUMES_DIR"/*.pdf; do
    if [ -f "$resume" ]; then
        filename=$(basename "$resume")
        echo "📄 Testing: $filename"
        
        response=$(curl -s -X POST "$API_URL" -F "file=@$resume")
        
        score=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'{data[\"overall_score\"]:.1f}')" 2>/dev/null)
        confidence=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'{data[\"confidence\"]:.0%}')" 2>/dev/null)
        
        if [ -n "$score" ]; then
            echo "   Score: $score/100 (Confidence: $confidence)"
        else
            echo "   Error: Could not parse response"
        fi
        echo ""
    fi
done

echo "=================================================="
echo "✅ Testing complete!"
