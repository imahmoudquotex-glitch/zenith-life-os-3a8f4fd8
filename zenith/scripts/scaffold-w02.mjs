import fs from 'node:fs';
import path from 'node:path';

const packagesDir = path.join(process.cwd(), 'packages');

const packages = [
  'server-env',
  'client-env',
  'result',
  'route',
  'auth-guard',
  'repo',
  'services',
  'security'
];

for (const pkg of packages) {
  const dir = path.join(packagesDir, pkg);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  }

  const pkgJson = {
    name: `@zenith/${pkg}`,
    version: '1.0.0',
    main: 'src/index.ts',
    types: 'src/index.ts',
    scripts: {
      lint: 'eslint .',
      typecheck: 'tsc --noEmit'
    },
    dependencies: {},
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0'
    }
  };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  const tsconfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: 'dist',
      rootDir: 'src'
    },
    include: ['src']
  };
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  fs.writeFileSync(path.join(dir, 'src', 'index.ts'), '// Export entry point\n');
  console.log(`Scaffolded ${pkg}`);
}
