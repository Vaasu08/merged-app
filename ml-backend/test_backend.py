"""
Test ML Backend
Quick test script to verify installation
"""

import sys
import os


def test_imports():
    """Test if all required packages are installed"""
    print("Testing imports...")
    
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('pydantic', 'Pydantic'),
        ('sklearn', 'scikit-learn'),
        ('xgboost', 'XGBoost'),
        ('pandas', 'Pandas'),
        ('numpy', 'NumPy'),
        ('nltk', 'NLTK'),
        ('PyPDF2', 'PyPDF2'),
        ('pdfplumber', 'pdfplumber'),
        ('docx', 'python-docx'),
    ]
    
    failed = []
    for package, name in required_packages:
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - NOT INSTALLED")
            failed.append(name)
    
    return len(failed) == 0, failed


def test_services():
    """Test if services can be imported"""
    print("\nTesting services...")
    
    try:
        from services.pdf_parser import PDFParser
        print("  ✅ PDFParser")
    except Exception as e:
        print(f"  ❌ PDFParser - {e}")
        return False
    
    try:
        from services.feature_extraction import FeatureExtractor
        print("  ✅ FeatureExtractor")
    except Exception as e:
        print(f"  ❌ FeatureExtractor - {e}")
        return False
    
    try:
        from services.ml_service import MLService
        print("  ✅ MLService")
    except Exception as e:
        print(f"  ❌ MLService - {e}")
        return False
    
    return True


def test_feature_extraction():
    """Test feature extraction"""
    print("\nTesting feature extraction...")
    
    try:
        from services.feature_extraction import FeatureExtractor
        
        extractor = FeatureExtractor()
        
        # Test with sample text
        sample_text = """
        John Doe
        Software Engineer
        john@example.com | (555) 123-4567
        
        SUMMARY
        Experienced software engineer with 5 years of experience in Python and React.
        
        EXPERIENCE
        Senior Developer - Tech Corp (2020-2024)
        - Developed and maintained 10+ web applications
        - Increased performance by 50%
        - Led team of 5 developers
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology, 2019
        GPA: 3.8
        
        SKILLS
        Python, JavaScript, React, Node.js, SQL, AWS, Docker
        """
        
        features = extractor.extract_features(sample_text)
        
        print(f"  ✅ Extracted {len(features)} features")
        print(f"     Sample features:")
        print(f"       - Total words: {features.get('total_words', 0)}")
        print(f"       - Action verbs: {features.get('action_verb_count', 0)}")
        print(f"       - Skills: {features.get('total_skills_mentioned', 0)}")
        print(f"       - Has email: {features.get('has_email', False)}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Feature extraction failed: {e}")
        return False


def test_ml_service():
    """Test ML service"""
    print("\nTesting ML service...")
    
    try:
        from services.ml_service import ml_service
        
        # Test fallback prediction (model not loaded)
        features = {
            'total_words': 500,
            'total_sentences': 30,
            'action_verb_count': 12,
            'quantifiable_metrics': 5,
            'has_summary': True,
            'has_experience': True,
            'has_education': True,
            'has_skills': True,
            'keyword_match_score': 70,
            'total_skills_mentioned': 10,
            'years_of_experience': 5,
            'appropriate_length': True,
            'consistent_formatting': True,
        }
        
        result = ml_service.predict_ats_score(features)
        
        print(f"  ✅ ML service working")
        print(f"     Fallback score: {result['overall_score']:.1f}/100")
        print(f"     Confidence: {result['confidence']:.2f}")
        print(f"     Suggestions: {len(result['suggestions'])}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ ML service failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_model_exists():
    """Check if trained model exists"""
    print("\nChecking for trained model...")
    
    model_path = "./models/ats_model.pkl"
    scaler_path = "./models/scaler.pkl"
    
    if os.path.exists(model_path):
        print(f"  ✅ Model found at {model_path}")
        model_exists = True
    else:
        print(f"  ⚠️  Model not found at {model_path}")
        print(f"     Run training script to create model:")
        print(f"       cd training && python generate_synthetic_data.py && python train_model.py")
        model_exists = False
    
    if os.path.exists(scaler_path):
        print(f"  ✅ Scaler found at {scaler_path}")
    else:
        print(f"  ⚠️  Scaler not found at {scaler_path}")
    
    return model_exists


def main():
    print("=" * 60)
    print("ML Backend Test Suite")
    print("=" * 60)
    print()
    
    # Test imports
    imports_ok, failed_packages = test_imports()
    
    if not imports_ok:
        print("\n❌ Some packages are missing:")
        for pkg in failed_packages:
            print(f"   - {pkg}")
        print("\nRun: pip install -r requirements.txt")
        sys.exit(1)
    
    # Test services
    services_ok = test_services()
    
    if not services_ok:
        print("\n❌ Service imports failed")
        sys.exit(1)
    
    # Test feature extraction
    features_ok = test_feature_extraction()
    
    if not features_ok:
        print("\n❌ Feature extraction failed")
        sys.exit(1)
    
    # Test ML service
    ml_ok = test_ml_service()
    
    if not ml_ok:
        print("\n❌ ML service failed")
        sys.exit(1)
    
    # Check model
    model_exists = test_model_exists()
    
    print("\n" + "=" * 60)
    if imports_ok and services_ok and features_ok and ml_ok:
        print("✅ All tests passed!")
        if model_exists:
            print("\nBackend is ready to run:")
            print("  python app.py")
        else:
            print("\nBackend can run in fallback mode:")
            print("  python app.py")
            print("\nTo use ML model, train it first:")
            print("  cd training")
            print("  python generate_synthetic_data.py")
            print("  python train_model.py")
    else:
        print("❌ Some tests failed")
        sys.exit(1)
    print("=" * 60)


if __name__ == "__main__":
    main()
