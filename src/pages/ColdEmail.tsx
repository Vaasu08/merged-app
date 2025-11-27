import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { ColdEmailGenerator } from '@/components/ColdEmailGenerator';

const ColdEmail = () => {
  const auth = useAuth();
  const user = auth?.user ?? null;

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Cold Email Generator
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Provide your target role, company, and job details, then choose an email tone to
              generate 2–3 personalized outreach emails powered by Gemini.
            </p>
          </div>

          <div className="rounded-xl border bg-background shadow-sm">
            <div className="border-b px-4 sm:px-6 py-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Job Details
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Provide information about the role and company for better personalization.
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
              <ColdEmailGenerator
                userId={user?.id ?? 'anonymous'}
                defaultJobRole="software engineer"
                defaultCompany="google"
              />
            </div>
          </div>

          {!user && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              You can generate emails without an account, but{' '}
              <span className="font-semibold">saving drafts</span> requires logging in.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ColdEmail;


