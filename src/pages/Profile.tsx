import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SkillInput } from '@/components/SkillInput';
import { ProfileForm } from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { getUserSkills, saveUserSkills, getUserProfile, saveUserProfile, UserProfile } from '@/lib/profile';
import { skillsDatabase } from '@/data/careerData';
import { toast } from 'sonner';
import { User, LogOut, Settings, Edit3, FileText, Globe, Linkedin, Github, Award, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const skillsLoadedRef = useRef(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    setIsLoadingProfile(true);
    try {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load your profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return;
    
    try {
      await saveUserProfile(user.id, profileData);
      setUserProfile(profileData as UserProfile);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error; // Let the form handle the error display
    }
  };

  const getSkillName = (skillId: string) => {
    return skillsDatabase.find(skill => skill.id === skillId)?.name || skillId;
  };

  const getSkillsByCategory = () => {
    const categorized: Record<string, string[]> = {};
    selectedSkills.forEach(skillId => {
      const skill = skillsDatabase.find(s => s.id === skillId);
      if (skill) {
        if (!categorized[skill.category]) {
          categorized[skill.category] = [];
        }
        categorized[skill.category].push(skill.name);
      }
    });
    return categorized;
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [skills, profile] = await Promise.all([
          getUserSkills(user.id),
          getUserProfile(user.id)
        ]);
        setSelectedSkills(skills);
        setUserProfile(profile);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load user data', e);
        toast.error('Failed to load your profile data');
      } finally {
        skillsLoadedRef.current = true;
      }
    };
    load();
    return () => {
      skillsLoadedRef.current = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const sync = async () => {
      if (!user?.id) return;
      if (!skillsLoadedRef.current) return;
      try {
        await saveUserSkills(user.id, selectedSkills);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to save user skills', e);
      }
    };
    sync();
  }, [selectedSkills, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your skills and track your career progress</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/insights" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Insights
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Job News
            </Link>
          </div>
        </div>

        {isEditingProfile ? (
          <ProfileForm
            userId={user?.id || ''}
            initialProfile={userProfile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditingProfile(false)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info Card */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-border/50 shadow-soft">
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold flex items-center justify-center">
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {userProfile?.full_name || user?.user_metadata?.full_name || 'Horizon Explorer'}
                      </CardTitle>
                      <CardDescription>{userProfile?.email || user?.email}</CardDescription>
                      {userProfile?.location && (
                        <CardDescription className="text-sm">{userProfile.location}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Skills</span>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {selectedSkills.length}
                      </Badge>
                    </div>
                    {userProfile?.experience_level && (
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Level</span>
                        </div>
                        <Badge variant="secondary" className="bg-success/10 text-success capitalize">
                          {userProfile.experience_level}
                        </Badge>
                      </div>
                    )}
                    {userProfile?.current_position && (
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Position</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-600/10 text-blue-600">
                          {userProfile.current_position}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full justify-start" 
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 hover:text-green-700" 
                      onClick={() => navigate('/resume')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Build Resume
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => toast.info('Account settings coming soon!')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-destructive hover:text-destructive" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Overview */}
              {userProfile && (
                <Card className="bg-gradient-card border-border/50 shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Overview</CardTitle>
                    <CardDescription>Your complete profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProfile.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Bio</h4>
                        <p className="text-sm">{userProfile.bio}</p>
                      </div>
                    )}
                    
                    {(userProfile.website || userProfile.linkedin_url || userProfile.github_url) && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Links</h4>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.website && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Website
                            </Badge>
                          )}
                          {userProfile.linkedin_url && (
                            <Badge variant="outline" className="text-xs">
                              <Linkedin className="w-3 h-3 mr-1" />
                              LinkedIn
                            </Badge>
                          )}
                          {userProfile.github_url && (
                            <Badge variant="outline" className="text-xs">
                              <Github className="w-3 h-3 mr-1" />
                              GitHub
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {userProfile.interests && userProfile.interests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {userProfile.interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills Overview */}
              {selectedSkills.length > 0 && (
                <Card className="bg-gradient-card border-border/50 shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills Overview</CardTitle>
                    <CardDescription>Your skills by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(getSkillsByCategory()).map(([category, skills]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {category} ({skills.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

          {/* Skills Management */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Manage Your Skills</CardTitle>
                <CardDescription>
                  Add or remove your skills below. These will be saved to your account and used for career recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillInput
                  selectedSkills={selectedSkills}
                  onSkillsChange={setSelectedSkills}
                  onAnalyze={() => {
                    if (selectedSkills.length < 3) {
                      toast.error('Please add at least 3 skills to analyze your career path.');
                      return;
                    }
                    
                    toast.success('Analyzing your career path...');
                    setTimeout(() => {
                      // Navigate to home with explicit state to trigger analysis
                      navigate('/', { 
                        state: { 
                          showRecommendations: true, 
                          skills: selectedSkills,
                          fromProfile: true 
                        } 
                      });
                    }, 500);
                  }}
                />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8"
                onClick={() => {
                  if (selectedSkills.length < 3) {
                    toast.error('Please add at least 3 skills to get career recommendations.');
                    return;
                  }
                  
                  navigate('/', { 
                    state: { 
                      showRecommendations: true, 
                      skills: selectedSkills,
                      fromProfile: true 
                    } 
                  });
                }}
              >
                Get Career Recommendations ({selectedSkills.length} skills)
              </Button>
            </div>

          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
