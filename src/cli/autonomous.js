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
  const prod = options.prod || false;
  const dryRun = options.dryRun || false;
  // If --prod is explicitly set, don't auto-enable demo mode
  const demo = options.demo || (!prod && !force && !hasApiKey); // demo if flag, or no key while not forcing prod
  
  // Debug info - always show when --prod is used
  if (prod || process.env.DEBUG) {
    console.log(chalk.gray(`DEBUG: Options received: ${JSON.stringify(options)}`));
    console.log(chalk.gray(`DEBUG: prod flag: ${prod}`));
    console.log(chalk.gray(`DEBUG: OPENAI_API_KEY present: ${hasApiKey ? 'YES' : 'NO'}`));
    console.log(chalk.gray(`DEBUG: GITHUB_TOKEN present: ${process.env.GITHUB_TOKEN ? 'YES' : 'NO'}`));
    console.log(chalk.gray(`DEBUG: VERCEL_TOKEN present: ${process.env.VERCEL_TOKEN ? 'YES' : 'NO'}`));
    console.log(chalk.gray(`DEBUG: Force mode: ${force}`));
    console.log(chalk.gray(`DEBUG: Demo mode: ${demo}\n`));
  }
  
  if (options.demo || demo) {
    console.log(chalk.yellow('📝 Running in DEMO mode (--demo or auto-demo)\n'));
  } else if (dryRun) {
    console.log(chalk.yellow('🛟 Running in DRY-RUN mode (no external side effects)\n'));
  } else if (prod) {
    console.log(chalk.green('🔑 Running in PRODUCTION mode - will use real external APIs\n'));
    // Check env vars upfront and warn if missing
    const missing = [];
    if (!process.env.GITHUB_TOKEN) missing.push('GITHUB_TOKEN');
    if (!process.env.GITHUB_OWNER) missing.push('GITHUB_OWNER');
    if (!process.env.GITHUB_REPO) missing.push('GITHUB_REPO');
    if (!process.env.VERCEL_TOKEN) missing.push('VERCEL_TOKEN');
    if (!process.env.VERCEL_PROJECT_ID) missing.push('VERCEL_PROJECT_ID');
    if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
    if (missing.length > 0) {
      console.log(chalk.yellow(`⚠️  Warning: Missing env vars: ${missing.join(', ')}`));
      console.log(chalk.yellow(`   Make sure to export these in your shell or set them in .env file\n`));
    } else {
      console.log(chalk.green('✓ All required environment variables are set\n'));
    }
  } else if (force && !prod) {
    console.log(chalk.yellow('⚡ Running in FORCE mode (safe/sim) - full loop regardless of status\n'));
  } else {
    console.log(chalk.yellow('⚠️  Running in SAFE mode (no real APIs)\n'));
    console.log(chalk.gray('   To run with real APIs, use: npm run cli -- autonomous <url> --prod\n'));
  }
  
  const loop = new AutonomousLoop();
  const result = await loop.execute(deploymentUrl, { force, demo, prod, dryRun });
  
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
