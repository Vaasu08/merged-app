// Adzuna Job Search API Service

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: {
    display_name: string;
    area: string[];
  };
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: boolean;
  contract_type?: string;
  category: {
    label: string;
    tag: string;
  };
  created: string;
  redirect_url: string;
  contract_time?: string;
}

export interface JobSearchParams {
  what: string; // Job title or keywords
  where?: string; // Location
  results_per_page?: number;
  page?: number;
  sort_by?: 'relevance' | 'date' | 'salary';
  salary_min?: number;
  max_days_old?: number;
  country?: string; // Default: 'us'
}

export interface JobSearchResponse {
  results: JobListing[];
  count: number;
  mean: number; // Mean salary
}

/**
 * Search for jobs using Adzuna API via backend proxy
 */
export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResponse> => {
  const {
    what,
    where = '',
    results_per_page = 20,
    page = 1,
    sort_by = 'relevance',
    salary_min,
    max_days_old = 30,
    country = 'us'
  } = params;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const url = `${apiUrl}/api/jobs/search`;

  try {
    console.log('🔍 Adzuna Service - Fetching jobs via backend proxy');
    console.log('📍 API URL:', url);
    console.log('📋 Request params:', { what, where, page, sort_by, results_per_page });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        what,
        where,
        results_per_page,
        page,
        sort_by,
        salary_min,
        max_days_old,
        country
      })
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend API error:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Response received:', {
      success: data.success,
      resultsCount: data.results?.length || 0,
      totalCount: data.count
    });

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch jobs');
    }

    console.log(`✨ Successfully fetched ${data.results?.length || 0} jobs`);

    return {
      results: data.results || [],
      count: data.count || 0,
      mean: data.mean || 0
    };

  } catch (error) {
    console.error('💥 Error in adzunaService.searchJobs:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error
    });

    // Return fallback empty results instead of throwing
    console.warn('⚠️ Using fallback empty job results due to API error');
    return {
      results: [],
      count: 0,
      mean: 0
    };
  }
};

/**
 * Get career-specific job keywords for better search results
 */
export const getCareerKeywords = (careerTitle: string): string => {
  const keywordMap: Record<string, string> = {
    'Full Stack Developer': 'full stack developer',
    'Frontend Developer': 'frontend developer react',
    'Backend Developer': 'backend developer node',
    'Data Scientist': 'data scientist',
    'Machine Learning Engineer': 'machine learning engineer',
    'DevOps Engineer': 'devops engineer',
    'Mobile App Developer': 'mobile developer ios android',
    'Data Engineer': 'data engineer',
    'Cloud Architect': 'cloud architect aws azure',
    'UI/UX Designer': 'ui ux designer',
    'QA/Test Automation Engineer': 'qa automation engineer',
    'Cybersecurity Analyst': 'cybersecurity analyst',
    'Product Manager': 'product manager'
  };

  return keywordMap[careerTitle] || careerTitle.toLowerCase();
};

/**
 * Format salary for display
 */
export const formatSalary = (min?: number, max?: number, isPredicted?: boolean): string => {
  if (!min && !max) return 'Salary not specified';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const predictedText = isPredicted ? ' (estimated)' : '';

  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)}${predictedText}`;
  } else if (min) {
    return `From ${formatNumber(min)}${predictedText}`;
  } else if (max) {
    return `Up to ${formatNumber(max)}${predictedText}`;
  }

  return 'Salary not specified';
};

/**
 * Calculate days ago from date string
 */
export const getDaysAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};
