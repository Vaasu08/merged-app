import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserSkills } from '@/lib/profile';
import { skillsDatabase } from '@/data/careerData';
import { FileText, Download, Eye, ArrowLeft, User, GraduationCap, Briefcase, Award, Globe } from 'lucide-react';
import jsPDF from 'jspdf';

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

const ResumeBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic'>('modern');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadResumeData();
  }, [user?.id]);

  const loadResumeData = async () => {
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
      if (selectedTemplate === 'classic') {
        toast.error('Classic template currently unavailable. Please try again later.');
      } else {
        toast.error('Failed to generate resume. Please try again.');
      }
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
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>

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
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Resume Preview - {selectedTemplate === 'modern' ? 'Modern' : 'Classic'} Template</CardTitle>
              <CardDescription>This is how your resume will look when downloaded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 shadow-lg" style={{ minHeight: '800px' }}>
                {selectedTemplate === 'modern' ? (
                  // Modern Template Preview
                  <>
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-6 -m-8 mb-8">
                      <h1 className="text-3xl font-bold">{resumeData.personalInfo.fullName}</h1>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                        {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                        {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                        {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
                        {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  // Classic Template Preview
                  <>
                    {/* Header - Classic Style */}
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-black mb-2">{resumeData.personalInfo.fullName}</h1>
                      <div className="text-sm text-gray-600">
                        {[
                          resumeData.personalInfo.email,
                          resumeData.personalInfo.phone,
                          resumeData.personalInfo.location,
                          resumeData.personalInfo.website,
                          resumeData.personalInfo.linkedin,
                          resumeData.personalInfo.github
                        ].filter(Boolean).join(' | ')}
                      </div>
                    </div>
                  </>
                )}

                {/* Summary/Objective */}
                {resumeData.summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedTemplate === 'modern' ? 'SUMMARY' : 'OBJECTIVE'}
                    </h2>
                    <p className="text-gray-700">{resumeData.summary}</p>
                  </div>
                )}

                {/* Conditional Section Ordering */}
                {selectedTemplate === 'modern' ? (
                  // Modern Template Order: Skills -> Experience -> Education
                  <>
                    {/* Skills */}
                    {resumeData.skills.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">SKILLS</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">EXPERIENCE</h2>
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{exp.position}</h3>
                                <p className="text-gray-600">{exp.company}{exp.location && `, ${exp.location}`}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">EDUCATION</h2>
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{edu.degree}</h3>
                                <p className="text-gray-600">{edu.institution}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</p>
                                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Classic Template Order: Education -> Experience -> Skills
                  <>
                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">EDUCATION</h2>
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{edu.degree}</h3>
                                <p className="text-gray-600">{edu.institution}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</p>
                                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">EXPERIENCE</h2>
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{exp.position}</h3>
                                <p className="text-gray-600">{exp.company}{exp.location && `, ${exp.location}`}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">SKILLS</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Certifications */}
                {resumeData.certifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">CERTIFICATIONS</h2>
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{cert.name}</h3>
                            <p className="text-gray-600">{cert.issuer}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(cert.issueDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;
