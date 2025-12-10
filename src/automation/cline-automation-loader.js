/**
 * Cline Automation Loader
 *
 * Picks the best implementation available at runtime:
 * - Prefers CLI when installed (Linux/Mac/WSL) for full capabilities
 * - Falls back to API-based implementation (Windows-friendly) otherwise
 */

let ClineAutomation;

async function resolveCline() {
  try {
    // Prefer CLI implementation
    const { ClineAutomation: ClineCli } = await import('./cline-automation.js');
    const { execSync } = await import('child_process');

    try {
      execSync('cline --version', { stdio: 'ignore' });
      return ClineCli;
    } catch {
      console.log('⚠️  Cline CLI not found, using API-based implementation (Windows compatible)');
    }
  } catch {
    // ignore and fall through to API
  }

  // Fallback: API-based implementation (works on Windows)
  const { ClineAutomationAPI } = await import('./cline-automation-api.js');
  return ClineAutomationAPI;
}

ClineAutomation = await resolveCline();

export { ClineAutomation };
