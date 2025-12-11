// src/utils/dashboard-reporter.js
import fetch from 'node-fetch';

export class DashboardReporter {
    constructor(apiBaseUrl = 'http://localhost:3000') {
        this.apiBaseUrl = apiBaseUrl;
    }
    
    async reportExecution(agentName, result) {
        try {
            const data = {
                agent: agentName,
                timestamp: new Date().toISOString(),
                tasks_executed: 1,
                decisions_made: result.decisions || 1,
                issues_resolved: result.success ? 1 : 0,
                success: result.success,
                details: result
            };
            
            const response = await fetch(`${this.apiBaseUrl}/api/executions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log(`📊 ${agentName} reported to dashboard`);
            }
        } catch (error) {
            // Silent fail if dashboard isn't running
            console.debug(`Dashboard unavailable for ${agentName}`);
        }
    }
    
    async updateStats(statsUpdate) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/stats/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statsUpdate)
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Singleton instance
export const dashboardReporter = new DashboardReporter();
