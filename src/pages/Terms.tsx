import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/signup">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-large">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scale className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using AI Career Pathfinder, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. Use License</h3>
              <p className="text-muted-foreground">
                Permission is granted to temporarily use AI Career Pathfinder for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. User Account</h3>
              <p className="text-muted-foreground">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for your account activities.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Career Recommendations</h3>
              <p className="text-muted-foreground">
                Our AI-powered career recommendations are provided for informational purposes only. While we strive for accuracy, we cannot guarantee specific career outcomes or job placement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. Privacy</h3>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. Prohibited Uses</h3>
              <p className="text-muted-foreground">
                You may not use our service for any unlawful purpose or to solicit others to perform illegal acts, to violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">7. Disclaimer</h3>
              <p className="text-muted-foreground">
                The information on this service is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">8. Contact Information</h3>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at support@careerpathfinder.ai
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;