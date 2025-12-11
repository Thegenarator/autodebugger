from flask import Flask, render_template, jsonify, request, send_from_directory
import subprocess
import json
import os
from flask_cors import CORS

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Initialize stats
stats = {
    "tasks_executed": 0,
    "decisions_made": 0,
    "success_rate": 0,
    "issues_resolved": 0
}

# Load existing stats if file exists
STATS_FILE = 'public/stats.json'
if os.path.exists(STATS_FILE):
    with open(STATS_FILE, 'r') as f:
        try:
            stats = json.load(f)
        except:
            pass

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return send_from_directory('public', 'index.html')

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get current statistics (for dashboard)"""
    return jsonify(stats)

@app.route('/api/stats/update', methods=['POST'])
def update_stats():
    """Update statistics (called by CLI)"""
    global stats
    data = request.json
    
    # Merge new stats
    for key in stats:
        if key in data:
            if key == 'success_rate' and data[key] > 0:
                # For success rate, calculate average
                current_total = stats['tasks_executed'] * (stats['success_rate'] / 100) if stats['tasks_executed'] > 0 else 0
                new_success = data.get('issues_resolved', 0)
                new_total = stats['tasks_executed'] + data.get('tasks_executed', 0)
                stats['success_rate'] = ((current_total + new_success) / new_total * 100) if new_total > 0 else 0
            else:
                # For counts, add them up
                stats[key] += data.get(key, 0)
    
    # Save to file for frontend
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f, indent=2)
    
    return jsonify({"success": True, "stats": stats})

@app.route('/api/debug', methods=['POST'])
def run_debug():
    """Run the debugger from web interface"""
    data = request.json
    error_log = data.get('error_log', '')
    
    if not error_log:
        return jsonify({"error": "No error log provided"}), 400
    
    # Save error to temp file
    temp_file = 'temp_error.log'
    with open(temp_file, 'w') as f:
        f.write(error_log)
    
    try:
        # Run your CLI tool
        # Note: Adjust this command to match how your CLI works
        cmd = ['python', '-m', 'src.autodebugger', 'analyze', temp_file]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        # Update stats based on result
        update_data = {
            "tasks_executed": 1,
            "decisions_made": 1,
            "issues_resolved": 1 if result.returncode == 0 else 0
        }
        
        # Update stats internally
        for key in stats:
            if key in update_data:
                stats[key] += update_data[key]
        
        # Recalculate success rate
        if stats['tasks_executed'] > 0:
            stats['success_rate'] = (stats['issues_resolved'] / stats['tasks_executed']) * 100
        
        # Save updated stats
        with open(STATS_FILE, 'w') as f:
            json.dump(stats, f, indent=2)
        
        return jsonify({
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr,
            "returncode": result.returncode,
            "stats": stats
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Debugger timed out"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)

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
    
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f, indent=2)
    
    return jsonify({"success": True, "stats": stats})

if __name__ == '__main__':
    print("🚀 Starting AutoDebugger Dashboard Server...")
    print("🌐 Dashboard available at: http://localhost:5000")
    print("📊 API available at: http://localhost:5000/api/stats")
    app.run(debug=True, port=5000)
