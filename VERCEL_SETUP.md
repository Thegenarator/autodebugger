# 🚀 Vercel Environment Variables Setup Guide

## Adding Secrets to Vercel

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `autodebugger`)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Click **Add New** and add each variable:

#### Required Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_...` |
| `GITHUB_OWNER` | Your GitHub username | `Thegenarator` |
| `GITHUB_REPO` | Repository name | `autodebugger` |

#### Optional Variables (for Vercel Integration)

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | `...` |
| `VERCEL_TEAM_ID` | Your Vercel team ID | `team_...` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `prj_...` |
| `CLINE_MODEL` | OpenAI model to use | `gpt-4` or `gpt-4-turbo` |

### Step 3: Set Environment Scope

For each variable, select the environments where it should be available:

- ✅ **Production** - For production deployments
- ✅ **Preview** - For preview deployments (recommended)
- ✅ **Development** - For local development (if using `vercel dev`)

**Recommendation:** Enable all three for full functionality.

### Step 4: Redeploy

After adding variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeployment

## Quick Setup Script

You can also use Vercel CLI to add variables:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add OPENAI_API_KEY production
vercel env add GITHUB_TOKEN production
vercel env add GITHUB_OWNER production
vercel env add GITHUB_REPO production

# Add to all environments
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development
# ... repeat for other variables
```

## Verifying Variables Are Set

### Option 1: Check in Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. You should see all your variables listed

### Option 2: Check in Deployment Logs

1. Go to **Deployments** → Select a deployment
2. Check the build logs
3. Look for environment variable usage (they won't show values, but you'll see if they're being used)

### Option 3: Test via API

Create a test API route to verify (don't expose values!):

```javascript
// api/test-env.js
export default function handler(req, res) {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGitHub = !!process.env.GITHUB_TOKEN;
  
  return res.json({
    openai_configured: hasOpenAI,
    github_configured: hasGitHub,
    // Don't expose actual values!
  });
}
```

## Troubleshooting

### Variables Not Available in API Routes

**Problem:** Environment variables not accessible in serverless functions

**Solution:**
1. Make sure variables are added to **Production** environment
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Dashboard Still Shows Demo Mode

**Problem:** Dashboard shows demo mode even after adding variables

**Solution:**
1. Verify variables are set in Vercel (Settings → Environment Variables)
2. Redeploy the application
3. Clear browser cache and hard refresh
4. Check browser console for API errors

### CLI Still Uses Demo Mode

**Problem:** CLI shows demo mode even with `.env` file

**Solution:**
1. Make sure `.env` file is in project root
2. Verify `.env` file has `OPENAI_API_KEY=your_key_here` (no quotes needed)
3. Check file is not in `.gitignore` (it should be!)
4. Restart terminal/command prompt after creating `.env`

```bash
# Verify .env is loaded
cd ~/AutoDebugger
cat .env | grep OPENAI_API_KEY

# Test if it's loaded
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? 'Loaded' : 'Not loaded')"
```

## Security Best Practices

1. ✅ **Never commit `.env` file** - It's in `.gitignore`
2. ✅ **Use Vercel Environment Variables** for production
3. ✅ **Rotate keys regularly** - Especially if exposed
4. ✅ **Use different keys** for development and production
5. ✅ **Limit token permissions** - Only grant necessary scopes

## Example `.env` File (Local Development)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
CLINE_MODEL=gpt-4

# GitHub Configuration
GITHUB_TOKEN=ghp_your-token-here
GITHUB_OWNER=Thegenarator
GITHUB_REPO=autodebugger

# Vercel Configuration (Optional)
VERCEL_TOKEN=your-vercel-token
VERCEL_TEAM_ID=team_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx
```

## After Setup

Once variables are set in Vercel:

1. ✅ Dashboard will use real API calls (not demo mode)
2. ✅ Autonomous loop will execute with real AI
3. ✅ Fixes will be generated using actual code analysis
4. ✅ Pull requests will be created with real code changes

## Need Help?

- Check Vercel docs: https://vercel.com/docs/environment-variables
- Check deployment logs for errors
- Verify variable names match exactly (case-sensitive)
- Make sure to redeploy after adding variables

