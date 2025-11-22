# 🔧 Fix: Browser Cache + Get Your Own RapidAPI Key

## 🎯 Problem

Your browser is using **cached code** that still points to port 4000. Also, the hardcoded RapidAPI key might be expired.

---

## ✅ Solution 1: Clear Browser Cache (Quick Fix)

### **Option A: Hard Refresh (Try This First)**

1. **Close ALL browser tabs** for `localhost:5173`
2. **Open a NEW tab**
3. **Navigate to:** `http://localhost:5173`
4. **Hard refresh:**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### **Option B: Clear Cache Manually**

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Click "Clear storage"** (left sidebar)
4. **Check all boxes**
5. **Click "Clear site data"**
6. **Refresh page**

### **Option C: Incognito Mode (Test)**

1. **Open Incognito/Private window:** `Ctrl + Shift + N`
2. **Navigate to:** `http://localhost:5173`
3. **Test job search**

If it works in Incognito, it's definitely a cache issue!

---

## ✅ Solution 2: Get Your Own FREE RapidAPI Key

The hardcoded key might be expired or rate-limited. Get your own free key:

### **Step 1: Sign Up for RapidAPI**

1. **Go to:** https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch

2. **Click "Sign Up"** (top right)
   - Use Google/GitHub for quick signup

3. **Click "Subscribe to Test"** button

4. **Select the FREE plan:**
   - **Basic Plan: $0/month**
   - 2,500 requests/month free
   - Click "Subscribe"

### **Step 2: Get Your API Key**

1. **After subscribing**, you'll see your API key in the **"Code Snippets"** section

2. **Look for:** `x-rapidapi-key: YOUR_KEY_HERE`

3. **Copy the key** (starts with something like `abc123...`)

### **Step 3: Update Backend with Your Key**

1. **Open:** `server/src/app.js`

2. **Find line 633:**
   ```javascript
   const RAPIDAPI_KEY = 'c5b9bfa7fbmshf020f8d59db3005p1d3fabjsn350c18b182ae';
   ```

3. **Replace with your key:**
   ```javascript
   const RAPIDAPI_KEY = 'YOUR_NEW_KEY_HERE';
   ```

4. **Save the file**

5. **Restart backend:**
   - In the terminal running `npm start` in `server` directory
   - Press `Ctrl + C`
   - Run: `npm start`

### **Step 4: Test**

1. **Hard refresh browser** (`Ctrl + Shift + R`)
2. **Go to Job Listings or AI Agents**
3. **Search for jobs**
4. **Check console** - should see: `✅ Found X jobs!`

---

## 🔍 Verify Backend is Working

Open browser console (F12) and run:

```javascript
// Test 1: Health check
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)

// Test 2: Job search
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
  console.log(data);
})
```

**Expected:**
- Test 1: `{ status: 'ok' }`
- Test 2: `✅ Jobs found: 5` (or more)

**If Test 2 fails:** The RapidAPI key is expired. Get your own key (see above).

---

## 🚨 Common Issues

### Issue: "Still showing port 4000 error"

**Cause:** Browser cache

**Fix:**
1. Close ALL tabs
2. Clear browser cache (see Solution 1 above)
3. Open in Incognito mode to test

### Issue: "Backend returns empty results"

**Cause:** RapidAPI key expired or rate-limited

**Fix:** Get your own free RapidAPI key (see Solution 2 above)

### Issue: "Backend not responding"

**Cause:** Backend server not running

**Fix:**
```bash
cd server
npm start
```

Should see: `✅ Server listening on :3000`

---

## 📝 Quick Checklist

- [ ] Backend running on port 3000
- [ ] Browser cache cleared (hard refresh)
- [ ] Tested in Incognito mode
- [ ] Got own RapidAPI key (if needed)
- [ ] Updated `server/src/app.js` with new key
- [ ] Restarted backend server
- [ ] Hard refreshed browser again

---

## ✅ Success!

Once working, you'll see:

**Console:**
```
💼 Recruiter Agent: Searching for jobs...
🔍 Generated AI-optimized search query: Senior React Developer TypeScript
✅ Found 10 jobs!
```

**UI:**
- Job listings show up
- No more "No Jobs Found"
- Agent Swarm shows job recommendations

---

## 🎉 Summary

**Two main issues:**
1. **Browser cache** - Clear it with hard refresh
2. **Expired API key** - Get your own free RapidAPI key

**Follow the steps above and you'll be good to go!** 🚀
