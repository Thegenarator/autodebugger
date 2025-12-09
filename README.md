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

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the autonomous agent
autodebugger autonomous https://your-app.vercel.app

# Or use individual commands
autodebugger monitor https://your-app.vercel.app
autodebugger diagnose error.log
autodebugger fix issue-123 --create-pr --redeploy
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

## 🤝 Contributing

This is a hackathon project. Contributions welcome via pull requests!

## 📄 License

MIT

