# Profile System Setup Guide

This guide will help you set up the comprehensive profile system for the Horizon Career Discovery Platform.

## 🚀 Quick Setup

### 1. Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to the SQL Editor

2. **Run the Database Setup Script**
   - Copy the contents of `database-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify Tables Created**
   - Go to Table Editor
   - You should see these new tables:
     - `user_profiles` - Main profile information
     - `user_skills` - User skills (already exists)
     - `profiles` - Basic profile metadata (already exists)

### 2. Test the Profile System

1. **Sign up/Login** to your application
2. **Go to Profile page** - you should see an "Edit Profile" button
3. **Click "Edit Profile"** to open the comprehensive form
4. **Fill in your details** across all tabs:
   - Basic Info (name, contact, bio, social links)
   - Professional (position, experience level, salary, work preference)
   - Education (degrees, institutions, dates)
   - Experience (work history, companies, roles)
   - Additional (certifications, languages, interests)

5. **Save your profile** - all data will be stored in Supabase
6. **Log out and log back in** - your data should persist

## 📊 Database Schema

### `user_profiles` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users |
| `full_name` | TEXT | User's full name |
| `email` | TEXT | User's email |
| `phone` | TEXT | Phone number |
| `location` | TEXT | City, Country |
| `bio` | TEXT | Personal bio/description |
| `website` | TEXT | Personal website URL |
| `linkedin_url` | TEXT | LinkedIn profile URL |
| `github_url` | TEXT | GitHub profile URL |
| `portfolio_url` | TEXT | Portfolio website URL |
| `current_position` | TEXT | Current job title |
| `current_company` | TEXT | Current company |
| `experience_level` | TEXT | Entry, Mid, Senior, Lead, Executive |
| `availability` | TEXT | Available, Busy, Not Looking |
| `salary_expectation` | NUMERIC | Expected salary |
| `currency` | TEXT | Currency code (USD, EUR, etc.) |
| `work_preference` | TEXT | Remote, Hybrid, On-site |
| `education` | JSONB | Array of education records |
| `experience` | JSONB | Array of work experience |
| `certifications` | JSONB | Array of certifications |
| `languages` | JSONB | Array of languages with proficiency |
| `interests` | JSONB | Array of interests/hobbies |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### JSONB Fields Structure

#### Education
```json
[
  {
    "id": "uuid",
    "institution": "University Name",
    "degree": "Bachelor's Degree",
    "field_of_study": "Computer Science",
    "start_date": "2020-09-01",
    "end_date": "2024-06-01",
    "gpa": 3.8,
    "description": "Additional details",
    "is_current": false
  }
]
```

#### Experience
```json
[
  {
    "id": "uuid",
    "company": "Tech Corp",
    "position": "Software Engineer",
    "start_date": "2024-01-01",
    "end_date": null,
    "description": "Job description",
    "location": "San Francisco, CA",
    "is_current": true,
    "achievements": ["Achievement 1", "Achievement 2"]
  }
]
```

#### Certifications
```json
[
  {
    "id": "uuid",
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "issue_date": "2023-12-01",
    "expiry_date": "2026-12-01",
    "credential_id": "AWS-123456",
    "credential_url": "https://..."
  }
]
```

#### Languages
```json
[
  {
    "id": "uuid",
    "name": "English",
    "proficiency": "native"
  },
  {
    "id": "uuid",
    "name": "Spanish",
    "proficiency": "intermediate"
  }
]
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Automatic profile creation** when new users sign up
- **Secure data handling** with proper permissions

## 🛠️ Features Included

### Profile Form Features
- ✅ **Tabbed interface** for organized data entry
- ✅ **Real-time validation** and error handling
- ✅ **Dynamic arrays** for education, experience, certifications
- ✅ **Auto-save functionality** with localStorage backup
- ✅ **Responsive design** that works on all devices
- ✅ **Comprehensive data collection** for career recommendations

### Data Persistence
- ✅ **Supabase integration** for cloud storage
- ✅ **localStorage fallback** for offline capability
- ✅ **Automatic sync** between local and cloud storage
- ✅ **Data persistence** across login sessions
- ✅ **Skills integration** with existing skill system

### User Experience
- ✅ **Edit/View modes** with seamless switching
- ✅ **Profile overview** showing key information
- ✅ **Skills management** integrated with profile
- ✅ **Debug tools** for troubleshooting
- ✅ **Toast notifications** for user feedback

## 🔧 Troubleshooting

### Common Issues

1. **Profile not saving**
   - Check Supabase connection
   - Verify RLS policies are set up correctly
   - Check browser console for errors

2. **Skills not persisting**
   - Use the "Debug Skills" button to check data flow
   - Use the "Sync Skills" button to force sync to Supabase
   - Check localStorage for backup data

3. **Form not loading**
   - Ensure all required components are imported
   - Check for TypeScript errors
   - Verify database tables exist

### Debug Tools

The profile page includes several debug tools:
- **Debug Skills** - Shows skill data from both Supabase and localStorage
- **Sync Skills** - Forces synchronization to Supabase
- **Console logging** - Detailed logs for troubleshooting

## 🚀 Next Steps

1. **Customize the form** - Add/remove fields as needed
2. **Integrate with career recommendations** - Use profile data for better matching
3. **Add profile pictures** - Implement avatar upload functionality
4. **Export functionality** - Generate PDF resumes from profile data
5. **Social features** - Allow users to share profiles

## 📝 Notes

- All data is stored securely in Supabase with proper RLS policies
- localStorage is used as a backup for offline functionality
- The system gracefully handles both authenticated and unauthenticated users
- Skills are integrated with the existing career recommendation system
- The form is fully responsive and accessible

---

**Need help?** Check the console logs, use the debug tools, or review the database setup script for any missing configurations.
