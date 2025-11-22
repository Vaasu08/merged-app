# 🔧 Fix RapidAPI Key Location + API URL

## 🚨 Issues Found in Your .env File

Looking at your screenshot, I see two problems:

### **Problem 1: Wrong API URL**
Line 5: `VITE_API_URL=http://localhost:4000`

**Should be:** `VITE_API_URL=http://localhost:3000`

Your backend runs on port 3000, not 4000!

### **Problem 2: RapidAPI Key in Wrong File**
You added `RAPIDAPI_KEY` to the **frontend** `.env` file, but it needs to be in the **backend** `server/.env` file!

---

## ✅ SOLUTION

### **Step 1: Fix Frontend .env**

**File:** `.env` (root directory)

**Change line 5:**
```env
# OLD (WRONG):
VITE_API_URL=http://localhost:4000

# NEW (CORRECT):
VITE_API_URL=http://localhost:3000
```

**Remove line 8** (RAPIDAPI_KEY doesn't belong here):
```env
# DELETE THIS LINE from frontend .env:
RAPIDAPI_KEY=97d3651f08msh6c6a94e6d3f996dp1e2cc0jsnf5fe5f7f984f
```

### **Step 2: Add RapidAPI Key to Backend .env**

**File:** `server/.env` (in the server directory)

**Add this line:**
```env
RAPIDAPI_KEY=97d3651f08msh6c6a94e6d3f996dp1e2cc0jsnf5fe5f7f984f
```

Your `server/.env` should look like:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
RAPIDAPI_KEY=97d3651f08msh6c6a94e6d3f996dp1e2cc0jsnf5fe5f7f984f
```

### **Step 3: Restart Both Servers**

**Backend:**
1. Find terminal running `npm start` in `server` directory
2. Press `Ctrl + C`
3. Run: `npm start`

**Frontend:**
1. Find terminal running `npm run dev`
2. Press `Ctrl + C`
3. Run: `npm run dev`

### **Step 4: Clear Browser Cache**

1. **Close all browser tabs** for localhost
2. **Press:** `Ctrl + Shift + Delete`
3. **Check:** "Cached images and files"
4. **Click:** "Clear data"

### **Step 5: Test**

1. **Open the new URL** shown in terminal (e.g., `http://localhost:8081/`)
2. **Go to Job Listings** page
3. **Search for:** "Full Stack Developer"
4. **You should see jobs!** 🎉

---

## 🔍 Quick Test

Open browser console (F12) and run:

```javascript
// Test backend directly
fetch('http://localhost:3000/api/jobs/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    what: 'software engineer',
    where: '',
    results_per_page: 5
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Jobs found:', data.results?.length || 0);
  console.log('First job:', data.results?.[0]?.title);
})
```

**Expected:** `✅ Jobs found: 5` (or more)

---

## 📝 Summary of Changes

### **Frontend `.env` (root directory):**
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000  # ← Changed from 4000 to 3000
VITE_GROQ_API_KEY=your_groq_key
# RAPIDAPI_KEY removed (doesn't belong here)
```

### **Backend `server/.env`:**
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
RAPIDAPI_KEY=97d3651f08msh6c6a94e6d3f996dp1e2cc0jsnf5fe5f7f984f  # ← Added here
```

---

## ✅ Checklist

- [ ] Changed `VITE_API_URL` from 4000 → 3000 in frontend `.env`
- [ ] Removed `RAPIDAPI_KEY` from frontend `.env`
- [ ] Added `RAPIDAPI_KEY` to `server/.env`
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Cleared browser cache
- [ ] Tested job search

---

**After these changes, job search will work!** 🚀
