/**
 * Example usage of the Career Agent Swarm with all 8 specialized agents
 * This file demonstrates real-world scenarios and use cases
 */

import { careerAgentSwarm, UserProfile } from '../lib/careerAgentSwarm';

// Example user profile
const exampleProfile: UserProfile = {
  fullName: 'Alex Johnson',
  currentRole: 'Mid-Level Software Engineer',
  targetRole: 'Senior Software Engineer',
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'System Design',
    'PostgreSQL'
  ],
  experience: [
    {
      position: 'Software Engineer',
      company: 'TechStartup Inc',
      startDate: '2022-01-01',
      endDate: '2025-11-01',
      isCurrent: true
    },
    {
      position: 'Junior Developer',
      company: 'WebDev Solutions',
      startDate: '2020-06-01',
      endDate: '2021-12-31',
      isCurrent: false
    }
  ],
  location: 'San Francisco, CA',
  preferences: {
    salaryMin: 150000,
    remotePreference: 'hybrid',
    industries: ['AI/ML', 'SaaS', 'FinTech']
  }
};

// Example current progress
const currentProgress = {
  applicationsSubmitted: 15,
  interviewsCompleted: 4,
  networkingEvents: 6,
  skillsLearned: ['Kubernetes', 'GraphQL'],
  readinessScore: 78
};

/**
 * SCENARIO 1: Complete Job Search Strategy
 */
export async function completeJobSearchExample() {
  console.log('=== SCENARIO 1: Complete Job Search Strategy ===\n');

  // Step 1: Run the full swarm for weekly planning
  console.log('📋 Running full career agent swarm...');
  const swarmState = await careerAgentSwarm.runSwarm(exampleProfile, {
    currentWeek: 0,
    userProgress: currentProgress
  });
  console.log(`✅ Week ${swarmState.currentWeek} plan created with ${swarmState.weeklyPlans[0].tasks.length} tasks`);
  console.log(`📊 Current readiness: ${swarmState.userProgress.readinessScore}/100\n`);

  // Step 2: Analyze industry trends
  console.log('📈 Analyzing industry trends...');
  const trends = await careerAgentSwarm.analyzeTrends('Technology', 'Senior Software Engineer');
  console.log('Current Trends:', trends.currentTrends.slice(0, 3));
  console.log('Emerging Skills:', trends.emergingSkills.slice(0, 3));
  console.log('Market Demand:', trends.marketDemand.substring(0, 100) + '...\n');

  // Step 3: Research target companies
  console.log('🔍 Researching target company...');
  const companyResearch = await careerAgentSwarm.researchCompany('Google', 'Senior Software Engineer');
  console.log('Company Overview:', companyResearch.overview);
  console.log('Key Interview Tips:', companyResearch.interviewTips.slice(0, 2));
  console.log('Salary Range:', companyResearch.salaryRange, '\n');

  return { swarmState, trends, companyResearch };
}

/**
 * SCENARIO 2: Interview Preparation
 */
export async function interviewPreparationExample() {
  console.log('=== SCENARIO 2: Interview Preparation ===\n');

  // Step 1: Assess interview readiness
  console.log('🎤 Assessing interview readiness...');
  const readiness = await careerAgentSwarm.assessInterviewReadiness(exampleProfile);
  console.log(`Readiness Score: ${readiness.score}/100`);
  console.log('Strengths:', readiness.strengths.slice(0, 2));
  console.log('Areas for Improvement:', readiness.improvements.slice(0, 2));
  console.log('Recommended Topics:', readiness.recommendedTopics.slice(0, 3), '\n');

  // Step 2: Generate mock interview questions
  console.log('❓ Generating mock interview questions...');
  const mockQuestions = await careerAgentSwarm.generateInterviewQuestions(exampleProfile, 5);
  console.log('Practice Questions:');
  mockQuestions.forEach((q, i) => console.log(`  ${i + 1}. ${q.substring(0, 80)}...`));
  console.log();

  // Step 3: Research company for interview
  console.log('🏢 Researching company for interview prep...');
  const companyInfo = await careerAgentSwarm.researchCompany('Stripe', 'Senior Software Engineer');
  console.log('Culture Highlights:', companyInfo.culture.slice(0, 3));
  console.log('Interview Tips:', companyInfo.interviewTips, '\n');

  return { readiness, mockQuestions, companyInfo };
}

/**
 * SCENARIO 3: Networking Strategy
 */
export async function networkingStrategyExample() {
  console.log('=== SCENARIO 3: Networking Strategy ===\n');

  // Step 1: Get comprehensive networking plan
  console.log('🤝 Creating networking plan...');
  const networkingPlan = await careerAgentSwarm.getNetworkingPlan(exampleProfile);
  console.log('Weekly Goals:');
  console.log('  - New Connections:', networkingPlan.weeklyGoals.newConnections);
  console.log('  - Messages:', networkingPlan.weeklyGoals.messagesPerWeek);
  console.log('  - Events:', networkingPlan.weeklyGoals.eventAttendance);
  console.log('Target Groups:', networkingPlan.targetGroups.slice(0, 2));
  console.log();

  // Step 2: Generate LinkedIn message
  console.log('💬 Generating LinkedIn outreach message...');
  const linkedInMessage = await careerAgentSwarm.generateLinkedInMessage(
    'Senior Software Engineer',
    'Sarah Chen',
    'I came across your insightful article on microservices architecture and scalability patterns'
  );
  console.log('Subject:', linkedInMessage.subject);
  console.log('Message Preview:', linkedInMessage.message.substring(0, 150) + '...');
  console.log('Follow-up Tips:', linkedInMessage.tips.slice(0, 2), '\n');

  return { networkingPlan, linkedInMessage };
}

/**
 * SCENARIO 4: Salary Negotiation
 */
export async function salaryNegotiationExample() {
  console.log('=== SCENARIO 4: Salary Negotiation ===\n');

  const jobOffer = {
    baseSalary: 160000,
    bonus: 25000,
    equity: '0.15% RSUs over 4 years',
    benefits: ['Health Insurance', '401k Match 6%', 'Unlimited PTO', 'Learning Budget'],
    location: 'San Francisco, CA',
    role: 'Senior Software Engineer',
    company: 'AI Startup'
  };

  // Step 1: Analyze the offer
  console.log('💰 Analyzing job offer...');
  const offerAnalysis = await careerAgentSwarm.analyzeSalaryOffer(jobOffer, exampleProfile);
  console.log('Analysis:', offerAnalysis.analysis);
  console.log('Market Comparison:', offerAnalysis.marketComparison);
  console.log('Total Compensation:', offerAnalysis.totalCompensation);
  console.log('Negotiation Power:', offerAnalysis.negotiationPower);
  console.log();

  // Step 2: Get negotiation strategy
  console.log('📝 Getting negotiation strategy...');
  const strategy = await careerAgentSwarm.getNegotiationStrategy(exampleProfile, 'offer-received');
  console.log('Key Points:', strategy.keyPoints.slice(0, 2));
  console.log('Recommended Script:', strategy.scripts[0].scenario);
  console.log('Mistakes to Avoid:', strategy.mistakes.slice(0, 2));
  console.log('Timing:', strategy.timing, '\n');

  // Step 3: Counter-offer script
  console.log('💬 Counter-offer script:');
  console.log(offerAnalysis.counterOfferScript, '\n');

  return { offerAnalysis, strategy };
}

/**
 * SCENARIO 5: Personal Branding
 */
export async function personalBrandingExample() {
  console.log('=== SCENARIO 5: Personal Branding ===\n');

  // Step 1: Analyze current brand
  console.log('🎨 Analyzing personal brand...');
  const brandAnalysis = await careerAgentSwarm.analyzePersonalBrand(exampleProfile);
  console.log('Current Brand:', brandAnalysis.currentBrand);
  console.log('Strengths:', brandAnalysis.strengths.slice(0, 2));
  console.log('Gaps:', brandAnalysis.gaps);
  console.log('Target Brand:', brandAnalysis.targetBrand);
  console.log();

  // Step 2: Generate LinkedIn profile
  console.log('📱 Generating optimized LinkedIn profile...');
  const linkedInProfile = await careerAgentSwarm.generateLinkedInProfile(exampleProfile);
  console.log('Headline:', linkedInProfile.headline);
  console.log('\nSummary Preview:', linkedInProfile.summary.substring(0, 200) + '...');
  console.log('\nKeywords:', linkedInProfile.keywordOptimization.slice(0, 5));
  console.log('Call to Action:', linkedInProfile.callToAction, '\n');

  // Step 3: Action plan
  console.log('📋 Brand Building Action Plan:');
  brandAnalysis.actionPlan.forEach((action, i) => console.log(`  ${i + 1}. ${action}`));
  console.log();

  return { brandAnalysis, linkedInProfile };
}

/**
 * SCENARIO 6: Using Individual Agents
 */
export async function individualAgentExample() {
  console.log('=== SCENARIO 6: Individual Agent Insights ===\n');

  // Query different agents for specific insights
  console.log('🤖 Getting insights from individual agents...\n');

  // Coach agent
  const coachInsight = await careerAgentSwarm.getAgentInsight('coach', exampleProfile, {
    progress: currentProgress
  });
  console.log(`${coachInsight.agentName}:`, coachInsight.message.substring(0, 150) + '...\n');

  // Interviewer agent
  const interviewerInsight = await careerAgentSwarm.getAgentInsight('interviewer', exampleProfile);
  console.log(`${interviewerInsight.agentName}:`, interviewerInsight.message);
  console.log('Action Items:', interviewerInsight.actionItems?.slice(0, 2), '\n');

  // Research agent
  const researchInsight = await careerAgentSwarm.getAgentInsight('researcher', exampleProfile, {
    companyName: 'OpenAI'
  });
  console.log(`${researchInsight.agentName}:`, researchInsight.message);
  console.log();

  // Branding agent
  const brandingInsight = await careerAgentSwarm.getAgentInsight('branding', exampleProfile);
  console.log(`${brandingInsight.agentName}:`, brandingInsight.message);
  console.log();

  return { coachInsight, interviewerInsight, researchInsight, brandingInsight };
}

/**
 * SCENARIO 7: Complete 4-Week Job Search Journey
 */
export async function fourWeekJourneyExample() {
  console.log('=== SCENARIO 7: 4-Week Job Search Journey ===\n');

  // Week 1: Setup and preparation
  console.log('📅 WEEK 1: Setup & Preparation\n');
  const brandProfile = await careerAgentSwarm.generateLinkedInProfile(exampleProfile);
  console.log('✓ LinkedIn profile optimized');
  
  const industryAnalysis = await careerAgentSwarm.analyzeTrends('Tech', exampleProfile.targetRole!);
  console.log('✓ Industry trends analyzed');
  console.log('✓ Focus areas:', industryAnalysis.emergingSkills.slice(0, 3).join(', '));
  console.log();

  // Week 2: Applications and networking
  console.log('📅 WEEK 2: Applications & Networking\n');
  const weeklyPlan = await careerAgentSwarm.runSwarm(exampleProfile, {
    currentWeek: 1,
    userProgress: currentProgress
  });
  console.log(`✓ Weekly plan created with ${weeklyPlan.weeklyPlans[0].tasks.length} tasks`);
  
  const networkingPlan = await careerAgentSwarm.getNetworkingPlan(exampleProfile);
  console.log(`✓ Networking plan: ${networkingPlan.weeklyGoals.newConnections} connections/week`);
  console.log();

  // Week 3: Interviews
  console.log('📅 WEEK 3: Interview Preparation\n');
  const readiness = await careerAgentSwarm.assessInterviewReadiness(exampleProfile);
  console.log(`✓ Interview readiness: ${readiness.score}/100`);
  
  const mockQuestions = await careerAgentSwarm.generateInterviewQuestions(exampleProfile, 10);
  console.log(`✓ ${mockQuestions.length} mock questions prepared`);
  console.log();

  // Week 4: Offers and negotiation
  console.log('📅 WEEK 4: Offer Evaluation & Negotiation\n');
  const negotiationStrategy = await careerAgentSwarm.getNegotiationStrategy(exampleProfile, 'pre-offer');
  console.log(`✓ Negotiation strategy prepared (${negotiationStrategy.stage})`);
  console.log('✓ Key points:', negotiationStrategy.keyPoints.slice(0, 2).join('; '));
  console.log();

  console.log('🎉 4-Week Journey Complete!\n');

  return {
    week1: { brandProfile, industryAnalysis },
    week2: { weeklyPlan, networkingPlan },
    week3: { readiness, mockQuestions },
    week4: { negotiationStrategy }
  };
}

// Main demo function
export async function runAllExamples() {
  console.log('\n🚀 Career Agent Swarm - Complete Demo\n');
  console.log('=' .repeat(50));
  console.log();

  try {
    // Run all scenarios
    await completeJobSearchExample();
    await interviewPreparationExample();
    await networkingStrategyExample();
    await salaryNegotiationExample();
    await personalBrandingExample();
    await individualAgentExample();
    await fourWeekJourneyExample();

    console.log('=' .repeat(50));
    console.log('\n✅ All examples completed successfully!\n');
    console.log('💡 Tip: Each agent can be used independently or combined for maximum impact.\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Uncomment to run examples:
// runAllExamples();
