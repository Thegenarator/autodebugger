# AutoDebugger — A Self-Healing Deployment AI Agent

An intelligent AI agent that autonomously monitors, diagnoses, and fixes deployment issues in real-time.

## 🏆 Hackathon Submission

**Event:** AI Agents Assemble Hackathon (Dec 8-14)  
**Prize Categories Targeted:**
- ✅ Infinity Build Award ($5,000) - Cline CLI integration
- ✅ Wakanda Data Award ($4,000) - Kestra AI Agent
- ✅ Iron Intelligence Award ($3,000) - Oumi RL fine-tuning
- ✅ Stormbreaker Deployment Award ($2,000) - Vercel deployment
- ✅ Captain Code Award ($1,000) - CodeRabbit integration

## 🎯 Project Overview

AutoDebugger is a self-healing deployment AI agent that creates a **complete autonomous loop**:

1. 🔍 **Detects** deployment failures automatically
2. 📊 **Summarizes** error logs using Kestra AI Agent
3. 🎯 **Decides** the right fix using Oumi RL-trained agent
4. 🔧 **Fixes** the code automatically using Cline CLI
5. 📝 **Opens PR** with fixes
6. 🤖 **CodeRabbit reviews** the PR automatically
7. 🚀 **Redeploys** on Vercel
8. ✅ **Verifies** deployment health

**It recovers failed deployments by itself!** This is the autonomous agent loop that hackathon judges LOVE.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AutoDebugger System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Cline CLI   │───▶│   Kestra     │───▶│    Oumi      │  │
│  │  Automation  │    │ Orchestration│    │  RL Agent    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │           │
│         └───────────────────┴────────────────────┘           │
│                           │                                  │
│                  ┌────────▼────────┐                         │
│                  │  Deployment     │                         │
│                  │  Monitoring     │                         │
│                  └─────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

- **Cline CLI**: Core automation engine for debugging workflows
- **Kestra**: Workflow orchestration and AI agent decision-making
- **Oumi**: Reinforcement learning for self-improvement
- **Vercel**: Frontend deployment and dashboard
- **CodeRabbit**: Automated code review and quality checks

## 🚀 Quick Start

### Option 1: Use as GitHub Action (Recommended for Teams)

Add AutoDebugger to your repository to automatically fix deployment failures:

1. **Copy the workflow file** to your repo:
   ```bash
   mkdir -p .github/workflows
   curl -o .github/workflows/autodebugger.yml https://raw.githubusercontent.com/Thegenarator/autodebugger/main/.github/workflows/autodebugger.yml
   ```

2. **Add required secrets** to your GitHub repository:
   - Go to `Settings` → `Secrets and variables` → `Actions`
   - Add these secrets:
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `GITHUB_TOKEN` - Auto-generated (already available)
     - `VERCEL_TOKEN` - (Optional) For Vercel deployments
     - `VERCEL_TEAM_ID` - (Optional) Your Vercel team ID
     - `VERCEL_PROJECT_ID` - (Optional) Your Vercel project ID

3. **AutoDebugger will automatically run** when:
   - A deployment fails
   - A workflow run fails
   - You manually trigger it from Actions tab

### Option 2: Install as CLI Tool

```bash
# Clone the repository
git clone https://github.com/Thegenarator/autodebugger.git
cd autodebugger

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# - OPENAI_API_KEY
# - GITHUB_TOKEN
# - GITHUB_OWNER
# - GITHUB_REPO
# - VERCEL_TOKEN (optional)

# Run the autonomous agent
npm run cli -- autonomous https://your-app.vercel.app

# Or use individual commands
npm run cli -- monitor https://your-app.vercel.app
npm run cli -- diagnose error.log
npm run cli -- diagnose "Build failed: exit code 1"
npm run cli -- fix issue-123 --create-pr --redeploy
```

### Option 3: Use in Your Own GitHub Actions Workflow

Add this step to your existing workflow:

```yaml
- name: 🤖 AutoDebugger Recovery
  uses: Thegenarator/autodebugger@main
  with:
    deployment_url: ${{ steps.deploy.outputs.url }}
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
  if: failure() # Only run on failure
```

## 📋 Features

- [ ] Real-time deployment monitoring
- [ ] AI-powered error diagnosis
- [ ] Automated fix generation
- [ ] Self-learning capability (Oumi RL)
- [ ] Workflow orchestration (Kestra)
- [ ] Web dashboard (Vercel)
- [ ] CLI automation (Cline)

## 📝 Development Plan

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed implementation roadmap.

## 📖 How It Works for Other Users

### For Repository Owners

1. **Add AutoDebugger workflow** to your `.github/workflows/` directory
2. **Configure secrets** in your GitHub repo settings
3. **That's it!** AutoDebugger will:
   - Monitor your deployments automatically
   - Detect failures and diagnose issues
   - Generate fixes using AI
   - Create pull requests with fixes
   - Wait for CodeRabbit review
   - Redeploy automatically

### For Developers

When AutoDebugger detects an issue:

1. **You'll see a PR** created automatically with the fix
2. **CodeRabbit reviews** the changes (if enabled)
3. **You can review** the AI-generated fix
4. **Merge when ready** - AutoDebugger handles the rest!

### Example Workflow

```
Deployment fails → AutoDebugger detects → Analyzes logs → 
Generates fix → Opens PR → CodeRabbit reviews → 
You merge → Auto-redeploys → Verifies health ✅
```

## 🔧 Configuration

### Required Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for AI analysis
- `GITHUB_TOKEN` - GitHub token (auto-provided in Actions)
- `GITHUB_OWNER` - Your GitHub username/org
- `GITHUB_REPO` - Repository name

### Optional Variables

- `VERCEL_TOKEN` - For Vercel deployments
- `VERCEL_TEAM_ID` - Vercel team ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `CLINE_MODEL` - AI model to use (default: gpt-4)

## 🤝 Contributing

This is a hackathon project. Contributions welcome via pull requests!

## 📄 License

MIT

