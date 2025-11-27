"""
ML Service v2.0
Load trained model and make predictions with industry-grade scoring
"""

import os
import joblib
import pickle
import numpy as np
from typing import Dict, Optional
from pathlib import Path


class MLService:
    """ML model inference service v2.0"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_loaded = False
        self.model_version = None
        
    def load_model(self, model_path: str=None, scaler_path: str=None):
        """Load trained model and scaler (supports v1 and v2 formats)"""
        # Default paths - try v2 first, fall back to v1
        base_path = Path(__file__).parent.parent / "models"
        
        v2_model_path = base_path / "ats_model_v2.pkl"
        v1_model_path = base_path / "ats_model.pkl"
        
        # Always prefer v2 if it exists, unless explicit path is given that's not default
        if model_path and not model_path.endswith("ats_model.pkl"):
            # Custom path provided
            model_path = Path(model_path)
        elif v2_model_path.exists():
            # Prefer v2 model
            model_path = v2_model_path
        elif model_path:
            model_path = Path(model_path)
        else:
            model_path = v1_model_path
        
        try:
            if model_path.exists():
                # Try loading as v2 format (model package)
                with open(model_path, 'rb') as f:
                    data = pickle.load(f)
                
                if isinstance(data, dict) and 'model' in data:
                    # v2 format
                    self.model = data['model']
                    self.scaler = data.get('scaler')
                    self.feature_names = data.get('feature_columns', [])
                    self.model_version = data.get('version', '2.0')
                    print(f"✅ Model v{self.model_version} loaded from {model_path}")
                else:
                    # v1 format (model only)
                    self.model = data
                    self.model_version = '1.0'
                    print(f"✅ Model v{self.model_version} loaded from {model_path}")
                    
                    # Try to load separate scaler
                    if scaler_path:
                        scaler_file = Path(scaler_path)
                    else:
                        scaler_file = base_path / "scaler.pkl"
                    
                    if scaler_file.exists():
                        self.scaler = joblib.load(scaler_file)
                        print(f"✅ Scaler loaded from {scaler_file}")
            else:
                print(f"⚠️ Model not found at {model_path}, using fallback")
                return False
            
            self.model_loaded = True
            return True
            
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def predict_ats_score(self, features: Dict) -> Dict:
        """
        Predict ATS score from features
        
        Args:
            features: Dictionary of extracted features
            
        Returns:
            Dictionary with score and breakdown
        """
        if not self.model_loaded:
            return self._fallback_prediction(features)
        
        try:
            # Convert features to array in correct order
            feature_array = self._features_to_array(features)
            
            # Scale features if scaler is loaded
            if self.scaler:
                feature_array = self.scaler.transform([feature_array])
            else:
                feature_array = [feature_array]
            
            # Make prediction
            score = self.model.predict(feature_array)[0]
            score = max(0, min(100, float(score)))  # Clamp to 0-100
            
            # Get confidence if model supports it
            confidence = self._get_confidence(feature_array)
            
            # Generate breakdown
            breakdown = self._generate_breakdown(features, score)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(features, score)
            
            return {
                'overall_score': round(score, 1),
                'confidence': confidence,
                'breakdown': breakdown,
                'suggestions': suggestions,
                'model_version': self.model_version or '2.0.0'
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(features)
    
    def _features_to_array(self, features: Dict) -> list:
        """Convert feature dictionary to array"""
        # Define expected feature order (must match training)
        feature_order = [
            'total_words', 'total_sentences', 'total_characters',
            'avg_word_length', 'avg_sentence_length', 'total_sections',
            'has_summary', 'has_experience', 'has_education', 'has_skills',
            'has_projects', 'has_certifications', 'has_email', 'has_phone',
            'has_linkedin', 'has_github', 'action_verb_count',
            'quantifiable_metrics', 'bullet_point_count', 'technical_terms_count',
            'years_of_experience', 'number_of_jobs', 'has_job_titles',
            'degree_level', 'has_gpa', 'total_skills_mentioned',
            'programming_languages', 'readability_score', 'appropriate_length',
            'consistent_formatting', 'keyword_match_score'
        ]
        
        # Convert booleans to integers
        feature_array = []
        for feature_name in feature_order:
            value = features.get(feature_name, 0)
            if isinstance(value, bool):
                value = 1 if value else 0
            feature_array.append(float(value))
        
        return feature_array
    
    def _get_confidence(self, feature_array) -> float:
        """Get prediction confidence"""
        try:
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(feature_array)[0]
                return float(max(proba))
            return 0.85  # Default confidence
        except:
            return 0.85
    
    def _generate_breakdown(self, features: Dict, overall_score: float) -> Dict:
        """Generate score breakdown by category"""
        # Calculate sub-scores based on features
        keyword_score = min(100, features.get('keyword_match_score', 50) * 1.2)
        
        experience_score = min(100, (
            features.get('action_verb_count', 0) * 4 + 
            features.get('quantifiable_metrics', 0) * 5 + 
            min(features.get('years_of_experience', 0) * 10, 50)
        ))
        
        formatting_score = min(100, (
            (50 if features.get('appropriate_length', False) else 20) + 
            (30 if features.get('consistent_formatting', False) else 10) + 
            (20 if features.get('bullet_point_count', 0) > 5 else 10)
        ))
        
        skills_score = min(100, (
            features.get('total_skills_mentioned', 0) * 7 + 
            features.get('programming_languages', 0) * 10
        ))
        
        structure_score = min(100, (
            features.get('total_sections', 0) * 15 + 
            (10 if features.get('has_summary', False) else 0) + 
            (20 if features.get('has_experience', False) else 0) + 
            (15 if features.get('has_education', False) else 0) + 
            (15 if features.get('has_skills', False) else 0)
        ))
        
        return {
            'keywords': round(keyword_score, 1),
            'experience': round(experience_score, 1),
            'formatting': round(formatting_score, 1),
            'skills': round(skills_score, 1),
            'structure': round(structure_score, 1)
        }
    
    def _generate_suggestions(self, features: Dict, score: float) -> list:
        """Generate actionable improvement suggestions"""
        suggestions = []
        
        # Keywords
        if features.get('keyword_match_score', 50) < 60:
            suggestions.append({
                'category': 'keywords',
                'priority': 'high',
                'suggestion': 'Add more relevant keywords from the job description to your resume'
            })
        
        # Action verbs
        if features.get('action_verb_count', 0) < 10:
            suggestions.append({
                'category': 'experience',
                'priority': 'high',
                'suggestion': 'Use more action verbs (achieved, managed, led, developed, etc.) to describe your accomplishments'
            })
        
        # Quantifiable metrics
        if features.get('quantifiable_metrics', 0) < 5:
            suggestions.append({
                'category': 'experience',
                'priority': 'high',
                'suggestion': 'Add quantifiable achievements (increased by 30%, managed $2M budget, led team of 10, etc.)'
            })
        
        # Length
        if not features.get('appropriate_length', False):
            word_count = features.get('total_words', 0)
            if word_count < 300:
                suggestions.append({
                    'category': 'formatting',
                    'priority': 'medium',
                    'suggestion': 'Your resume is too brief. Add more details about your experience and achievements'
                })
            elif word_count > 1000:
                suggestions.append({
                    'category': 'formatting',
                    'priority': 'medium',
                    'suggestion': 'Your resume is too long. Focus on the most relevant and recent experience'
                })
        
        # Sections
        if features.get('total_sections', 0) < 4:
            missing = []
            if not features.get('has_summary', False):
                missing.append('professional summary')
            if not features.get('has_skills', False):
                missing.append('skills section')
            if missing:
                suggestions.append({
                    'category': 'structure',
                    'priority': 'medium',
                    'suggestion': f"Add missing sections: {', '.join(missing)}"
                })
        
        # Skills
        if features.get('total_skills_mentioned', 0) < 8:
            suggestions.append({
                'category': 'skills',
                'priority': 'medium',
                'suggestion': 'List more relevant technical and soft skills (aim for 10-15 skills)'
            })
        
        # Contact info
        if not features.get('has_email', False) or not features.get('has_phone', False):
            suggestions.append({
                'category': 'structure',
                'priority': 'high',
                'suggestion': 'Ensure your contact information (email and phone) is clearly visible'
            })
        
        # Bullet points
        if features.get('bullet_point_count', 0) < 5:
            suggestions.append({
                'category': 'formatting',
                'priority': 'low',
                'suggestion': 'Use bullet points to make your experience more readable'
            })
        
        # Sort by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: priority_order[x['priority']])
        
        return suggestions[:8]  # Return top 8 suggestions
    
    def _fallback_prediction(self, features: Dict) -> Dict:
        """Fallback prediction using rule-based scoring"""
        # Calculate score using weighted features
        score = 0
        
        # Keywords (30%)
        score += features.get('keyword_match_score', 50) * 0.3
        
        # Experience (25%)
        exp_score = min(100, (
            features.get('action_verb_count', 0) * 3 + 
            features.get('quantifiable_metrics', 0) * 4 + 
            min(features.get('years_of_experience', 0) * 8, 40)
        ))
        score += exp_score * 0.25
        
        # Structure (20%)
        struct_score = (
            features.get('total_sections', 0) * 12 + 
            (10 if features.get('has_summary', False) else 0) + 
            (20 if features.get('has_experience', False) else 0)
        )
        score += min(100, struct_score) * 0.2
        
        # Skills (15%)
        skills_score = min(100, features.get('total_skills_mentioned', 0) * 8)
        score += skills_score * 0.15
        
        # Formatting (10%)
        format_score = (
            (50 if features.get('appropriate_length', False) else 20) + 
            (30 if features.get('consistent_formatting', False) else 10) + 
            (20 if features.get('bullet_point_count', 0) > 5 else 10)
        )
        score += min(100, format_score) * 0.1
        
        score = max(0, min(100, score))
        
        return {
            'overall_score': round(score, 1),
            'confidence': 0.7,  # Lower confidence for fallback
            'breakdown': self._generate_breakdown(features, score),
            'suggestions': self._generate_suggestions(features, score),
            'model_version': 'fallback-1.0.0'
        }


# Singleton instance
ml_service = MLService()
