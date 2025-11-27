"""
Generate Synthetic Training Data - Industry Grade v2.0
Improved version with:
- Non-linear scoring (real ATS thresholds)
- Independent feature generation (realistic inconsistencies)
- Penalty factors (career gaps, job hopping, missing info)
- Job-specific context
- Better noise modeling
"""

import random
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')


class IndustryGradeATSGenerator:
    """
    Generate realistic resume features that model actual ATS behavior
    
    Key Improvements over v1:
    1. Non-linear scoring with thresholds (like real ATS)
    2. Independent feature noise (realistic inconsistencies)
    3. Penalty factors for red flags
    4. Job role context
    5. Better score distribution
    """
    
    # Job roles with different keyword expectations
    JOB_ROLES = {
        'software_engineer': {
            'required_keywords': ['python', 'java', 'javascript', 'sql', 'git', 'agile'],
            'bonus_keywords': ['aws', 'docker', 'kubernetes', 'react', 'node'],
            'min_skills': 8,
            'preferred_degree': 2,  # Bachelor's
        },
        'data_scientist': {
            'required_keywords': ['python', 'sql', 'machine learning', 'statistics', 'pandas'],
            'bonus_keywords': ['tensorflow', 'pytorch', 'spark', 'tableau', 'r'],
            'min_skills': 10,
            'preferred_degree': 3,  # Master's
        },
        'product_manager': {
            'required_keywords': ['product', 'roadmap', 'stakeholder', 'agile', 'metrics'],
            'bonus_keywords': ['jira', 'analytics', 'strategy', 'user research', 'a/b testing'],
            'min_skills': 6,
            'preferred_degree': 2,
        },
        'marketing': {
            'required_keywords': ['marketing', 'campaigns', 'analytics', 'social media', 'content'],
            'bonus_keywords': ['seo', 'ppc', 'hubspot', 'google analytics', 'email marketing'],
            'min_skills': 5,
            'preferred_degree': 2,
        },
        'general': {
            'required_keywords': ['communication', 'teamwork', 'problem solving', 'leadership'],
            'bonus_keywords': ['project management', 'excel', 'presentation', 'analysis'],
            'min_skills': 5,
            'preferred_degree': 2,
        }
    }
    
    # Degree levels
    DEGREE_LEVELS = {
        0: 'No Degree',
        1: 'High School',
        2: 'Associate',
        3: "Bachelor's",
        4: "Master's",
        5: 'PhD'
    }
    
    def __init__(self, seed: int=None):
        """Initialize generator with optional seed for reproducibility"""
        if seed:
            random.seed(seed)
            np.random.seed(seed)
    
    def _nonlinear_keyword_score(self, match_pct: float) -> float:
        """
        Non-linear keyword scoring like real ATS systems
        
        Real ATS behavior:
        - Below 40%: Heavy penalty (likely auto-reject)
        - 40-60%: Partial match (weak candidate)
        - 60-80%: Good match (qualified)
        - 80%+: Strong match (top candidate)
        """
        if match_pct < 30:
            # Severe penalty - likely auto-rejected
            return match_pct * 0.15  # Max 4.5 points
        elif match_pct < 50:
            # Weak match
            return 4.5 + (match_pct - 30) * 0.25  # 4.5 to 9.5 points
        elif match_pct < 70:
            # Decent match
            return 9.5 + (match_pct - 50) * 0.4  # 9.5 to 17.5 points
        elif match_pct < 85:
            # Good match
            return 17.5 + (match_pct - 70) * 0.5  # 17.5 to 25 points
        else:
            # Excellent match - bonus territory
            return 25 + (match_pct - 85) * 0.67  # 25 to 35 points
    
    def _nonlinear_experience_score(self, years: float, num_jobs: int,
                                     metrics: int, job_hopping: bool) -> float:
        """
        Non-linear experience scoring with penalties
        
        Factors:
        - Years of experience (diminishing returns after 10 years)
        - Number of positions (career progression)
        - Quantifiable achievements
        - Job hopping penalty (< 1.5 years average tenure)
        """
        # Base experience score (diminishing returns)
        if years < 1:
            exp_base = years * 3  # Entry level penalty
        elif years < 3:
            exp_base = 3 + (years - 1) * 3  # Junior
        elif years < 7:
            exp_base = 9 + (years - 3) * 2  # Mid-level
        elif years < 12:
            exp_base = 17 + (years - 7) * 1  # Senior
        else:
            exp_base = 22 + min(3, (years - 12) * 0.3)  # Executive (diminishing)
        
        # Job progression bonus
        if num_jobs >= 2 and num_jobs <= 5:
            exp_base += min(3, num_jobs * 0.8)
        elif num_jobs > 5:
            exp_base += 3  # Cap the bonus
        
        # Quantifiable achievements bonus
        exp_base += min(4, metrics * 0.4)
        
        # Job hopping penalty
        if job_hopping:
            exp_base *= 0.75  # 25% penalty
        
        return min(25, exp_base)
    
    def _calculate_penalties(self, features: Dict) -> float:
        """
        Calculate penalty factors for red flags
        
        Penalties:
        - Missing contact info: -5 to -15 points
        - Missing required sections: -10 to -20 points
        - Career gap indicators: -5 points
        - Poor formatting: -3 points
        - Too short/long resume: -5 points
        """
        penalty = 0
        
        # Missing contact info (critical for ATS)
        if not features['has_email']:
            penalty += 10  # Email is essential
        if not features['has_phone']:
            penalty += 5
        
        # Missing required sections (ATS may fail to parse)
        if not features['has_experience']:
            penalty += 15  # Experience is critical
        if not features['has_education']:
            penalty += 8
        if not features['has_skills']:
            penalty += 10  # Skills section very important for keyword matching
        
        # Career gap indicator (approximated by jobs/years ratio)
        avg_tenure = features['years_of_experience'] / max(1, features['number_of_jobs'])
        if features['years_of_experience'] > 5 and avg_tenure > 4:
            # Possible career gaps
            penalty += 3
        
        # Poor formatting
        if not features['consistent_formatting']:
            penalty += 3
        
        # Resume length issues
        if features['total_words'] < 250:
            penalty += 5  # Too short
        elif features['total_words'] > 1000:
            penalty += 3  # Too long
        
        # No job titles mentioned
        if not features['has_job_titles']:
            penalty += 5
        
        return penalty
    
    def _add_independent_noise(self, features: Dict, tier: str) -> Dict:
        """
        Add realistic independent noise to features
        
        Real resumes have inconsistencies:
        - Good candidates may have poor formatting
        - Entry level may have excellent keywords
        - Senior people may lack modern skills
        """
        noise_features = features.copy()
        
        # Random chance to flip certain features regardless of tier
        noise_chance = 0.15  # 15% chance of inconsistency
        
        # Formatting can be bad even for good candidates
        if random.random() < noise_chance:
            noise_features['consistent_formatting'] = not noise_features['consistent_formatting']
        
        # LinkedIn/GitHub presence is independent
        if random.random() < 0.2:
            noise_features['has_linkedin'] = random.random() < 0.5
        if random.random() < 0.2:
            noise_features['has_github'] = random.random() < 0.3
        
        # Action verb count can vary
        noise_features['action_verb_count'] = max(0,
            noise_features['action_verb_count'] + int(random.gauss(0, 3)))
        
        # Bullet points can vary
        noise_features['bullet_point_count'] = max(0,
            noise_features['bullet_point_count'] + int(random.gauss(0, 4)))
        
        # Add some randomness to word count
        noise_features['total_words'] = max(150, min(1200,
            noise_features['total_words'] + int(random.gauss(0, 50))))
        
        # Recalculate derived features
        noise_features['total_characters'] = int(noise_features['total_words'] * random.gauss(5.5, 0.3))
        noise_features['total_sentences'] = max(8, int(noise_features['total_words'] / random.gauss(15, 2)))
        noise_features['avg_word_length'] = noise_features['total_characters'] / max(1, noise_features['total_words'])
        noise_features['avg_sentence_length'] = noise_features['total_words'] / max(1, noise_features['total_sentences'])
        
        return noise_features
    
    def _calculate_ats_score(self, features: Dict) -> float:
        """
        Calculate ATS score using non-linear, realistic scoring
        
        Components:
        1. Keyword match (35%) - Non-linear with thresholds
        2. Experience (25%) - Non-linear with penalties
        3. Skills (18%) - With minimum requirements
        4. Education (12%) - Role-dependent
        5. Format (10%) - Parsability factors
        6. Penalties - Red flags subtract from score
        """
        
        # 1. Keyword Score (35 points max) - NON-LINEAR
        keyword_score = self._nonlinear_keyword_score(features['keyword_match_score'])
        
        # 2. Experience Score (25 points max) - NON-LINEAR with penalties
        job_hopping = (features['years_of_experience'] > 3 and 
                      features['number_of_jobs'] > features['years_of_experience'] / 1.5)
        
        exp_score = self._nonlinear_experience_score(
            features['years_of_experience'],
            features['number_of_jobs'],
            features['quantifiable_metrics'],
            job_hopping
        )
        
        # 3. Skills Score (18 points max)
        skills_base = min(10, features['total_skills_mentioned'] * 0.5)
        skills_base += min(5, features['programming_languages'] * 1.2)
        skills_base += min(3, features['action_verb_count'] * 0.2)
        skills_score = min(18, skills_base)
        
        # 4. Education Score (12 points max)
        degree_scores = {0: 0, 1: 2, 2: 5, 3: 9, 4: 11, 5: 12}
        edu_score = degree_scores.get(features['degree_level'], 0)
        if features['has_gpa'] and features['degree_level'] >= 3:
            edu_score = min(12, edu_score + 1)
        
        # 5. Format Score (10 points max)
        format_score = 0
        format_score += 2.5 if features['has_experience'] else 0
        format_score += 2 if features['has_education'] else 0
        format_score += 2.5 if features['has_skills'] else 0
        format_score += 1 if features['has_email'] else 0
        format_score += 1 if features['has_phone'] else 0
        format_score += 1 if features['consistent_formatting'] else 0
        format_score = min(10, format_score)
        
        # Calculate raw score
        raw_score = keyword_score + exp_score + skills_score + edu_score + format_score
        
        # 6. Apply Penalties
        penalty = self._calculate_penalties(features)
        
        # Final score with noise
        noise = random.gauss(0, 2.5)  # More realistic variance
        final_score = raw_score - penalty + noise
        
        # Ensure score is in valid range
        return max(0, min(100, final_score))
    
    def generate_resume_features(self, target_tier: str='average',
                                  job_role: str='general') -> Dict:
        """
        Generate features for a resume with improved realism
        
        Args:
            target_tier: Quality tier (poor, below_average, average, good, excellent, outstanding)
            job_role: Job role context for keyword expectations
        
        Returns:
            Dictionary of features with calculated ATS score
        """
        
        # Tier parameters with more variation
        tier_params = {
            'poor': {
                'keyword_match': (5, 35),
                'years_exp': (0, 2),
                'skills': (0, 6),
                'degree_weights': [0.3, 0.3, 0.2, 0.15, 0.05, 0],
                'section_prob': 0.4,
                'format_prob': 0.3,
            },
            'below_average': {
                'keyword_match': (25, 55),
                'years_exp': (0, 4),
                'skills': (3, 10),
                'degree_weights': [0.1, 0.2, 0.25, 0.35, 0.1, 0],
                'section_prob': 0.65,
                'format_prob': 0.5,
            },
            'average': {
                'keyword_match': (45, 72),
                'years_exp': (2, 8),
                'skills': (6, 15),
                'degree_weights': [0.05, 0.1, 0.15, 0.5, 0.18, 0.02],
                'section_prob': 0.85,
                'format_prob': 0.7,
            },
            'good': {
                'keyword_match': (65, 85),
                'years_exp': (3, 12),
                'skills': (10, 20),
                'degree_weights': [0.02, 0.05, 0.1, 0.45, 0.33, 0.05],
                'section_prob': 0.95,
                'format_prob': 0.85,
            },
            'excellent': {
                'keyword_match': (78, 94),
                'years_exp': (5, 18),
                'skills': (15, 28),
                'degree_weights': [0, 0.02, 0.08, 0.35, 0.45, 0.1],
                'section_prob': 0.98,
                'format_prob': 0.92,
            },
            'outstanding': {
                'keyword_match': (88, 99),
                'years_exp': (8, 25),
                'skills': (20, 35),
                'degree_weights': [0, 0, 0.05, 0.25, 0.5, 0.2],
                'section_prob': 1.0,
                'format_prob': 0.98,
            }
        }
        
        params = tier_params[target_tier]
        
        # Generate base features
        keyword_min, keyword_max = params['keyword_match']
        keyword_match_score = random.uniform(keyword_min, keyword_max)
        
        exp_min, exp_max = params['years_exp']
        years_of_experience = max(0, random.gauss((exp_min + exp_max) / 2, (exp_max - exp_min) / 4))
        
        # Jobs based on experience with variation
        if years_of_experience < 2:
            number_of_jobs = random.randint(1, 2)
        elif years_of_experience < 5:
            number_of_jobs = random.randint(1, 3)
        elif years_of_experience < 10:
            number_of_jobs = random.randint(2, 5)
        else:
            number_of_jobs = random.randint(3, 7)
        
        skill_min, skill_max = params['skills']
        total_skills_mentioned = random.randint(skill_min, skill_max)
        
        # Programming languages (more for tech roles)
        if job_role in ['software_engineer', 'data_scientist']:
            programming_languages = random.randint(
                min(2, total_skills_mentioned),
                min(total_skills_mentioned, max(3, total_skills_mentioned // 2))
            )
        else:
            programming_languages = random.randint(0, min(3, total_skills_mentioned // 3))
        
        # Education with weighted distribution
        degree_level = random.choices(range(6), weights=params['degree_weights'])[0]
        has_gpa = random.random() < (0.4 if degree_level >= 3 else 0.1)
        
        # Sections
        section_prob = params['section_prob']
        has_experience = random.random() < section_prob
        has_education = random.random() < section_prob
        has_skills = random.random() < section_prob
        has_summary = random.random() < (section_prob * 0.7)
        has_projects = random.random() < (section_prob * 0.5)
        has_certifications = random.random() < (section_prob * 0.4)
        
        # Contact info
        has_email = random.random() < (0.9 + params['format_prob'] * 0.1)
        has_phone = random.random() < (0.85 + params['format_prob'] * 0.15)
        has_linkedin = random.random() < (params['format_prob'] * 0.7)
        has_github = random.random() < (params['format_prob'] * 0.4) if job_role in ['software_engineer', 'data_scientist'] else random.random() < 0.1
        
        # Content quality
        quality_factor = params['format_prob']
        
        action_verb_count = max(0, int(random.gauss(5 + quality_factor * 18, 4)))
        quantifiable_metrics = max(0, int(random.gauss(2 + quality_factor * 12, 3)))
        bullet_point_count = max(0, int(random.gauss(8 + quality_factor * 15, 4)))
        technical_terms_count = max(0, int(random.gauss(5 + quality_factor * 20, 4)))
        has_job_titles = random.random() < (0.7 + quality_factor * 0.3)
        
        # Text statistics
        total_words = int(random.gauss(400 + quality_factor * 350, 80))
        total_words = max(150, min(1100, total_words))
        total_sentences = max(10, int(total_words / random.gauss(16, 2)))
        total_characters = int(total_words * random.gauss(5.5, 0.4))
        avg_word_length = total_characters / max(1, total_words)
        avg_sentence_length = total_words / max(1, total_sentences)
        
        # Structure
        total_sections = sum([
            has_experience, has_education, has_skills,
            has_summary, has_projects, has_certifications
        ])
        
        # Formatting
        readability_score = max(20, min(100, random.gauss(55 + quality_factor * 30, 10)))
        appropriate_length = 300 <= total_words <= 850
        consistent_formatting = random.random() < params['format_prob']
        
        # Create feature dictionary
        features = {
            'total_words': total_words,
            'total_sentences': total_sentences,
            'total_characters': total_characters,
            'avg_word_length': round(avg_word_length, 2),
            'avg_sentence_length': round(avg_sentence_length, 2),
            'total_sections': total_sections,
            'has_summary': has_summary,
            'has_experience': has_experience,
            'has_education': has_education,
            'has_skills': has_skills,
            'has_projects': has_projects,
            'has_certifications': has_certifications,
            'has_email': has_email,
            'has_phone': has_phone,
            'has_linkedin': has_linkedin,
            'has_github': has_github,
            'action_verb_count': action_verb_count,
            'quantifiable_metrics': quantifiable_metrics,
            'bullet_point_count': bullet_point_count,
            'technical_terms_count': technical_terms_count,
            'years_of_experience': round(years_of_experience, 1),
            'number_of_jobs': number_of_jobs,
            'has_job_titles': has_job_titles,
            'degree_level': degree_level,
            'has_gpa': has_gpa,
            'total_skills_mentioned': total_skills_mentioned,
            'programming_languages': programming_languages,
            'readability_score': round(readability_score, 1),
            'appropriate_length': appropriate_length,
            'consistent_formatting': consistent_formatting,
            'keyword_match_score': round(keyword_match_score, 1)
        }
        
        # Add independent noise for realism
        features = self._add_independent_noise(features, target_tier)
        
        # Calculate ATS score using non-linear scoring
        features['ats_score'] = round(self._calculate_ats_score(features), 1)
        
        return features
    
    def generate_dataset(self, n_samples: int=15000,
                         include_job_context: bool=True) -> pd.DataFrame:
        """
        Generate improved synthetic dataset
        
        Args:
            n_samples: Number of samples (default 15,000 for better generalization)
            include_job_context: Whether to vary by job role
        
        Returns:
            DataFrame with features and scores
        """
        print(f"🚀 Generating {n_samples} Industry-Grade Resumes (v2.0)")
        print("=" * 60)
        print("Improvements:")
        print("  ✓ Non-linear scoring (real ATS thresholds)")
        print("  ✓ Independent feature noise (realistic inconsistencies)")
        print("  ✓ Penalty factors (career gaps, job hopping, missing info)")
        print("  ✓ Job role context")
        print("  ✓ Better variance modeling")
        print("=" * 60)
        
        data = []
        
        # Realistic tier distribution
        tiers = ['poor', 'below_average', 'average', 'good', 'excellent', 'outstanding']
        weights = [0.10, 0.18, 0.38, 0.22, 0.10, 0.02]
        
        # Job roles
        job_roles = list(self.JOB_ROLES.keys())
        
        for i in range(n_samples):
            tier = random.choices(tiers, weights=weights)[0]
            job_role = random.choice(job_roles) if include_job_context else 'general'
            
            features = self.generate_resume_features(tier, job_role)
            features['job_role'] = job_role  # Include for analysis (not for training)
            features['target_tier'] = tier  # Include for analysis
            
            data.append(features)
            
            if (i + 1) % 3000 == 0:
                print(f"  Generated {i + 1:,}/{n_samples:,} samples...")
        
        df = pd.DataFrame(data)
        
        # Print statistics
        print(f"\n✅ Dataset Generated: {len(df):,} samples")
        print(f"\n📊 Score Statistics:")
        print(f"   Range: {df['ats_score'].min():.1f} - {df['ats_score'].max():.1f}")
        print(f"   Mean: {df['ats_score'].mean():.1f}")
        print(f"   Median: {df['ats_score'].median():.1f}")
        print(f"   Std Dev: {df['ats_score'].std():.1f}")
        
        print(f"\n📈 Score Distribution:")
        bins = [(0, 30), (30, 45), (45, 60), (60, 75), (75, 85), (85, 100)]
        labels = ['Very Poor', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent']
        for (low, high), label in zip(bins, labels):
            count = len(df[(df['ats_score'] >= low) & (df['ats_score'] < high)])
            pct = count / len(df) * 100
            bar = '█' * int(pct / 2)
            print(f"   {label:12} ({low:2}-{high:3}): {count:5} ({pct:5.1f}%) {bar}")
        
        print(f"\n🎯 Feature Correlations with ATS Score (Top 10):")
        # Calculate correlations excluding non-numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        correlations = numeric_df.corr()['ats_score'].abs().sort_values(ascending=False)
        for feat, corr in correlations.head(11).items():
            if feat != 'ats_score':
                print(f"   {feat:30}: {corr:.3f}")
        
        return df
    
    def save_dataset(self, df: pd.DataFrame,
                     filepath: str="./data/synthetic_resumes_v2.csv",
                     training_only: bool=True):
        """
        Save dataset to CSV
        
        Args:
            df: DataFrame to save
            filepath: Output path
            training_only: If True, remove analysis columns (job_role, target_tier)
        """
        import os
        os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)
        
        if training_only:
            # Remove columns not used for training
            train_df = df.drop(columns=['job_role', 'target_tier'], errors='ignore')
            train_df.to_csv(filepath, index=False)
            print(f"\n💾 Training dataset saved to {filepath}")
            print(f"   Columns: {len(train_df.columns)} features + 1 target")
        else:
            df.to_csv(filepath, index=False)
            print(f"\n💾 Full dataset saved to {filepath}")
        
        # Also save a sample for inspection
        sample_path = filepath.replace('.csv', '_sample.csv')
        df.head(100).to_csv(sample_path, index=False)
        print(f"   Sample (100 rows) saved to {sample_path}")


def main():
    """Main function to generate improved dataset"""
    print("\n" + "=" * 70)
    print("INDUSTRY-GRADE ATS DATASET GENERATOR v2.0")
    print("=" * 70)
    
    # Initialize generator
    generator = IndustryGradeATSGenerator(seed=42)
    
    # Generate dataset
    df = generator.generate_dataset(n_samples=15000, include_job_context=True)
    
    # Save dataset
    generator.save_dataset(df, "./data/synthetic_resumes_v2.csv", training_only=True)
    
    # Additional statistics
    print("\n" + "=" * 70)
    print("DATASET READY FOR TRAINING")
    print("=" * 70)
    print("\n📋 Next Steps:")
    print("   1. Run training script: python train_model_v2.py")
    print("   2. Evaluate on test resumes")
    print("   3. Compare with v1 model performance")
    
    return df


if __name__ == "__main__":
    df = main()
