import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages,
  Heart,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { UserProfile, Education, Experience, Certification, Language } from '@/lib/profile';

interface ProfileFormProps {
  userId: string;
  initialProfile?: UserProfile | null;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ 
  userId, 
  initialProfile, 
  onSave, 
  onCancel 
}) => {
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile || {});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(profile.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || '');

  // Professional Info
  const [currentPosition, setCurrentPosition] = useState(profile.current_position || '');
  const [currentCompany, setCurrentCompany] = useState(profile.current_company || '');
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || 'entry');
  const [availability, setAvailability] = useState(profile.availability || 'available');
  const [salaryExpectation, setSalaryExpectation] = useState(profile.salary_expectation?.toString() || '');
  const [currency, setCurrency] = useState(profile.currency || 'USD');
  const [workPreference, setWorkPreference] = useState(profile.work_preference || 'remote');

  // Dynamic arrays
  const [education, setEducation] = useState<Education[]>(profile.education || []);
  const [experience, setExperience] = useState<Experience[]>(profile.experience || []);
  const [certifications, setCertifications] = useState<Certification[]>(profile.certifications || []);
  const [languages, setLanguages] = useState<Language[]>(profile.languages || []);
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFullName(initialProfile.full_name || '');
      setEmail(initialProfile.email || '');
      setPhone(initialProfile.phone || '');
      setLocation(initialProfile.location || '');
      setBio(initialProfile.bio || '');
      setWebsite(initialProfile.website || '');
      setLinkedinUrl(initialProfile.linkedin_url || '');
      setGithubUrl(initialProfile.github_url || '');
      setPortfolioUrl(initialProfile.portfolio_url || '');
      setCurrentPosition(initialProfile.current_position || '');
      setCurrentCompany(initialProfile.current_company || '');
      setExperienceLevel(initialProfile.experience_level || 'entry');
      setAvailability(initialProfile.availability || 'available');
      setSalaryExpectation(initialProfile.salary_expectation?.toString() || '');
      setCurrency(initialProfile.currency || 'USD');
      setWorkPreference(initialProfile.work_preference || 'remote');
      setEducation(initialProfile.education || []);
      setExperience(initialProfile.experience || []);
      setCertifications(initialProfile.certifications || []);
      setLanguages(initialProfile.languages || []);
      setInterests(initialProfile.interests || []);
    }
  }, [initialProfile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
        id: userId,
        full_name: fullName,
        email,
        phone,
        location,
        bio,
        website,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        current_position: currentPosition,
        current_company: currentCompany,
        experience_level: experienceLevel as any,
        availability: availability as any,
        salary_expectation: salaryExpectation ? parseFloat(salaryExpectation) : undefined,
        currency,
        work_preference: workPreference as any,
        education,
        experience,
        certifications,
        languages,
        interests,
      };

      console.log('Saving profile data:', updatedProfile);
      await onSave(updatedProfile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience([...experience, {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuer: '',
      issue_date: ''
    }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    setLanguages([...languages, {
      name: '',
      proficiency: 'beginner'
    }]);
  };

  const updateLanguage = (index: number, field: keyof Language, value: any) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-muted-foreground">Fill in your details to get personalized career recommendations</p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
              <CardDescription>Your career details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPosition">Current Position</Label>
                  <Input
                    id="currentPosition"
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="not_looking">Not Looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryExpectation">Salary Expectation</Label>
                  <div className="flex gap-2">
                    <Input
                      id="salaryExpectation"
                      type="number"
                      value={salaryExpectation}
                      onChange={(e) => setSalaryExpectation(e.target.value)}
                      placeholder="75000"
                    />
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workPreference">Work Preference</Label>
                  <Select value={workPreference} onValueChange={setWorkPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </div>
                <Button onClick={addEducation} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="University Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field_of_study}
                          onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value) || undefined)}
                          placeholder="3.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={edu.start_date}
                          onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={edu.end_date || ''}
                          onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                          disabled={edu.is_current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={edu.is_current}
                        onChange={(e) => updateEducation(index, 'is_current', e.target.checked)}
                      />
                      <Label htmlFor={`current-${index}`}>Currently studying</Label>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="Additional details about your education..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {education.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No education added yet. Click "Add Education" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </div>
                <Button onClick={addExperience} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </CardTitle>
              <CardDescription>Your professional work experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.map((exp, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={exp.location || ''}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={exp.end_date || ''}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          disabled={exp.is_current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id={`current-exp-${index}`}
                        checked={exp.is_current}
                        onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                      />
                      <Label htmlFor={`current-exp-${index}`}>Currently working here</Label>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {experience.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No work experience added yet. Click "Add Experience" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Information */}
        <TabsContent value="additional" className="space-y-6">
          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </div>
                <Button onClick={addCertification} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </CardTitle>
              <CardDescription>Your professional certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Certification {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Certification Name</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issuing Organization</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder="Amazon Web Services"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={cert.issue_date}
                          onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={cert.expiry_date || ''}
                          onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Credential ID</Label>
                        <Input
                          value={cert.credential_id || ''}
                          onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                          placeholder="Credential ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Credential URL</Label>
                        <Input
                          value={cert.credential_url || ''}
                          onChange={(e) => updateCertification(index, 'credential_url', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {certifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No certifications added yet. Click "Add Certification" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Languages
                </div>
                <Button onClick={addLanguage} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </CardTitle>
              <CardDescription>Languages you speak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      value={lang.name}
                      onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                      placeholder="Language name"
                    />
                  </div>
                  <Select value={lang.proficiency} onValueChange={(value) => updateLanguage(index, 'proficiency', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {languages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No languages added yet. Click "Add Language" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Interests
              </CardTitle>
              <CardDescription>Your hobbies and interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest..."
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} disabled={!newInterest.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {interests.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No interests added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
