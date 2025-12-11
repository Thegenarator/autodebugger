import chalk from 'chalk';
import { AutonomousLoop } from '../core/autonomous-loop.js';

/**
 * Autonomous command - Executes the complete self-healing loop
 * This is the showcase feature that demonstrates the full agent loop!
 */
export async function autonomousCommand(deploymentUrl, options) {
  console.log(chalk.bold.blue('\n🤖 AutoDebugger Autonomous Loop\n'));
  console.log(chalk.gray('This demonstrates the complete self-healing deployment agent:'));
  console.log(chalk.gray('Detect → Summarize → Decide → Fix → PR → Review → Deploy → Verify\n'));
  
  const loop = new AutonomousLoop();
  const result = await loop.execute(deploymentUrl);

   // ADD DASHBOARD REPORTING HERE
  try {
    await dashboardReporter.reportExecution('autonomous', {
      success: result.success,
      decisions: result.decisions || 5, // Adjust based on your result structure
      duration: result.duration,
      deployment_url: deploymentUrl,
      agents_used: result.agents || ['cline', 'kestra', 'oumi']
    });
    
    await dashboardReporter.updateStats({
      tasks_executed: 1,
      decisions_made: result.decisions || 5,
      issues_resolved: result.success ? 1 : 0
    });
    
    console.log(chalk.gray('📊 Results reported to dashboard'));
  } catch (error) {
    // Don't crash if dashboard isn't running
    console.log(chalk.yellow('⚠️  Could not update dashboard (running in CLI-only mode)'));
  }
  
  if (result.success) {
    console.log(chalk.bold.green('\n✅ Autonomous recovery successful!'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Autonomous recovery failed'));
    process.exit(1);
  }
}


