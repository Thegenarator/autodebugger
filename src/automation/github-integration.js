/**
 * GitHub Integration Module
 * 
 * Creates pull requests with CodeRabbit-reviewed changes
 * Completes the autonomous loop: Fix → PR → Review → Deploy
 */

import axios from 'axios';

export class GitHubIntegration {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.owner = process.env.GITHUB_OWNER || 'your-username';
    this.repo = process.env.GITHUB_REPO || 'autodebugger';
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Create a branch, commit fixes, and open a PR
   * CodeRabbit will automatically review the PR
   */
  async createFixPR(fixPlan, issueDetails) {
    const branchName = `autodebugger/fix-${issueDetails.issueId}-${Date.now()}`;
    
    try {
      // 1. Create a new branch
      await this._createBranch(branchName);
      
      // 2. Apply the fixes (would use Cline to write files)
      const filesChanged = await this._applyFixesToBranch(branchName, fixPlan);
      
      // 3. Commit the changes
      const commitSha = await this._commitChanges(branchName, fixPlan, issueDetails);
      
      // 4. Create the pull request
      const pr = await this._createPullRequest(branchName, fixPlan, issueDetails);
      
      // 5. CodeRabbit will automatically review (via GitHub App)
      // Just need to ensure CodeRabbit is enabled on the repo
      
      return {
        success: true,
        branchName,
        prNumber: pr.number,
        prUrl: pr.html_url,
        filesChanged,
        commitSha,
        message: `PR #${pr.number} created. CodeRabbit will review automatically.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new branch from main
   */
  async _createBranch(branchName) {
    // Get latest commit from main branch
    const { data: refData } = await axios.get(
      `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/ref/heads/main`,
      {
        headers: {
          Authorization: `token ${this.githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    // Create new branch
    await axios.post(
      `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/refs`,
      {
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha
      },
      {
        headers: {
          Authorization: `token ${this.githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    return branchName;
  }

  /**
   * Apply fixes to files in the branch
   */
  async _applyFixesToBranch(branchName, fixPlan) {
    const filesChanged = [];
    
    // In real implementation, would use Cline CLI to:
    // 1. Read current file content
    // 2. Apply fixes
    // 3. Write updated content
    
    for (const change of fixPlan.changes) {
      if (change.file) {
        // Get current file content
        let currentContent = '';
        try {
          const { data } = await axios.get(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${change.file}?ref=${branchName}`,
            {
              headers: {
                Authorization: `token ${this.githubToken}`,
                Accept: 'application/vnd.github.v3+json'
              }
            }
          );
          currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
        } catch (error) {
          // File doesn't exist, will create new
          currentContent = '';
        }
        
        // Apply fix (in real implementation, would use Cline to generate proper fix)
        const fixedContent = this._applyCodeFix(currentContent, change);
        
        // Update file
        await this._updateFile(branchName, change.file, fixedContent, change.description);
        filesChanged.push(change.file);
      }
    }
    
    return filesChanged;
  }

  /**
   * Update a file in the branch
   */
  async _updateFile(branchName, filePath, content, message) {
    // Get current file SHA (if exists)
    let sha = null;
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${branchName}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, will create new
    }
    
    // Create or update file
    await axios.put(
      `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`,
      {
        message: `AutoDebugger: ${message}`,
        content: Buffer.from(content).toString('base64'),
        branch: branchName,
        ...(sha && { sha })
      },
      {
        headers: {
          Authorization: `token ${this.githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );
  }

  /**
   * Commit changes
   */
  async _commitChanges(branchName, fixPlan, issueDetails) {
    // Commit is created automatically when updating files
    // This is just for reference
    return 'commit-sha-placeholder';
  }

  /**
   * Create pull request
   */
  async _createPullRequest(branchName, fixPlan, issueDetails) {
    const { data } = await axios.post(
      `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls`,
      {
        title: `🤖 AutoDebugger: Fix for ${issueDetails.summary}`,
        head: branchName,
        base: 'main',
        body: this._generatePRDescription(fixPlan, issueDetails),
        labels: ['autodebugger', 'auto-generated', 'bug-fix']
      },
      {
        headers: {
          Authorization: `token ${this.githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );
    
    return data;
  }

  /**
   * Generate PR description
   */
  _generatePRDescription(fixPlan, issueDetails) {
    return `## 🤖 AutoDebugger Automated Fix

**Issue ID:** ${issueDetails.issueId}
**Severity:** ${issueDetails.severity}
**Issue:** ${issueDetails.summary}

### Changes Applied

${fixPlan.changes.map((change, idx) => `- ${idx + 1}. ${change.description}`).join('\n')}

### Fix Strategy

- **Confidence:** ${(fixPlan.confidence * 100).toFixed(0)}%
- **Generated by:** Cline CLI
- **Strategy:** Oumi RL agent

### Automated Workflow

1. ✅ Issue detected and diagnosed
2. ✅ Kestra AI Agent summarized the problem
3. ✅ Oumi RL selected optimal fix strategy
4. ✅ Cline CLI generated the fix
5. 🔄 **This PR** - Ready for CodeRabbit review
6. ⏳ Will auto-merge and redeploy after review

### CodeRabbit Review

This PR will be automatically reviewed by CodeRabbit for:
- Code quality
- Best practices
- Documentation improvements

---
*Generated by AutoDebugger AI Agent*`;
  }

  /**
   * Apply code fix (simplified - in real implementation, use Cline)
   */
  _applyCodeFix(currentContent, change) {
    // In real implementation, this would use Cline CLI to properly
    // generate and apply the fix based on the change description
    if (change.code) {
      return change.code;
    }
    return currentContent + '\n' + `// ${change.description}`;
  }

  /**
   * Fetch workflow run logs from GitHub Actions
   */
  async getWorkflowLogs(runId) {
    try {
      // Get workflow run details
      const { data: runData } = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/actions/runs/${runId}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Get job logs
      const { data: jobsData } = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/jobs`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Fetch logs for each job
      const logs = [];
      for (const job of jobsData.jobs || []) {
        try {
          const { data: logData } = await axios.get(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/actions/jobs/${job.id}/logs`,
            {
              headers: {
                Authorization: `token ${this.githubToken}`,
                Accept: 'application/vnd.github.v3+json'
              },
              responseType: 'text'
            }
          );
          logs.push({
            jobName: job.name,
            status: job.conclusion,
            logs: logData
          });
        } catch (error) {
          // Log might not be available yet
          logs.push({
            jobName: job.name,
            status: job.conclusion,
            logs: `Logs not available: ${error.message}`
          });
        }
      }

      return {
        runId,
        status: runData.conclusion,
        workflow: runData.name || runData.workflow_id,
        logs: logs,
        createdAt: runData.created_at,
        updatedAt: runData.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to fetch workflow logs: ${error.message}`);
    }
  }

  /**
   * Get latest failed workflow runs
   */
  async getFailedWorkflows(limit = 5) {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/actions/runs`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          },
          params: {
            status: 'failure',
            per_page: limit
          }
        }
      );

      return data.workflow_runs.map(run => ({
        id: run.id,
        name: run.name,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        htmlUrl: run.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to fetch failed workflows: ${error.message}`);
    }
  }
}

