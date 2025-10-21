import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
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
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Information We Collect</h3>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This includes your email address, name, and skill information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h3>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, including generating personalized career recommendations based on your skills and preferences.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. Information Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or when required by law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. CV and Resume Processing</h3>
              <p className="text-muted-foreground">
                When you upload CV or resume files, we process them locally in your browser to extract skills information. These files are not stored on our servers or shared with third parties.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. Cookies and Analytics</h3>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">7. Your Rights</h3>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal information. You can manage your account settings or contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">8. Data Retention</h3>
              <p className="text-muted-foreground">
                We retain your personal information for as long as your account is active or as needed to provide services. You may delete your account at any time.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">9. Children's Privacy</h3>
              <p className="text-muted-foreground">
                Our service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">10. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at privacy@careerpathfinder.ai
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;