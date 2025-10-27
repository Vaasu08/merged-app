// Test file for validating AI-powered ATS scoring
// This can be run in the browser console or as a separate test

import { ATSScorerAI, ATSScorerFallback } from './atsScorerAI';
import { ParsedResume } from './cvParser';

// Sample test data
const sampleResume: ParsedResume = {
  text: `John Doe - Software Developer Resume

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Django, Flask
Databases: PostgreSQL, MongoDB, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, Git
Tools: Jest, Cypress, Webpack, Agile/Scrum

EXPERIENCE
Senior Full Stack Developer | TechCorp Inc. | 2022 - Present
- Developed React-based web applications serving 10,000+ users
- Implemented RESTful APIs using Node.js and Express.js
- Worked with PostgreSQL and MongoDB databases
- Deployed applications using Docker and AWS
- Improved application performance by 40% through optimization

Software Developer | StartupXYZ | 2020 - 2022
- Built responsive web applications using React and TypeScript
- Collaborated with cross-functional teams using Agile methodology
- Implemented automated testing with Jest and Cypress
- Managed version control with Git and GitHub

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020
GPA: 3.8/4.0

CERTIFICATIONS
AWS Certified Developer Associate | 2021
Google Cloud Professional Developer | 2022`,

  skills: ['js', 'ts', 'react', 'node', 'python', 'java', 'postgres', 'mongodb', 'aws', 'docker', 'git'],
  experience: [
    'Senior Full Stack Developer at TechCorp Inc. (2022-Present)',
    'Software Developer at StartupXYZ (2020-2022)'
  ],
  education: [
    'Bachelor of Science in Computer Science - University of California, Berkeley (2016-2020)'
  ],
  confidence: 95,
  keywords: ['javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'postgresql', 'mongodb', 'aws', 'docker', 'git', 'agile', 'scrum'],
  experienceYears: 4,
  contactInfo: {
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA'
  },
  sections: {
    summary: 'Experienced software developer with 4+ years in full-stack development',
    experience: 'Senior Full Stack Developer at TechCorp Inc. and Software Developer at StartupXYZ',
    education: 'Bachelor of Science in Computer Science from UC Berkeley',
    skills: 'JavaScript, TypeScript, React, Node.js, Python, Java, PostgreSQL, MongoDB, AWS, Docker, Git'
  }
};

const sampleJobDescription = `
We are looking for a Senior Full Stack Developer to join our team.

Requirements:
- 3+ years of experience in full-stack development
- Strong proficiency in JavaScript, TypeScript, and React
- Experience with Node.js and Express.js
- Database experience with PostgreSQL and MongoDB
- Cloud experience with AWS
- Knowledge of Docker and containerization
- Experience with Git version control
- Understanding of Agile/Scrum methodologies
- Strong problem-solving and communication skills

Nice to have:
- Experience with Python and Java
- Knowledge of Kubernetes
- Experience with automated testing (Jest, Cypress)
- Previous startup experience
`;

// Test function to compare AI vs Rule-based scoring
export async function testATSScoring() {
  console.log('🧪 Testing ATS Scoring Systems...');
  
  try {
    // Test AI scoring
    console.log('\n🤖 Testing AI-Powered Scoring...');
    const aiScorer = new ATSScorerAI();
    const aiScores = await aiScorer.calculateScore(sampleResume, sampleJobDescription);
    
    console.log('AI Scores:', {
      overall: aiScores.overall,
      keywordMatch: aiScores.keywordMatch,
      skillsMatch: aiScores.skillsMatch,
      experience: aiScores.experience,
      education: aiScores.education,
      formatting: aiScores.formatting,
      grade: aiScores.grade
    });
    
    console.log('AI Matched Keywords:', aiScores.matchedKeywords);
    console.log('AI Missing Keywords:', aiScores.missingKeywords);
    console.log('AI Suggestions:', aiScores.suggestions);
    
    // Test Rule-based scoring
    console.log('\n📊 Testing Rule-Based Scoring...');
    const ruleBasedScores = ATSScorerFallback.calculateScore(sampleResume, sampleJobDescription);
    
    console.log('Rule-Based Scores:', {
      overall: ruleBasedScores.overall,
      keywordMatch: ruleBasedScores.keywordMatch,
      skillsMatch: ruleBasedScores.skillsMatch,
      experience: ruleBasedScores.experience,
      education: ruleBasedScores.education,
      formatting: ruleBasedScores.formatting,
      grade: ruleBasedScores.grade
    });
    
    console.log('Rule-Based Matched Keywords:', ruleBasedScores.matchedKeywords);
    console.log('Rule-Based Missing Keywords:', ruleBasedScores.missingKeywords);
    console.log('Rule-Based Suggestions:', ruleBasedScores.suggestions);
    
    // Compare results
    console.log('\n📈 Comparison Analysis:');
    console.log('Overall Score Difference:', aiScores.overall - ruleBasedScores.overall);
    console.log('Keyword Match Difference:', aiScores.keywordMatch - ruleBasedScores.keywordMatch);
    console.log('Skills Match Difference:', aiScores.skillsMatch - ruleBasedScores.skillsMatch);
    
    // Analyze improvements
    const improvements = {
      moreKeywords: aiScores.matchedKeywords.length - ruleBasedScores.matchedKeywords.length,
      betterSuggestions: aiScores.suggestions.length - ruleBasedScores.suggestions.length,
      semanticUnderstanding: aiScores.matchedKeywords.some(kw => 
        !ruleBasedScores.matchedKeywords.includes(kw)
      )
    };
    
    console.log('AI Improvements:', improvements);
    
    return {
      aiScores,
      ruleBasedScores,
      improvements
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Test API connection
export async function testGeminiConnection() {
  console.log('🔗 Testing Gemini API Connection...');
  
  try {
    const aiScorer = new ATSScorerAI();
    const isConnected = await aiScorer.testConnection();
    
    if (isConnected) {
      console.log('✅ Gemini API connection successful');
      return true;
    } else {
      console.log('❌ Gemini API connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

// Performance test
export async function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  const iterations = 3;
  const times = {
    ai: [] as number[],
    ruleBased: [] as number[]
  };
  
  // Test AI performance
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const aiScorer = new ATSScorerAI();
      await aiScorer.calculateScore(sampleResume, sampleJobDescription);
      const end = performance.now();
      times.ai.push(end - start);
    } catch (error) {
      console.warn(`AI test ${i + 1} failed:`, error);
    }
  }
  
  // Test Rule-based performance
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    ATSScorerFallback.calculateScore(sampleResume, sampleJobDescription);
    const end = performance.now();
    times.ruleBased.push(end - start);
  }
  
  const avgAI = times.ai.reduce((a, b) => a + b, 0) / times.ai.length;
  const avgRuleBased = times.ruleBased.reduce((a, b) => a + b, 0) / times.ruleBased.length;
  
  console.log('Performance Results:');
  console.log(`AI Average Time: ${avgAI.toFixed(2)}ms`);
  console.log(`Rule-Based Average Time: ${avgRuleBased.toFixed(2)}ms`);
  console.log(`Speed Difference: ${(avgAI / avgRuleBased).toFixed(2)}x slower`);
  
  return { avgAI, avgRuleBased };
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running Complete ATS Scoring Test Suite...');
  
  // Test connection first
  const connected = await testGeminiConnection();
  if (!connected) {
    console.log('⚠️ Skipping AI tests due to connection issues');
    return;
  }
  
  // Run scoring comparison
  await testATSScoring();
  
  // Run performance test
  await testPerformance();
  
  console.log('✅ All tests completed!');
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testATSScoring = testATSScoring;
  (window as any).testGeminiConnection = testGeminiConnection;
  (window as any).testPerformance = testPerformance;
  (window as any).runAllTests = runAllTests;
}
