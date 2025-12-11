import chalk from 'chalk';
import { AutonomousLoop } from '../core/autonomous-loop.js';

/**
 * Autonomous command - Executes the complete self-healing loop
 * This is the showcase feature that demonstrates the full agent loop!
 */
export async function autonomousCommand(deploymentUrl, options = {}) {
  console.log(chalk.bold.blue('\n🤖 AutoDebugger Autonomous Loop\n'));
  console.log(chalk.gray('This demonstrates the complete self-healing deployment agent:'));
  console.log(chalk.gray('Detect → Summarize → Decide → Fix → PR → Review → Deploy → Verify\n'));
  
  // Check if we should force/demo mode
  const force = options.force || false;
  const demo = options.demo || !process.env.OPENAI_API_KEY; // Auto-enable demo if no API key
  
  if (demo) {
    console.log(chalk.yellow('📝 Running in DEMO mode (no API key detected)\n'));
  } else if (force) {
    console.log(chalk.yellow('⚡ Running in FORCE mode - will execute full loop regardless of deployment status\n'));
  }
  
  const loop = new AutonomousLoop();
  const result = await loop.execute(deploymentUrl, { force, demo });
  
  if (result.success) {
    if (result.action === 'none') {
      console.log(chalk.bold.green('\n✅ Deployment is healthy - no action needed'));
      console.log(chalk.yellow('\n💡 To see the full autonomous loop in action:'));
      console.log(chalk.white('   npm run cli -- autonomous <url> --force'));
      console.log(chalk.white('   npm run cli -- autonomous <url> --demo'));
    } else {
      console.log(chalk.bold.green('\n✅ Autonomous recovery successful!'));
    }
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Autonomous recovery failed'));
    if (result.error) {
      console.log(chalk.red(`   Error: ${result.error}`));
    }
    process.exit(1);
  }
}
