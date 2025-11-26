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
import { FileText, Download, Eye, ArrowLeft, User, GraduationCap, Briefcase, Award, Globe, AlertCircle, CheckCircle, Sparkles, Wand2, Loader2, LayoutTemplate, ArrowUp, ArrowDown, Move, Target, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import { ATSScorerAI } from '@/lib/atsScorerAI';
import type { ParsedCV } from '@/lib/cvParser';
import { aiResumeEnhancer, type EnhancedResume } from '@/lib/aiResumeEnhancer';
import { BackButton } from '@/components/BackButton';
import { resumeAnalyticsService } from '@/lib/resumeAnalytics';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
    priority: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    impact?: string;
    action?: string;
  }>;
}

type TemplateType = 'ada' | 'hedy' | 'alan' | 'grace';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('ada');
  const [accentColor, setAccentColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('helvetica');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sectionOrder, setSectionOrder] = useState<string[]>(['education', 'skills', 'experience', 'projects']);
  const [lineSpacing, setLineSpacing] = useState<'compact' | 'standard' | 'comfortable'>('standard');
  const [showIcons, setShowIcons] = useState(true);
  const [pageMargins, setPageMargins] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [headerStyle, setHeaderStyle] = useState<'centered' | 'left' | 'two-column'>('centered');
  const [sectionStyle, setSectionStyle] = useState<'underline' | 'box' | 'bold'>('underline');
 
  // Debounced values for performance
  const debouncedAccentColor = useDebounce(accentColor, 300);
  const debouncedFontFamily = useDebounce(fontFamily, 300);
  const debouncedFontSize = useDebounce(fontSize, 300);
  const debouncedLineSpacing = useDebounce(lineSpacing, 300);

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

      console.log('Loaded profile data:', profile);
      console.log('Profile education:', profile?.education);
      console.log('Profile experience:', profile?.experience);
      console.log('Profile certifications:', profile?.certifications);

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
          skills: skillsData.length > 0 ? skillsData : [],
          experience: Array.isArray(profile.experience) && profile.experience.length > 0
            ? profile.experience.map(exp => ({
                company: exp.company || '',
                position: exp.position || '',
                startDate: exp.start_date || '',
                endDate: exp.end_date || '',
                description: exp.description || '',
                location: exp.location || '',
                isCurrent: exp.is_current || false
              }))
            : [],
          education: Array.isArray(profile.education) && profile.education.length > 0
            ? profile.education.map(edu => ({
                institution: edu.institution || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.field_of_study || '',
                startDate: edu.start_date || '',
                endDate: edu.end_date || '',
                gpa: edu.gpa || null,
                isCurrent: edu.is_current || false
              }))
            : [],
          certifications: Array.isArray(profile.certifications) && profile.certifications.length > 0
            ? profile.certifications.map(cert => ({
                name: cert.name || '',
                issuer: cert.issuer || '',
                issueDate: cert.issue_date || '',
                expiryDate: cert.expiry_date || ''
              }))
            : []
        };

        console.log('Constructed resume data:', resumeData);
        console.log('Resume education count:', resumeData.education.length);
        console.log('Resume experience count:', resumeData.experience.length);
        console.log('Resume certifications count:', resumeData.certifications.length);

        setResumeData(resumeData);
        
        if (resumeData.education.length === 0 && resumeData.experience.length === 0) {
          toast.info('Complete your profile with education and experience to build a better resume', { duration: 5000 });
        }
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

  const calculateATSScore = useCallback(async () => {
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




      // Calculate score with AI
      const scorer = new ATSScorerAI();
      const scores = await scorer.calculateScore(parsedResume);
      setATSScore(scores.overall);
      setATSDetails(scores);

      // Track ATS score analytics
      if (user?.id) {
        await resumeAnalyticsService.trackATSScore(
          user.id,
          'current-resume',
          scores.overall,
          ['template:' + selectedTemplate, 'skills:' + resumeData.skills.length, 'experience:' + experienceYears]
        );
      }
    } catch (error) {
      console.error('ATS scoring error:', error);
      toast.error('Failed to calculate ATS score. Please try again.');
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const setAccentColorPDF = (pdf: jsPDF, color: string) => {
    const rgb = hexToRgb(color);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
  };

  const getMarginSize = () => {
    if (pageMargins === 'narrow') return 15;
    if (pageMargins === 'wide') return 25;
    return 20; // normal
  };

  const getFontSizeMultiplier = () => {
    if (fontSize === 'small') return 0.9;
    if (fontSize === 'large') return 1.1;
    return 1.0; // medium
  };

  const getLineSpacingMultiplier = () => {
    if (lineSpacing === 'compact') return 0.8;
    if (lineSpacing === 'comfortable') return 1.2;
    return 1.0; // standard
  };

  const drawSectionHeader = (pdf: jsPDF, text: string, x: number, y: number, pageWidth: number, margin: number) => {
    const fontSizeMult = getFontSizeMultiplier();
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(11 * fontSizeMult);
    setAccentColorPDF(pdf, accentColor);
    pdf.text(text, x, y);
    pdf.setTextColor(0, 0, 0);
    
    if (sectionStyle === 'underline') {
      pdf.setDrawColor(hexToRgb(accentColor).r, hexToRgb(accentColor).g, hexToRgb(accentColor).b);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      pdf.setDrawColor(0, 0, 0);
    } else if (sectionStyle === 'box') {
      const rgb = hexToRgb(accentColor);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b, 0.1);
      pdf.rect(margin - 2, y - 6, pageWidth - 2 * margin + 4, 8, 'F');
    }
    // 'bold' style doesn't need additional decoration
  };


  const generateAdaPDF = (pdf: jsPDF) => {
    if (!resumeData) return;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = getMarginSize();
    const fontSizeMult = getFontSizeMultiplier();
    const spacingMult = getLineSpacingMultiplier();
    let y = 30;

    // Set global font
    pdf.setFont(fontFamily);

    // Header based on style
    if (headerStyle === 'centered') {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(20 * fontSizeMult);
      setAccentColorPDF(pdf, accentColor);
      pdf.text(resumeData.personalInfo.fullName, pageWidth / 2, y, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      y += 8 * spacingMult;

      pdf.setFont(fontFamily, 'normal');
      pdf.setFontSize(10 * fontSizeMult);
      const contact = [
        resumeData.personalInfo.phone,
        resumeData.personalInfo.email,
        resumeData.personalInfo.linkedin ? 'LinkedIn' : '',
        resumeData.personalInfo.github ? 'GitHub' : ''
      ].filter(Boolean).join(' | ');
      pdf.text(contact, pageWidth / 2, y, { align: 'center' });
      y += 15 * spacingMult;
    } else if (headerStyle === 'left') {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(20 * fontSizeMult);
      setAccentColorPDF(pdf, accentColor);
      pdf.text(resumeData.personalInfo.fullName, margin, y);
      pdf.setTextColor(0, 0, 0);
      y += 8 * spacingMult;

      pdf.setFont(fontFamily, 'normal');
      pdf.setFontSize(9 * fontSizeMult);
      const contacts = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.linkedin,
        resumeData.personalInfo.github
      ].filter(Boolean);
      contacts.forEach(contact => {
        pdf.text(contact, margin, y);
        y += 5 * spacingMult;
      });
      y += 5 * spacingMult;
    } else { // two-column
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(18 * fontSizeMult);
      setAccentColorPDF(pdf, accentColor);
      pdf.text(resumeData.personalInfo.fullName, margin, y);
      pdf.setTextColor(0, 0, 0);
      
      pdf.setFont(fontFamily, 'normal');
      pdf.setFontSize(9 * fontSizeMult);
      const contact = [resumeData.personalInfo.email, resumeData.personalInfo.phone].filter(Boolean).join(' | ');
      pdf.text(contact, pageWidth - margin, y, { align: 'right' });
      y += 12 * spacingMult;
    }

    // EDUCATION
    if (resumeData.education.length > 0) {
      drawSectionHeader(pdf, 'EDUCATION', margin, y, pageWidth, margin);
      y += (sectionStyle === 'underline' ? 8 : 10) * spacingMult;

      resumeData.education.forEach(edu => {
        if (y > pageHeight - 20) { pdf.addPage(); y = 20; }
        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(10 * fontSizeMult);
        pdf.text(edu.institution + ' | Chapel Hill, NC', margin, y);
        pdf.text(formatDate(edu.startDate) + ' ' + (edu.isCurrent ? 'Present' : formatDate(edu.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5 * spacingMult;

        pdf.setFont(fontFamily, 'italic');
        pdf.setFontSize(10 * fontSizeMult);
        const degreeText = `${edu.degree}${edu.fieldOfStudy ? ', Minors in ' + edu.fieldOfStudy : ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`;
        pdf.text(degreeText, margin, y);
        y += 8 * spacingMult;
      });
      y += 5 * spacingMult;
    }

    // TECHNICAL SKILLS
    if (resumeData.skills.length > 0) {
      if (y > pageHeight - 40) { pdf.addPage(); y = 20; }

      drawSectionHeader(pdf, 'TECHNICAL SKILLS', margin, y, pageWidth, margin);
      y += (sectionStyle === 'underline' ? 8 : 10) * spacingMult;

      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(10 * fontSizeMult);
      pdf.text('Languages (ordered by proficiency): ', margin, y);
      
      pdf.setFont(fontFamily, 'normal');
      const skillsText = (enhancedResume?.coreCompetencies || resumeData.skills).join(', ');
      const skillsLines = pdf.splitTextToSize(skillsText, pageWidth - margin * 2 - 70);
      pdf.text(skillsLines, margin + 70, y);
      y += (skillsLines.length * 5 + 10) * spacingMult;
    }

    // RELEVANT EXPERIENCE
    if (resumeData.experience.length > 0) {
      if (y > pageHeight - 40) { pdf.addPage(); y = 20; }

      drawSectionHeader(pdf, 'RELEVANT EXPERIENCE', margin, y, pageWidth, margin);
      y += (sectionStyle === 'underline' ? 8 : 10) * spacingMult;

      resumeData.experience.forEach(exp => {
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(10 * fontSizeMult);
        pdf.text(exp.company + ' | ' + (exp.location || ''), margin, y);
        pdf.text(formatDate(exp.startDate) + ' - ' + (exp.isCurrent ? 'Present' : formatDate(exp.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5 * spacingMult;

        pdf.setFont(fontFamily, 'italic');
        pdf.text(exp.position, margin, y);
        y += 5 * spacingMult;

        const enhancedExp = enhancedResume?.experience?.find(
          e => e.company === exp.company && e.position === exp.position
        );

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(9 * fontSizeMult);
        if (enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0) {
          enhancedExp.bulletPoints.forEach(bullet => {
            const lines = pdf.splitTextToSize('• ' + bullet, pageWidth - margin * 2 - 5);
            pdf.text(lines, margin + 5, y);
            y += lines.length * 4.5 * spacingMult;
          });
        } else if (exp.description) {
          const lines = pdf.splitTextToSize('• ' + exp.description, pageWidth - margin * 2 - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 4.5 * spacingMult;
        }
        y += 5 * spacingMult;
      });
    }

    // PROJECTS
    if (y > pageHeight - 30) { pdf.addPage(); y = 20; }
    drawSectionHeader(pdf, 'PROJECTS', margin, y, pageWidth, margin);
  };

  const generateHedyPDF = (pdf: jsPDF) => {
    if (!resumeData) return;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;
    
    const spacingMultiplier = lineSpacing === 'compact' ? 0.8 : lineSpacing === 'comfortable' ? 1.2 : 1.0;

    // Header - Name centered
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(18);
    setAccentColorPDF(pdf, accentColor);
    pdf.text(resumeData.personalInfo.fullName, pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    y += 8 * spacingMultiplier;

    // Contact info centered with hyperlink style
    pdf.setFont(fontFamily, 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 255); // Blue for hyperlink look
    const contact = [
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.linkedin ? 'LinkedIn' : '',
      resumeData.personalInfo.github ? 'GitHub' : ''
    ].filter(Boolean).join(' | ');
    pdf.text(contact, pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0, 0, 0); // Back to black
    y += 15 * spacingMultiplier;

    const renderEducation = () => {
        if (resumeData.education.length === 0) return;
        
        if (y > pageHeight - 40) { pdf.addPage(); y = 20; }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(11);
        setAccentColorPDF(pdf, accentColor);
        pdf.text('EDUCATION', margin, y);
        pdf.setTextColor(0, 0, 0);
        y += 2 * spacingMultiplier;
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6 * spacingMultiplier;

        resumeData.education.forEach(edu => {
            if (y > pageHeight - 20) { pdf.addPage(); y = 20; }
            pdf.setFont(fontFamily, 'bold');
            pdf.setFontSize(10);
            pdf.text('The ' + edu.institution, margin, y);
            pdf.text(formatDate(edu.startDate) + ' - ' + (edu.isCurrent ? 'Present' : formatDate(edu.endDate)), pageWidth - margin, y, { align: 'right' });
            y += 5 * spacingMultiplier;

            pdf.setFont(fontFamily, 'normal');
            pdf.setFontSize(10);
            const degreeText = `${edu.degree}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`;
            pdf.text(degreeText, margin, y);
            y += 10 * spacingMultiplier;
        });
    };

    const renderSkills = () => {
        if (resumeData.skills.length === 0) return;
        
        if (y > pageHeight - 40) { pdf.addPage(); y = 20; }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(11);
        setAccentColorPDF(pdf, accentColor);
        pdf.text('TECHNICAL SKILLS', margin, y);
        pdf.setTextColor(0, 0, 0);
        y += 2 * spacingMultiplier;
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6 * spacingMultiplier;

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(10);
        const skills = (enhancedResume?.coreCompetencies || resumeData.skills).join(', ');
        const skillsLines = pdf.splitTextToSize(skills, pageWidth - margin * 2);
        pdf.text(skillsLines, margin, y);
        y += (skillsLines.length * 5 + 10) * spacingMultiplier;
    };

    const renderExperience = () => {
        if (resumeData.experience.length === 0) return;
        
        if (y > pageHeight - 40) { pdf.addPage(); y = 20; }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(11);
        setAccentColorPDF(pdf, accentColor);
        pdf.text('PROFESSIONAL EXPERIENCE', margin, y);
        pdf.setTextColor(0, 0, 0);
        y += 2 * spacingMultiplier;
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6 * spacingMultiplier;

        resumeData.experience.forEach(exp => {
            if (y > pageHeight - 40) {
            pdf.addPage();
            y = 20;
            }
            
            pdf.setFont(fontFamily, 'bold');
            pdf.setFontSize(10);
            pdf.text(exp.position + ' | ' + exp.company + ' | ' + (exp.location || 'Chapel Hill, NC'), margin, y);
            pdf.text(formatDate(exp.startDate) + ' - ' + (exp.isCurrent ? 'Present' : formatDate(exp.endDate)), pageWidth - margin, y, { align: 'right' });
            y += 5 * spacingMultiplier;

            const enhancedExp = enhancedResume?.experience?.find(
            e => e.company === exp.company && e.position === exp.position
            );

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            if (enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0) {
            enhancedExp.bulletPoints.forEach(bullet => {
                const lines = pdf.splitTextToSize('• ' + bullet, pageWidth - margin * 2 - 5);
                if (y + lines.length * 4.5 > pageHeight - 20) { pdf.addPage(); y = 20; }
                pdf.text(lines, margin + 5, y);
                y += lines.length * 4.5 * spacingMultiplier;
            });
            } else if (exp.description) {
            const lines = pdf.splitTextToSize('• ' + exp.description, pageWidth - margin * 2 - 5);
            if (y + lines.length * 4.5 > pageHeight - 20) { pdf.addPage(); y = 20; }
            pdf.text(lines, margin + 5, y);
            y += lines.length * 4.5 * spacingMultiplier;
            }
            y += 5 * spacingMultiplier;
        });
    };

    const renderProjects = () => {
        // PROJECTS (if any)
        if (y > pageHeight - 40) { pdf.addPage(); y = 20; }
        y += 3 * spacingMultiplier;
        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(11);
        pdf.text('PROJECTS', margin, y);
        y += 2 * spacingMultiplier;
        pdf.line(margin, y, pageWidth - margin, y);
    };

    const sectionRenderers: Record<string, () => void> = {
        education: renderEducation,
        skills: renderSkills,
        experience: renderExperience,
        projects: renderProjects
    };

    sectionOrder.forEach(section => {
        if (sectionRenderers[section]) sectionRenderers[section]();
    });
  };

  const generateAlanPDF = (pdf: jsPDF) => {
    if (!resumeData) return;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;

    // Header - Name centered
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(18);
    setAccentColorPDF(pdf, accentColor);
    pdf.text(resumeData.personalInfo.fullName, pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    y += 8;

    // Contact with brackets [Email] | [Phone] | [LinkedIn]
    pdf.setFont(fontFamily, 'normal');
    pdf.setFontSize(10);
    const contactParts: string[] = [];
    if (resumeData.personalInfo.email) contactParts.push('[' + resumeData.personalInfo.email + ']');
    if (resumeData.personalInfo.phone) contactParts.push('[' + resumeData.personalInfo.phone + ']');
    if (resumeData.personalInfo.linkedin) contactParts.push('[LinkedIn]');
    const contact = contactParts.join(' | ');
    pdf.text(contact, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // EDUCATION
    if (resumeData.education.length > 0) {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(11);
      setAccentColorPDF(pdf, accentColor);
      pdf.text('EDUCATION', margin, y);
      pdf.setTextColor(0, 0, 0);
      y += 2;
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      resumeData.education.forEach(edu => {
        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(10);
        pdf.text('The ' + edu.institution + ', Chapel Hill, NC', margin, y);
        pdf.text(formatDate(edu.startDate) + ' - ' + (edu.isCurrent ? 'Present' : formatDate(edu.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5;

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(10);
        const degreeText = `${edu.degree}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`;
        pdf.text(degreeText, margin, y);
        y += 10;
      });
    }

    // TECHNICAL SKILLS
    if (resumeData.skills.length > 0) {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(accentColor);
      pdf.text('TECHNICAL SKILLS', margin, y);
      pdf.setTextColor(0, 0, 0);
      y += 2;
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      pdf.setFont(fontFamily, 'normal');
      pdf.setFontSize(10);
      const skills = (enhancedResume?.coreCompetencies || resumeData.skills).join(', ');
      const skillsLines = pdf.splitTextToSize(skills, pageWidth - margin * 2);
      pdf.text(skillsLines, margin, y);
      y += skillsLines.length * 5 + 10;
    }

    // PROJECTS
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(12);
    setAccentColorPDF(pdf, accentColor);
    pdf.text('PROJECTS', margin, y);
    pdf.setTextColor(0, 0, 0);
    y += 10;

    // PROFESSIONAL EXPERIENCE
    if (resumeData.experience.length > 0) {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(12);
      setAccentColorPDF(pdf, accentColor);
      pdf.text('PROFESSIONAL EXPERIENCE', margin, y);
      pdf.setTextColor(0, 0, 0);
      y += 6;

      resumeData.experience.forEach(exp => {
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(exp.position + ' | ' + exp.company + ' | ' + (exp.location || 'Chapel Hill, NC'), margin, y);
        pdf.text(formatDate(exp.startDate) + ' - ' + (exp.isCurrent ? 'Present' : formatDate(exp.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5;

        const enhancedExp = enhancedResume?.experience?.find(
          e => e.company === exp.company && e.position === exp.position
        );

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        if (enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0) {
          enhancedExp.bulletPoints.forEach(bullet => {
            const lines = pdf.splitTextToSize('• ' + bullet, pageWidth - margin * 2 - 5);
            pdf.text(lines, margin + 5, y);
            y += lines.length * 4.5;
          });
        } else if (exp.description) {
          const lines = pdf.splitTextToSize('• ' + exp.description, pageWidth - margin * 2 - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 4.5;
        }
        y += 5;
      });
    }
  };

  const generateGracePDF = (pdf: jsPDF) => {
    if (!resumeData) return;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;

    // Header - Name bold
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(18);
    setAccentColorPDF(pdf, accentColor);
    pdf.text(resumeData.personalInfo.fullName, pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    y += 8;

    // Contact with bullet separators
    pdf.setFont(fontFamily, 'normal');
    pdf.setFontSize(10);
    const contact = [
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.linkedin ? 'linkedin.com/in/' + resumeData.personalInfo.fullName.toLowerCase().replace(' ', '-') : '',
      resumeData.personalInfo.github ? 'github.com/' + resumeData.personalInfo.fullName.toLowerCase().replace(' ', '') : ''
    ].filter(Boolean).join(' • ');
    pdf.text(contact, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // EDUCATION
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(11);
    setAccentColorPDF(pdf, accentColor);
    pdf.text('EDUCATION', margin, y);
    pdf.setTextColor(0, 0, 0);
    y += 2;
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;

    if (resumeData.education.length > 0) {
      resumeData.education.forEach(edu => {
        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(10);
        pdf.text('The ' + edu.institution + ' | Chapel Hill, NC', margin, y);
        pdf.text(formatDate(edu.startDate) + ' ' + (edu.isCurrent ? 'Present' : formatDate(edu.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5;

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(10);
        const degreeText = `(Intended) ${edu.degree}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`;
        pdf.text(degreeText, margin, y);
        y += 10;
      });
    }

    // TECHNICAL SKILLS
    if (resumeData.skills.length > 0) {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(11);
      setAccentColorPDF(pdf, accentColor);
      pdf.text('TECHNICAL SKILLS', margin, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(0, 0, 0);
      y += 2;
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(10);
      pdf.text('Programming Languages: ', margin, y);
      
      pdf.setFont(fontFamily, 'normal');
      const skills = (enhancedResume?.coreCompetencies || resumeData.skills).join(', ');
      const skillsLines = pdf.splitTextToSize(skills, pageWidth - margin * 2 - 55);
      pdf.text(skillsLines, margin + 55, y);
      y += skillsLines.length * 5 + 10;
    }

    // PROJECTS
    pdf.setFont(fontFamily, 'bold');
    pdf.setFontSize(11);
    setAccentColorPDF(pdf, accentColor);
    pdf.text('PROJECTS', margin, y);
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(0, 0, 0);
    y += 2;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    // PROFESSIONAL EXPERIENCE
    if (resumeData.experience.length > 0) {
      pdf.setFont(fontFamily, 'bold');
      pdf.setFontSize(11);
      setAccentColorPDF(pdf, accentColor);
      pdf.text('PROFESSIONAL EXPERIENCE', margin, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(0, 0, 0);
      y += 2;
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      resumeData.experience.forEach(exp => {
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(10);
        pdf.text(exp.position + ' | ' + exp.company + ' | ' + (exp.location || 'Chapel Hill, NC'), margin, y);
        pdf.text(formatDate(exp.startDate) + ' - ' + (exp.isCurrent ? 'Present' : formatDate(exp.endDate)), pageWidth - margin, y, { align: 'right' });
        y += 5;

        const enhancedExp = enhancedResume?.experience?.find(
          e => e.company === exp.company && e.position === exp.position
        );

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(9);
        if (enhancedExp?.bulletPoints && enhancedExp.bulletPoints.length > 0) {
          enhancedExp.bulletPoints.forEach(bullet => {
            const lines = pdf.splitTextToSize('• ' + bullet, pageWidth - margin * 2 - 5);
            pdf.text(lines, margin + 5, y);
            y += lines.length * 4.5;
          });
        } else if (exp.description) {
          const lines = pdf.splitTextToSize('• ' + exp.description, pageWidth - margin * 2 - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 4.5;
        }
        y += 5;
      });
    }
  };

  const generatePDF = () => {
    if (!resumeData) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (selectedTemplate === 'ada') {
        generateAdaPDF(pdf);
      } else if (selectedTemplate === 'hedy') {
        generateHedyPDF(pdf);
      } else if (selectedTemplate === 'alan') {
        generateAlanPDF(pdf);
      } else {
        generateGracePDF(pdf);
      }

      // Save the PDF
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      
      // Track download analytics
      if (user?.id) {
        resumeAnalyticsService.trackDownload(
          user.id,
          'current-resume',
          selectedTemplate
        );
      }
      
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
          <Card className={`border-2 ${getScoreBg(atsScore)} transition-all duration-300`}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-background/50 dark:bg-background/80 rounded-xl shadow-sm">
                    {atsScore >= 80 ? (
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    ) : atsScore >= 65 ? (
                      <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">ATS Compatibility Score</CardTitle>
                    <CardDescription className="mt-1">
                      {atsScore >= 80
                        ? '🎉 Excellent! Your resume is highly ATS-compatible'
                        : atsScore >= 65
                        ? '✅ Good, but there\'s room for improvement'
                        : '⚠️ Consider improving for better ATS compatibility'}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(atsScore)} mb-1`}>
                    {atsScore}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">out of 100</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Progress value={atsScore} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
               
                {atsDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 dark:bg-background/30 border border-border/50">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</div>
                      <div className="text-2xl font-bold text-foreground">{atsDetails.keywordMatch.toFixed(0)}%</div>
                      <Progress value={atsDetails.keywordMatch} className="h-1.5" />
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 dark:bg-background/30 border border-border/50">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skills</div>
                      <div className="text-2xl font-bold text-foreground">{atsDetails.skillsMatch.toFixed(0)}%</div>
                      <Progress value={atsDetails.skillsMatch} className="h-1.5" />
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 dark:bg-background/30 border border-border/50">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Experience</div>
                      <div className="text-2xl font-bold text-foreground">{atsDetails.experience.toFixed(0)}%</div>
                      <Progress value={atsDetails.experience} className="h-1.5" />
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 dark:bg-background/30 border border-border/50">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Education</div>
                      <div className="text-2xl font-bold text-foreground">{atsDetails.education.toFixed(0)}%</div>
                      <Progress value={atsDetails.education} className="h-1.5" />
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 dark:bg-background/30 border border-border/50">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Formatting</div>
                      <div className="text-2xl font-bold text-foreground">{atsDetails.formatting.toFixed(0)}%</div>
                      <Progress value={atsDetails.formatting} className="h-1.5" />
                    </div>
                  </div>
                )}




                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowATSDetails(!showATSDetails)}
                    className="flex-1"
                  >
                    {showATSDetails ? 'Hide Details' : 'Show Detailed Analysis'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={calculateATSScore}
                    className="flex-1"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Recalculate Score
                  </Button>
                </div>




                {/* Detailed Suggestions */}
                {showATSDetails && atsDetails && atsDetails.suggestions && (
                  <div className="mt-6 space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Improvement Suggestions
                      </h4>
                      <Badge variant="secondary">{atsDetails.suggestions.length} tips</Badge>
                    </div>
                    {atsDetails.suggestions.map((suggestion, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl text-sm shadow-sm transition-all hover:shadow-md ${
                          suggestion.priority === 'critical'
                            ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700'
                            : suggestion.priority === 'high'
                            ? 'bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-300 dark:border-orange-700'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-700'
                            : 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Badge 
                            variant="outline" 
                            className={`mt-0.5 uppercase text-xs font-bold ${
                              suggestion.priority === 'critical' ? 'border-red-500 text-red-700 dark:text-red-400' :
                              suggestion.priority === 'high' ? 'border-orange-500 text-orange-700 dark:text-orange-400' :
                              suggestion.priority === 'medium' ? 'border-yellow-600 text-yellow-700 dark:text-yellow-400' :
                              'border-blue-500 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {suggestion.priority}
                          </Badge>
                          <div className="flex-1 space-y-3">
                            <p className="font-semibold text-foreground leading-relaxed">{suggestion.message}</p>
                            {suggestion.impact && (
                              <div className="flex items-start gap-2 p-2 rounded-lg bg-green-100/50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                <Sparkles className="h-4 w-4 text-green-700 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-green-800 dark:text-green-300">
                                  <span className="font-bold">Impact:</span> {suggestion.impact}
                                </p>
                              </div>
                            )}
                            {suggestion.action && (
                              <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                <CheckCircle className="h-4 w-4 text-blue-700 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                  <span className="font-bold">Action:</span> {suggestion.action}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                   
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => navigate('/ats-assessment')}
                      className="w-full mt-4"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Get Full ATS Assessment Report
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

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              Choose Template
            </CardTitle>
            <CardDescription>
              Select a professional design for your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className={`cursor-pointer border-2 rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all ${
                  selectedTemplate === 'ada' 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md' 
                    : 'border-border bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedTemplate('ada')}
              >
                <div className="h-32 bg-muted dark:bg-muted/50 rounded-lg mb-3 overflow-hidden relative shadow-inner">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-slate-700 dark:bg-slate-800"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-white dark:bg-slate-200"></div>
                </div>
                <h3 className="font-bold text-center text-foreground">Ada Lovelace Style</h3>
                <p className="text-xs text-muted-foreground text-center mt-1.5">Centered header with underlined sections</p>
                {selectedTemplate === 'ada' && <Badge className="w-full mt-2 justify-center">Selected</Badge>}
              </div>

              <div 
                className={`cursor-pointer border-2 rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all ${
                  selectedTemplate === 'hedy' 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md' 
                    : 'border-border bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedTemplate('hedy')}
              >
                <div className="h-32 bg-white dark:bg-slate-200 rounded-lg mb-3 border border-border shadow-inner relative p-2">
                  <div className="w-full h-4 bg-gray-800 dark:bg-gray-900 mb-2 mx-auto rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                </div>
                <h3 className="font-bold text-center text-foreground">Hedy Lamarr Style</h3>
                <p className="text-xs text-muted-foreground text-center mt-1.5">Hyperlinked contact, clean layout</p>
                {selectedTemplate === 'hedy' && <Badge className="w-full mt-2 justify-center">Selected</Badge>}
              </div>

              <div 
                className={`cursor-pointer border-2 rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all ${
                  selectedTemplate === 'alan' 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md' 
                    : 'border-border bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedTemplate('alan')}
              >
                <div className="h-32 bg-white dark:bg-slate-200 rounded-lg mb-3 border border-border shadow-inner relative p-2">
                  <div className="w-1/2 h-4 bg-gray-900 dark:bg-gray-950 mb-4 rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                </div>
                <h3 className="font-bold text-center text-foreground">Alan Turing Style</h3>
                <p className="text-xs text-muted-foreground text-center mt-1.5">Bracketed contact, bold headers</p>
                {selectedTemplate === 'alan' && <Badge className="w-full mt-2 justify-center">Selected</Badge>}
              </div>

              <div 
                className={`cursor-pointer border-2 rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all ${
                  selectedTemplate === 'grace' 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md' 
                    : 'border-border bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedTemplate('grace')}
              >
                <div className="h-32 bg-white dark:bg-slate-200 rounded-lg mb-3 border border-border shadow-inner relative p-2">
                  <div className="w-3/4 h-4 bg-gray-800 dark:bg-gray-900 mb-2 mx-auto rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-400 mb-2 rounded"></div>
                </div>
                <h3 className="font-bold text-center text-foreground">Grace Hopper Style</h3>
                <p className="text-xs text-muted-foreground text-center mt-1.5">Bullet-separated contact</p>
                {selectedTemplate === 'grace' && <Badge className="w-full mt-2 justify-center">Selected</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Resume Customization
            </CardTitle>
            <CardDescription>
              {showPreview 
                ? '✨ Changes apply instantly to the preview below'
                : 'Personalize your resume colors and fonts. Enable live preview to see changes in real-time!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accent Color Picker */}
              <div className="space-y-3">
                <label htmlFor="accent-color" className="text-sm font-semibold">Accent Color</label>
                <div className="flex items-center gap-4">
                  <input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-border shadow-sm"
                    aria-label="Select accent color"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Choose a color for headers and accents</p>
                    <p className="text-xs text-muted-foreground mt-1">Current: {accentColor}</p>
                  </div>
                </div>
                {/* Preset Colors */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setAccentColor('#000000')}
                    className="h-8 w-8 rounded-full bg-black border-2 border-gray-300 hover:scale-110 transition"
                    title="Black"
                  />
                  <button
                    onClick={() => setAccentColor('#1e40af')}
                    className="h-8 w-8 rounded-full bg-blue-800 border-2 border-gray-300 hover:scale-110 transition"
                    title="Navy Blue"
                  />
                  <button
                    onClick={() => setAccentColor('#16a34a')}
                    className="h-8 w-8 rounded-full bg-green-600 border-2 border-gray-300 hover:scale-110 transition"
                    title="Green"
                  />
                  <button
                    onClick={() => setAccentColor('#dc2626')}
                    className="h-8 w-8 rounded-full bg-red-600 border-2 border-gray-300 hover:scale-110 transition"
                    title="Red"
                  />
                  <button
                    onClick={() => setAccentColor('#9333ea')}
                    className="h-8 w-8 rounded-full bg-purple-600 border-2 border-gray-300 hover:scale-110 transition"
                    title="Purple"
                  />
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-3">
                <label htmlFor="font-family" className="text-sm font-semibold">Font Family</label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select font family"
                >
                  <option value="helvetica">Helvetica (Clean & Professional)</option>
                  <option value="times">Times New Roman (Classic)</option>
                  <option value="courier">Courier (Typewriter Style)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose a font that matches your industry and style
                </p>
              </div>

              {/* Line Spacing */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Line Spacing</label>
                <div className="flex gap-2">
                  {['compact', 'standard', 'comfortable'].map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => setLineSpacing(spacing as 'compact' | 'standard' | 'comfortable')}
                      className={`px-4 py-2 rounded-lg border-2 text-sm capitalize font-medium transition-all ${
                        lineSpacing === spacing
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'bg-card border-border hover:bg-accent hover:border-primary/50'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Adjust spacing to fit content on one page
                </p>
              </div>

              {/* Section Reordering */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Section Order</label>
                <div className="space-y-2">
                  {sectionOrder.map((section, index) => (
                    <div key={section} className="flex items-center justify-between p-3 bg-card border-2 border-border rounded-lg hover:border-primary/50 transition-colors">
                      <span className="capitalize text-sm font-medium">{section}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (index === 0) return;
                            const newOrder = [...sectionOrder];
                            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                            setSectionOrder(newOrder);
                          }}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-accent rounded-md disabled:opacity-30 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (index === sectionOrder.length - 1) return;
                            const newOrder = [...sectionOrder];
                            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                            setSectionOrder(newOrder);
                          }}
                          disabled={index === sectionOrder.length - 1}
                          className="p-1.5 hover:bg-accent rounded-md disabled:opacity-30 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Customization Section */}
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Font Size */}
              <div className="space-y-3">
                <label htmlFor="font-size" className="text-sm font-semibold">Font Size</label>
                <select
                  id="font-size"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select font size"
                >
                  <option value="small">Small (Fit more content)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="large">Large (Better readability)</option>
                </select>
              </div>

              {/* Page Margins */}
              <div className="space-y-3">
                <label htmlFor="page-margins" className="text-sm font-semibold">Page Margins</label>
                <select
                  id="page-margins"
                  value={pageMargins}
                  onChange={(e) => setPageMargins(e.target.value as 'narrow' | 'normal' | 'wide')}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select page margins"
                >
                  <option value="narrow">Narrow (More space)</option>
                  <option value="normal">Normal (Recommended)</option>
                  <option value="wide">Wide (Cleaner look)</option>
                </select>
              </div>

              {/* Line Spacing */}
              <div className="space-y-3">
                <label htmlFor="line-spacing" className="text-sm font-semibold">Line Spacing</label>
                <select
                  id="line-spacing"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(e.target.value as 'compact' | 'standard' | 'comfortable')}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select line spacing"
                >
                  <option value="compact">Compact (Fit more)</option>
                  <option value="standard">Standard (ATS-friendly)</option>
                  <option value="comfortable">Comfortable (Easy to read)</option>
                </select>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Style */}
              <div className="space-y-3">
                <label htmlFor="header-style" className="text-sm font-semibold">Header Layout</label>
                <select
                  id="header-style"
                  value={headerStyle}
                  onChange={(e) => setHeaderStyle(e.target.value as 'centered' | 'left' | 'two-column')}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select header style"
                >
                  <option value="centered">Centered (Traditional)</option>
                  <option value="left">Left Aligned (Modern)</option>
                  <option value="two-column">Two Column (Compact)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose how your name and contact info are displayed
                </p>
              </div>

              {/* Section Style */}
              <div className="space-y-3">
                <label htmlFor="section-style" className="text-sm font-semibold">Section Headers Style</label>
                <select
                  id="section-style"
                  value={sectionStyle}
                  onChange={(e) => setSectionStyle(e.target.value as 'underline' | 'box' | 'bold')}
                  className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  aria-label="Select section style"
                >
                  <option value="underline">Underlined (Classic)</option>
                  <option value="box">Box Background (Modern)</option>
                  <option value="bold">Bold Only (Minimal)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Style for section headings (Education, Experience, etc.)
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Show Icons Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="show-icons" className="text-sm font-semibold">Show Contact Icons</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display icons next to email, phone, and social links
                </p>
              </div>
              <button
                id="show-icons"
                onClick={() => setShowIcons(!showIcons)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner ${
                  showIcons ? 'bg-primary' : 'bg-muted border-2 border-border'
                }`}
                aria-label="Toggle contact icons"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-background shadow-md transition-transform ${
                    showIcons ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant={showPreview && !showAnalytics ? "default" : "outline"}
            size="lg"
            onClick={() => {
              setShowPreview(true);
              setShowAnalytics(false);
            }}
            className="min-w-[200px]"
          >
            <Eye className="w-5 h-5 mr-2" />
            {showPreview && !showAnalytics ? 'Live Preview Active' : 'Show Live Preview'}
          </Button>
          <Button
            variant={showAnalytics ? "default" : "outline"}
            size="lg"
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              if (!showAnalytics) setShowPreview(false);
            }}
            className="min-w-[200px]"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            {showAnalytics ? 'Analytics Active' : 'Show Analytics'}
          </Button>
          <Button
            size="lg"
            onClick={generatePDF}
            disabled={!resumeData}
            className="min-w-[200px]"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Live Preview Indicator */}
        {showPreview && (
          <div className="text-center">
            <Badge variant="secondary" className="animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              Live Preview - Updates as you customize
            </Badge>
          </div>
        )}




        {/* Resume Preview */}
        {showPreview && resumeData && (
          <div className="mt-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume Preview</CardTitle>
                  <Badge variant="outline">
                    {selectedTemplate === 'ada' ? 'Ada Lovelace Style' :
                     selectedTemplate === 'hedy' ? 'Hedy Lamarr Style' : 
                     selectedTemplate === 'alan' ? 'Alan Turing Style' : 'Grace Hopper Style'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto min-h-[800px] transition-all duration-300" style={{ fontFamily: debouncedFontFamily === 'times' ? 'Times New Roman, serif' : debouncedFontFamily === 'courier' ? 'Courier, monospace' : 'Helvetica, Arial, sans-serif', fontSize: debouncedFontSize === 'small' ? '0.9em' : debouncedFontSize === 'large' ? '1.1em' : '1em', lineHeight: debouncedLineSpacing === 'compact' ? '1.3' : debouncedLineSpacing === 'comfortable' ? '1.7' : '1.5' }}>
                  {selectedTemplate === 'ada' ? (
                    <div className="flex h-full">
                    {/* Ada Lovelace Style Preview */}
                    <div className="w-1/3 text-white p-6 space-y-6" style={{ backgroundColor: debouncedAccentColor }}>
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
                          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={{ color: debouncedAccentColor, borderColor: debouncedAccentColor }}>PROFESSIONAL EXPERIENCE</h2>
                          <div className="space-y-4">
                            {resumeData.experience.map((exp, index) => {
                              const enhancedExp = enhancedResume?.experience?.find(
                                e => e.company === exp.company && e.position === exp.position
                              );
                              return (
                                <div key={index}>
                                  <h3 className="font-bold" style={{ color: debouncedAccentColor }}>{exp.company}</h3>
                                  <p className="font-semibold text-sm">{exp.position}</p>
                                  <p className="text-xs italic text-gray-600 dark:text-gray-400 mb-2">
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
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{exp.description}</p>
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
                          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={{ color: debouncedAccentColor, borderColor: debouncedAccentColor }}>EDUCATION</h2>
                          <div className="space-y-3">
                            {resumeData.education.map((edu, index) => {
                              const enhancedEdu = enhancedResume?.education?.find(
                                e => e.institution === edu.institution && e.degree === edu.degree
                              );
                              return (
                                <div key={index}>
                                  <h3 className="font-bold" style={{ color: debouncedAccentColor }}>{edu.institution}</h3>
                                  <p className="text-sm">{edu.degree}{edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}</p>
                                  <p className="text-xs italic text-gray-600 dark:text-gray-400">
                                    {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                                  </p>
                                  {enhancedEdu?.relevantCoursework && enhancedEdu.relevantCoursework.length > 0 && (
                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
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
                          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={{ color: debouncedAccentColor, borderColor: debouncedAccentColor }}>CERTIFICATIONS</h2>
                          <div className="space-y-2">
                            {resumeData.certifications.map((cert, index) => (
                              <div key={index}>
                                <p className="font-semibold text-sm">{cert.name}</p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">{cert.issuer} | {formatDate(cert.issueDate)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  ) : selectedTemplate === 'hedy' ? (
                    <div className="p-8 h-full">
                      {/* Hedy Lamarr Style Preview */}
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        <p className="text-sm" style={{ color: debouncedAccentColor }}>
                          {[resumeData.personalInfo.email, resumeData.personalInfo.phone, 'LinkedIn', 'GitHub'].filter(Boolean).join(' | ')}
                        </p>
                      </div>
                      
                      {resumeData.education.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ borderBottom: `2px solid ${debouncedAccentColor}`, paddingBottom: '0.5rem' }}>EDUCATION</h3>
                          {resumeData.education.map((edu, i) => (
                            <div key={i} className="mb-3">
                              <div className="flex justify-between">
                                <p className="font-semibold">The {edu.institution}</p>
                                <p className="text-sm">{formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}</p>
                              </div>
                              <p className="text-sm">{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {resumeData.skills.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ borderBottom: `2px solid ${debouncedAccentColor}`, paddingBottom: '0.5rem' }}>TECHNICAL SKILLS</h3>
                          <p className="text-sm">{resumeData.skills.join(', ')}</p>
                        </div>
                      )}
                      
                      {resumeData.experience.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ borderBottom: `2px solid ${debouncedAccentColor}`, paddingBottom: '0.5rem' }}>PROFESSIONAL EXPERIENCE</h3>
                          {resumeData.experience.map((exp, i) => (
                            <div key={i} className="mb-4">
                              <div className="flex justify-between">
                                <span className="font-semibold text-sm">{exp.position} | {exp.company} | {exp.location || 'Chapel Hill, NC'}</span>
                                <span className="text-sm">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                              </div>
                              <p className="text-xs mt-1">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : selectedTemplate === 'alan' ? (
                    <div className="p-8 h-full">
                      {/* Alan Turing Style Preview */}
                      <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          [{resumeData.personalInfo.email}] | [{resumeData.personalInfo.phone}] | [LinkedIn]
                        </p>
                      </div>
                      
                      {resumeData.education.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ color: debouncedAccentColor }}>EDUCATION</h3>
                          {resumeData.education.map((edu, i) => (
                            <div key={i} className="mb-3">
                              <div className="flex justify-between">
                                <p className="font-semibold">The {edu.institution}, Chapel Hill, NC</p>
                                <p className="text-sm">{formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}</p>
                              </div>
                              <p className="text-sm">(Intended) {edu.degree}{edu.gpa ? `, GPA: ${edu.gpa}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {resumeData.skills.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ color: debouncedAccentColor }}>TECHNICAL SKILLS</h3>
                          <p className="text-sm">{resumeData.skills.join(', ')}</p>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="text-base font-bold mb-3" style={{ color: debouncedAccentColor }}>PROJECTS</h3>
                      </div>
                      
                      {resumeData.experience.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-base font-bold mb-3" style={{ color: debouncedAccentColor }}>PROFESSIONAL EXPERIENCE</h3>
                          {resumeData.experience.map((exp, i) => (
                            <div key={i} className="mb-4">
                              <div className="flex justify-between">
                                <span className="font-semibold text-sm">{exp.position} | {exp.company} | {exp.location || 'Chapel Hill, NC'}</span>
                                <span className="text-sm">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                              </div>
                              <p className="text-xs mt-1">{exp.description}</p>
                              <p className="text-sm">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 h-full">
                      {/* Grace Hopper Style Preview */}
                      <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {[resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.linkedin].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      
                      {resumeData.education.length > 0 && (
                        <div className="mb-6">
                          <h2 className="font-bold text-lg mb-3 pb-1" style={{ borderBottom: `2px solid ${debouncedAccentColor}`, color: debouncedAccentColor }}>EDUCATION</h2>
                          {resumeData.education.map((edu, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="flex justify-between">
                                <p className="font-semibold">{edu.institution}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}</p>
                              </div>
                              <p className="text-sm">{edu.degree}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && user?.id && (
          <div className="mt-8">
            <AnalyticsDashboard 
              userId={user.id} 
              resumeId="current-resume"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;

