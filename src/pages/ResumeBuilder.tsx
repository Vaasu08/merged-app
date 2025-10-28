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
import { FileText, Download, Eye, ArrowLeft, User, GraduationCap, Briefcase, Award, Globe, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import { ATSScorer } from '@/lib/atsScorer';
import type { ParsedCV } from '@/lib/cvParser';




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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic'>('modern');
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
     
      let yPosition = 20;




      // Modern Template
      if (selectedTemplate === 'modern') {
        // Header with background
        pdf.setFillColor(41, 128, 185);
        pdf.rect(0, 0, pageWidth, 35, 'F');
       
        // Name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(resumeData.personalInfo.fullName, 20, 25);
       
        // Contact info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const contactInfo = [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.location,
          resumeData.personalInfo.website,
          resumeData.personalInfo.linkedin,
          resumeData.personalInfo.github
        ].filter(Boolean).join(' | ');
       
        if (contactInfo) {
          pdf.text(contactInfo, 20, 32);
        }




        yPosition = 50;




        // Summary
        if (resumeData.summary) {
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('SUMMARY', 20, yPosition);
          yPosition += 8;
         
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const summaryLines = pdf.splitTextToSize(resumeData.summary, pageWidth - 40);
          pdf.text(summaryLines, 20, yPosition);
          yPosition += summaryLines.length * 4 + 10;
        }




        // Skills
        if (resumeData.skills.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('SKILLS', 20, yPosition);
          yPosition += 8;
         
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const skillsText = resumeData.skills.join(' • ');
          const skillsLines = pdf.splitTextToSize(skillsText, pageWidth - 40);
          pdf.text(skillsLines, 20, yPosition);
          yPosition += skillsLines.length * 4 + 10;
        }




        // Experience
        if (resumeData.experience.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EXPERIENCE', 20, yPosition);
          yPosition += 8;
         
          resumeData.experience.forEach((exp, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(exp.position, 20, yPosition);
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const companyAndLocation = [exp.company, exp.location].filter(Boolean).join(', ');
            pdf.text(companyAndLocation, 20, yPosition + 5);
           
            const dateRange = `${formatDate(exp.startDate)} - ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}`;
            pdf.text(dateRange, pageWidth - 80, yPosition + 5);
           
            yPosition += 12;
           
            if (exp.description) {
              const descLines = pdf.splitTextToSize(exp.description, pageWidth - 40);
              pdf.text(descLines, 20, yPosition);
              yPosition += descLines.length * 4 + 5;
            }
           
            if (index < resumeData.experience.length - 1) {
              yPosition += 3;
            }
          });
         
          yPosition += 10;
        }




        // Education
        if (resumeData.education.length > 0) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
         
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EDUCATION', 20, yPosition);
          yPosition += 8;
         
          resumeData.education.forEach((edu) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(edu.degree, 20, yPosition);
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const institutionAndField = [edu.institution, edu.fieldOfStudy].filter(Boolean).join(', ');
            pdf.text(institutionAndField, 20, yPosition + 5);
           
            const dateRange = `${formatDate(edu.startDate)} - ${edu.isCurrent ? 'Present' : formatDate(edu.endDate)}`;
            pdf.text(dateRange, pageWidth - 80, yPosition + 5);
           
            if (edu.gpa) {
              pdf.text(`GPA: ${edu.gpa}`, 20, yPosition + 10);
              yPosition += 15;
            } else {
              yPosition += 12;
            }
          });
         
          yPosition += 10;
        }




        // Certifications
        if (resumeData.certifications.length > 0) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
         
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CERTIFICATIONS', 20, yPosition);
          yPosition += 8;
         
          resumeData.certifications.forEach((cert) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(cert.name, 20, yPosition);
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(cert.issuer, 20, yPosition + 5);
           
            const issueDate = formatDate(cert.issueDate);
            pdf.text(issueDate, pageWidth - 80, yPosition + 5);
           
            yPosition += 12;
          });
        }
      } else if (selectedTemplate === 'classic') {
        // Classic Template - Traditional, simple, single-column format
       
        // Header - Name and Contact Info
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(resumeData.personalInfo.fullName, 20, yPosition);
        yPosition += 8;
       
        // Contact info in a simple format
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const contactInfo = [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.location,
          resumeData.personalInfo.website,
          resumeData.personalInfo.linkedin,
          resumeData.personalInfo.github
        ].filter(Boolean).join(' | ');
       
        if (contactInfo) {
          pdf.text(contactInfo, 20, yPosition);
        }
       
        yPosition += 15;




        // Summary/Objective
        if (resumeData.summary) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('OBJECTIVE', 20, yPosition);
          yPosition += 8;
         
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const summaryLines = pdf.splitTextToSize(resumeData.summary, pageWidth - 40);
          pdf.text(summaryLines, 20, yPosition);
          yPosition += summaryLines.length * 4 + 10;
        }




        // Education (Classic format puts education before experience)
        if (resumeData.education.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EDUCATION', 20, yPosition);
          yPosition += 8;
         
          resumeData.education.forEach((edu) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(edu.degree, 20, yPosition);
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const institutionAndField = [edu.institution, edu.fieldOfStudy].filter(Boolean).join(', ');
            pdf.text(institutionAndField, 20, yPosition + 5);
           
            const dateRange = `${formatDate(edu.startDate)} - ${edu.isCurrent ? 'Present' : formatDate(edu.endDate)}`;
            pdf.text(dateRange, pageWidth - 80, yPosition + 5);
           
            if (edu.gpa) {
              pdf.text(`GPA: ${edu.gpa}`, 20, yPosition + 10);
              yPosition += 15;
            } else {
              yPosition += 12;
            }
          });
         
          yPosition += 10;
        }




        // Work Experience
        if (resumeData.experience.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EXPERIENCE', 20, yPosition);
          yPosition += 8;
         
          resumeData.experience.forEach((exp, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(exp.position, 20, yPosition);
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const companyAndLocation = [exp.company, exp.location].filter(Boolean).join(', ');
            pdf.text(companyAndLocation, 20, yPosition + 5);
           
            const dateRange = `${formatDate(exp.startDate)} - ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}`;
            pdf.text(dateRange, pageWidth - 80, yPosition + 5);
           
            yPosition += 12;
           
            if (exp.description) {
              const descLines = pdf.splitTextToSize(exp.description, pageWidth - 40);
              pdf.text(descLines, 20, yPosition);
              yPosition += descLines.length * 4 + 5;
            }
           
            if (index < resumeData.experience.length - 1) {
              yPosition += 3;
            }
          });
         
          yPosition += 10;
        }




        // Skills
        if (resumeData.skills.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('SKILLS', 20, yPosition);
          yPosition += 8;
         
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const skillsText = resumeData.skills.join(' • ');
          const skillsLines = pdf.splitTextToSize(skillsText, pageWidth - 40);
          pdf.text(skillsLines, 20, yPosition);
          yPosition += skillsLines.length * 4 + 10;
        }




        // Certifications
        if (resumeData.certifications.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CERTIFICATIONS', 20, yPosition);
          yPosition += 8;
         
          resumeData.certifications.forEach((cert) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
           
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(cert.name, 20, yPosition);
           
            const dateRange = `${formatDate(cert.issueDate)}${cert.expiryDate ? ` - ${formatDate(cert.expiryDate)}` : ''}`;
            pdf.text(dateRange, pageWidth - 80, yPosition);
           
            yPosition += 8;
          });
        }
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
            <p className="text-muted-foreground">Generate your professional resume from your profile data</p>
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




        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Template</CardTitle>
            <CardDescription>Select a professional template for your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === 'modern'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate('modern')}
              >
                <div className="text-center">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Modern</h3>
                  <p className="text-sm text-muted-foreground">Clean, professional design with blue accent</p>
                  <Badge variant="outline" className="mt-2">ATS Score: 95/100</Badge>
                </div>
              </div>
             
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === 'classic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate('classic')}
              >
                <div className="text-center">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Classic</h3>
                  <p className="text-sm text-muted-foreground">Traditional, timeless design</p>
                  <Badge variant="outline" className="mt-2">ATS Score: 100/100</Badge>
                </div>
              </div>
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
                  <Badge variant="outline">{selectedTemplate === 'modern' ? 'Modern' : 'Classic'} Template</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
                  {/* Modern Template Preview */}
                  {selectedTemplate === 'modern' ? (
                    <div className="p-8 space-y-6">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg -m-8 mb-4">
                        <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                          {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                          {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
                          {resumeData.personalInfo.website && <span>• {resumeData.personalInfo.website}</span>}
                          {resumeData.personalInfo.linkedin && <span>• LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                          {resumeData.personalInfo.github && <span>• GitHub: {resumeData.personalInfo.github}</span>}
                        </div>
                      </div>


                      {/* Summary */}
                      {resumeData.summary && (
                        <div>
                          <h2 className="text-xl font-bold mb-2 text-gray-800">SUMMARY</h2>
                          <p className="text-gray-700">{resumeData.summary}</p>
                        </div>
                      )}


                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold mb-2 text-gray-800">SKILLS</h2>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-sm">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Experience */}
                      {resumeData.experience.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold mb-3 text-gray-800">EXPERIENCE</h2>
                          <div className="space-y-4">
                            {resumeData.experience.map((exp, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-semibold text-lg">{exp.position}</h3>
                                    <p className="text-blue-600">{exp.company}{exp.location && `, ${exp.location}`}</p>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                                  </span>
                                </div>
                                {exp.description && (
                                  <p className="text-gray-700 mt-2">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Education */}
                      {resumeData.education.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold mb-3 text-gray-800">EDUCATION</h2>
                          <div className="space-y-3">
                            {resumeData.education.map((edu, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{edu.degree}</h3>
                                    <p className="text-gray-700">{edu.institution}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</p>
                                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Certifications */}
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold mb-3 text-gray-800">CERTIFICATIONS</h2>
                          <div className="space-y-3">
                            {resumeData.certifications.map((cert, index) => (
                              <div key={index} className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{cert.name}</h3>
                                  <p className="text-gray-700">{cert.issuer}</p>
                                </div>
                                <span className="text-sm text-gray-600">{formatDate(cert.issueDate)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Classic Template Preview */
                    <div className="p-8 space-y-6">
                      {/* Header */}
                      <div className="text-center border-b-2 border-gray-300 pb-4">
                        <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        <div className="flex flex-wrap gap-2 text-sm justify-center text-gray-600">
                          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                          {resumeData.personalInfo.phone && <span>| {resumeData.personalInfo.phone}</span>}
                          {resumeData.personalInfo.location && <span>| {resumeData.personalInfo.location}</span>}
                          {resumeData.personalInfo.website && <span>| {resumeData.personalInfo.website}</span>}
                          {resumeData.personalInfo.linkedin && <span>| LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                          {resumeData.personalInfo.github && <span>| GitHub: {resumeData.personalInfo.github}</span>}
                        </div>
                      </div>


                      {/* Summary/Objective */}
                      {resumeData.summary && (
                        <div>
                          <h2 className="text-lg font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">OBJECTIVE</h2>
                          <p className="text-gray-700">{resumeData.summary}</p>
                        </div>
                      )}


                      {/* Education */}
                      {resumeData.education.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold mb-3 text-gray-800 border-b border-gray-300 pb-1">EDUCATION</h2>
                          <div className="space-y-3">
                            {resumeData.education.map((edu, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{edu.degree}</h3>
                                    <p className="text-gray-700">{edu.institution}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</p>
                                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Experience */}
                      {resumeData.experience.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold mb-3 text-gray-800 border-b border-gray-300 pb-1">EXPERIENCE</h2>
                          <div className="space-y-4">
                            {resumeData.experience.map((exp, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="font-semibold">{exp.position}</h3>
                                    <p className="text-gray-700">{exp.company}{exp.location && `, ${exp.location}`}</p>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                                  </span>
                                </div>
                                {exp.description && (
                                  <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">SKILLS</h2>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-sm">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Certifications */}
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold mb-3 text-gray-800 border-b border-gray-300 pb-1">CERTIFICATIONS</h2>
                          <div className="space-y-2">
                            {resumeData.certifications.map((cert, index) => (
                              <div key={index} className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{cert.name}</p>
                                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                                </div>
                                <span className="text-sm text-gray-600">{formatDate(cert.issueDate)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

