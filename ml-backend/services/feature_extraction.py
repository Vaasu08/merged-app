"""
Feature Extraction Service v2.0
Enhanced feature extraction with better keyword matching and industry-standard patterns
"""

import re
from typing import Dict, List, Optional, Set, Tuple
import textstat
from collections import Counter


class FeatureExtractor:
    """Extract features from resume text - Industry Grade v2.0"""
    
    # Expanded action verbs (ATS systems look for these)
    ACTION_VERBS = {
        # Leadership
        'led', 'managed', 'directed', 'supervised', 'coordinated', 'oversaw',
        'headed', 'spearheaded', 'orchestrated', 'pioneered', 'founded',
        # Achievement
        'achieved', 'accomplished', 'attained', 'exceeded', 'surpassed', 'earned',
        'won', 'awarded', 'recognized', 'honored', 'promoted',
        # Creation
        'created', 'developed', 'designed', 'built', 'established', 'launched',
        'initiated', 'introduced', 'invented', 'originated', 'formulated',
        # Improvement
        'improved', 'enhanced', 'optimized', 'streamlined', 'upgraded', 'modernized',
        'revitalized', 'transformed', 'revolutionized', 'restructured', 'refined',
        # Analysis
        'analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'examined',
        'diagnosed', 'identified', 'discovered', 'measured', 'quantified',
        # Communication
        'presented', 'communicated', 'negotiated', 'persuaded', 'influenced', 'advocated',
        'collaborated', 'partnered', 'liaised', 'consulted', 'mentored', 'trained',
        # Technical
        'implemented', 'deployed', 'integrated', 'automated', 'engineered', 'programmed',
        'architected', 'configured', 'migrated', 'scaled', 'debugged', 'tested',
        # Business
        'increased', 'decreased', 'reduced', 'generated', 'delivered', 'executed',
        'accelerated', 'expanded', 'consolidated', 'maximized', 'minimized'
    }
    
    SECTION_KEYWORDS = {
        'summary': ['summary', 'profile', 'objective', 'about', 'overview', 'introduction'],
        'experience': ['experience', 'employment', 'work history', 'professional experience',
                       'career history', 'relevant experience'],
        'education': ['education', 'academic', 'qualification', 'degree', 'university',
                      'college', 'school'],
        'skills': ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies',
                   'technologies', 'tools'],
        'projects': ['projects', 'portfolio', 'key projects', 'personal projects'],
        'certifications': ['certifications', 'certificates', 'licenses', 'credentials',
                          'professional development']
    }
    
    # Technical skills database for better matching
    TECH_SKILLS = {
        # Programming Languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php',
        'swift', 'kotlin', 'go', 'golang', 'rust', 'scala', 'r', 'matlab', 'perl',
        'objective-c', 'dart', 'lua', 'haskell', 'clojure', 'elixir', 'f#',
        # Web Frameworks
        'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
        'django', 'flask', 'fastapi', 'express', 'node.js', 'nodejs', 'spring',
        'rails', 'laravel', 'asp.net', '.net', 'dotnet',
        # Data/ML
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
        'spark', 'hadoop', 'kafka', 'airflow', 'mlflow', 'huggingface',
        # Cloud
        'aws', 'azure', 'gcp', 'google cloud', 'amazon web services', 'heroku',
        'digitalocean', 'cloudflare', 'vercel', 'netlify',
        # DevOps
        'docker', 'kubernetes', 'k8s', 'jenkins', 'circleci', 'github actions',
        'gitlab ci', 'terraform', 'ansible', 'puppet', 'chef', 'vagrant',
        # Databases
        'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch',
        'dynamodb', 'cassandra', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'graphql',
        # Tools
        'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
        'figma', 'sketch', 'postman', 'swagger', 'nginx', 'apache',
        # Concepts
        'rest', 'restful', 'api', 'microservices', 'serverless', 'ci/cd', 'cicd',
        'agile', 'scrum', 'kanban', 'devops', 'sre', 'tdd', 'bdd',
        'machine learning', 'deep learning', 'nlp', 'computer vision', 'ai',
        'data science', 'data engineering', 'etl', 'data pipeline'
    }
    
    # Job titles for better parsing
    JOB_TITLES = {
        'engineer', 'developer', 'programmer', 'architect', 'analyst', 'scientist',
        'manager', 'director', 'vp', 'vice president', 'lead', 'principal',
        'senior', 'junior', 'staff', 'intern', 'associate', 'consultant',
        'specialist', 'coordinator', 'administrator', 'executive', 'officer',
        'head', 'chief', 'cto', 'ceo', 'cfo', 'coo', 'cio', 'founder', 'co-founder'
    }
    
    def extract_features(self, resume_text: str, job_description: Optional[str]=None) -> Dict:
        """
        Extract all features from resume text
        
        Args:
            resume_text: Raw resume text
            job_description: Optional job description for keyword matching
            
        Returns:
            Dictionary of 31 features matching training data
        """
        text = resume_text.lower()
        original_text = resume_text
        
        # Basic text statistics
        word_count = self._count_words(text)
        sentence_count = self._count_sentences(text)
        char_count = len(resume_text)
        
        features = {
            # Text statistics (5 features)
            'total_words': word_count,
            'total_sentences': sentence_count,
            'total_characters': char_count,
            'avg_word_length': round(char_count / max(word_count, 1) / 1.2, 2),  # Approximate
            'avg_sentence_length': round(word_count / max(sentence_count, 1), 2),
            
            # Structure features (7 features)
            'total_sections': self._count_sections(text),
            'has_summary': self._has_section(text, 'summary'),
            'has_experience': self._has_section(text, 'experience'),
            'has_education': self._has_section(text, 'education'),
            'has_skills': self._has_section(text, 'skills'),
            'has_projects': self._has_section(text, 'projects'),
            'has_certifications': self._has_section(text, 'certifications'),
            
            # Contact information (4 features)
            'has_email': self._has_email(text),
            'has_phone': self._has_phone(text),
            'has_linkedin': self._has_linkedin(text),
            'has_github': self._has_github(text),
            
            # Content quality (4 features)
            'action_verb_count': self._count_action_verbs(text),
            'quantifiable_metrics': self._count_quantifiable_metrics(text),
            'bullet_point_count': self._count_bullet_points(original_text),
            'technical_terms_count': self._count_technical_terms(text),
            
            # Experience indicators (3 features)
            'years_of_experience': self._extract_years_experience(text),
            'number_of_jobs': self._count_jobs(text),
            'has_job_titles': self._has_job_titles(text),
            
            # Education indicators (2 features)
            'degree_level': self._get_degree_level(text),
            'has_gpa': self._has_gpa(text),
            
            # Skills (2 features)
            'total_skills_mentioned': self._count_skills(text),
            'programming_languages': self._count_programming_languages(text),
            
            # Formatting quality (3 features)
            'readability_score': self._get_readability_score(original_text),
            'appropriate_length': self._check_length(word_count),
            'consistent_formatting': self._check_consistent_formatting(original_text),
            
            # Keyword matching (1 feature)
            'keyword_match_score': self._calculate_keyword_match(text, job_description),
        }
        
        return features
    
    def _count_words(self, text: str) -> int:
        """Count words in text"""
        words = re.findall(r'\b\w+\b', text)
        return len(words)
    
    def _count_sentences(self, text: str) -> int:
        """Count sentences"""
        # Better sentence detection
        sentences = re.split(r'[.!?]+(?:\s|$)', text)
        return len([s for s in sentences if s.strip() and len(s.strip()) > 10])
    
    def _count_sections(self, text: str) -> int:
        """Count resume sections"""
        count = 0
        for section_names in self.SECTION_KEYWORDS.values():
            for name in section_names:
                # Look for section headers (usually on their own line or followed by colon)
                pattern = rf'\b{re.escape(name)}\b\s*[:\n]?'
                if re.search(pattern, text, re.IGNORECASE):
                    count += 1
                    break
        return count
    
    def _has_section(self, text: str, section: str) -> bool:
        """Check if section exists"""
        keywords = self.SECTION_KEYWORDS.get(section, [])
        for keyword in keywords:
            pattern = rf'\b{re.escape(keyword)}\b'
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _has_email(self, text: str) -> bool:
        """Check for email address"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return bool(re.search(email_pattern, text, re.IGNORECASE))
    
    def _has_phone(self, text: str) -> bool:
        """Check for phone number"""
        phone_patterns = [
            r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\+\d{10,14}',
            r'\d{3}[-.\s]\d{3}[-.\s]\d{4}'
        ]
        for pattern in phone_patterns:
            if re.search(pattern, text):
                return True
        return False
    
    def _has_linkedin(self, text: str) -> bool:
        """Check for LinkedIn profile"""
        patterns = ['linkedin.com', 'linkedin:', '/in/', 'linkedin']
        return any(p in text for p in patterns)
    
    def _has_github(self, text: str) -> bool:
        """Check for GitHub profile"""
        patterns = ['github.com', 'github:', 'github.io', 'github']
        return any(p in text for p in patterns)
    
    def _count_action_verbs(self, text: str) -> int:
        """Count action verbs used"""
        words = re.findall(r'\b\w+\b', text)
        # Check for verb stems too (e.g., "leading" matches "led")
        count = 0
        for word in words:
            if word in self.ACTION_VERBS:
                count += 1
            # Check common verb endings
            elif word.endswith('ed') and word[:-2] in self.ACTION_VERBS:
                count += 1
            elif word.endswith('ing') and word[:-3] in self.ACTION_VERBS:
                count += 1
        return count
    
    def _count_quantifiable_metrics(self, text: str) -> int:
        """Count quantifiable achievements (numbers with context)"""
        patterns = [
            r'\d+%',  # Percentages: 30%
            r'\$[\d,]+[kmb]?',  # Money: $50K, $2M
            r'\d+[kmb]\+?',  # Thousands/Millions: 10K, 2M
            r'\d+\+',  # Numbers with plus: 100+
            r'\d+x',  # Multipliers: 3x
            r'\d+\s*(?:users?|customers?|clients?|people|team|engineers?|members?)',
            r'(?:increased?|decreased?|reduced?|improved?|grew?|saved?).*?\d+',
            r'\d+\s*(?:years?|months?|weeks?|days?|hours?)',
        ]
        
        count = 0
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            count += len(matches)
        
        return min(count, 50)  # Cap to avoid outliers
    
    def _count_bullet_points(self, text: str) -> int:
        """Count bullet points"""
        bullet_chars = ['•', '●', '○', '▪', '▸', '►', '◆', '◇', '■', '□']
        count = sum(text.count(char) for char in bullet_chars)
        
        # Also count lines starting with - or *
        lines = text.split('\n')
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('-') or stripped.startswith('*'):
                count += 1
        
        return count
    
    def _count_technical_terms(self, text: str) -> int:
        """Count technical terms"""
        words = set(re.findall(r'\b[\w.#+]+\b', text))
        count = 0
        for word in words:
            if word in self.TECH_SKILLS or word.replace('.', '') in self.TECH_SKILLS:
                count += 1
        return count
    
    def _extract_years_experience(self, text: str) -> float:
        """Extract years of experience from text"""
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?',
            r'(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)',
            r'over\s*(\d+)\s*(?:years?|yrs?)',
        ]
        
        years = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    # Range like "5-7 years"
                    try:
                        years.append(int(match[-1]))
                    except:
                        pass
                else:
                    try:
                        years.append(int(match))
                    except:
                        pass
        
        # Also estimate from date ranges (e.g., 2015-2020)
        date_ranges = re.findall(r'(20\d{2})\s*[-–]\s*(20\d{2}|present|current)', text, re.IGNORECASE)
        for start, end in date_ranges:
            try:
                start_year = int(start)
                end_year = 2025 if end.lower() in ['present', 'current'] else int(end)
                years.append(end_year - start_year)
            except:
                pass
        
        return max(years) if years else 0
    
    def _count_jobs(self, text: str) -> int:
        """Estimate number of job positions"""
        # Look for company/role patterns
        job_indicators = [
            r'(20\d{2})\s*[-–]\s*(20\d{2}|present|current)',  # Date ranges
            r'(?:at|@)\s+[A-Z][a-zA-Z]+',  # "at Company"
        ]
        
        count = 0
        for pattern in job_indicators:
            matches = re.findall(pattern, text, re.IGNORECASE)
            count += len(matches)
        
        # Also look for job title keywords
        title_matches = 0
        for title in self.JOB_TITLES:
            if title in text:
                title_matches += 1
        
        return max(count, title_matches // 2, 1)
    
    def _has_job_titles(self, text: str) -> bool:
        """Check for job titles"""
        job_title_patterns = [
            r'(?:senior|junior|lead|principal|staff)\s+\w+\s+(?:engineer|developer|manager)',
            r'(?:software|data|product|project|engineering)\s+(?:engineer|developer|manager|analyst)',
        ]
        
        for pattern in job_title_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        # Simple check
        return any(title in text for title in self.JOB_TITLES)
    
    def _get_degree_level(self, text: str) -> int:
        """Get highest degree level (0-5)"""
        degree_patterns = [
            (5, [r'\bph\.?d\b', r'\bdoctorate\b', r'\bdoctoral\b']),
            (4, [r"\bmaster'?s?\b", r'\bm\.?s\.?\b', r'\bm\.?a\.?\b', r'\bmba\b', r'\bm\.?eng\b']),
            (3, [r"\bbachelor'?s?\b", r'\bb\.?s\.?\b', r'\bb\.?a\.?\b', r'\bb\.?eng\b', r'\bundergraduate\b']),
            (2, [r'\bassociate\b', r'\bdiploma\b', r'\ba\.?s\.?\b', r'\ba\.?a\.?\b']),
            (1, [r'\bhigh school\b', r'\bged\b', r'\bsecondary\b']),
        ]
        
        for level, patterns in degree_patterns:
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return level
        return 0
    
    def _has_gpa(self, text: str) -> bool:
        """Check for GPA mention"""
        gpa_patterns = [
            r'\bgpa\b',
            r'grade\s*point\s*average',
            r'\d\.\d+\s*/\s*4\.0',
            r'[34]\.\d{1,2}\s*gpa',
        ]
        for pattern in gpa_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _count_skills(self, text: str) -> int:
        """Count total skills mentioned"""
        # Count technical skills found
        tech_count = self._count_technical_terms(text)
        
        # Also look for skills section and count items
        skills_section = re.search(
            r'(?:skills?|technologies|tools|competenc).*?(?=\n\n|\n[A-Z]|\Z)',
            text, re.DOTALL | re.IGNORECASE
        )
        
        if skills_section:
            section_text = skills_section.group()
            # Count comma-separated items
            comma_count = section_text.count(',') + 1
            # Count items in lists
            list_items = len(re.findall(r'[•●○▪-]\s*\w+', section_text))
            tech_count = max(tech_count, comma_count, list_items)
        
        return min(tech_count, 50)  # Cap at 50
    
    def _count_programming_languages(self, text: str) -> int:
        """Count programming languages mentioned"""
        languages = {
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby',
            'php', 'swift', 'kotlin', 'go', 'golang', 'rust', 'scala', 'r',
            'matlab', 'perl', 'objective-c', 'dart', 'lua', 'haskell', 'clojure',
            'elixir', 'f#', 'groovy', 'julia', 'cobol', 'fortran', 'assembly'
        }
        
        # Handle special cases
        text_lower = text.lower()
        count = 0
        
        for lang in languages:
            # Word boundary search
            if re.search(rf'\b{re.escape(lang)}\b', text_lower):
                count += 1
        
        # Special cases
        if re.search(r'\bc\b(?!\+\+|#)', text_lower):
            count += 1
        
        return count
    
    def _get_readability_score(self, text: str) -> float:
        """Calculate readability score"""
        try:
            score = textstat.flesch_reading_ease(text)
            # Normalize and clamp
            return max(20, min(100, score))
        except:
            return 60
    
    def _check_length(self, word_count: int) -> bool:
        """Check if resume length is appropriate"""
        return 250 <= word_count <= 900
    
    def _check_consistent_formatting(self, text: str) -> bool:
        """Check for consistent formatting"""
        # Check for consistent date formats
        date_formats = [
            len(re.findall(r'\b\d{4}\s*[-–]\s*(?:\d{4}|present|current)\b', text, re.IGNORECASE)),
            len(re.findall(r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}\b', text, re.IGNORECASE)),
        ]
        
        # Check for bullet consistency
        bullet_types = sum([
            text.count('•') > 2,
            text.count('●') > 2,
            text.count('-') > 5,
            text.count('*') > 2,
        ])
        
        # Good formatting: dates present and mostly one bullet style
        return max(date_formats) >= 2 and bullet_types <= 2
    
    def _calculate_keyword_match(self, resume_text: str, job_description: Optional[str]) -> float:
        """Calculate keyword match score with improved algorithm"""
        if not job_description:
            return 50.0  # Neutral score when no JD provided
        
        # Extract meaningful keywords from job description
        jd_lower = job_description.lower()
        
        # Get technical terms from JD
        jd_tech = set()
        for term in self.TECH_SKILLS:
            if term in jd_lower:
                jd_tech.add(term)
        
        # Get other important keywords (longer words, likely meaningful)
        jd_words = set(re.findall(r'\b[a-z]{4,}\b', jd_lower))
        
        # Remove common filler words
        filler_words = {
            'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will',
            'your', 'our', 'you', 'are', 'can', 'they', 'their', 'about', 'more',
            'been', 'being', 'would', 'could', 'should', 'also', 'other', 'than',
            'just', 'only', 'over', 'such', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'which', 'while',
            'company', 'team', 'work', 'working', 'looking', 'position', 'role',
            'experience', 'required', 'requirements', 'qualifications', 'skills',
            'ability', 'knowledge', 'understanding', 'excellent', 'strong', 'good'
        }
        jd_words -= filler_words
        
        # Combine important keywords
        important_keywords = jd_tech | jd_words
        
        if not important_keywords:
            return 50.0
        
        # Check resume for these keywords
        resume_words = set(re.findall(r'\b[a-z]{3,}\b', resume_text))
        resume_tech = set()
        for term in self.TECH_SKILLS:
            if term in resume_text:
                resume_tech.add(term)
        
        all_resume_terms = resume_words | resume_tech
        
        # Calculate match
        matches = important_keywords.intersection(all_resume_terms)
        
        # Weight technical matches higher
        tech_matches = jd_tech.intersection(resume_tech)
        tech_weight = len(tech_matches) * 2  # Double weight for technical skills
        
        total_important = len(important_keywords) + len(jd_tech)  # Account for tech weight
        total_matches = len(matches) + tech_weight
        
        if total_important == 0:
            return 50.0
        
        match_score = (total_matches / total_important) * 100
        
        # Normalize to realistic range (10-95)
        return max(10, min(95, match_score))


# Singleton instance
feature_extractor = FeatureExtractor()
