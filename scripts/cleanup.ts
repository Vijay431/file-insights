#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

function removeTarget(targetPath: string): void {
  const resolved = path.resolve(process.cwd(), targetPath);

  if (!fs.existsSync(resolved)) {
    return;
  }

  fs.rmSync(resolved, { recursive: true, force: true });
}

async function main(): Promise<void> {
  const [, , ...paths] = process.argv;

  if (paths.length === 0) {
    console.error('No paths provided to cleanup script.');
    process.exit(1);
  }

  paths.forEach(removeTarget);
}

main().catch((error) => {
  console.error('Failed to clean paths:', error);
  process.exit(1);
});
