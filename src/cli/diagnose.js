import chalk from 'chalk';
import ora from 'ora';
// Windows-compatible: Use API version (can switch to CLI if installed)
import { ClineAutomationAPI as ClineAutomation } from '../automation/cline-automation-api.js';
import { KestraAgent } from '../agents/kestra-agent.js';
import fs from 'fs/promises';

/**
 * Diagnose command - Uses Cline CLI to analyze logs and diagnose issues
 * Qualifies for Infinity Build Award + Wakanda Data Award (Kestra summarization)
 */
export async function diagnoseCommand(source, options) {
  const spinner = ora('Analyzing issue...').start();
  
  try {
    const clineAutomation = new ClineAutomation();
    const kestraAgent = new KestraAgent();
    
    // Determine if source is a file path, URL, or direct error message
    let logData = source;
    let sourceType = 'message';
    
    try {
      // Try reading as file
      const fileContent = await fs.readFile(source, 'utf-8');
      logData = fileContent;
      sourceType = 'file';
      spinner.text = `Reading log file: ${source}`;
    } catch {
      // Not a file, treat as direct input
      sourceType = 'message';
    }
    
    spinner.text = 'Running Cline CLI analysis...';
    
    // Use Cline CLI to analyze the logs
    const clineAnalysis = await clineAutomation.analyzeLogs(logData);
    
    spinner.text = 'Summarizing with Kestra AI Agent...';
    
    // Use Kestra AI Agent to summarize and make decisions
    const summary = await kestraAgent.summarizeAndDecide({
      rawLogs: logData,
      clineAnalysis: clineAnalysis,
      sourceType: sourceType
    });
    
    spinner.succeed(chalk.green('Diagnosis complete!\n'));
    
    // Format output based on requested format
    if (options.output === 'json') {
      console.log(JSON.stringify({
        issueId: summary.issueId,
        severity: summary.severity,
        summary: summary.summary,
        rootCause: summary.rootCause,
        suggestedFixes: summary.suggestedFixes,
        canAutoFix: summary.canAutoFix,
        kestraDecision: summary.decision
      }, null, 2));
    } else if (options.output === 'summary') {
      console.log(chalk.bold.cyan('\n📋 Issue Summary'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.white(`Issue ID: ${summary.issueId}`));
      console.log(chalk.white(`Severity: ${getSeverityColor(summary.severity)}`));
      console.log(chalk.white(`\n${summary.summary}`));
      
      console.log(chalk.bold.cyan('\n🔍 Root Cause'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.white(summary.rootCause));
      
      console.log(chalk.bold.cyan('\n💡 Suggested Fixes'));
      console.log(chalk.gray('─'.repeat(60)));
      summary.suggestedFixes.forEach((fix, idx) => {
        console.log(chalk.white(`${idx + 1}. ${fix.description}`));
        if (fix.confidence) {
          console.log(chalk.gray(`   Confidence: ${(fix.confidence * 100).toFixed(0)}%`));
        }
      });
      
      console.log(chalk.bold.cyan('\n🤖 Kestra Agent Decision'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.white(`Auto-fix recommended: ${summary.canAutoFix ? chalk.green('Yes') : chalk.red('No')}`));
      console.log(chalk.white(`Decision: ${summary.decision}`));
      
      console.log(chalk.gray('\n─'.repeat(60)));
      console.log(chalk.gray(`\nUse 'autodebugger fix ${summary.issueId}' to apply fixes\n`));
    } else {
      // Text format
      console.log(summary.summary);
      console.log(`\nRoot Cause: ${summary.rootCause}`);
      summary.suggestedFixes.forEach((fix, idx) => {
        console.log(`${idx + 1}. ${fix.description}`);
      });
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Diagnosis failed: ${error.message}`));
    process.exit(1);
  }
}

function getSeverityColor(severity) {
  const colors = {
    critical: chalk.red.bold('CRITICAL'),
    high: chalk.red('HIGH'),
    medium: chalk.yellow('MEDIUM'),
    low: chalk.green('LOW'),
    info: chalk.blue('INFO')
  };
  return colors[severity.toLowerCase()] || severity;
}

