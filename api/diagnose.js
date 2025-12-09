/**
 * Vercel Serverless Function - Diagnose API
 * Allows dashboard to diagnose issues via API
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source, demo = false } = req.body;

    if (!source) {
      return res.status(400).json({ error: 'Source (log or error message) is required' });
    }

    // Demo mode - return simulated results
    if (demo || !process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        demo: true,
        issueId: `demo-issue-${Date.now()}`,
        severity: 'medium',
        summary: 'Demo mode: Simulated deployment issue detected. In production, this would use AI to analyze the actual error logs.',
        rootCause: 'Demo mode: This is a simulated analysis. Real mode uses Kestra AI Agent to summarize errors from multiple sources.',
        suggestedFixes: [
          { description: 'Check environment variables configuration', confidence: 0.8 },
          { description: 'Verify API endpoint connectivity', confidence: 0.7 },
          { description: 'Review recent deployment changes', confidence: 0.6 }
        ],
        canAutoFix: true,
        decision: 'Demo mode: High confidence fix available. In production, Oumi RL agent would select optimal strategy.',
        confidence: 0.85,
        dataSources: ['deployment_logs', 'monitoring_metrics', 'config_system']
      });
    }

    // Real mode - use actual AutoDebugger
    // Note: In Vercel serverless, imports are relative to project root
    const { ClineAutomationAPI } = await import('../src/automation/cline-automation-api.js');
    const { KestraAgent } = await import('../src/agents/kestra-agent.js');

    const clineAutomation = new ClineAutomationAPI();
    const kestraAgent = new KestraAgent();

    // Analyze logs
    const clineAnalysis = await clineAutomation.analyzeLogs(source);
    
    // Summarize with Kestra
    const summary = await kestraAgent.summarizeAndDecide({
      rawLogs: source,
      clineAnalysis: clineAnalysis,
      sourceType: 'api'
    });

    return res.status(200).json(summary);

  } catch (error) {
    console.error('Diagnose API error:', error);
    return res.status(500).json({ 
      error: 'Diagnosis failed', 
      message: error.message,
      demo: true // Fallback to demo on error
    });
  }
}

