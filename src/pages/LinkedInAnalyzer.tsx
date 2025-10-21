import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Wand2, Clipboard, Linkedin, Sparkles, Zap, Target, 
  Award, TrendingUp, Users, Globe, Rocket, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { Header } from '@/components/Header';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useInView as useIntersectionObserver } from 'react-intersection-observer';

type ProfileScore = {
  overall: number;
  details: {
    url: number;
    about: number;
    keywords: number;
    readability: number;
    structure: number;
  };
  feedback: string[];
};

const normalize = (value: number, min: number, max: number) => {
  if (max === min) return 0;
  const v = Math.max(min, Math.min(max, value));
  return Math.round(((v - min) / (max - min)) * 100);
};

const estimateReadability = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const avgWordsPerSentence = words / sentences;
  // Target 12-20 words per sentence
  const ideal = 16;
  const spread = 8; // acceptable ± range
  const distance = Math.abs(avgWordsPerSentence - ideal);
  const score = Math.max(0, 100 - (distance / spread) * 100);
  return Math.round(score);
};

const keywordList = [
  'results', 'impact', 'growth', 'leadership', 'team', 'scale', 'optimize',
  'deliver', 'strategy', 'customer', 'product', 'data', 'design', 'security',
  'cloud', 'ai', 'ml', 'automation', 'performance', 'quality', 'collaborate'
];

const scoreProfile = (url: string, about: string): ProfileScore => {
  const feedback: string[] = [];

  // URL score: looks like a LinkedIn profile and includes vanity slug
  const looksLinkedIn = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\//i.test(url.trim());
  const hasVanity = /linkedin\.com\/in\/[a-z0-9\-]{5,}/i.test(url.trim());
  const urlScore = looksLinkedIn ? (hasVanity ? 100 : 70) : (url.trim() ? 30 : 0);
  if (!looksLinkedIn) feedback.push('Use a valid LinkedIn profile URL (e.g., linkedin.com/in/yourname).');
  if (looksLinkedIn && !hasVanity) feedback.push('Claim a custom LinkedIn vanity URL for professionalism.');

  // About score: length, readability, structure, keywords
  const aboutText = about.trim();
  const lengthScore = normalize(aboutText.length, 400, 1600); // ideal ~ 800–1200 chars
  if (aboutText.length < 400) feedback.push('Expand your About section to share more context (800–1200 chars ideal).');
  if (aboutText.length > 1600) feedback.push('Tighten your About section to keep it concise and scannable.');

  const readability = estimateReadability(aboutText);
  if (readability < 60) feedback.push('Use shorter sentences and plain language for readability.');

  const hasParagraphs = /\n\s*\n/.test(aboutText);
  const hasBullets = /(^|\n)\s*[•\-\*\u2022]/m.test(aboutText);
  const structureScore = (hasParagraphs ? 60 : 0) + (hasBullets ? 40 : 0);
  if (!hasParagraphs) feedback.push('Break text into short paragraphs.');
  if (!hasBullets) feedback.push('Add 3–5 bullet points for highlights or achievements.');

  const keywordHits = keywordList.reduce((acc, k) => acc + (new RegExp(`\\b${k}\\b`, 'i').test(aboutText) ? 1 : 0), 0);
  const keywordsScore = normalize(keywordHits, 2, 10);
  if (keywordHits < 5) feedback.push('Include impact-oriented keywords (e.g., results, growth, scale).');

  const aboutScore = Math.round(0.35 * lengthScore + 0.25 * readability + 0.2 * structureScore + 0.2 * keywordsScore);

  const overall = Math.round(0.35 * urlScore + 0.65 * aboutScore);

  return {
    overall,
    details: {
      url: urlScore,
      about: aboutScore,
      keywords: keywordsScore,
      readability,
      structure: structureScore,
    },
    feedback,
  };
};

const LinkedInAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [about, setAbout] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recommended, setRecommended] = useState('');

  const result = useMemo(() => scoreProfile(url, about), [url, about]);

  const onAnalyze = () => {
    if (!url.trim()) {
      toast.error('Please paste your LinkedIn profile URL.');
      return;
    }
    setSubmitted(true);
    toast.success('Profile analyzed!');
  };

  const onGenerateRecommended = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      toast.error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.');
      return;
    }
    if (!url.trim() && !about.trim()) {
      toast.error('Provide a LinkedIn URL or About text for context.');
      return;
    }
    setGenerating(true);
    setRecommended('');
    try {
      const prompt = `You are a LinkedIn coach. Generate a professional, concise, first-person LinkedIn About section (120-180 words) with:
• Hooks in the first sentence
• 2-3 short paragraphs
• 3-5 bullet highlights with quantified impact when possible
• Clear industry keywords

Context:
URL: ${url || 'N/A'}
Current About (may be empty):\n${about || 'N/A'}

Constraints:
- Avoid buzzword stuffing
- Keep tone authentic and outcome-focused
- Use simple language and active voice`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9 }
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gemini API Error:', errorText);
        throw new Error('Gemini request failed');
      }
      const data = await res.json();
      console.log('Full Gemini response:', data);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        console.error('No content in response:', data);
        throw new Error('No content returned by Gemini');
      }
      setRecommended(text.trim());
      toast.success('Recommended About generated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate recommendation.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container mx-auto max-w-5xl space-y-8 py-8 px-4 relative z-10">
        <Header />

        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 backdrop-blur-sm rounded-full text-primary text-sm font-medium border border-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Linkedin className="h-4 w-4" />
            </motion.div>
            AI-Powered LinkedIn Analysis
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
          >
            LinkedIn Profile Analyzer
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Optimize your LinkedIn profile with AI-powered analysis and get personalized recommendations to boost your professional presence.
          </motion.p>
        </motion.div>

        {/* Main Analyzer Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
            <CardHeader>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 bg-primary/10 rounded-lg"
                >
                  <Target className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Profile Analysis</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Paste your LinkedIn profile URL and optionally your About section to get a quality score and actionable feedback.
                  </CardDescription>
                </div>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile URL
                </label>
                <Input 
                  placeholder="https://www.linkedin.com/in/yourname"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-border focus:border-primary transition-colors duration-300"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  About Section (optional)
                </label>
                <Textarea
                  placeholder="Paste your About section here for a deeper analysis..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="min-h-[160px] border-border focus:border-primary transition-colors duration-300"
                />
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Tip: Aim for 800–1200 characters, short paragraphs and 3–5 bullets.
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={onAnalyze} className="bg-gradient-primary text-white hover:opacity-90 font-semibold px-6 py-3 rounded-xl shadow-lg group">
                      <Target className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                      Analyze Profile
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={onGenerateRecommended} disabled={generating} variant="outline" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl border-2 hover:border-primary/50 transition-all duration-300">
                      <Wand2 className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                      {generating ? 'Generating…' : 'Generate Recommended About'}
                    </Button>
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-primary/20 text-primary">Vanity URL</Badge>
                  <Badge variant="outline" className="border-accent/20 text-accent">Readability</Badge>
                  <Badge variant="outline" className="border-success/20 text-success">Keywords</Badge>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {submitted && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-success/10 rounded-lg"
                  >
                    <Award className="h-5 w-5 text-success" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Your Profile Score</CardTitle>
                    <CardDescription>Overall quality based on URL, About content, structure, keywords, and readability</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Overall Score
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-lg font-bold text-primary"
                    >
                      {result.overall}%
                    </motion.div>
                  </div>
                  <Progress value={result.overall} className="h-3" />
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'url', label: 'URL', icon: Linkedin },
                    { key: 'about', label: 'About', icon: Sparkles },
                    { key: 'keywords', label: 'Keywords', icon: Target },
                    { key: 'readability', label: 'Readability', icon: CheckCircle },
                    { key: 'structure', label: 'Structure', icon: Award }
                  ].map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="p-4 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className="text-sm font-bold text-primary"
                        >
                          {result.details[item.key as keyof typeof result.details]}%
                        </motion.span>
                      </div>
                      <Progress value={result.details[item.key as keyof typeof result.details]} className="h-2" />
                    </motion.div>
                  ))}
                </div>

                {result.feedback.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-3 p-4 bg-background rounded-xl border border-border/50"
                  >
                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Suggestions
                    </div>
                    <ul className="space-y-2">
                      {result.feedback.map((f, i) => (
                        <motion.li
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {recommended && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-accent/10 rounded-lg"
                  >
                    <Wand2 className="h-5 w-5 text-accent" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Recommended About (AI)</CardTitle>
                    <CardDescription>Review and personalize before using on your profile</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Textarea value={recommended} readOnly className="min-h-[200px] border-border/50 focus:border-primary/50 transition-colors duration-300" />
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex justify-end"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl border-2 hover:border-primary/50 transition-all duration-300"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(recommended);
                          toast.success('Copied to clipboard');
                        } catch {
                          toast.error('Copy failed');
                        }
                      }}
                    >
                      <Clipboard className="h-4 w-4" /> Copy to Clipboard
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <Card className="bg-gradient-primary text-white border-0 shadow-2xl relative z-10">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Ready to Boost Your Career?
              </motion.div>
              
              <motion.h3
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Take Your Professional Presence to the Next Level
              </motion.h3>
              
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-white/80 mb-8 max-w-3xl mx-auto text-lg leading-relaxed"
              >
                Optimize your LinkedIn profile and discover personalized career paths with our AI-powered tools.
              </motion.p>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-50 font-bold px-8 py-4 rounded-xl shadow-lg group">
                    <Link to="/" className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Get Career Recommendations
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-6 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
                    <Link to="/insights" className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      View Industry Insights
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;


