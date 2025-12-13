import chalk from 'chalk';
import ora from 'ora';
// Windows-compatible: Use API version (can switch to CLI if installed)
import { ClineAutomationAPI as ClineAutomation } from '../automation/cline-automation-api.js';
import { KestraAgent } from '../agents/kestra-agent.js';

/**
 * Monitor command - Uses Cline CLI to monitor deployments
 * This is the core automation that qualifies for Infinity Build Award
 */
export async function monitorCommand(url, options) {
  const spinner = ora(`Starting monitoring for ${url}`).start();
  
  try {
    // Initialize Cline automation engine
    const clineAutomation = new ClineAutomation();
    const kestraAgent = new KestraAgent();
    
    spinner.succeed(chalk.green(`Monitoring started for: ${chalk.cyan(url)}`));
    console.log(chalk.gray(`Polling interval: ${options.interval}s`));
    console.log(chalk.gray(`Auto-fix: ${options.autoFix ? 'enabled' : 'disabled'}\n`));
    
    // Main monitoring loop
    let iteration = 0;
    const monitorInterval = setInterval(async () => {
      iteration++;
      console.log(chalk.blue(`\n[${new Date().toLocaleTimeString()}] Check #${iteration}`));
      
      try {
        // Use Cline CLI to check deployment status
        const status = await clineAutomation.checkDeployment(url);
        
        if (status.healthy) {
          console.log(chalk.green('✓ Deployment healthy'));
        } else {
          console.log(chalk.red('✗ Issues detected!'));
          
          // Use Kestra agent to analyze and summarize the issue
          const analysis = await kestraAgent.analyzeDeploymentIssue(status);
          console.log(chalk.yellow(`\nIssue Summary: ${analysis.summary}`));
          
          if (options.autoFix && analysis.canAutoFix) {
            console.log(chalk.cyan('Attempting automatic fix...'));
            const fixResult = await clineAutomation.generateFix(analysis);
            
            if (fixResult.success) {
              console.log(chalk.green(`✓ Fix applied: ${fixResult.description}`));
            } else {
              console.log(chalk.red(`✗ Fix failed: ${fixResult.error}`));
            }
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error during monitoring: ${error.message}`));
      }
    }, parseInt(options.interval) * 1000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(monitorInterval);
      spinner.stop();
      console.log(chalk.yellow('\n\nMonitoring stopped.'));
      process.exit(0);
    });
    
  } catch (error) {
    spinner.fail(chalk.red(`Failed to start monitoring: ${error.message}`));
    process.exit(1);
  }
}

