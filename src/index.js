#!/usr/bin/env node
import 'dotenv/config';

/**
 * AutoDebugger - Main Entry Point
 * ...

 * A Self-Healing Deployment AI Agent
 */

import { program } from 'commander';
import chalk from 'chalk';
import { monitorCommand } from './cli/monitor.js';
import { diagnoseCommand } from './cli/diagnose.js';
import { fixCommand } from './cli/fix.js';
import { statusCommand } from './cli/status.js';
import { autonomousCommand } from './cli/autonomous.js';

console.log(chalk.blue.bold('\n🤖 AutoDebugger - Self-Healing Deployment AI Agent\n'));

program
  .name('autodebugger')
  .description('An intelligent AI agent for automated deployment debugging')
  .version('1.0.0');

// Monitor command - watches deployment in real-time
program
  .command('monitor')
  .description('Monitor a deployment for issues')
  .argument('<url>', 'Deployment URL or service identifier')
  .option('-i, --interval <seconds>', 'Polling interval in seconds', '10')
  .option('--auto-fix', 'Automatically apply fixes when issues detected')
  .action(monitorCommand);

// Diagnose command - analyzes logs and errors
program
  .command('diagnose')
  .description('Diagnose issues from logs or error messages')
  .argument('<source>', 'Log file path, error message, or deployment ID')
  .option('-o, --output <format>', 'Output format (json, text, summary)', 'summary')
  .action(diagnoseCommand);

// Fix command - attempts to automatically fix issues
program
  .command('fix')
  .description('Attempt to automatically fix detected issues')
  .argument('<issue-id>', 'Issue identifier from diagnose command')
  .option('--dry-run', 'Show what would be fixed without applying changes')
  .option('--confirm', 'Skip confirmation prompts')
  .option('--create-pr', 'Create PR with CodeRabbit review (autonomous loop)')
  .option('--redeploy', 'Redeploy on Vercel after PR (requires --create-pr)')
  .action(fixCommand);

// Status command - check agent status and recent activity
program
  .command('status')
  .description('Show agent status and recent activity')
  .option('--json', 'Output as JSON')
  .action(statusCommand);

// Autonomous command - complete self-healing loop (SHOWCASE)
program
  .command('autonomous')
  .description('Execute complete autonomous recovery loop (Detect → Fix → PR → Deploy)')
  .argument('<url>', 'Deployment URL to monitor and fix')
  .option('--auto-merge', 'Automatically merge PR after CodeRabbit review')
  .action(autonomousCommand);

program.parse();

