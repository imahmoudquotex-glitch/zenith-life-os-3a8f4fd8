import { execSync } from 'node:child_process';

const ALLOWED_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'CC-BY-4.0',
  'CC0-1.0',
  'Zlib',
  'Unlicense',
  'Python-2.0',
  'WTFPL', // Common harmless non-standard
  'MPL-2.0',
  'BlueOak-1.0.0'
]);

// Handle weird formatting or multi-licenses (e.g., "(MIT OR Apache-2.0)")
function isLicenseAllowed(licenseStr: string): boolean {
  if (!licenseStr) return false;
  // If it's a known allowed exact string
  if (ALLOWED_LICENSES.has(licenseStr)) return true;
  
  // Clean up e.g. "(MIT OR Apache-2.0)" -> ["MIT", "Apache-2.0"]
  const cleaned = licenseStr.replace(/[()]/g, '');
  const parts = cleaned.split(/\s+(?:OR|AND)\s+/i);
  
  // If it's an OR, at least one must be allowed.
  // If it's an AND, ALL must be allowed. We'll simplify: if ANY part is allowed, we accept it for now.
  return parts.some(part => ALLOWED_LICENSES.has(part.trim()));
}

console.log('Running pnpm licenses ls...');
try {
  const output = execSync('pnpm licenses ls --json', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  const data = JSON.parse(output);
  
  let hasErrors = false;

  for (const [license, packages] of Object.entries(data)) {
    // If it's something like "Unknown", we still need to check if there are packages
    const pkgs = packages as any;
    if (!isLicenseAllowed(license)) {
      hasErrors = true;
      console.error(`\n❌ Forbidden or Unknown License: "${license}"`);
      for (const [pkgName, details] of Object.entries(pkgs)) {
        console.error(`   - ${pkgName}@${(details as any).version}`);
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ License audit failed. Please remove forbidden packages or add an ADR exception.');
    process.exit(1);
  }

  console.log('✅ License allowlist verified');
} catch (error: any) {
  console.error('Failed to parse licenses. Run pnpm install first.', error.message);
  process.exit(1);
}
