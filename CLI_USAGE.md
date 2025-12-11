# 🖥️ AutoDebugger CLI Usage Guide

## Installation

The CLI is available via npm scripts. There's no global installation needed.

## Basic Commands

### Diagnose Issues

```bash
# Diagnose from a file
npm run cli -- diagnose error.log

# Diagnose from text
npm run cli -- diagnose "Build failed: exit code 1"

# Diagnose with JSON output
npm run cli -- diagnose error.log --output json
```

### Fix Issues

```bash
# Fix a specific issue
npm run cli -- fix issue-1234567890

# Fix with auto-PR creation
npm run cli -- fix issue-1234567890 --create-pr

# Fix and redeploy
npm run cli -- fix issue-1234567890 --create-pr --redeploy
```

### Autonomous Recovery

```bash
# Run full autonomous recovery loop
npm run cli -- autonomous https://your-app.vercel.app

# With options
npm run cli -- autonomous https://your-app.vercel.app --create-pr --redeploy
```

### Monitor Deployments

```bash
# Monitor a deployment URL
npm run cli -- monitor https://your-app.vercel.app

# Monitor with interval (seconds)
npm run cli -- monitor https://your-app.vercel.app --interval 30
```

### Check Status

```bash
# Show agent status
npm run cli -- status
```

## Common Issues

### "autodebugger: command not found"

**Solution:** Use `npm run cli` instead of `autodebugger`:

```bash
# ❌ Wrong
autodebugger diagnose error.log

# ✅ Correct
npm run cli -- diagnose error.log
```

### "Cline CLI not found"

**Solution:** This is normal on Windows/WSL. The system will automatically use the API-based implementation which works the same way.

### Workflow Syntax Errors

If you see errors like:
```
Invalid workflow file: .github/workflows/autodebugger.yml
Unexpected symbol: 'deployment_status?'
```

**Solution:** The workflow file has been fixed. Pull the latest changes:
```bash
git pull origin main
```

## Examples

### Example 1: Diagnose a Build Error

```bash
# Create a test error file
echo "Build failed: Module not found: './components/Button'" > build-error.log

# Diagnose it
npm run cli -- diagnose build-error.log
```

### Example 2: Full Autonomous Recovery

```bash
# Run autonomous recovery on a failed deployment
npm run cli -- autonomous https://my-app.vercel.app
```

This will:
1. Detect the deployment failure
2. Analyze error logs
3. Generate fixes
4. Create a Pull Request
5. Wait for review
6. Redeploy automatically

### Example 3: Fix a Specific Issue

```bash
# First, diagnose to get an issue ID
npm run cli -- diagnose "Error: Cannot find module 'express'" --output json > diagnosis.json

# Extract issue ID (example: issue-1765492201640)
ISSUE_ID=$(cat diagnosis.json | grep -o '"issueId":"[^"]*"' | cut -d'"' -f4)

# Fix the issue
npm run cli -- fix "$ISSUE_ID" --create-pr
```

## Environment Variables

Make sure you have these set in your `.env` file:

```bash
OPENAI_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo_name
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_team_id
VERCEL_PROJECT_ID=your_project_id
```

## Troubleshooting

### Diagnosis Returns "Unknown issue"

This usually means:
- The error log doesn't contain enough information
- The AI couldn't identify a specific problem
- Try providing more context in the error log

**Solution:** Include more details:
```bash
npm run cli -- diagnose "Build failed: exit code 1
Error: Module not found: './components/Button'
File: src/App.js:15
Stack trace: ..."
```

### Fix Command Doesn't Work

**Check:**
1. Is the issue ID correct? (from diagnosis output)
2. Do you have API keys configured?
3. Is the repository accessible?

**Solution:**
```bash
# Verify your setup
npm run cli -- status

# Check environment variables
cat .env | grep -E "OPENAI|GITHUB|VERCEL"
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run cli -- diagnose <source>` | Diagnose issues from logs or text |
| `npm run cli -- fix <issue-id>` | Fix a specific issue |
| `npm run cli -- autonomous <url>` | Run full autonomous recovery |
| `npm run cli -- monitor <url>` | Monitor a deployment |
| `npm run cli -- status` | Show agent status |

## Need Help?

- Check the main README.md
- See DASHBOARD_RESULTS.md for dashboard usage
- Review SETUP_FOR_OTHERS.md for setup instructions

