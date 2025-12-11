# 🚀 AutoDebugger Setup Guide for Other Users

This guide helps other developers add AutoDebugger to their repositories.

## Quick Setup (5 minutes)

### Step 1: Add the Workflow

Copy the AutoDebugger workflow to your repository:

```bash
# In your repository root
mkdir -p .github/workflows
```

Create `.github/workflows/autodebugger.yml`:

```yaml
name: AutoDebugger - Self-Healing Deployment Agent

on:
  deployment_status:
    types: [failure]
  workflow_run:
    workflows: ["Deploy", "Build", "CI"]
    types: [completed]
  workflow_dispatch:

jobs:
  autodebugger:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install AutoDebugger
        run: |
          git clone https://github.com/Thegenarator/autodebugger.git
          cd autodebugger && npm install
      - name: Run AutoDebugger
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: ${{ github.event.repository.name }}
        run: |
          cd autodebugger
          npm run cli -- autonomous ${{ github.event.deployment_status?.target_url || 'https://your-app.vercel.app' }}
```

### Step 2: Add GitHub Secrets

1. Go to your repository on GitHub
2. Click `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add these secrets:

| Secret Name | Description | Where to Get It |
|------------|-------------|-----------------|
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com](https://platform.openai.com/api-keys) |
| `GITHUB_TOKEN` | Auto-generated | Already available in Actions |
| `VERCEL_TOKEN` | Vercel token (optional) | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_TEAM_ID` | Vercel team ID (optional) | Vercel dashboard → Team settings |
| `VERCEL_PROJECT_ID` | Vercel project ID (optional) | Vercel project settings |

### Step 3: Test It

1. **Manual trigger**: Go to `Actions` → `AutoDebugger` → `Run workflow`
2. **Or wait** for a deployment failure - it will trigger automatically!

## How It Works

### Automatic Mode

When a deployment fails:
1. ✅ AutoDebugger workflow triggers automatically
2. 🔍 Analyzes error logs using AI
3. 🎯 Generates fix using Cline + Oumi RL
4. 📝 Creates PR with fix
5. 🤖 CodeRabbit reviews (if enabled)
6. 🚀 Auto-redeploys after merge

### Manual Mode

Trigger manually from GitHub Actions:
- Go to `Actions` tab
- Select `AutoDebugger` workflow
- Click `Run workflow`
- Enter deployment URL
- Click `Run workflow`

## Using AutoDebugger CLI Locally

If you want to run AutoDebugger from your local machine:

```bash
# Clone AutoDebugger
git clone https://github.com/Thegenarator/autodebugger.git
cd autodebugger
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run commands
npm run cli -- diagnose "Build failed: exit code 1"
npm run cli -- autonomous https://your-app.vercel.app
npm run cli -- monitor https://your-app.vercel.app
```

## Troubleshooting

### Workflow doesn't trigger

- Check that `.github/workflows/autodebugger.yml` exists
- Verify workflow syntax is correct
- Check GitHub Actions are enabled in repo settings

### "OPENAI_API_KEY missing" error

- Make sure you added `OPENAI_API_KEY` to repository secrets
- Check secret name matches exactly (case-sensitive)

### PR not created

- Verify `GITHUB_TOKEN` is available (auto-provided)
- Check repository permissions allow creating PRs
- Review workflow logs for errors

## Examples

### Example 1: Vercel Deployment

```yaml
# In your deploy workflow
- name: Deploy to Vercel
  run: vercel deploy --prod

# AutoDebugger will trigger if deployment fails
```

### Example 2: Custom Deployment

```yaml
# Trigger AutoDebugger manually
- name: Trigger AutoDebugger
  if: failure()
  uses: Thegenarator/autodebugger-action@main
  with:
    deployment_url: ${{ steps.deploy.outputs.url }}
```

## Support

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/Thegenarator/autodebugger/issues)
- 💬 [Discussions](https://github.com/Thegenarator/autodebugger/discussions)

## License

MIT - Feel free to use in your projects!

