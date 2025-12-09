/**
 * Vercel Integration Module
 * 
 * Handles deployment and redeployment on Vercel
 * Completes the autonomous loop: Fix → PR → Review → Deploy
 */

import axios from 'axios';

export class VercelIntegration {
  constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.teamId = process.env.VERCEL_TEAM_ID;
    this.projectId = process.env.VERCEL_PROJECT_ID;
    this.baseUrl = 'https://api.vercel.com';
  }

  /**
   * Trigger a new deployment
   */
  async deploy(prNumber = null) {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/v13/deployments`,
        {
          name: this.projectId,
          ...(prNumber && { 
            gitSource: {
              type: 'github',
              ref: `pull/${prNumber}/head`,
              repo: process.env.GITHUB_REPO
            }
          })
        },
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json'
          },
          params: this.teamId ? { teamId: this.teamId } : {}
        }
      );

      return {
        success: true,
        deploymentId: data.id,
        url: data.url,
        state: data.readyState,
        message: `Deployment triggered: ${data.url}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to trigger deployment'
      };
    }
  }

  /**
   * Redeploy after fix is merged
   */
  async redeployAfterFix(prNumber) {
    console.log(`Redeploying after PR #${prNumber} is merged...`);
    
    // Wait a bit for merge to complete
    await this._wait(2000);
    
    // Trigger new deployment
    return await this.deploy();
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId) {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`
          },
          params: this.teamId ? { teamId: this.teamId } : {}
        }
      );

      return {
        id: data.id,
        url: data.url,
        state: data.readyState,
        createdAt: data.createdAt,
        buildingAt: data.buildingAt,
        readyAt: data.readyAt
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  /**
   * Check if deployment is healthy
   */
  async checkDeploymentHealth(url) {
    try {
      const response = await axios.get(`${url}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      return {
        healthy: response.status === 200,
        status: response.status,
        url
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        url
      };
    }
  }

  /**
   * Wait helper
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

