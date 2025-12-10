/**
 * Vercel Serverless Function - Configuration API
 * Stores and retrieves user configuration (GitHub repo, Vercel deployment)
 */

// In-memory storage (for demo - in production, use database or Vercel KV)
let configStore = {};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Save configuration
    try {
      const { githubOwner, githubRepo, vercelProjectId, vercelTeamId, deploymentUrl } = req.body;
      
      const config = {
        githubOwner: githubOwner || process.env.GITHUB_OWNER,
        githubRepo: githubRepo || process.env.GITHUB_REPO,
        vercelProjectId: vercelProjectId || process.env.VERCEL_PROJECT_ID,
        vercelTeamId: vercelTeamId || process.env.VERCEL_TEAM_ID,
        deploymentUrl: deploymentUrl,
        updatedAt: new Date().toISOString()
      };

      // Store in memory (in production, use database)
      configStore = config;

      return res.status(200).json({
        success: true,
        config,
        message: 'Configuration saved successfully'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save configuration', message: error.message });
    }
  }

  if (req.method === 'GET') {
    // Get configuration
    const config = {
      githubOwner: configStore.githubOwner || process.env.GITHUB_OWNER || '',
      githubRepo: configStore.githubRepo || process.env.GITHUB_REPO || '',
      vercelProjectId: configStore.vercelProjectId || process.env.VERCEL_PROJECT_ID || '',
      vercelTeamId: configStore.vercelTeamId || process.env.VERCEL_TEAM_ID || '',
      deploymentUrl: configStore.deploymentUrl || '',
      updatedAt: configStore.updatedAt || null
    };

    return res.status(200).json({ config });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

