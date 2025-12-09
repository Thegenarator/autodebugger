import chalk from 'chalk';
import ora from 'ora';
// Windows-compatible: Use API version (can switch to CLI if installed)
import { ClineAutomationAPI as ClineAutomation } from '../automation/cline-automation-api.js';
import { OumiAgent } from '../agents/oumi-agent.js';
import { GitHubIntegration } from '../automation/github-integration.js';
import { VercelIntegration } from '../automation/vercel-integration.js';
import readline from 'readline';

/**
 * Fix command - Uses Cline CLI to generate and apply fixes
 * Qualifies for Infinity Build Award + Iron Intelligence Award (Oumi RL)
 */
export async function fixCommand(issueId, options) {
  const spinner = ora(`Preparing fix for issue: ${issueId}`).start();
  
  try {
    const clineAutomation = new ClineAutomation();
    const oumiAgent = new OumiAgent();
    
    spinner.text = 'Retrieving issue details...';
    const issueDetails = await clineAutomation.getIssueDetails(issueId);
    
    if (!issueDetails) {
      spinner.fail(chalk.red(`Issue ${issueId} not found`));
      process.exit(1);
    }
    
    spinner.text = 'Consulting Oumi RL agent for optimal fix strategy...';
    
    // Use Oumi RL agent to determine the best fix strategy
    const rlStrategy = await oumiAgent.getOptimalFixStrategy(issueDetails);
    
    spinner.text = 'Generating fix using Cline CLI...';
    
    // Use Cline CLI to generate the actual fix code/commands
    const fixPlan = await clineAutomation.generateFix({
      ...issueDetails,
      strategy: rlStrategy
    });
    
    spinner.succeed(chalk.green('Fix plan generated!\n'));
    
    // Display the fix plan
    console.log(chalk.bold.cyan('\n🔧 Fix Plan'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Issue: ${issueDetails.summary}`));
    console.log(chalk.white(`Strategy: ${rlStrategy.strategy} (Confidence: ${(rlStrategy.confidence * 100).toFixed(0)}%)`));
    console.log(chalk.white(`RL Model Score: ${rlStrategy.score.toFixed(2)}`));
    
    console.log(chalk.bold.cyan('\n📝 Changes to Apply'));
    console.log(chalk.gray('─'.repeat(60)));
    fixPlan.changes.forEach((change, idx) => {
      console.log(chalk.white(`\n${idx + 1}. ${change.type}: ${change.description}`));
      if (change.code) {
        console.log(chalk.gray('   Code:'));
        console.log(chalk.gray(change.code.split('\n').map(l => `   ${l}`).join('\n')));
      }
    });
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  DRY RUN MODE - No changes will be applied\n'));
      return;
    }
    
    // Ask for confirmation unless --confirm flag is set
    if (!options.confirm) {
      const confirmed = await askForConfirmation('\nApply this fix? (y/N): ');
      if (!confirmed) {
        console.log(chalk.yellow('Fix cancelled by user.'));
        return;
      }
    }
    
    spinner.start('Applying fix...');
    
    // Apply the fix using Cline CLI
    const result = await clineAutomation.applyFix(fixPlan);
    
    if (result.success) {
      spinner.succeed(chalk.green('Fix applied successfully!'));
      
      // Optional: Create PR and redeploy (autonomous loop)
      if (options.createPR) {
        spinner.start('Creating PR with CodeRabbit review...');
        const github = new GitHubIntegration();
        const prResult = await github.createFixPR(fixPlan, issueDetails);
        
        if (prResult.success) {
          spinner.succeed(chalk.green(`PR #${prResult.prNumber} created!`));
          console.log(chalk.cyan(`\n🔗 PR: ${prResult.prUrl}`));
          console.log(chalk.gray('CodeRabbit will review automatically'));
          
          if (options.redeploy) {
            spinner.start('Redeploying on Vercel...');
            const vercel = new VercelIntegration();
            const deployResult = await vercel.redeployAfterFix(prResult.prNumber);
            
            if (deployResult.success) {
              spinner.succeed(chalk.green('Deployment triggered!'));
              console.log(chalk.cyan(`🚀 Deploy: ${deployResult.url}`));
            }
          }
        }
      }
      
      // Update Oumi RL agent with the result for learning
      await oumiAgent.updateReward(issueId, {
        success: true,
        timeSaved: result.timeSaved,
        issuesResolved: result.issuesResolved
      });
      
      console.log(chalk.green(`\n✓ ${result.description}`));
      if (result.verification) {
        console.log(chalk.green(`✓ Verification: ${result.verification}`));
      }
    } else {
      spinner.fail(chalk.red('Fix application failed!'));
      
      // Update Oumi RL agent with failure for learning
      await oumiAgent.updateReward(issueId, {
        success: false,
        error: result.error
      });
      
      console.log(chalk.red(`\n✗ Error: ${result.error}`));
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Fix failed: ${error.message}`));
    process.exit(1);
  }
}

function askForConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

