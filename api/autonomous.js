/**
 * Vercel Serverless Function - Autonomous Loop API
 * Allows dashboard to run full autonomous recovery
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
    const { deploymentUrl, demo = false, githubOwner, githubRepo, vercelProjectId } = req.body;

    // Get configuration from request or environment
    const config = {
      githubOwner: githubOwner || process.env.GITHUB_OWNER,
      githubRepo: githubRepo || process.env.GITHUB_REPO,
      vercelProjectId: vercelProjectId || process.env.VERCEL_PROJECT_ID
    };

    if (!deploymentUrl && !config.vercelProjectId) {
      return res.status(400).json({ error: 'Deployment URL or Vercel Project ID is required' });
    }

    // Demo mode - return simulated results
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
    if (demo || !hasApiKey) {
      return res.status(200).json({
        demo: true,
        success: true,
        issueId: `demo-issue-${Date.now()}`,
        prNumber: 123,
        prUrl: 'https://github.com/demo/repo/pull/123',
        deploymentUrl: deploymentUrl,
        healthy: true,
        steps: [
          { step: 1, name: 'Detect', status: 'completed', message: 'Deployment failure detected' },
          { step: 2, name: 'Summarize', status: 'completed', message: 'Kestra AI Agent analyzed logs' },
          { step: 3, name: 'Decide', status: 'completed', message: 'Oumi RL selected optimal strategy' },
          { step: 4, name: 'Fix', status: 'completed', message: 'Cline generated fix' },
          { step: 5, name: 'PR', status: 'completed', message: 'Pull request created' },
          { step: 6, name: 'Review', status: 'completed', message: 'CodeRabbit reviewed' },
          { step: 7, name: 'Deploy', status: 'completed', message: 'Redeployed on Vercel' },
          { step: 8, name: 'Verify', status: 'completed', message: 'Deployment verified healthy' }
        ],
        message: 'Demo mode: Simulated autonomous recovery. In production, this would execute the full loop with real API calls.'
      });
    }

    // Real mode - use actual AutoDebugger
    const { AutonomousLoop } = await import('../src/core/autonomous-loop.js');
    
    // Set environment variables for this request
    if (config.githubOwner) process.env.GITHUB_OWNER = config.githubOwner;
    if (config.githubRepo) process.env.GITHUB_REPO = config.githubRepo;
    if (config.vercelProjectId) process.env.VERCEL_PROJECT_ID = config.vercelProjectId;
    
    const loop = new AutonomousLoop();
    const targetUrl = deploymentUrl || `https://${config.vercelProjectId}.vercel.app`;
    const result = await loop.execute(targetUrl);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Autonomous API error:', error);
    return res.status(500).json({ 
      error: 'Autonomous recovery failed', 
      message: error.message,
      demo: true // Fallback to demo on error
    });
  }
}

