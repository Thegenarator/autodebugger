/**
 * Vercel Serverless Function - Monitor API
 * Lightweight monitoring endpoint to check for failed workflows/deployments
 * without requiring users to copy workflows. Can be called by a cron/pinger.
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
    const githubOwner = req.query.githubOwner || process.env.GITHUB_OWNER;
    const githubRepo = req.query.githubRepo || process.env.GITHUB_REPO;
    const vercelProjectId = req.query.vercelProjectId || process.env.VERCEL_PROJECT_ID;

    const result = {
      github: null,
      vercel: null
    };

    if (githubOwner && githubRepo && process.env.GITHUB_TOKEN) {
      try {
        const { GitHubIntegration } = await import('../src/automation/github-integration.js');
        const github = new GitHubIntegration();
        github.owner = githubOwner;
        github.repo = githubRepo;
        result.github = {
          failedWorkflows: await github.getFailedWorkflows(3)
        };
      } catch (error) {
        result.github = { error: error.message };
      }
    }

    if (vercelProjectId && process.env.VERCEL_TOKEN) {
      try {
        const { VercelIntegration } = await import('../src/automation/vercel-integration.js');
        const vercel = new VercelIntegration();
        vercel.projectId = vercelProjectId;
        result.vercel = {
          failedDeployments: await vercel.getFailedDeployments(3)
        };
      } catch (error) {
        result.vercel = { error: error.message };
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Monitor API error:', error);
    return res.status(500).json({ error: 'Monitor failed', message: error.message });
  }
}


