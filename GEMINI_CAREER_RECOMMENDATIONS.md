# Gemini AI Career Recommendations Integration

## Overview

The career assessment system now uses **Google Gemini AI** to generate personalized job recommendations based on user responses to the 10-question career assessment.

## How It Works

### 1. Assessment Flow

- User clicks "Test Career Assessment" button
- Answers 10 multiple-choice questions about:
  - Work environment preferences
  - Personality traits
  - Team dynamics
  - Learning style
  - Problem-solving approach
  - Career goals
  - Stress management
  - Subject interests

### 2. AI Analysis

When the user completes the assessment:

1. **Toast Notification**: "Analyzing your responses with AI..." appears
2. **Gemini API Call**: Answers are sent to Gemini 2.0 Flash model
3. **Intelligent Prompt**: A comprehensive prompt analyzes user traits and preferences
4. **Personalized Results**: Gemini generates 6 unique job recommendations

### 3. Recommendation Details

Each job recommendation includes:

- **Match Score**: 60-98% based on answer alignment
- **Job Title**: Specific career path
- **Description**: 2-3 sentence overview
- **Key Skills**: 5-7 required skills
- **Average Salary**: Realistic salary range (INR/USD)
- **Growth Rate**: Industry growth percentage
- **Work Environment**: Typical work setting
- **Personalized Reasons**: 3-4 specific reasons why this job matches their answers

## Technical Implementation

### Files Created/Modified

#### 1. `/src/lib/geminiCareerRecommendation.ts` (NEW)

Main service file that handles Gemini API integration:

- `GeminiCareerRecommendationService` class
- `analyzeAssessmentAnswersWithGemini()` function
- Prompt engineering for career analysis
- JSON parsing and validation
- Fallback recommendations if API fails

**Key Features:**

```typescript
// Main function to call
async analyzeAssessmentAnswersWithGemini(
  answers: Record<number, string>
): Promise<JobRecommendation[]>

// Uses Gemini 2.0 Flash model
Model: gemini-2.0-flash-exp
Temperature: 0.7
Max Tokens: 4096
```

#### 2. `/src/pages/Index.tsx` (MODIFIED)

Updated three `onComplete` handlers to use async Gemini calls:

- Welcome screen modal
- Skills screen modal
- Recommendations screen modal

**Changes:**

- Made `onComplete` async
- Added loading toast with unique IDs
- Error handling with try/catch
- Success/error toast notifications

### API Configuration

**Environment Variable:**

```env
VITE_GEMINI_API_KEY=AIzaSyCk1oorWS5rwYKY486JBltdrLhZH88sWvc
```

**API Endpoint:**

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

## Prompt Engineering

The system sends a detailed prompt to Gemini that includes:

1. **Context**: "You are a career counselor AI..."
2. **Assessment Answers**: All 10 Q&A pairs with question text
3. **Analysis Instructions**: What to look for in answers
4. **Output Format**: Exact JSON structure required
5. **Quality Guidelines**:
   - Realistic match scores (60-98)
   - Specific reasons based on actual answers
   - Diverse job options across industries
   - Indian salary ranges or global standards

## Error Handling

### Fallback System

If Gemini API fails:

1. Error is logged to console
2. Error toast shown to user
3. Fallback recommendation provided (Software Developer with 75% match)
4. User can retry assessment

### Validation

- Checks for valid JSON response
- Removes markdown code blocks if present
- Ensures all required fields are present
- Limits to 6 recommendations max
- Provides default values for missing fields

## User Experience

### Loading States

```
1. User clicks "Submit" on question 10
2. Modal closes
3. Toast: "Analyzing your responses with AI..."
4. ~2-5 seconds processing
5. Toast: "Assessment completed! Here are your personalized recommendations."
6. Results screen appears with 6 job cards
```

### Results Display

- Full-screen overlay
- 2-column grid on desktop, 1-column on mobile
- Color-coded match scores:
  - Green (80%+): Excellent match
  - Blue (60-79%): Good match
  - Orange (<60%): Possible match
- Interactive cards with:
  - "Learn More" button (Google search)
  - "Retake Assessment" button
  - "Explore Skills & Learning Paths" button

## Testing the Feature

### Manual Testing Steps

1. Navigate to home page
2. Click "Test Career Assessment" button
3. Answer all 10 questions
4. Click "Submit" on final question
5. Watch for loading toast
6. Verify 6 recommendations appear
7. Check that reasons are specific to your answers
8. Test "Learn More", "Retake", and navigation buttons

### Expected Behavior

- Loading toast should appear immediately
- Results should load within 5 seconds
- Match scores should be 60-98%
- Reasons should mention specific answers (e.g., "Based on your preference for remote work...")
- All job cards should have complete information

### Troubleshooting

If recommendations don't appear:

1. Check browser console for errors
2. Verify `VITE_GEMINI_API_KEY` in `.env`
3. Check network tab for API call status
4. Look for toast error message
5. Ensure you're on localhost:8081

## Future Enhancements

### Possible Improvements

1. **Save to Profile**: Store recommendations in Supabase
2. **History**: View past assessment results
3. **Comparison**: Compare multiple assessment results
4. **Deep Dive**: Get detailed career path roadmap for selected job
5. **Skills Gap**: Show what skills to learn for each recommendation
6. **Learning Paths**: Generate course recommendations
7. **Salary Insights**: Real-time salary data by location
8. **Job Listings**: Link to actual job postings

### API Optimizations

1. Implement caching for similar answer patterns
2. Add rate limiting protection
3. Use streaming responses for faster perceived load time
4. Batch multiple assessments if needed

## Development Notes

### Why Gemini 2.0 Flash?

- **Fast**: 2-5 second response time
- **Cost-effective**: Free tier supports development
- **Smart**: Excellent at analysis and reasoning
- **JSON Support**: Reliable structured output
- **Context Window**: 1M tokens (plenty for our use case)

### Alternative Models Considered

- Gemini Pro: More expensive, not needed for this use case
- Gemini 1.5: Flash is newer and faster
- GPT-4: Requires OpenAI API, more expensive

### Code Quality

- Full TypeScript support with interfaces
- Error boundaries with fallbacks
- Loading states for better UX
- Toast notifications for feedback
- Clean async/await patterns
- Console logging for debugging

## API Costs (Free Tier)

**Gemini 2.0 Flash Free Tier:**

- 1500 requests per day
- 1 million tokens per minute
- 10 requests per minute

**Per Assessment:**

- ~1000 tokens input (questions + prompt)
- ~2000 tokens output (6 recommendations)
- **Total**: ~3000 tokens per assessment

**Daily Capacity:**

- Can handle ~500 assessments per day (based on token limits)
- More than enough for development and early users

## Support

For issues or questions:

1. Check browser console logs
2. Verify environment variables
3. Review Gemini API status
4. Check network connectivity
5. Ensure you're using latest code

## Credits

**Gemini API Integration**: Google Generative AI
**Model**: Gemini 2.0 Flash Experimental
**Built by**: Horizon Team (MAIT)
**Date**: October 27, 2025
