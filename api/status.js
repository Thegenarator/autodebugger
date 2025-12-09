/**
 * Vercel Serverless Function - Status API
 * Returns current status of all agents
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const demo = !process.env.OPENAI_API_KEY;

    if (demo) {
      return res.status(200).json({
        demo: true,
        cline: {
          connected: true,
          tasksExecuted: Math.floor(Math.random() * 100) + 50,
          version: '1.0.0-api',
          mode: 'Demo mode'
        },
        kestra: {
          active: true,
          workflows: Math.floor(Math.random() * 50) + 25,
          decisions: Math.floor(Math.random() * 50) + 25,
          version: '1.0.0'
        },
        oumi: {
          trained: true,
          modelVersion: '1.0.0',
          episodes: Math.floor(Math.random() * 100) + 50,
          successRate: 0.75 + Math.random() * 0.1
        },
        overall: {
          healthy: true,
          issuesResolved: Math.floor(Math.random() * 20) + 10
        }
      });
    }

    // Real mode
    const { ClineAutomationAPI } = await import('../src/automation/cline-automation-api.js');
    const { KestraAgent } = await import('../src/agents/kestra-agent.js');
    const { OumiAgent } = await import('../src/agents/oumi-agent.js');

    const cline = new ClineAutomationAPI();
    const kestra = new KestraAgent();
    const oumi = new OumiAgent();

    const [clineStatus, kestraStatus, oumiStatus] = await Promise.all([
      cline.getStatus(),
      kestra.getStatus(),
      oumi.getStatus()
    ]);

    return res.status(200).json({
      cline: clineStatus,
      kestra: kestraStatus,
      oumi: oumiStatus,
      overall: {
        healthy: true,
        issuesResolved: 0
      }
    });

  } catch (error) {
    console.error('Status API error:', error);
    return res.status(500).json({ error: 'Status check failed', message: error.message });
  }
}

