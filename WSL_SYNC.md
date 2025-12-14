# 🔄 WSL File Sync Commands

Quick reference for syncing files between Windows and WSL.

## 📁 Access Windows Files from WSL

Windows files are accessible at `/mnt/c/`, `/mnt/d/`, etc.

```bash
# Navigate to Windows Desktop
cd /mnt/c/Users/MK/Desktop/AutoDebugger

# List files
ls -la

# Edit files (use any Linux editor)
nano vercel.json
# or
code vercel.json  # if VS Code is installed
```

## 🔄 Copy Files from Windows to WSL

### Copy Single File
```bash
# Copy from Windows to WSL home directory
cp /mnt/c/Users/MK/Desktop/AutoDebugger/vercel.json ~/autodebugger/

# Copy with full path
cp /mnt/c/Users/MK/Desktop/AutoDebugger/package.json ~/projects/autodebugger/
```

### Copy Entire Directory
```bash
# Copy entire project to WSL filesystem (faster performance)
cp -r /mnt/c/Users/MK/Desktop/AutoDebugger ~/autodebugger

# Or use rsync for better sync (if installed)
rsync -av /mnt/c/Users/MK/Desktop/AutoDebugger/ ~/autodebugger/
```

### Copy with Preserve Permissions
```bash
cp -p /mnt/c/Users/MK/Desktop/AutoDebugger/.env ~/autodebugger/
```

## 🔄 Copy Files from WSL to Windows

```bash
# Copy from WSL to Windows
cp ~/autodebugger/vercel.json /mnt/c/Users/MK/Desktop/AutoDebugger/

# Copy directory
cp -r ~/autodebugger/* /mnt/c/Users/MK/Desktop/AutoDebugger/
```

## 🔄 Sync Changes (Bidirectional)

### Using rsync (Recommended - if installed)
```bash
# Install rsync if needed
sudo apt-get update && sudo apt-get install -y rsync

# Sync from Windows to WSL
rsync -av --update /mnt/c/Users/MK/Desktop/AutoDebugger/ ~/autodebugger/

# Sync from WSL to Windows
rsync -av --update ~/autodebugger/ /mnt/c/Users/MK/Desktop/AutoDebugger/
```

### Using cp with Update Flag
```bash
# Only copy newer files
cp -u /mnt/c/Users/MK/Desktop/AutoDebugger/* ~/autodebugger/
```

## 🔄 Git Sync (Recommended Method)

**Best approach**: Use git to sync between Windows and WSL

### From Windows (PowerShell):
```powershell
cd C:\Users\MK\Desktop\AutoDebugger
git add .
git commit -m "Sync changes"
git push
```

### From WSL:
```bash
cd ~/autodebugger  # or /mnt/c/Users/MK/Desktop/AutoDebugger
git pull
```

## 📝 Quick Sync Script

Create a sync script in WSL:

```bash
# Create sync script
cat > ~/sync-autodebugger.sh << 'EOF'
#!/bin/bash
# Sync AutoDebugger from Windows to WSL

SOURCE="/mnt/c/Users/MK/Desktop/AutoDebugger"
DEST="$HOME/autodebugger"

echo "🔄 Syncing AutoDebugger..."
rsync -av --exclude 'node_modules' --exclude '.git' "$SOURCE/" "$DEST/"
echo "✅ Sync complete!"
EOF

# Make executable
chmod +x ~/sync-autodebugger.sh

# Run it
~/sync-autodebugger.sh
```

## 🚀 Work Directly in WSL (Best Performance)

For best performance, work directly in WSL filesystem:

```bash
# Clone/copy project to WSL filesystem
cp -r /mnt/c/Users/MK/Desktop/AutoDebugger ~/autodebugger
cd ~/autodebugger

# Install dependencies
npm install

# Run commands
npm start
node server.js
```

**Note**: Files in WSL filesystem (`~/`) are much faster than Windows filesystem (`/mnt/c/`)

## 🔍 Check File Differences

```bash
# Compare files
diff /mnt/c/Users/MK/Desktop/AutoDebugger/vercel.json ~/autodebugger/vercel.json

# Find modified files
find /mnt/c/Users/MK/Desktop/AutoDebugger -type f -newer ~/autodebugger/vercel.json
```

## ⚡ Quick Commands Reference

```bash
# Navigate to Windows project
cd /mnt/c/Users/MK/Desktop/AutoDebugger

# Copy specific file
cp vercel.json ~/backup/

# Copy all JS files
cp src/**/*.js ~/backup/

# Copy excluding node_modules
rsync -av --exclude 'node_modules' /mnt/c/Users/MK/Desktop/AutoDebugger/ ~/autodebugger/

# View file in Windows location
cat /mnt/c/Users/MK/Desktop/AutoDebugger/package.json

# Edit file in Windows location
nano /mnt/c/Users/MK/Desktop/AutoDebugger/vercel.json
```

## 🎯 Recommended Workflow

1. **Work in WSL filesystem** for better performance:
   ```bash
   cp -r /mnt/c/Users/MK/Desktop/AutoDebugger ~/autodebugger
   cd ~/autodebugger
   ```

2. **Use git** to sync changes:
   ```bash
   git add .
   git commit -m "Changes"
   git push
   ```

3. **Pull in Windows** when needed:
   ```powershell
   git pull
   ```

---

**💡 Tip**: For real-time sync, use VS Code with WSL extension - it automatically handles file syncing!

