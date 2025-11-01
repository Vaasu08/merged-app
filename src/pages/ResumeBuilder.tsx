import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserSkills } from '@/lib/profile';
import { skillsDatabase } from '@/data/careerData';
import { FileText, Download, Eye, ArrowLeft, User, GraduationCap, Briefcase, Award, Globe, AlertCircle, CheckCircle, Sparkles, Wand2, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { ATSScorer } from '@/lib/atsScorer';
import type { ParsedCV } from '@/lib/cvParser';
import { aiResumeEnhancer, type EnhancedResume } from '@/lib/aiResumeEnhancer';
import { BackButton } from '@/components/BackButton';




interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    isCurrent: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: number | null;
    isCurrent: boolean;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
  }>;
}

interface ATSDetails {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experience: number;
  education: number;
  formatting: number;
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    message: string;
  }>;
}

const ResumeBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
 
  // ATS Score state
  const [atsScore, setATSScore] = useState<number | null>(null);
  const [atsDetails, setATSDetails] = useState<ATSDetails | null>(null);
  const [showATSDetails, setShowATSDetails] = useState(false);

  const loadResumeData = useCallback(async () => {
    if (!user?.id) return;




    setIsLoading(true);
    try {
      const [profile, skills] = await Promise.all([
        getUserProfile(user.id),
        getUserSkills(user.id)
      ]);




      if (profile) {
        const skillsData = skills.map(skillId => {
          const skill = skillsDatabase.find(s => s.id === skillId);
          return skill?.name || skillId;
        });




        const resumeData: ResumeData = {
          personalInfo: {
            fullName: profile.full_name || user.user_metadata?.full_name || 'Your Name',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            website: profile.website || '',
            linkedin: profile.linkedin_url || '',
            github: profile.github_url || ''
          },
          summary: profile.bio || 'Professional with expertise in technology and innovation.',
          skills: skillsData,
          experience: (profile.experience || []).map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date || '',
            description: exp.description,
            location: exp.location || '',
            isCurrent: exp.is_current || false
          })),
          education: (profile.education || []).map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study,
            startDate: edu.start_date,
            endDate: edu.end_date || '',
            gpa: edu.gpa || null,
            isCurrent: edu.is_current || false
          })),
          certifications: (profile.certifications || []).map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            issueDate: cert.issue_date,
            expiryDate: cert.expiry_date || ''
          }))
        };




        setResumeData(resumeData);
      } else {
        toast.error('No profile data found. Please complete your profile first.');
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
      toast.error('Failed to load profile data for resume generation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, user?.user_metadata?.full_name]);

  const calculateATSScore = useCallback(() => {
    if (!resumeData) return;




    try {
      // Convert resume data to ParsedCV format
      const resumeText = generateResumeText();
      const experienceYears = calculateExperienceYears(resumeData.experience);
     
      const parsedResume: ParsedCV = {
        text: resumeText,
        skills: resumeData.skills,
        experience: resumeData.experience.map(exp =>
          `${exp.position} at ${exp.company}: ${exp.description}`
        ),
        education: resumeData.education.map(edu => edu.degree),
        confidence: 85,
        keywords: extractKeywords(resumeText),
        experienceYears,
        contactInfo: {
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          linkedin: resumeData.personalInfo.linkedin,
          location: resumeData.personalInfo.location,
        },
        sections: {
          summary: resumeData.summary,
          experience: resumeData.experience.map(e => e.description).join('\n'),
          education: resumeData.education.map(e => `${e.degree} - ${e.institution}`).join('\n'),
          skills: resumeData.skills.join(', '),
        }
      };




      // Calculate score
      const scores = ATSScorer.calculateScore(parsedResume);
      setATSScore(scores.overall);
      setATSDetails(scores);
    } catch (error) {
      console.error('ATS scoring error:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData]);

  const enhanceResumeWithAI = async () => {
    if (!resumeData) {
      toast.error('No resume data available');
      return;
    }
    
    console.log('Starting AI enhancement...');
    setIsEnhancing(true);
    const toastId = toast.loading('🤖 AI is enhancing your resume...');
    
    try {
      const enhanced = await aiResumeEnhancer.enhanceCompleteResume({
        personalInfo: resumeData.personalInfo,
        skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
        targetRole: resumeData.experience[0]?.position || 'Professional'
      });
      
      console.log('Enhancement complete!', enhanced);
      setEnhancedResume(enhanced);
      toast.success('✨ Resume enhanced successfully!', { id: toastId });
    } catch (error) {
      console.error('Enhancement error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed: ${errorMsg}`, { id: toastId });
    } finally {
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useEffect(() => {
    if (resumeData) {
      calculateATSScore();
    }
  }, [resumeData, calculateATSScore]);

  // Helper to generate resume text
  const generateResumeText = (): string => {
    if (!resumeData) return '';
   
    let text = `${resumeData.personalInfo.fullName}\n`;
    text += `${resumeData.personalInfo.email} ${resumeData.personalInfo.phone}\n`;
    text += `${resumeData.summary}\n\n`;
   
    text += 'SKILLS\n';
    text += resumeData.skills.join(', ') + '\n\n';
   
    text += 'EXPERIENCE\n';
    resumeData.experience.forEach(exp => {
      text += `${exp.position} at ${exp.company}\n`;
      text += `${exp.description}\n`;
    });
   
    text += '\nEDUCATION\n';
    resumeData.education.forEach(edu => {
      text += `${edu.degree} - ${edu.institution}\n`;
    });
   
    return text;
  };




  // Extract keywords helper
  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at']);
    return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))];
  };




  // Calculate experience years
  const calculateExperienceYears = (experience: ResumeData['experience']): number => {
    if (experience.length === 0) return 0;
   
    const years = experience.map(exp => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });
   
    return Math.round(years.reduce((sum, y) => sum + y, 0));
  };




  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 65) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };




  // Get score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    if (score >= 65) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  };




  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };




  const generatePDF = () => {
    if (!resumeData) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Professional 2-Column Layout Constants
      const sidebarWidth = 65;
      const sidebarColor: [number, number, number] = [62, 74, 94]; // #3E4A5E - Professional dark blue
      const accentColor: [number, number, number] = [41, 128, 185]; // #2980B9 - Blue accent
      const margin = 15;
      const mainContentX = sidebarWidth + margin;
      const mainContentWidth = pageWidth - sidebarWidth - margin * 2;
      
      // Draw sidebar background
      pdf.setFillColor(...sidebarColor);
      pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
      
      // === LEFT SIDEBAR ===
      let sidebarY = 20;
      
      // Name in sidebar
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const nameLines = pdf.splitTextToSize(resumeData.personalInfo.fullName, sidebarWidth - 10);
      pdf.text(nameLines, 10, sidebarY);
      sidebarY += nameLines.length * 7 + 5;
      
      // Target role/position from first experience
      if (resumeData.experience.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const roleLines = pdf.splitTextToSize(resumeData.experience[0].position, sidebarWidth - 10);
        pdf.text(roleLines, 10, sidebarY);
        sidebarY += roleLines.length * 5 + 10;
      }
      
      // Contact Information
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTACT', 10, sidebarY);
      sidebarY += 6;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      const contactItems = [
        { icon: '✉', text: resumeData.personalInfo.email },
        { icon: '☎', text: resumeData.personalInfo.phone },
        { icon: '📍', text: resumeData.personalInfo.location },
        { icon: '🌐', text: resumeData.personalInfo.website },
        { icon: 'in', text: resumeData.personalInfo.linkedin },
        { icon: 'git', text: resumeData.personalInfo.github }
      ].filter(item => item.text);
      
      contactItems.forEach(item => {
        const lines = pdf.splitTextToSize(item.text, sidebarWidth - 15);
        pdf.text(lines, 10, sidebarY);
        sidebarY += lines.length * 4.5 + 1;
      });
      
      sidebarY += 8;
      
      // Professional Summary in sidebar
      const summaryText = enhancedResume?.professionalSummary || resumeData.summary;
      if (summaryText) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROFESSIONAL SUMMARY', 10, sidebarY);
        sidebarY += 6;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(summaryText, sidebarWidth - 10);
        pdf.text(summaryLines, 10, sidebarY);
        sidebarY += summaryLines.length * 4 + 8;
      }
      
      // Key Skills in sidebar
      if (resumeData.skills.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KEY SKILLS', 10, sidebarY);
        sidebarY += 6;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        // Display skills with bullet points
        const skillsToDisplay = enhancedResume?.coreCompetencies || resumeData.skills;
        skillsToDisplay.slice(0, 12).forEach(skill => {
          if (sidebarY > pageHeight - 15) return;
          pdf.text('• ' + skill, 12, sidebarY);
          sidebarY += 4.5;
        });
      }
      
      // === MAIN CONTENT (RIGHT SIDE) ===
      let mainY = 20;
      
      pdf.setTextColor(0, 0, 0);
      
      // Professional Experience Section
      if (resumeData.experience.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...accentColor);
        pdf.text('PROFESSIONAL EXPERIENCE', mainContentX, mainY);
        mainY += 8;
        
        // Draw separator line
        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(0.5);
        pdf.line(mainContentX, mainY - 2, pageWidth - margin, mainY - 2);
        mainY += 3;
        
        pdf.setTextColor(0, 0, 0);
        
        resumeData.experience.forEach((exp, index) => {
          if (mainY > pageHeight - 40) {
            pdf.addPage();
            
            // Redraw sidebar on new page
            pdf.setFillColor(...sidebarColor);
            pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
            
            mainY = 20;
          }
          
          // Company name in blue
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...accentColor);
          pdf.text(exp.company, mainContentX, mainY);
          mainY += 5;
          
          // Position title
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(exp.position, mainContentX, mainY);
          mainY += 5;
          
          // Date range and location in italics
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(9);
          const dateRange = `${formatDate(exp.startDate)} - ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}`;
          const locationText = exp.location ? ` | ${exp.location}` : '';
          pdf.text(dateRange + locationText, mainContentX, mainY);
          mainY += 6;
          
          // Enhanced bullet points or regular description
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          
          const enhancedExp = enhancedResume?.experience?.find(
            e => e.company === exp.company && e.position === exp.position
          );
          
          if (enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0) {
            // Use AI-enhanced bullet points with metrics
            enhancedExp.bulletPoints.forEach(bullet => {
              if (mainY > pageHeight - 20) {
                pdf.addPage();
                pdf.setFillColor(...sidebarColor);
                pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
                mainY = 20;
              }
              
              const bulletLines = pdf.splitTextToSize('• ' + bullet, mainContentWidth);
              pdf.text(bulletLines, mainContentX, mainY);
              mainY += bulletLines.length * 4 + 1;
            });
          } else if (exp.description) {
            // Fallback to regular description
            const descLines = pdf.splitTextToSize('• ' + exp.description, mainContentWidth);
            pdf.text(descLines, mainContentX, mainY);
            mainY += descLines.length * 4 + 1;
          }
          
          mainY += 5; // Space between experiences
        });
        
        mainY += 5;
      }
      
      // Education Section
      if (resumeData.education.length > 0) {
        if (mainY > pageHeight - 40) {
          pdf.addPage();
          pdf.setFillColor(...sidebarColor);
          pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
          mainY = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...accentColor);
        pdf.text('EDUCATION', mainContentX, mainY);
        mainY += 8;
        
        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(0.5);
        pdf.line(mainContentX, mainY - 2, pageWidth - margin, mainY - 2);
        mainY += 3;
        
        pdf.setTextColor(0, 0, 0);
        
        resumeData.education.forEach((edu) => {
          if (mainY > pageHeight - 30) {
            pdf.addPage();
            pdf.setFillColor(...sidebarColor);
            pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
            mainY = 20;
          }
          
          // Institution in blue
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...accentColor);
          pdf.text(edu.institution, mainContentX, mainY);
          mainY += 5;
          
          // Degree
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          const degreeText = `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`;
          pdf.text(degreeText, mainContentX, mainY);
          mainY += 5;
          
          // Date range
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(9);
          const eduDateRange = `${formatDate(edu.startDate)} - ${edu.isCurrent ? 'Present' : formatDate(edu.endDate)}`;
          pdf.text(eduDateRange, mainContentX, mainY);
          
          // GPA on same line
          if (edu.gpa) {
            pdf.text(`GPA: ${edu.gpa}`, mainContentX + 50, mainY);
          }
          
          mainY += 6;
          
          // Enhanced coursework if available
          const enhancedEdu = enhancedResume?.education?.find(
            e => e.institution === edu.institution && e.degree === edu.degree
          );
          
          if (enhancedEdu?.relevantCoursework && enhancedEdu.relevantCoursework.length > 0) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const coursework = 'Coursework: ' + enhancedEdu.relevantCoursework.join(', ');
            const courseworkLines = pdf.splitTextToSize(coursework, mainContentWidth);
            pdf.text(courseworkLines, mainContentX, mainY);
            mainY += courseworkLines.length * 4;
          }
          
          mainY += 5;
        });
        
        mainY += 5;
      }
      
      // Certifications Section
      if (resumeData.certifications.length > 0) {
        if (mainY > pageHeight - 30) {
          pdf.addPage();
          pdf.setFillColor(...sidebarColor);
          pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
          mainY = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...accentColor);
        pdf.text('CERTIFICATIONS', mainContentX, mainY);
        mainY += 8;
        
        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(0.5);
        pdf.line(mainContentX, mainY - 2, pageWidth - margin, mainY - 2);
        mainY += 3;
        
        pdf.setTextColor(0, 0, 0);
        
        resumeData.certifications.forEach((cert) => {
          if (mainY > pageHeight - 20) {
            pdf.addPage();
            pdf.setFillColor(...sidebarColor);
            pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
            mainY = 20;
          }
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(cert.name, mainContentX, mainY);
          mainY += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const certLine = `${cert.issuer} | ${formatDate(cert.issueDate)}${cert.expiryDate ? ' - ' + formatDate(cert.expiryDate) : ''}`;
          pdf.text(certLine, mainContentX, mainY);
          mainY += 6;
        });
      }

      // Save the PDF
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate resume. Please try again.');
    }
  };




  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }




  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Profile Data Found</h2>
              <p className="text-muted-foreground mb-6">
                Please complete your profile first to generate a resume.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/profile" label="Back to Profile" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
              <p className="text-muted-foreground">Generate your professional resume from your profile data</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/ats-assessment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ATS Assessment
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>




        {/* ATS Score Card */}
        {atsScore !== null && (
          <Card className={`border-2 ${getScoreBg(atsScore)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    {atsScore >= 80 ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Current ATS Score
                      <Sparkles className="w-4 h-4 text-primary" />
                    </CardTitle>
                    <CardDescription>
                      {atsScore >= 80
                        ? 'Excellent! Your resume is highly ATS-compatible'
                        : atsScore >= 65
                        ? 'Good, but there\'s room for improvement'
                        : 'Consider improving for better ATS compatibility'}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                    {atsScore}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={atsScore} className="h-2" />
               
                {atsDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Keywords</div>
                      <div className="font-semibold">{atsDetails.keywordMatch.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Skills</div>
                      <div className="font-semibold">{atsDetails.skillsMatch.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Experience</div>
                      <div className="font-semibold">{atsDetails.experience.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Education</div>
                      <div className="font-semibold">{atsDetails.education.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Formatting</div>
                      <div className="font-semibold">{atsDetails.formatting.toFixed(0)}%</div>
                    </div>
                  </div>
                )}




                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowATSDetails(!showATSDetails)}
                >
                  {showATSDetails ? 'Hide Details' : 'Show Detailed Analysis'}
                </Button>




                {/* Detailed Suggestions */}
                {showATSDetails && atsDetails && atsDetails.suggestions && (
                  <div className="mt-4 space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Improvement Suggestions:</h4>
                    {atsDetails.suggestions.map((suggestion, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          suggestion.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-blue-100 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            {suggestion.priority}
                          </Badge>
                          <p className="flex-1">{suggestion.message}</p>
                        </div>
                      </div>
                    ))}
                   
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/ats-assessment')}
                      className="mt-2"
                    >
                      Get Full ATS Assessment →
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Enhancement Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Resume Enhancement
            </CardTitle>
            <CardDescription>
              {enhancedResume 
                ? '✨ Your resume has been enhanced with AI-powered professional summaries, quantified achievements, and optimized bullet points.' 
                : 'Use AI to transform your resume with compelling professional summaries, impact-driven bullet points, and quantified achievements.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedResume && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium">Enhancement Complete!</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Professional summary optimized</li>
                        <li>• {enhancedResume.experience?.reduce((sum, exp) => sum + (exp.bulletPoints?.length || 0), 0)} achievement-focused bullet points generated</li>
                        <li>• Core competencies extracted and highlighted</li>
                        <li>• Quantified metrics and impact statements added</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <Button
                size="lg"
                className="w-full"
                variant={enhancedResume ? "outline" : "default"}
                onClick={enhanceResumeWithAI}
                disabled={!resumeData || isEnhancing}
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI is analyzing and enhancing your resume...
                  </>
                ) : enhancedResume ? (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Regenerate AI Enhancement
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Enhance with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-5 h-5 mr-2" />
            {showPreview ? 'Hide Preview' : 'Preview Resume'}
          </Button>
          <Button
            size="lg"
            onClick={generatePDF}
            disabled={!resumeData}
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </Button>
        </div>




        {/* Resume Preview */}
        {showPreview && resumeData && (
          <div className="mt-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume Preview</CardTitle>
                  <Badge variant="outline">Professional 2-Column Template</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
                  {/* Professional 2-Column Preview */}
                  <div className="flex">
                    {/* Left Sidebar */}
                    <div className="w-1/3 bg-[#3E4A5E] text-white p-6 space-y-6">
                      {/* Name and Title */}
                      <div>
                        <h1 className="text-xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        {resumeData.experience.length > 0 && (
                          <p className="text-sm opacity-90">{resumeData.experience[0].position}</p>
                        )}
                      </div>

                      {/* Contact */}
                      <div>
                        <h3 className="text-sm font-bold mb-2">CONTACT</h3>
                        <div className="text-xs space-y-1.5">
                          {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
                          {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                          {resumeData.personalInfo.location && <p>{resumeData.personalInfo.location}</p>}
                          {resumeData.personalInfo.linkedin && <p className="break-words">{resumeData.personalInfo.linkedin}</p>}
                        </div>
                      </div>

                      {/* Summary */}
                      {(enhancedResume?.professionalSummary || resumeData.summary) && (
                        <div>
                          <h3 className="text-sm font-bold mb-2">SUMMARY</h3>
                          <p className="text-xs leading-relaxed">{enhancedResume?.professionalSummary || resumeData.summary}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold mb-2">KEY SKILLS</h3>
                          <ul className="text-xs space-y-1">
                            {(enhancedResume?.coreCompetencies || resumeData.skills).slice(0, 12).map((skill, index) => (
                              <li key={index}>• {skill}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right Main Content */}
                    <div className="w-2/3 p-6 space-y-6">
                      {/* Experience */}
                      {resumeData.experience.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-[#2980B9] mb-3 pb-1 border-b-2 border-[#2980B9]">PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-4">
                            {resumeData.experience.map((exp, index) => {
                              const enhancedExp = enhancedResume?.experience?.find(
                                e => e.company === exp.company && e.position === exp.position
                              );
                              return (
                                <div key={index}>
                                  <h3 className="font-bold text-[#2980B9]">{exp.company}</h3>
                                  <p className="font-semibold text-sm">{exp.position}</p>
                                  <p className="text-xs italic text-gray-600 mb-2">
                                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                                    {exp.location && ` | ${exp.location}`}
                                  </p>
                                  {enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0 ? (
                                    <ul className="text-xs space-y-1 ml-4">
                                      {enhancedExp.bulletPoints.map((bullet, i) => (
                                        <li key={i} className="list-disc">{bullet}</li>
                                      ))}
                                    </ul>
                                  ) : exp.description && (
                                    <p className="text-xs text-gray-700">{exp.description}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {resumeData.education.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-[#2980B9] mb-3 pb-1 border-b-2 border-[#2980B9]">EDUCATION</h2>
                          <div className="space-y-3">
                            {resumeData.education.map((edu, index) => {
                              const enhancedEdu = enhancedResume?.education?.find(
                                e => e.institution === edu.institution && e.degree === edu.degree
                              );
                              return (
                                <div key={index}>
                                  <h3 className="font-bold text-[#2980B9]">{edu.institution}</h3>
                                  <p className="text-sm">{edu.degree}{edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}</p>
                                  <p className="text-xs italic text-gray-600">
                                    {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                                  </p>
                                  {enhancedEdu?.relevantCoursework && enhancedEdu.relevantCoursework.length > 0 && (
                                    <p className="text-xs text-gray-700 mt-1">
                                      <span className="font-semibold">Coursework:</span> {enhancedEdu.relevantCoursework.join(', ')}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-[#2980B9] mb-3 pb-1 border-b-2 border-[#2980B9]">CERTIFICATIONS</h2>
                          <div className="space-y-2">
                            {resumeData.certifications.map((cert, index) => (
                              <div key={index}>
                                <p className="font-semibold text-sm">{cert.name}</p>
                                <p className="text-xs text-gray-700">{cert.issuer} | {formatDate(cert.issueDate)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;

