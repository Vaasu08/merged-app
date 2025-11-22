# 🔥 NUCLEAR OPTION: Complete Cache Clear + Environment Variable Fix

## 🚨 The Problem

Your browser has **EXTREMELY aggressive caching** of the compiled JavaScript. Even after restarting the dev server, it's still using the old cached code that points to port 4000.

---

## ✅ FINAL SOLUTION (This WILL Work)

### **Step 1: Add Environment Variable**

1. **Open your `.env` file** in the root directory

2. **Add this line:**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Save the file**

This will override the hardcoded default in `adzunaService.ts`.

### **Step 2: Kill ALL Dev Servers**

You have **TWO** dev servers running (I can see from your terminal list). Kill both:

1. **Find BOTH terminals** running `npm run dev`
2. **Press `Ctrl + C`** in BOTH
3. **Wait for them to fully stop**

### **Step 3: Clear Browser Cache COMPLETELY**

**Option A: Clear All Data (Recommended)**

1. **Close ALL browser tabs** for localhost
2. **Press:** `Ctrl + Shift + Delete`
3. **Select:** "All time"
4. **Check ALL boxes:**
   - Browsing history
   - Cookies and other site data
   - **Cached images and files** ← MOST IMPORTANT
5. **Click:** "Clear data"

**Option B: Use Incognito Mode (Quick Test)**

1. **Open Incognito:** `Ctrl + Shift + N`
2. **Go to:** `http://localhost:8081/` (or whatever port shows when you restart)
3. **Test job search**

If it works in Incognito, it's definitely a cache issue!

### **Step 4: Restart Dev Server (Only ONE)**

```bash
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:XXXX/
```

### **Step 5: Test in Fresh Browser**

1. **Open the URL** shown in the terminal
2. **Open DevTools:** `F12`
3. **Go to Network tab**
4. **Check "Disable cache"** checkbox
5. **Refresh page:** `Ctrl + Shift + R`
6. **Test job search**

---

## 🔍 Verify Environment Variable is Loaded

Open browser console (F12) and run:

```javascript
// This should show 'http://localhost:3000' if env var is loaded
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:4000');
```

**Expected:** `API URL: http://localhost:3000`

**If it shows 4000:** The `.env` file wasn't loaded. Make sure you:
1. Added `VITE_API_URL=http://localhost:3000` to `.env`
2. Restarted the dev server AFTER adding it
3. Cleared browser cache

---

## 🧪 Test Backend Directly

Open browser console and test the backend directly (bypassing frontend code):

```javascript
// Test 1: Direct to backend
fetch('http://localhost:3000/api/jobs/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ what: 'software engineer', where: '', results_per_page: 5 })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Direct backend test:', data.results?.length || 0, 'jobs');
  console.log('First job:', data.results?.[0]?.title);
})

// Test 2: Via Vite proxy
fetch('/api/jobs/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ what: 'software engineer', where: '', results_per_page: 5 })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Via proxy test:', data.results?.length || 0, 'jobs');
})
```

**Both should return jobs!**

---

## 🚨 If STILL Not Working

### **Nuclear Option: Delete node_modules and Rebuild**

```bash
# Stop dev server (Ctrl+C)

# Delete node_modules and cache
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .vite

# Reinstall
npm install

# Restart
npm run dev
```

### **Alternative: Use Direct Backend URL**

If nothing else works, you can bypass the Vite proxy entirely by using the direct backend URL.

**Edit `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

This will make `adzunaService.ts` use `http://localhost:3000` directly instead of relying on the Vite proxy.

---

## 📋 Complete Checklist

- [ ] Added `VITE_API_URL=http://localhost:3000` to `.env`
- [ ] Killed ALL dev servers (check for multiple)
- [ ] Cleared browser cache completely (Ctrl+Shift+Delete)
- [ ] Restarted dev server (only ONE instance)
- [ ] Opened in Incognito mode to test
- [ ] Checked Network tab "Disable cache" is ON
- [ ] Verified env var loaded in console
- [ ] Tested backend directly
- [ ] Tested via Vite proxy

---

## ✅ Expected Result

**Console:**
```
API URL: http://localhost:3000
✅ Direct backend test: 5 jobs
First job: Senior Software Engineer
✅ Via proxy test: 5 jobs
```

**UI:**
- Job listings show results
- AI Agents find jobs
- No more "ERR_CONNECTION_REFUSED"

---

## 🎯 Summary

**The issue:** Browser cache is EXTREMELY stubborn

**The fix:**
1. Add `VITE_API_URL=http://localhost:3000` to `.env`
2. Kill ALL dev servers
3. Clear browser cache completely
4. Restart dev server
5. Test in Incognito mode

**This WILL work!** 🚀
