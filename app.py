from flask import Flask, render_template, jsonify, request, send_from_directory
import subprocess
import json
import os
import sys
from flask_cors import CORS

# Add src/ to path so we can import your agents
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

app = Flask(__name__, static_folder='web', static_url_path='')
CORS(app)

# Initialize stats
stats = {
    "tasks_executed": 0,
    "decisions_made": 0,
    "success_rate": 0,
    "issues_resolved": 0
}

# Load existing stats if file exists
STATS_FILE = 'web/stats.json'
if os.path.exists(STATS_FILE):
    with open(STATS_FILE, 'r') as f:
        try:
            stats = json.load(f)
        except:
            pass

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return send_from_directory('web', 'index.html')

# ============ LOCAL AGENT INTEGRATION ============

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """Call your actual Kestra/Cline agents locally"""
    try:
        data = request.json
        source = data.get('source', '')
        demo = data.get('demo', False)
        
        if not source and not demo:
            return jsonify({
                "error": "Source (log or error message) is required",
                "success": False,
                "demo": False,
                "local": True
            }), 400
        
        # DEMO MODE (for testing without agents)
        if demo or not os.path.exists('src/agents/kestra-agent.js'):
            return jsonify({
                "success": True,
                "demo": True,
                "local": True,
                "issueId": f"local-demo-{int(time.time())}",
                "severity": "medium",
                "summary": "Local demo analysis - agents would run here",
                "rootCause": "Demo mode: Real agents would analyze this error",
                "suggestedFixes": [
                    {"description": "Check error patterns", "confidence": 0.8},
                    {"description": "Review deployment logs", "confidence": 0.7}
                ],
                "canAutoFix": True,
                "confidence": 0.85
            })
        
        # REAL MODE - Try to import and run your actual agents
        try:
            # Try to import your agents
            # Since they're JavaScript, we'll call them via Node
            temp_file = f'temp_error_{int(time.time())}.log'
            with open(temp_file, 'w') as f:
                f.write(source)
            
            # Call your diagnose.js CLI
            cmd = ['node', 'src/cli/diagnose.js', temp_file]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.dirname(__file__)  # Run from project root
            )
            
            # Clean up
            if os.path.exists(temp_file):
                os.remove(temp_file)
            
            if result.returncode == 0:
                try:
                    # Parse JSON output from your CLI
                    agent_result = json.loads(result.stdout)
                    return jsonify({
                        "success": True,
                        "demo": False,
                        "local": True,
                        **agent_result
                    })
                except json.JSONDecodeError:
                    # CLI returned text, not JSON
                    return jsonify({
                        "success": True,
                        "demo": False,
                        "local": True,
                        "issueId": f"local-{int(time.time())}",
                        "severity": "medium",
                        "summary": "CLI analysis completed",
                        "rootCause": result.stdout[:200] + "...",
                        "suggestedFixes": [],
                        "canAutoFix": False,
                        "rawOutput": result.stdout
                    })
            else:
                return jsonify({
                    "success": False,
                    "demo": False,
                    "local": True,
                    "error": f"CLI failed: {result.stderr}",
                    "rawOutput": result.stdout
                }), 500
                
        except Exception as agent_error:
            # Fallback if agents aren't available
            print(f"Agent error: {agent_error}")
            return jsonify({
                "success": True,
                "demo": True,
                "local": True,
                "issueId": f"local-fallback-{int(time.time())}",
                "severity": "medium",
                "summary": "Local analysis (agent fallback)",
                "rootCause": f"Using fallback analysis: {str(agent_error)[:100]}",
                "suggestedFixes": [
                    {"description": "Check if agents are properly configured", "confidence": 0.6}
                ],
                "canAutoFix": False,
                "confidence": 0.5
            })
            
    except Exception as e:
        print(f"Diagnose endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "success": False,
            "local": True
        }), 500

@app.route('/api/autonomous', methods=['POST'])
def autonomous():
    """Run the full autonomous loop locally"""
    try:
        data = request.json
        deployment_url = data.get('deploymentUrl', '')
        demo = data.get('demo', False)
        
        if not deployment_url:
            return jsonify({
                "error": "Deployment URL is required",
                "success": False,
                "local": True
            }), 400
        
        # Update stats
        stats["tasks_executed"] += 1
        save_stats()
        
        if demo:
            # Simulate autonomous recovery
            import time
            time.sleep(2)  # Simulate processing
            
            return jsonify({
                "success": True,
                "demo": True,
                "local": True,
                "steps": [
                    {"step": 1, "name": "Detection", "status": "completed", "message": "Issue detected"},
                    {"step": 2, "name": "Analysis", "status": "completed", "message": "Kestra agent analyzing"},
                    {"step": 3, "name": "Decision", "status": "completed", "message": "Oumi RL selected fix"},
                    {"step": 4, "name": "Fix", "status": "completed", "message": "Cline CLI applied fix"},
                    {"step": 5, "name": "PR", "status": "completed", "message": "Pull request created"},
                    {"step": 6, "name": "Review", "status": "completed", "message": "CodeRabbit review passed"},
                    {"step": 7, "name": "Deploy", "status": "completed", "message": "Redeployed on Vercel"}
                ],
                "prNumber": 42,
                "prUrl": "https://github.com/demo/pr/42",
                "deploymentUrl": deployment_url,
                "message": "Autonomous recovery successful (demo)"
            })
        
        # REAL MODE - Call your autonomous.js CLI
        try:
            cmd = ['node', 'src/cli/autonomous.js', deployment_url]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,  # Longer timeout for full loop
                cwd=os.path.dirname(__file__)
            )
            
            if result.returncode == 0:
                try:
                    autonomous_result = json.loads(result.stdout)
                    stats["issues_resolved"] += 1
                    save_stats()
                    return jsonify({
                        "success": True,
                        "demo": False,
                        "local": True,
                        **autonomous_result
                    })
                except json.JSONDecodeError:
                    return jsonify({
                        "success": True,
                        "demo": False,
                        "local": True,
                        "message": "Autonomous loop completed",
                        "rawOutput": result.stdout,
                        "deploymentUrl": deployment_url
                    })
            else:
                return jsonify({
                    "success": False,
                    "demo": False,
                    "local": True,
                    "error": result.stderr,
                    "rawOutput": result.stdout
                }), 500
                
        except subprocess.TimeoutExpired:
            return jsonify({
                "success": False,
                "error": "Autonomous loop timed out (took too long)",
                "local": True
            }), 500
            
    except Exception as e:
        print(f"Autonomous endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "success": False,
            "local": True
        }), 500

# ============ KEEP YOUR EXISTING ENDPOINTS ============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get current statistics (for dashboard)"""
    return jsonify(stats)

@app.route('/api/stats/update', methods=['POST'])
def update_stats():
    """Update statistics (called by CLI)"""
    global stats
    data = request.json
    
    for key in stats:
        if key in data:
            stats[key] += data.get(key, 0)
    
    # Recalculate success rate
    if stats['tasks_executed'] > 0:
        stats['success_rate'] = (stats['issues_resolved'] / stats['tasks_executed']) * 100
    
    save_stats()
    return jsonify({"success": True, "stats": stats})

def save_stats():
    """Helper to save stats to file"""
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f, indent=2)

@app.route('/api/reset', methods=['POST'])
def reset_stats():
    """Reset all statistics"""
    global stats
    stats = {
        "tasks_executed": 0,
        "decisions_made": 0,
        "success_rate": 0,
        "issues_resolved": 0
    }
    save_stats()
    return jsonify({"success": True, "stats": stats})

# ============ NEW: HEALTH CHECK ============

@app.route('/api/status', methods=['GET'])
def status():
    """Health check for dashboard"""
    agents_available = os.path.exists('src/agents/kestra-agent.js')
    
    return jsonify({
        "success": True,
        "local": True,
        "demo": not agents_available,
        "cline": {
            "connected": os.path.exists('src/automation/cline-automation.js'),
            "tasksExecuted": stats["tasks_executed"]
        },
        "kestra": {
            "active": agents_available,
            "decisions": stats["decisions_made"]
        },
        "oumi": {
            "trained": os.path.exists('src/agents/oumi-agent.js'),
            "successRate": stats["success_rate"]
        },
        "overall": {
            "healthy": True,
            "issuesResolved": stats["issues_resolved"]
        }
    })

if __name__ == '__main__':
    import time
    print("🚀 AutoDebugger LOCAL Development Server")
    print("========================================")
    print("🌐 Dashboard: http://localhost:3000")
    print("🔌 Mode: Local (connects to src/agents directly)")
    print("📊 API: http://localhost:3000/api/*")
    print("")
    print("For Vercel deployment, use the /api/ folder instead.")
    print("")
    app.run(debug=True, port=3000)  # Changed from 5000 to 3000
