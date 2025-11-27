export type ColdEmailTone = 'formal' | 'friendly' | 'concise' | 'persuasive' | 'bold';

export interface ColdEmailRequest {
  userId: string;
  jobRole: string;
  company: string;
  jobDescription?: string;
  jobUrl?: string;
  tone: ColdEmailTone;
  recruiterName?: string;
  save?: boolean;
}

export interface ColdEmailVariant {
  variantIndex: number;
  subject: string;
  body: string;
  cta: string;
}

export interface ColdEmailResponse {
  success: boolean;
  emails: ColdEmailVariant[];
  savedIds?: string[];
  note?: string;
}

export async function generateColdEmails(
  payload: ColdEmailRequest
): Promise<ColdEmailResponse> {
  const res = await fetch('/api/generate-cold-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to generate cold emails');
  }

  const data = (await res.json()) as ColdEmailResponse;
  return data;
}


