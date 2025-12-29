# Production Testing Guide

This guide helps you test AutoDebugger in production mode with real API calls.

## Prerequisites

1. **Environment Variables** - All required variables must be set
2. **GitHub Repository** - Must have access to create branches and PRs
3. **Vercel Project** - Must have deployment access
4. **OpenAI API Key** - Must have valid quota/billing

## Step 1: Verify Environment Variables

Run the test script to check if all variables are loaded:

```bash
node test-prod-env.js
```

Expected output:
```
✅ All required environment variables are set!
   You can run: npm run cli -- autonomous <url> --prod --force
```

## Step 2: Test with a Real Deployment

### Option A: Test with Existing Deployment (Recommended)

1. **Find a deployment URL** from your Vercel dashboard
2. **Run with production mode**:
   ```bash
   npm run cli -- autonomous "https://your-app.vercel.app" --prod --force
   ```

### Option B: Create a Test Deployment Issue

To test the full autonomous loop, you can:

1. **Intentionally break something** in your code (e.g., add a syntax error)
2. **Deploy to Vercel** (it will fail)
3. **Run AutoDebugger**:
   ```bash
   npm run cli -- autonomous "https://your-broken-app.vercel.app" --prod
   ```
4. **AutoDebugger should**:
   - Detect the failure
   - Generate a fix
   - Create a PR
   - Wait for CodeRabbit review
   - Merge and redeploy
   - Verify the fix worked

## Step 3: Verify Each Step

### ✅ Step 1: Detection
- Should show: `✗ Deployment failure detected!`
- Check: Error count and details

### ✅ Step 2-4: AI Processing
- Should show: Summary, strategy, and fix plan
- **Note**: If OpenAI quota exceeded, will use fallbacks (still works)

### ✅ Step 5: PR Creation
- Should show: `✓ PR #X created: https://github.com/...`
- **Verify**: Check GitHub - PR should actually exist
- **Verify**: Files changed should match the fix plan

### ✅ Step 6: CodeRabbit Review
- Should show: Review status and comments
- **Note**: Requires CodeRabbit GitHub App installed
- **Timeout**: May take 30-60 seconds

### ✅ Step 7: Vercel Redeploy
- Should show: Deployment URL and status
- **Verify**: Check Vercel dashboard for new deployment

### ✅ Step 8: Verification
- Should show: Health check result and quality score
- **Verify**: Deployment should be healthy

## Common Issues

### ❌ "GITHUB_OWNER and GITHUB_REPO must be set"

**Problem**: Environment variables not loaded

**Solution**:
1. Check if variables are exported: `echo $GITHUB_OWNER`
2. Use `.env` file instead (recommended):
   ```bash
   # Create ~/autodebugger/.env
   GITHUB_OWNER=Thegenarator
   GITHUB_REPO=autodebugger
   GITHUB_TOKEN=ghp_...
   # ... etc
   ```
3. Run test script: `node test-prod-env.js`

### ❌ "429 You exceeded your current quota" (OpenAI)

**Problem**: OpenAI API quota/billing issue

**Impact**: AI steps will use fallbacks (system still works)
**Solution**: Add billing to OpenAI account or use fallbacks

### ❌ "Failed to create PR: 401" (GitHub)

**Problem**: Invalid or expired GitHub token

**Solution**:
1. Regenerate token: https://github.com/settings/tokens
2. Ensure token has `repo` scope
3. Update `.env` or export: `export GITHUB_TOKEN=ghp_...`

### ❌ "Failed to redeploy: 400" (Vercel)

**Problem**: Invalid Vercel credentials or project not linked

**Solution**:
1. Check `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`
2. Ensure project is linked to GitHub
3. Verify token has deployment permissions

## Testing Checklist

- [ ] Environment variables verified (`node test-prod-env.js`)
- [ ] GitHub token has `repo` scope
- [ ] CodeRabbit GitHub App installed on repo
- [ ] Vercel project linked to GitHub
- [ ] Deployment URL is accessible
- [ ] OpenAI API key has quota (or fallbacks work)
- [ ] PR creation succeeds
- [ ] CodeRabbit review completes (or times out gracefully)
- [ ] Vercel redeploy succeeds
- [ ] Final health check passes

## Quick Test Command

```bash
# Set env vars (or use .env file)
export GITHUB_TOKEN="ghp_..."
export GITHUB_OWNER="Thegenarator"
export GITHUB_REPO="autodebugger"
# ... etc

# Run test
npm run cli -- autonomous "https://your-app.vercel.app" --prod --force
```

## What to Expect

When production mode works correctly:

1. **Real GitHub PR** will be created
2. **CodeRabbit** will review (if app installed)
3. **Vercel** will redeploy
4. **Health check** will verify success

All of these are **real API calls** - not simulated!

