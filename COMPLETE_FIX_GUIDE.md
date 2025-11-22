# 🎯 COMPLETE FIX: Job Search Working Guide

## 🚨 Current Issue

Browser is using **cached code** pointing to port 4000. Also, the RapidAPI key might be expired.

---

## ✅ SOLUTION (Choose One)

### **Option 1: Clear Browser Cache (Quickest)**

**Do this first before anything else:**

1. **Close ALL browser tabs** for `localhost:5173`

2. **Open DevTools** (F12) in a new tab

3. **Right-click the refresh button** → Select **"Empty Cache and Hard Reload"**

4. **Or use keyboard shortcut:**
   - `Ctrl + Shift + Delete` → Clear browsing data → Check "Cached images and files" → Clear

5. **Or try Incognito mode:**
   - `Ctrl + Shift + N` → Navigate to `http://localhost:5173`

---

### **Option 2: Get Your Own RapidAPI Key (Recommended)**

The hardcoded key is likely expired. Get a **FREE** key:

#### **Step 1: Sign Up**
1. Go to: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Click **"Sign Up"** (use Google/GitHub for quick signup)
3. Click **"Subscribe to Test"**
4. Select **"Basic Plan"** - **$0/month** (2,500 free requests/month)
5. Click **"Subscribe"**

#### **Step 2: Get Your Key**
1. After subscribing, look for **"Code Snippets"** section
2. Find: `x-rapidapi-key: YOUR_KEY_HERE`
3. **Copy your key**

#### **Step 3: Add to Environment Variable**

**Option A: Use .env file (Easiest)**

1. **Open:** `server/.env`

2. **Add this line:**
   ```env
   RAPIDAPI_KEY=your_key_here
   ```

3. **Restart backend:**
   ```bash
   # In terminal running server, press Ctrl+C
   npm start
   ```

**Option B: Edit code directly**

1. **Open:** `server/src/app.js`
2. **Find line 633:**
   ```javascript
   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'c5b9bfa7fbmshf020f8d59db3005p1d3fabjsn350c18b182ae';
   ```
3. **Replace the fallback key with yours:**
   ```javascript
   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'YOUR_NEW_KEY_HERE';
   ```
4. **Save and restart backend**

---

## 🔍 Test Everything

### **Test 1: Backend Health**

Open browser console (F12):

```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** `{ status: 'ok' }`

### **Test 2: Job Search API**

```javascript
fetch('http://localhost:3000/api/jobs/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    what: 'software engineer',
    where: 'San Francisco',
    results_per_page: 5
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Jobs found:', data.results?.length || 0);
  console.log('First job:', data.results?.[0]?.title);
})
```

**Expected:** 
```
✅ Jobs found: 5
First job: Senior Software Engineer
```

**If you see an error:** The RapidAPI key is expired. Get your own (see Option 2 above).

### **Test 3: AI Agents**

1. Go to **AI Career Agent Swarm** page
2. Click **"Run Weekly Update"**
3. Check console:
   ```
   💼 Recruiter Agent: Searching for jobs...
   🔍 Generated AI-optimized search query: Senior React Developer TypeScript
   ✅ Found 10 jobs!
   ```

---

## 📋 Complete Checklist

- [ ] Backend server running (`npm start` in `server` directory)
- [ ] Backend shows: `✅ Server listening on :3000`
- [ ] Browser cache cleared (hard refresh or incognito)
- [ ] Health check works (`http://localhost:3000/health`)
- [ ] Job search API test returns results
- [ ] Got own RapidAPI key (if needed)
- [ ] Added `RAPIDAPI_KEY` to `server/.env`
- [ ] Restarted backend server
- [ ] Hard refreshed browser (`Ctrl + Shift + R`)
- [ ] AI Agents show job listings

---

## 🎯 Environment Variables Summary

### **Frontend (`.env` in root):**
```env
VITE_GROQ_API_KEY=gsk_your_groq_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Backend (`server/.env`):**
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
RAPIDAPI_KEY=your_rapidapi_key_here  # Add this!
```

---

## 🚨 Troubleshooting

### "Still getting port 4000 error"

**Cause:** Browser cache

**Fix:**
1. Close ALL tabs
2. Clear cache: `Ctrl + Shift + Delete`
3. Check "Cached images and files"
4. Click "Clear data"
5. Open new tab → Hard refresh

### "Backend returns 0 jobs"

**Cause:** RapidAPI key expired or rate-limited

**Fix:** Get your own free key (see Option 2)

### "TypeError: Failed to fetch"

**Cause:** Backend not running or wrong port

**Fix:**
1. Check backend terminal shows: `✅ Server listening on :3000`
2. If not, restart: `cd server && npm start`

---

## ✅ Success Indicators

**Console:**
```
🚀 Starting Multi-Agent Career Swarm...
🎯 Planner Agent: Analyzing resume...
💼 Recruiter Agent: Searching for jobs...
🔍 Generated AI-optimized search query: Senior React Developer TypeScript
✅ Found 10 jobs!
🎤 Interviewer Agent: Assessing readiness...
💪 Coach Agent: Generating motivation...
✅ All agents completed successfully!
```

**UI:**
- Job Listings page shows results
- AI Agent Swarm displays job recommendations
- No "No Jobs Found" message

---

## 🎉 Final Steps

1. **Clear browser cache** (most important!)
2. **Get RapidAPI key** (if old one expired)
3. **Add to `server/.env`**
4. **Restart backend**
5. **Hard refresh browser**
6. **Test AI Agents**

**You're all set!** 🚀
