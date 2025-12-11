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
  const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
  const demo = options.demo || (!hasApiKey && !force); // Only auto-enable demo if no API key AND not forcing
  
  // Debug info
  if (process.env.DEBUG) {
    console.log(chalk.gray(`DEBUG: OPENAI_API_KEY present: ${hasApiKey ? 'YES' : 'NO'}`));
    console.log(chalk.gray(`DEBUG: Force mode: ${force}`));
    console.log(chalk.gray(`DEBUG: Demo mode: ${demo}\n`));
  }
  
  if (options.demo) {
    console.log(chalk.yellow('📝 Running in DEMO mode (--demo flag set)\n'));
  } else if (!hasApiKey && !force) {
    console.log(chalk.yellow('📝 Running in DEMO mode (no OPENAI_API_KEY found in environment)\n'));
    console.log(chalk.gray('   Tip: Add OPENAI_API_KEY to .env file or use --force to run anyway\n'));
  } else if (force) {
    console.log(chalk.yellow('⚡ Running in FORCE mode - will execute full loop regardless of deployment status\n'));
  } else {
    console.log(chalk.green('🔑 API key detected - running in REAL mode\n'));
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
