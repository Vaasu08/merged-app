# 🔧 AI Agents Troubleshooting & Fix

## The Problem

Your AI agents aren't working because they need **API keys** to function. The agents use:
1. **Google Gemini AI** - For intelligent decision-making (required)
2. **Supabase** - For database storage (optional, agents work without it)

## ✅ Quick Fix (5 minutes)

### Step 1: Get a FREE Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 2: Add Your API Key  

Open your `.env` file (in the root of `c:\Users\vaasu\merged-app\`) and add:

```env
VITE_GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

**If `.env` doesn't exist**: Copy `.env.example` to `.env` first:
```bash
copy .env.example .env
```

Then edit `.env` and paste your Gemini API key.

### Step 3: Restart Dev Server

1. Stop the dev server (Ctrl+C in the terminal)
2. Run `npm run dev` again
3. The agents will now work!

---

## Why This Matters

Without the Gemini API key:
- ❌ Planner can't create intelligent weekly plans
- ❌ Recruiter can't generate optimized job search queries  
- ❌ Coach can't create personalized motivation
- ❌ Interviewer can't generate mock questions

**With the API key:**
- ✅ All 4 agents become fully operational
- ✅ Agents use AI to personalize everything for you
- ✅ Your Opal workflow integration activates

---

## Already Have the Key?

If you already added `VITE_GEMINI_API_KEY` to your `.env` file:

1. **Restart the dev server** - Environment variables only load on startup
2. **Check the spelling** - Must be exactly `VITE_GEMINI_API_KEY` (not `GEMINI_API_KEY`)
3. **Check the file** - Must be `.env` not `.env.example`

---

## Test It Works

After adding the key and restarting:

1. Go to `http://localhost:8080/agent-swarm`
2. Click **"Activate AI Agents"** or **"Run Weekly Update"**
3. You should see a loading spinner, then agent messages appear
4. Check the browser console (F12) - you should see logs like:
   - ` 🔍 Recruiter Agent: Generated query: ...`
   - `✅ Planner Agent: Created weekly plan`

---

## Fallback Mode

**Right now your agents are running in "fallback mode"** - they generate basic generic plans without AI.

Once you add the Gemini API key, they'll switch to **"AI mode"** and become much smarter!

---

## Need Help?

If it still doesn't work after adding the key:
1. Check the browser console for errors (F12 → Console tab)
2. Check the terminal for error messages
3. Make sure you restarted the dev server

**Free Gemini API Key:** https://makersuite.google.com/app/apikey

🚀 **Once you add the key, your agents will come alive!**
