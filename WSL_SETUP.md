# 🐧 WSL Setup Guide for AutoDebugger

Complete guide to run AutoDebugger on Windows Subsystem for Linux (WSL).

## Prerequisites

1. **Windows 10/11** with WSL installed
2. **Ubuntu** (or another Linux distribution) in WSL

## Quick Setup

### Step 1: Install WSL (if not already installed)

Open PowerShell as Administrator:

```powershell
wsl --install -d Ubuntu
```

Restart your computer if prompted.

### Step 2: Open Ubuntu Terminal

- Press `Windows Key` → Type "Ubuntu" → Open Ubuntu terminal
- Or use `wsl` command in PowerShell/Command Prompt

### Step 3: Navigate to Your Project

```bash
# Access Windows files from WSL
cd /mnt/c/Users/MK/Desktop/AutoDebugger
```

### Step 4: Install Node.js (if needed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Set Up Environment Variables

```bash
# Create .env file if it doesn't exist
cp .env.example .env 2>/dev/null || touch .env

# Edit .env file (use nano or your preferred editor)
nano .env
```

Add your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
VERCEL_TOKEN=your_vercel_token_here
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id
```

Save and exit (in nano: `Ctrl+X`, then `Y`, then `Enter`)

## Running the Application

### Option 1: Run Dashboard Server (Localhost)

```bash
# Start the Express server (serves dashboard + API)
node server.js
```

The server will start on `http://localhost:3002`

**Access from Windows Browser:**
- Open any browser on Windows
- Navigate to: `http://localhost:3002`
- WSL automatically forwards localhost ports to Windows!

### Option 2: Run CLI Commands

```bash
# Monitor a deployment
npm run cli -- monitor https://your-app.vercel.app

# Diagnose an issue
npm run cli -- diagnose "Build failed: exit code 1"

# Run full autonomous recovery loop
npm run cli -- autonomous https://your-app.vercel.app

# Check status
npm run cli -- status
```

### Option 3: Development Mode (Auto-reload)

```bash
npm run dev
```

## Testing the Dashboard

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Open in Windows browser:**
   - Go to `http://localhost:3002`
   - You should see the AutoDebugger dashboard

3. **Test Demo Mode:**
   - Click "🎯 Try Demo Mode" button
   - Dashboard should show simulated data
   - No API keys required for demo mode!

## Common Issues & Solutions

### Issue: "Command not found: node"

**Solution:**
```bash
# Install Node.js (see Step 4 above)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: "Permission denied" errors

**Solution:**
```bash
# Make scripts executable
chmod +x src/index.js
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 3002
lsof -i :3002

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3003 node server.js
```

### Issue: Can't access localhost from Windows browser

**Solution:**
- WSL2 should automatically forward ports
- If not working, check Windows Firewall settings
- Or use WSL IP address:
  ```bash
  # Get WSL IP address
  ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
  ```
  Then access from Windows: `http://WSL_IP:3002`

## WSL File System Notes

- **Windows files**: Located at `/mnt/c/Users/YourUsername/...`
- **Linux files**: Located at `~/` or `/home/username/`
- **Performance**: Linux files are faster than Windows files in WSL
- **Best practice**: Clone repo to Linux filesystem for better performance:
  ```bash
  cd ~
  git clone https://github.com/Thegenarator/autodebugger.git
  cd autodebugger
  ```

## Next Steps

1. ✅ Server running on `http://localhost:3002`
2. ✅ Dashboard accessible from Windows browser
3. ✅ Demo mode working (no setup required)
4. 📝 Configure your GitHub/Vercel credentials for real monitoring
5. 🚀 Test with actual deployments!

## Troubleshooting

If you encounter any issues:

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **Check dependencies:**
   ```bash
   npm list --depth=0
   ```

3. **Check environment variables:**
   ```bash
   cat .env
   ```

4. **View server logs:**
   The server will show errors in the terminal where you ran `node server.js`

5. **Test API endpoints:**
   ```bash
   curl http://localhost:3002/api/ping
   # Should return: {"ok":true}
   ```

## Useful Commands

```bash
# Run in background
nohup node server.js > server.log 2>&1 &

# View logs
tail -f server.log

# Stop background process
pkill -f "node server.js"
```

---

**🎉 You're all set!** The dashboard should now work on WSL and be accessible from your Windows browser.

