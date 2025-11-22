export interface ServerScore {
  // Adjust fields if your backend returns a specific schema
  [key: string]: unknown;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const SCORES_ENDPOINT = `${API_BASE}/api/scores`;

export async function getScores(): Promise<ServerScore[]> {
  try {
    const response = await fetch(SCORES_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn(`⚠️ Failed to fetch scores: ${response.status} ${response.statusText}. Using fallback empty array.`);
      return [];
    }

    try {
      return await response.json();
    } catch (err) {
      console.warn('⚠️ Invalid JSON from /api/scores. Using fallback empty array.');
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching scores:', error);
    console.warn('⚠️ Using fallback empty array due to fetch error');
    return [];
  }
}


