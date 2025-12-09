/**
 * Cline Automation Loader
 * 
 * Automatically detects Windows vs Linux and loads the appropriate implementation
 */

let ClineAutomation;

try {
  // Try to load CLI-based version (Linux/Mac/WSL)
  const clineCli = await import('./cline-automation.js');
  ClineAutomation = clineCli.ClineAutomation;
  
  // Test if Cline CLI is actually available
  // If not, fall back to API version
  try {
    // Try to execute a simple Cline command
    // If this fails, we'll use the API version
    const { execSync } = require('child_process');
    execSync('cline --version', { stdio: 'ignore' });
  } catch (e) {
    // Cline CLI not available, use API version
    console.log('⚠️  Cline CLI not found, using API-based implementation (Windows compatible)');
    const clineApi = await import('./cline-automation-api.js');
    ClineAutomation = clineApi.ClineAutomationAPI;
  }
} catch (error) {
  // Fallback to API version (Windows compatible)
  console.log('ℹ️  Using API-based Cline implementation (Windows compatible)');
  const clineApi = await import('./cline-automation-api.js');
  ClineAutomation = clineApi.ClineAutomationAPI;
}

export { ClineAutomation };


