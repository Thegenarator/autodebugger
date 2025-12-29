#!/usr/bin/env node
/**
 * Test script to verify environment variables are loaded correctly
 * Run: node test-prod-env.js
 */

import 'dotenv/config';

console.log('\n🔍 Testing Environment Variables...\n');
console.log('─'.repeat(60));

const required = {
  'GITHUB_TOKEN': process.env.GITHUB_TOKEN,
  'GITHUB_OWNER': process.env.GITHUB_OWNER,
  'GITHUB_REPO': process.env.GITHUB_REPO,
  'VERCEL_TOKEN': process.env.VERCEL_TOKEN,
  'VERCEL_PROJECT_ID': process.env.VERCEL_PROJECT_ID,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
};

const optional = {
  'VERCEL_TEAM_ID': process.env.VERCEL_TEAM_ID,
};

let allValid = true;

console.log('Required Variables:');
for (const [key, value] of Object.entries(required)) {
  const isSet = value && typeof value === 'string' && value.trim() !== '';
  const status = isSet ? '✅' : '❌';
  const display = isSet 
    ? `${value.substring(0, 10)}... (length: ${value.length})`
    : 'NOT SET';
  console.log(`  ${status} ${key}: ${display}`);
  if (!isSet) allValid = false;
}

console.log('\nOptional Variables:');
for (const [key, value] of Object.entries(optional)) {
  const isSet = value && typeof value === 'string' && value.trim() !== '';
  const status = isSet ? '✅' : '⚠️ ';
  const display = isSet 
    ? `${value.substring(0, 10)}... (length: ${value.length})`
    : 'NOT SET (optional)';
  console.log(`  ${status} ${key}: ${display}`);
}

console.log('\n' + '─'.repeat(60));

if (allValid) {
  console.log('✅ All required environment variables are set!');
  console.log('   You can run: npm run cli -- autonomous <url> --prod --force\n');
  process.exit(0);
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('   Set them in .env file or export them in your shell.\n');
  process.exit(1);
}

