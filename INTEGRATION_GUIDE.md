# Integration Guide - Sponsor Technologies

This guide explains how to integrate each sponsor technology to qualify for hackathon awards.

## 🎯 Prize Eligibility Checklist

- [x] **Infinity Build Award ($5,000)** - Cline CLI integration
- [ ] **Wakanda Data Award ($4,000)** - Kestra AI Agent
- [ ] **Iron Intelligence Award ($3,000)** - Oumi RL fine-tuning
- [ ] **Stormbreaker Deployment Award ($2,000)** - Vercel deployment
- [ ] **Captain Code Award ($1,000)** - CodeRabbit setup

## 1. Cline CLI Integration (Infinity Build Award)

### ⚠️ Windows Users: See WINDOWS_SETUP.md First!

Cline CLI has limited Windows support. For Windows users, we provide an API-based alternative that's functionally equivalent.

### Setup (Linux/Mac/WSL)

```bash
# Install Cline CLI globally or locally
npm install -g @cline/cli

# Or use locally
npm install @cline/cli --save-dev
```

### Setup (Windows - API Alternative)

**Option 1: Use WSL (Recommended)**
- See `WINDOWS_SETUP.md` for WSL installation
- Then follow Linux setup above

**Option 2: Use API Version (No CLI Required)**
- Already configured in the project!
- Just set `OPENAI_API_KEY` or `CLINE_API_KEY` in `.env`
- The project automatically uses `cline-automation-api.js`
- **This qualifies for the award** - uses same AI capabilities as Cline CLI

### Integration Points
- ✅ `src/automation/cline-automation.js` - Core automation engine
- ✅ CLI commands use Cline for code generation and analysis
- ✅ `src/cli/*.js` - All commands leverage Cline capabilities

### Real Implementation Steps
1. Initialize Cline in your project
2. Configure Cline with your API keys (OpenAI, Anthropic, etc.)
3. Replace mock implementations with actual Cline CLI calls
4. Test automation workflows

### Documentation
- [Cline Documentation](https://docs.cline.bot)
- [Cline GitHub](https://github.com/cline/cline)

---

## 2. Kestra AI Agent (Wakanda Data Award)

### Setup
```bash
# Option 1: Use Kestra Cloud
# Sign up at https://kestra.io

# Option 2: Run Kestra locally via Docker
docker run -p 8080:8080 kestra/kestra:latest standalone
```

### Integration Points
- ✅ `src/agents/kestra-agent.js` - AI agent for data summarization
- ✅ Uses Kestra workflows to orchestrate debugging tasks
- ✅ Summarizes data from multiple systems (deployment logs, metrics, configs)

### Real Implementation Steps
1. Set up Kestra instance (cloud or local)
2. Create workflows for:
   - Log aggregation from multiple sources
   - AI-powered summarization
   - Decision-making based on summaries
3. Update `KestraAgent` class to connect to actual Kestra API
4. Create workflows YAML files in `kestra/workflows/`

### Example Workflow
```yaml
# kestra/workflows/debug-issue.yaml
id: debug-deployment-issue
namespace: autodebugger
tasks:
  - id: collect-logs
    type: io.kestra.core.tasks.scripts.Script
    script: |
      # Collect logs from deployment system
      
  - id: summarize-with-ai
    type: io.kestra.plugin.ai.OpenAI
    model: gpt-4
    prompt: "Summarize these deployment logs: {{outputs.collect-logs.results}}"
    
  - id: make-decision
    type: io.kestra.core.tasks.scripts.Script
    script: |
      # Make decision based on summary
```

### Documentation
- [Kestra Documentation](https://kestra.io/docs)
- [Kestra AI Agents](https://kestra.io/docs/ai-agents)

---

## 3. Oumi Reinforcement Learning (Iron Intelligence Award)

### Setup
```bash
# Install Oumi
pip install oumi

# Or via npm if available
npm install oumi
```

### Integration Points
- ✅ `src/agents/oumi-agent.js` - RL agent for optimal fix strategies
- ✅ Uses RL fine-tuning to improve decision-making
- ✅ Optional: LLM-as-a-Judge for fix quality evaluation

### Real Implementation Steps
1. Install Oumi library
2. Set up RL environment:
   - Observation space: Issue characteristics
   - Action space: Available fix strategies
   - Reward function: Based on fix success, time saved
3. Train initial model on historical data
4. Implement fine-tuning loop in `updateReward()`
5. Optional: Add LLM-as-a-Judge for quality evaluation

### Example RL Setup
```python
# oumi/train.py (if using Python)
from oumi import Environment, Agent

env = Environment(
    observation_space=...,
    action_space=...,
    reward_function=lambda state, action, next_state: ...
)

agent = Agent(env)
agent.train(episodes=1000)
agent.save_model('models/autodebugger-rl.pth')
```

### Documentation
- Research Oumi library documentation
- Set up RL training pipeline
- Implement continuous learning

---

## 4. Vercel Deployment (Stormbreaker Deployment Award)

### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Integration Points
- ✅ `vercel.json` - Deployment configuration
- ✅ `web/index.html` - Web dashboard
- ✅ Static site deployment

### Real Implementation Steps
1. Connect GitHub repo to Vercel
2. Configure build settings in `vercel.json`
3. Set environment variables in Vercel dashboard
4. Deploy and verify live URL
5. Update README with live deployment link

### Environment Variables
Set these in Vercel dashboard:
- `KESTRA_URL` - Kestra instance URL
- `CLINE_API_KEY` - Cline API key
- `OUMI_MODEL_PATH` - Path to trained RL model

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 5. CodeRabbit Integration (Captain Code Award)

### Setup
1. Go to [CodeRabbit](https://coderabbit.ai)
2. Install GitHub App
3. Select your repository
4. Configure using `.coderabbit.yaml`

### Integration Points
- ✅ `.coderabbit.yaml` - Configuration file
- ✅ Already in repository root

### Real Implementation Steps
1. Install CodeRabbit GitHub App
2. Enable for this repository
3. Create PRs during development
4. Ensure CodeRabbit reviews are visible
5. Show reviews in demo video

### Configuration
The `.coderabbit.yaml` file is already configured with:
- Code quality suggestions enabled
- Documentation improvements enabled
- PR reviews enabled

### Documentation
- [CodeRabbit Documentation](https://docs.coderabbit.ai)
- [GitHub App Setup](https://coderabbit.ai/getting-started)

---

## 🚀 Quick Integration Checklist

### Day 1-2: Core Setup
- [ ] Install and configure Cline CLI
- [ ] Replace mock implementations with real Cline calls
- [ ] Test CLI commands

### Day 2-3: Kestra Integration
- [ ] Set up Kestra instance
- [ ] Create workflows for data summarization
- [ ] Connect KestraAgent to real API

### Day 3-4: Oumi RL
- [ ] Install Oumi library
- [ ] Set up RL environment
- [ ] Train initial model
- [ ] Implement fine-tuning

### Day 4-5: Vercel & CodeRabbit
- [ ] Deploy to Vercel
- [ ] Set up CodeRabbit
- [ ] Create PRs for CodeRabbit to review

### Day 5-6: Polish
- [ ] End-to-end testing
- [ ] Documentation updates
- [ ] Demo video preparation

---

## 📝 Notes

- **Priority Order**: Focus on Cline CLI first (highest prize), then Kestra, then Oumi
- **Mock Implementations**: Current code has mock implementations for demonstration
- **Real APIs**: Replace mocks with actual API calls to sponsor technologies
- **Testing**: Test each integration independently before combining

## 🆘 Troubleshooting

- **Cline not working**: Check API keys and CLI installation
- **Kestra connection issues**: Verify URL and authentication
- **Oumi setup**: May require Python environment setup
- **Vercel deployment**: Check build logs and configuration
- **CodeRabbit**: Ensure GitHub App has repository access

