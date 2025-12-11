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
  
  if (result.success) {
    console.log(chalk.bold.green('\n✅ Autonomous recovery successful!'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Autonomous recovery failed'));
    process.exit(1);
  }
}

