#!/bin/bash
# Quick Setup Script for ML Backend

set -e

echo "=================================="
echo "ML-Powered ATS Backend Setup"
echo "=================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python $python_version"

# Check if in virtual environment
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo ""
    echo "⚠️  Not in virtual environment!"
    echo "Recommended: Create and activate venv first"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo ""
    read -p "Continue without venv? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Download NLTK data
echo ""
echo "Downloading NLTK data..."
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Check if model exists
echo ""
if [ -f "./models/ats_model.pkl" ]; then
    echo "✅ Model found at ./models/ats_model.pkl"
else
    echo "⚠️  Model not found. Training new model..."
    echo ""
    
    # Generate synthetic data
    echo "Generating synthetic training data..."
    cd training
    python3 generate_synthetic_data.py
    
    # Train model
    echo ""
    echo "Training model (this may take 1-2 minutes)..."
    python3 train_model.py
    
    cd ..
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "To start the API server:"
echo "  python3 app.py"
echo ""
echo "Server will run on: http://localhost:8000"
echo ""
