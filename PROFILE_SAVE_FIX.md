# Profile Save Functionality Fix

## Issue

Users were unable to save profile changes. The save button appeared to work but data wasn't persisting to the database.

## Root Cause

The `saveUserProfile()` and `getUserProfile()` functions in `/src/lib/profile.ts` had a data type mismatch:

1. **Save Issue**: The function was using `JSON.stringify()` to convert arrays (education, experience, certifications, etc.) to strings before saving
2. **Load Issue**: The function was using `JSON.parse()` to convert strings back to arrays when loading
3. **Database Reality**: The Supabase `user_profiles` table uses **JSONB columns**, which natively accept and return JavaScript objects/arrays

### The Problem

```typescript
// OLD CODE - INCORRECT ❌
const profileData = {
  ...profile,
  education: profile.education ? JSON.stringify(profile.education) : null,  // Converting to string
  experience: profile.experience ? JSON.stringify(profile.experience) : null,
  // ... etc
};

// When loading:
education: data.education ? JSON.parse(data.education) : [],  // Trying to parse already-parsed data
```

This caused:

- **Double stringification** when saving (array → string → escaped string in JSONB)
- **Parse errors** when loading (trying to parse an array as if it were a string)
- **Data corruption** with nested quotes and escape characters

## Solution

Remove the unnecessary `JSON.stringify()` and `JSON.parse()` calls. Supabase's PostgreSQL client automatically handles JSONB serialization:

### Fixed saveUserProfile()

```typescript
// NEW CODE - CORRECT ✅
const profileData = {
  ...profile,
  id: userId, // Ensure ID is always set
  education: profile.education || [], // Pass arrays directly
  experience: profile.experience || [],
  certifications: profile.certifications || [],
  languages: profile.languages || [],
  interests: profile.interests || [],
  updated_at: new Date().toISOString(),
};

const { data, error } = await supabase
  .from("user_profiles")
  .upsert(profileData, { onConflict: "id" })
  .select(); // Added .select() to return saved data for debugging
```

### Fixed getUserProfile()

```typescript
// NEW CODE - CORRECT ✅
if (data) {
  // JSONB fields are already parsed by Supabase client
  return {
    ...data,
    education: data.education || [], // Use directly, no parsing needed
    experience: data.experience || [],
    certifications: data.certifications || [],
    languages: data.languages || [],
    interests: data.interests || [],
  };
}
```

## Additional Improvements

1. **Better logging**: Added profile data to console logs for debugging
2. **ID enforcement**: Explicitly set `id: userId` in profileData to ensure it's always present
3. **Return data**: Added `.select()` to upsert query to see what was actually saved
4. **Error handling**: Changed `console.warn` to `console.error` for actual errors

## Database Schema Reference

From `database-setup.sql`:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  -- ... basic fields ...
  education JSONB DEFAULT '[]'::jsonb,      -- JSONB, not TEXT
  experience JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  -- ...
);
```

## Testing

To verify the fix:

1. Open the app and navigate to Profile page
2. Click "Edit Profile"
3. Make changes to any field (name, bio, education, experience, etc.)
4. Click "Save"
5. Check browser console for "Profile successfully saved to Supabase: [data]"
6. Refresh the page - changes should persist

## Files Modified

- `/src/lib/profile.ts` (lines 92-159)
  - Fixed `getUserProfile()` function
  - Fixed `saveUserProfile()` function

## Related Code

The save flow works as follows:

```
User clicks Save button
  ↓
ProfileForm.handleSave() (line 106-145)
  - Collects all form fields into updatedProfile object
  ↓
Profile.handleSaveProfile() (line 49-59)
  - Validates user.id exists
  - Calls saveUserProfile()
  ↓
profile.ts saveUserProfile() (line 126-152)
  - Saves to localStorage as backup
  - Upserts to Supabase user_profiles table ← FIX APPLIED HERE
  ↓
Success toast message displayed
```

## Prevention

When working with Supabase JSONB columns:

- ✅ Pass JavaScript objects/arrays directly
- ❌ Don't use JSON.stringify() before saving
- ❌ Don't use JSON.parse() after loading
- ✅ Use default values (|| []) to handle nulls
- ✅ Let Supabase client handle serialization automatically
