import React, { useState } from 'react';
import { generateColdEmails, type ColdEmailTone } from '@/lib/coldEmailService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColdEmailGeneratorProps {
  userId: string;
  defaultJobRole?: string;
  defaultCompany?: string;
  defaultJobDescription?: string;
  defaultJobUrl?: string;
}

export const ColdEmailGenerator: React.FC<ColdEmailGeneratorProps> = ({
  userId,
  defaultJobRole = '',
  defaultCompany = '',
  defaultJobDescription = '',
  defaultJobUrl,
}) => {
  const { toast } = useToast();
  const [jobRole, setJobRole] = useState(defaultJobRole);
  const [company, setCompany] = useState(defaultCompany);
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [jobUrl, setJobUrl] = useState(defaultJobUrl || '');
  const [tone, setTone] = useState<ColdEmailTone>('formal');
  const [recruiterName, setRecruiterName] = useState('');
  const [saveToDrafts, setSaveToDrafts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<
    { variantIndex: number; subject: string; body: string; cta: string }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleGenerate = async () => {
    if (!jobRole || !company || (!jobDescription && !jobUrl)) {
      toast({
        title: 'Missing information',
        description: 'Please provide job role, company, and either a job description or job URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await generateColdEmails({
        userId,
        jobRole,
        company,
        jobDescription: jobDescription || undefined,
        jobUrl: jobUrl || undefined,
        tone,
        recruiterName: recruiterName || undefined,
        save: saveToDrafts,
      });

      setEmails(result.emails || []);
      setSelectedIndex(0);

      toast({
        title: 'Emails generated',
        description:
          result.emails.length > 1
            ? `Created ${result.emails.length} cold email variations.`
            : 'Created 1 cold email.',
      });
    } catch (error) {
      console.error('Cold email generation error:', error);
      toast({
        title: 'Error',
        description: 'Unable to generate cold emails. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEmail = emails[selectedIndex];

  const handleCopy = async () => {
    if (!selectedEmail) return;

    const text = `Subject: ${selectedEmail.subject}\n\n${selectedEmail.body}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Email copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard. Please copy manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Cold Email Generator</h3>
        <p className="text-sm text-muted-foreground">
          Generate personalized cold emails using your profile, the job description, and company
          context.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Role</label>
          <Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. Software Engineer" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Microsoft" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={5}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Job URL (optional)</label>
          <Input
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="LinkedIn or career page URL"
          />

          <label className="mt-4 text-sm font-medium">Tone</label>
          <Select value={tone} onValueChange={(value) => setTone(value as ColdEmailTone)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>

          <label className="mt-4 text-sm font-medium">Recruiter Name (optional)</label>
          <Input
            value={recruiterName}
            onChange={(e) => setRecruiterName(e.target.value)}
            placeholder="e.g. Sarah"
          />

          <div className="mt-4 flex items-center gap-2 text-sm">
            <input
              id="saveToDrafts"
              type="checkbox"
              checked={saveToDrafts}
              onChange={(e) => setSaveToDrafts(e.target.checked)}
              className="h-4 w-4 rounded border-muted-foreground"
            />
            <label htmlFor="saveToDrafts" className="select-none">
              Save to drafts in my workspace
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Emails'}
        </Button>
        {emails.length > 0 && (
          <Button variant="outline" onClick={handleCopy}>
            Copy Selected
          </Button>
        )}
      </div>

      {emails.length > 0 && (
        <div className="space-y-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {emails.map((email, idx) => (
              <Button
                key={email.variantIndex}
                variant={idx === selectedIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndex(idx)}
              >
                Variant {idx + 1}
              </Button>
            ))}
          </div>

          {selectedEmail && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">Subject</div>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                  {selectedEmail.subject}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Body</div>
                <pre className="max-h-80 overflow-auto rounded-md border bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                  {selectedEmail.body}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


