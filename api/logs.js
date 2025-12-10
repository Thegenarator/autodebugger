/**
 * Vercel Serverless Function - Logs API
 * Fetches logs from GitHub Actions and Vercel deployments
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { source, githubOwner, githubRepo, vercelProjectId } = req.query;

    const results = {
      github: null,
      vercel: null
    };

    // Fetch GitHub workflow logs if configured
    if (source === 'github' && githubOwner && githubRepo && process.env.GITHUB_TOKEN) {
      try {
        const { GitHubIntegration } = await import('../src/automation/github-integration.js');
        const github = new GitHubIntegration();
        github.owner = githubOwner;
        github.repo = githubRepo;
        
        const failedWorkflows = await github.getFailedWorkflows(5);
        results.github = {
          failedWorkflows,
          message: `Found ${failedWorkflows.length} failed workflow(s)`
        };
      } catch (error) {
        results.github = { error: error.message };
      }
    }

    // Fetch Vercel deployment logs if configured
    if (source === 'vercel' && vercelProjectId && process.env.VERCEL_TOKEN) {
      try {
        const { VercelIntegration } = await import('../src/automation/vercel-integration.js');
        const vercel = new VercelIntegration();
        vercel.projectId = vercelProjectId;
        
        const failedDeployments = await vercel.getFailedDeployments(5);
        results.vercel = {
          failedDeployments,
          message: `Found ${failedDeployments.length} failed deployment(s)`
        };
      } catch (error) {
        results.vercel = { error: error.message };
      }
    }

    // If no specific source, try both
    if (!source) {
      if (githubOwner && githubRepo && process.env.GITHUB_TOKEN) {
        try {
          const { GitHubIntegration } = await import('../src/automation/github-integration.js');
          const github = new GitHubIntegration();
          github.owner = githubOwner;
          github.repo = githubRepo;
          results.github = {
            failedWorkflows: await github.getFailedWorkflows(5)
          };
        } catch (error) {
          results.github = { error: error.message };
        }
      }

      if (vercelProjectId && process.env.VERCEL_TOKEN) {
        try {
          const { VercelIntegration } = await import('../src/automation/vercel-integration.js');
          const vercel = new VercelIntegration();
          vercel.projectId = vercelProjectId;
          results.vercel = {
            failedDeployments: await vercel.getFailedDeployments(5)
          };
        } catch (error) {
          results.vercel = { error: error.message };
        }
      }
    }

    return res.status(200).json(results);

  } catch (error) {
    console.error('Logs API error:', error);
    return res.status(500).json({ error: 'Failed to fetch logs', message: error.message });
  }
}

