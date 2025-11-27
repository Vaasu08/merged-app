"""
FastAPI Application
ATS Score Prediction API
"""

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from services.pdf_parser import PDFParser
from services.feature_extraction import FeatureExtractor
from services.ml_service import ml_service

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="ATS Score Prediction API",
    description="ML-powered ATS resume scoring",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pdf_parser = PDFParser()
feature_extractor = FeatureExtractor()


# Load ML model on startup
@app.on_event("startup")
async def startup_event():
    """Load ML model when server starts"""
    model_path = os.getenv("MODEL_PATH", "./models/ats_model.pkl")
    scaler_path = os.getenv("SCALER_PATH", "./models/scaler.pkl")
    
    success = ml_service.load_model(model_path, scaler_path)
    if success:
        print("✅ ML model loaded successfully")
    else:
        print("⚠️ Running in fallback mode (model not found)")


# Request/Response models
class ATSScoreResponse(BaseModel):
    overall_score: float
    confidence: float
    breakdown: dict
    suggestions: list
    model_version: str
    

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    model_version: Optional[str] = None


# Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": ml_service.model_loaded,
        "version": "2.0.0",
        "model_version": getattr(ml_service, 'model_version', None)
    }


@app.post("/api/ats-score", response_model=ATSScoreResponse)
async def predict_ats_score(
    file: UploadFile=File(...),
    job_description: Optional[str]=None
):
    """
    Predict ATS score for uploaded resume
    
    Args:
        file: Resume file (PDF, DOCX, or TXT)
        job_description: Optional job description for keyword matching
    
    Returns:
        ATS score with breakdown and suggestions
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Parse resume text
        resume_text = pdf_parser.parse_file(content, file.filename)
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from resume or content too short"
            )
        
        # Extract features
        features = feature_extractor.extract_features(
            resume_text,
            job_description=job_description
        )
        
        # Predict ATS score
        result = ml_service.predict_ats_score(features)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process resume: {str(e)}"
        )


class ATSScoreTextRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None


@app.post("/api/ats-score-text")
async def predict_ats_score_from_text(request: ATSScoreTextRequest):
    """
    Predict ATS score from resume text
    
    Args:
        request: Request body with resume_text and optional job_description
    
    Returns:
        ATS score with breakdown and suggestions
    """
    try:
        if not request.resume_text or len(request.resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Resume text is too short"
            )
        
        # Extract features
        features = feature_extractor.extract_features(
            request.resume_text,
            job_description=request.job_description
        )
        
        # Predict ATS score
        result = ml_service.predict_ats_score(features)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing resume text: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process resume: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting ATS Score API on {host}:{port}")
    print(f"📚 API docs: http://{host if host != '0.0.0.0' else 'localhost'}:{port}/docs")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True
    )
