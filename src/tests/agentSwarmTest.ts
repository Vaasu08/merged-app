/**
 * Test file to verify all 8 agents in the Career Agent Swarm are working
 * Run this to ensure the swarm is fully functional
 */

import { careerAgentSwarm, UserProfile } from '../lib/careerAgentSwarm';

// Test profile
const testProfile: UserProfile = {
  fullName: 'Test User',
  currentRole: 'Software Engineer',
  targetRole: 'Senior Software Engineer',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  experience: [
    {
      position: 'Software Engineer',
      company: 'Tech Company',
      startDate: '2022-01-01',
      endDate: '2025-11-01',
      isCurrent: true
    }
  ],
  location: 'San Francisco, CA',
  preferences: {
    salaryMin: 150000,
    remotePreference: 'hybrid',
    industries: ['Technology', 'SaaS']
  }
};

const testProgress = {
  applicationsSubmitted: 10,
  interviewsCompleted: 3,
  networkingEvents: 5,
  skillsLearned: ['System Design'],
  readinessScore: 75
};

/**
 * Test 1: Full Swarm Execution
 */
async function testFullSwarm() {
  console.log('\n=== TEST 1: Full Swarm Execution ===\n');
  
  try {
    const result = await careerAgentSwarm.runSwarm(testProfile, {
      currentWeek: 0,
      userProgress: testProgress
    });

    console.log('✅ Full swarm executed successfully');
    console.log(`   - Week: ${result.currentWeek}`);
    console.log(`   - Tasks created: ${result.weeklyPlans[0].tasks.length}`);
    console.log(`   - Agent messages: ${result.agentConversation.length}`);
    console.log(`   - Agents participated:`);
    result.agentConversation.forEach(msg => {
      console.log(`     • ${msg.agentName}`);
    });
    
    return { success: true, agentCount: result.agentConversation.length };
  } catch (error) {
    console.error('❌ Full swarm test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 2: Individual Agent Access
 */
async function testIndividualAgents() {
  console.log('\n=== TEST 2: Individual Agent Access ===\n');
  
  const results: Record<string, boolean> = {};
  
  // Test Planner Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('planner', testProfile);
    console.log('✅ Planner Agent: Working');
    results.planner = true;
  } catch (error) {
    console.error('❌ Planner Agent failed');
    results.planner = false;
  }

  // Test Recruiter Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('recruiter', testProfile);
    console.log('✅ Recruiter Agent: Working');
    results.recruiter = true;
  } catch (error) {
    console.error('❌ Recruiter Agent failed');
    results.recruiter = false;
  }

  // Test Coach Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('coach', testProfile, {
      progress: testProgress
    });
    console.log('✅ Coach Agent: Working');
    results.coach = true;
  } catch (error) {
    console.error('❌ Coach Agent failed');
    results.coach = false;
  }

  // Test Interviewer Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('interviewer', testProfile);
    console.log('✅ Interviewer Agent: Working');
    results.interviewer = true;
  } catch (error) {
    console.error('❌ Interviewer Agent failed');
    results.interviewer = false;
  }

  // Test Research Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('researcher', testProfile, {
      companyName: 'Google'
    });
    console.log('✅ Research Agent: Working');
    results.researcher = true;
  } catch (error) {
    console.error('❌ Research Agent failed');
    results.researcher = false;
  }

  // Test Networking Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('networker', testProfile);
    console.log('✅ Networking Agent: Working');
    results.networker = true;
  } catch (error) {
    console.error('❌ Networking Agent failed');
    results.networker = false;
  }

  // Test Negotiation Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('negotiator', testProfile);
    console.log('✅ Negotiation Agent: Working');
    results.negotiator = true;
  } catch (error) {
    console.error('❌ Negotiation Agent failed');
    results.negotiator = false;
  }

  // Test Branding Agent
  try {
    const insight = await careerAgentSwarm.getAgentInsight('branding', testProfile);
    console.log('✅ Branding Agent: Working');
    results.branding = true;
  } catch (error) {
    console.error('❌ Branding Agent failed');
    results.branding = false;
  }

  const successCount = Object.values(results).filter(v => v).length;
  console.log(`\n📊 Individual Agent Results: ${successCount}/8 agents working`);
  
  return results;
}

/**
 * Test 3: Specific Agent Methods
 */
async function testSpecificMethods() {
  console.log('\n=== TEST 3: Specific Agent Methods ===\n');
  
  const results: Record<string, boolean> = {};

  // Research Agent methods
  try {
    await careerAgentSwarm.researchCompany('Stripe', 'Backend Engineer');
    console.log('✅ researchCompany(): Working');
    results.researchCompany = true;
  } catch (error) {
    console.error('❌ researchCompany() failed');
    results.researchCompany = false;
  }

  try {
    await careerAgentSwarm.analyzeTrends('Technology', 'Software Engineer');
    console.log('✅ analyzeTrends(): Working');
    results.analyzeTrends = true;
  } catch (error) {
    console.error('❌ analyzeTrends() failed');
    results.analyzeTrends = false;
  }

  // Networking Agent methods
  try {
    await careerAgentSwarm.generateLinkedInMessage(
      'Software Engineer',
      'John Doe',
      'Test context'
    );
    console.log('✅ generateLinkedInMessage(): Working');
    results.generateLinkedInMessage = true;
  } catch (error) {
    console.error('❌ generateLinkedInMessage() failed');
    results.generateLinkedInMessage = false;
  }

  try {
    await careerAgentSwarm.getNetworkingPlan(testProfile);
    console.log('✅ getNetworkingPlan(): Working');
    results.getNetworkingPlan = true;
  } catch (error) {
    console.error('❌ getNetworkingPlan() failed');
    results.getNetworkingPlan = false;
  }

  // Negotiation Agent methods
  try {
    await careerAgentSwarm.analyzeSalaryOffer({
      baseSalary: 150000,
      bonus: 20000,
      location: 'San Francisco, CA',
      role: 'Senior Software Engineer',
      company: 'Test Corp'
    }, testProfile);
    console.log('✅ analyzeSalaryOffer(): Working');
    results.analyzeSalaryOffer = true;
  } catch (error) {
    console.error('❌ analyzeSalaryOffer() failed');
    results.analyzeSalaryOffer = false;
  }

  try {
    await careerAgentSwarm.getNegotiationStrategy(testProfile, 'pre-offer');
    console.log('✅ getNegotiationStrategy(): Working');
    results.getNegotiationStrategy = true;
  } catch (error) {
    console.error('❌ getNegotiationStrategy() failed');
    results.getNegotiationStrategy = false;
  }

  // Branding Agent methods
  try {
    await careerAgentSwarm.analyzePersonalBrand(testProfile);
    console.log('✅ analyzePersonalBrand(): Working');
    results.analyzePersonalBrand = true;
  } catch (error) {
    console.error('❌ analyzePersonalBrand() failed');
    results.analyzePersonalBrand = false;
  }

  try {
    await careerAgentSwarm.generateLinkedInProfile(testProfile);
    console.log('✅ generateLinkedInProfile(): Working');
    results.generateLinkedInProfile = true;
  } catch (error) {
    console.error('❌ generateLinkedInProfile() failed');
    results.generateLinkedInProfile = false;
  }

  // Interviewer Agent methods
  try {
    await careerAgentSwarm.assessInterviewReadiness(testProfile);
    console.log('✅ assessInterviewReadiness(): Working');
    results.assessInterviewReadiness = true;
  } catch (error) {
    console.error('❌ assessInterviewReadiness() failed');
    results.assessInterviewReadiness = false;
  }

  try {
    await careerAgentSwarm.generateInterviewQuestions(testProfile, 5);
    console.log('✅ generateInterviewQuestions(): Working');
    results.generateInterviewQuestions = true;
  } catch (error) {
    console.error('❌ generateInterviewQuestions() failed');
    results.generateInterviewQuestions = false;
  }

  const successCount = Object.values(results).filter(v => v).length;
  console.log(`\n📊 Specific Methods Results: ${successCount}/10 methods working`);
  
  return results;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('\n🧪 Career Agent Swarm - Comprehensive Test Suite\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();

  // Run tests
  const swarmResult = await testFullSwarm();
  const agentResults = await testIndividualAgents();
  const methodResults = await testSpecificMethods();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 TEST SUMMARY\n');
  
  console.log(`✅ Full Swarm: ${swarmResult.success ? 'PASS' : 'FAIL'}`);
  if (swarmResult.success) {
    console.log(`   - Agents participated: ${swarmResult.agentCount}`);
  }
  
  const agentCount = Object.values(agentResults).filter(v => v).length;
  console.log(`✅ Individual Agents: ${agentCount}/8 working (${Math.round(agentCount/8*100)}%)`);
  
  const methodCount = Object.values(methodResults).filter(v => v).length;
  console.log(`✅ Specific Methods: ${methodCount}/10 working (${Math.round(methodCount/10*100)}%)`);
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  
  const allPassed = swarmResult.success && agentCount === 8 && methodCount === 10;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! The Career Agent Swarm is fully operational.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the logs above for details.\n');
  }

  return {
    success: allPassed,
    results: {
      fullSwarm: swarmResult,
      individualAgents: agentResults,
      specificMethods: methodResults
    },
    duration
  };
}

// Uncomment to run tests immediately
// runAllTests().catch(console.error);
