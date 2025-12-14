# AutoDebugger
## Self-Healing Deployment AI Agent

**Automatically detect, analyze, and recover from deployment failures — without human intervention.**

AutoDebugger monitors deployments, reasons about failures, generates fixes, opens pull requests, reviews changes, and (optionally) redeploys your app.

[![Run Demo](https://img.shields.io/badge/Run-Demo-brightgreen)](https://autodebugger.vercel.app)
[![View GitHub](https://img.shields.io/badge/View-GitHub-blue)](https://github.com/Thegenarator/autodebugger)
[![Live Dashboard](https://img.shields.io/badge/Live-Dashboard-purple)](https://autodebugger.vercel.app)

---

## 🎯 How AutoDebugger Works

AutoDebugger runs an **autonomous recovery loop**:

```
Detect → Summarize → Decide → Fix → PR → Review → Deploy → Verify
```

Each step is designed to be **safe, observable, and auditable** through pull requests and deployment logs.

### The Complete Flow

1. **🔍 Detect** - Monitors deployment health and identifies failures
2. **🧠 Summarize** - Kestra AI Agent analyzes logs from multiple sources
3. **🎯 Decide** - Oumi RL agent selects optimal fix strategy
4. **🔧 Fix** - Cline CLI generates code fixes automatically
5. **📝 PR** - Creates pull request with proposed changes
6. **🤖 Review** - CodeRabbit automatically reviews the PR
7. **🚀 Deploy** - Redeploys on Vercel after approval
8. **✅ Verify** - Confirms deployment health and evaluates fix quality

**Every action is visible, traceable, and reversible.**

---

## 🏆 Award-Winning Features

Built for the **AI Agents Assemble Hackathon**, AutoDebugger integrates with multiple partner technologies:

- **🏅 Infinity Build Award** - Cline CLI integration for automated code fixes
- **🏅 Wakanda Data Award** - Kestra AI Agent for multi-source data summarization
- **🏅 Iron Intelligence Award** - Oumi RL for optimal fix strategy selection
- **🏅 Stormbreaker Award** - Vercel deployment and monitoring
- **🏅 Captain Code Award** - CodeRabbit automated code review

---

## 📊 Dashboard Overview

The dashboard provides **real-time visibility** into the autonomous recovery process:

### Active Recovery Loop
- ✅ Issue detection status
- ✅ Error summary and severity analysis
- ✅ Fix strategy confidence scores
- ✅ Generated code changes
- ✅ Pull request status and URL
- ✅ CodeRabbit review outcome
- ✅ Deployment and verification state

**Live Dashboard:** [autodebugger.vercel.app](https://autodebugger.vercel.app)

---

## 🎬 Demo Mode vs Production Mode

### 🎯 Demo Mode
- ✅ Simulated deployment failures
- ✅ Simulated AI reasoning and fixes
- ✅ Safe pull-request previews
- ✅ No real infrastructure changes
- ✅ **No API costs** - uses deterministic fallbacks

**Perfect for:** Demonstrations, onboarding, evaluation, and testing

### 🚀 Production Mode
- ✅ Real GitHub pull requests
- ✅ Real deployment recovery
- ✅ Vercel-integrated redeploys
- ✅ Health verification and scoring
- ✅ LLM-as-a-Judge quality evaluation

**Production mode** connects directly to your repository and deployment platform.

---

## 🚀 Quick Start

### Run Demo Locally

```bash
# Clone the repository
git clone https://github.com/Thegenarator/autodebugger.git
cd autodebugger

# Install dependencies
npm install

# Run in demo mode (no API keys required)
npm run cli -- autonomous https://test.vercel.app --demo
```

### Connect to Your Deployment

1. **Set up environment variables** (create `.env` file):
   ```env
   OPENAI_API_KEY=sk-proj-...
   GITHUB_TOKEN=ghp_...
   GITHUB_OWNER=your-username
   GITHUB_REPO=your-repo
   VERCEL_TOKEN=... (optional)
   VERCEL_PROJECT_ID=... (optional)
   ```

2. **Run autonomous recovery**:
   ```bash
   npm run cli -- autonomous https://your-deployment.vercel.app
   ```

---

## 💡 Example Recovery Output

```
[1/8] 🔍 Detecting deployment failure...
✗ Deployment failure detected! (2 errors)

[2/8] 🧠 Summarizing errors with Kestra AI Agent...
✓ Summary: Dependency mismatch causing build failure

[3/8] 🎯 Consulting Oumi RL agent for optimal fix strategy...
✓ Strategy: aggressive_fix (Confidence: 70%)

[4/8] 🔧 Generating fix using Cline CLI...
✓ Fix plan generated (1 change(s))

[5/8] 📝 Creating pull request...
✓ PR #123 created: https://github.com/owner/repo/pull/123

[6/8] 🤖 CodeRabbit reviewing PR automatically...
✓ CodeRabbit approved the PR

[7/8] 🚀 Redeploying on Vercel...
✓ Deployment triggered: https://your-app.vercel.app

[8/8] ✅ Verifying deployment health...
✓ Deployment verified healthy!
   Fix quality score: 90%
```

**AutoDebugger resolves failures in minutes, not hours.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AutoDebugger Autonomous Loop                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Cline   │→ │  Kestra  │→ │   Oumi   │             │
│  │   CLI    │  │ AI Agent │  │ RL Agent │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│       ↓              ↓              ↓                   │
│  ┌──────────────────────────────────────┐              │
│  │      Autonomous Recovery Engine       │              │
│  └──────────────────────────────────────┘              │
│       ↓              ↓              ↓                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ GitHub   │  │ CodeRabbit│  │  Vercel  │             │
│  │   PRs    │  │  Review   │  │ Deploy   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Cline CLI** - Core automation engine for debugging workflows
- **Kestra** - Workflow orchestration and AI agent decision-making
- **Oumi** - Reinforcement learning for self-improvement
- **Vercel** - Frontend deployment and dashboard hosting
- **CodeRabbit** - Automated code review and quality checks
- **OpenAI** - AI-powered analysis and fix generation

---

## 📖 Documentation

- **[How It Works](./HOW_IT_WORKS.md)** - Detailed technical explanation
- **[Setup Guide](./SETUP_FOR_OTHERS.md)** - Step-by-step setup instructions
- **[API Documentation](./VERCEL_API_ANALYSIS.md)** - API integration details
- **[Full Flow Trace](./FULL_FLOW_TRACE.md)** - Complete autonomous loop walkthrough

---

## 🎯 Use Cases

- **Automated Deployment Recovery** - Self-healing infrastructure
- **CI/CD Pipeline Integration** - Automatic failure recovery
- **Development Workflow** - Catch and fix issues before production
- **Team Productivity** - Reduce manual debugging time
- **Award Submissions** - Demonstrate autonomous agent capabilities

---

## 🤝 Contributing

This is a hackathon project built for the **AI Agents Assemble Hackathon**. Contributions welcome via pull requests!

---

## 📄 License

MIT

---

## 🌟 Recognition

Built with recognition from:
- **Cline CLI** - Infinity Build Award
- **Kestra AI** - Wakanda Data Award  
- **Oumi RL** - Iron Intelligence Award
- **Vercel** - Stormbreaker Award
- **CodeRabbit** - Captain Code Award

**Total Award Potential: $15,000** 🏆

---

**Ready to see it in action?** [Run the demo →](https://autodebugger.vercel.app)
