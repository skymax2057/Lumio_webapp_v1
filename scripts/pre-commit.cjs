#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running pre-commit checks...');

const runCommand = (command, description) => {
  console.log(`\n${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: path.dirname(__dirname) });
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
};

const checks = [
  { command: 'npm run type-check', description: '📝 TypeScript type check' },
  { command: 'npm run lint', description: '🔨 ESLint check', optional: true },
  { command: 'npm run test:run', description: '🧪 Running tests' },
];

let failed = false;

for (const check of checks) {
  const success = runCommand(check.command, check.description);
  if (!success && !check.optional) {
    failed = true;
  }
}

if (failed) {
  console.error('\n❌ Pre-commit checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\n✅ All pre-commit checks passed!');
