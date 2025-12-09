import chalk from 'chalk';
// Windows-compatible: Use API version (can switch to CLI if installed)
import { ClineAutomationAPI as ClineAutomation } from '../automation/cline-automation-api.js';
import { KestraAgent } from '../agents/kestra-agent.js';
import { OumiAgent } from '../agents/oumi-agent.js';

/**
 * Status command - Shows agent status and recent activity
 */
export async function statusCommand(options) {
  try {
    const clineAutomation = new ClineAutomation();
    const kestraAgent = new KestraAgent();
    const oumiAgent = new OumiAgent();
    
    const status = {
      timestamp: new Date().toISOString(),
      cline: await clineAutomation.getStatus(),
      kestra: await kestraAgent.getStatus(),
      oumi: await oumiAgent.getStatus(),
      recentActivity: await getRecentActivity()
    };
    
    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
      return;
    }
    
    // Pretty print status
    console.log(chalk.bold.blue('\n🤖 AutoDebugger Agent Status\n'));
    console.log(chalk.gray('─'.repeat(60)));
    
    console.log(chalk.bold.cyan('\n📡 Cline CLI'));
    console.log(chalk.white(`  Status: ${status.cline.connected ? chalk.green('Connected') : chalk.red('Disconnected')}`));
    console.log(chalk.white(`  Tasks executed: ${status.cline.tasksExecuted || 0}`));
    
    console.log(chalk.bold.cyan('\n🧠 Kestra AI Agent'));
    console.log(chalk.white(`  Status: ${status.kestra.active ? chalk.green('Active') : chalk.yellow('Inactive')}`));
    console.log(chalk.white(`  Workflows running: ${status.kestra.workflows || 0}`));
    console.log(chalk.white(`  Decisions made: ${status.kestra.decisions || 0}`));
    
    console.log(chalk.bold.cyan('\n🎯 Oumi RL Agent'));
    console.log(chalk.white(`  Status: ${status.oumi.trained ? chalk.green('Trained') : chalk.yellow('Training')}`));
    console.log(chalk.white(`  Model version: ${status.oumi.modelVersion || 'N/A'}`));
    console.log(chalk.white(`  Success rate: ${((status.oumi.successRate || 0) * 100).toFixed(1)}%`));
    console.log(chalk.white(`  Episodes: ${status.oumi.episodes || 0}`));
    
    if (status.recentActivity && status.recentActivity.length > 0) {
      console.log(chalk.bold.cyan('\n📊 Recent Activity'));
      status.recentActivity.slice(0, 5).forEach(activity => {
        const icon = activity.type === 'fix' ? '🔧' : activity.type === 'monitor' ? '👁️' : '🔍';
        console.log(chalk.white(`  ${icon} ${activity.timestamp}: ${activity.description}`));
      });
    }
    
    console.log(chalk.gray('\n─'.repeat(60)));
    console.log(chalk.gray(`\nLast updated: ${new Date(status.timestamp).toLocaleString()}\n`));
    
  } catch (error) {
    console.error(chalk.red(`Failed to get status: ${error.message}`));
    process.exit(1);
  }
}

async function getRecentActivity() {
  // This would typically query a database or log file
  // For now, return mock data
  return [
    { timestamp: new Date().toISOString(), type: 'monitor', description: 'Monitored deployment: example-app' },
    { timestamp: new Date(Date.now() - 60000).toISOString(), type: 'fix', description: 'Fixed: Configuration error' },
    { timestamp: new Date(Date.now() - 120000).toISOString(), type: 'diagnose', description: 'Diagnosed: Network timeout issue' }
  ];
}

