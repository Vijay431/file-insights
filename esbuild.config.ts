#!/usr/bin/env tsx

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';

/**
 * Services that can be lazy-loaded for better initial bundle size
 * Note: Current implementation uses dynamic imports in DI container,
 * which provides similar benefits without separate bundles
 */
const LAZY_SERVICES = [
  'src/services/fileMetadataService.ts',
  'src/services/notificationService.ts',
] as const;

/**
 * Create base build configuration
 */
const createConfig = (isProduction = false): esbuild.BuildOptions => ({
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  sourcemap: isProduction ? false : 'inline',
  minify: isProduction,
  treeShaking: true,
  mainFields: ['module', 'main'],
  conditions: ['node'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
  },
  // VS Code extension optimizations
  keepNames: false,
  legalComments: 'none',
  drop: isProduction ? ['console', 'debugger'] : [],
  metafile: true,
  plugins: [],
});

// Build function with comprehensive reporting
async function build(production = false): Promise<void> {
  try {
    console.log(`🚀 Building in ${production ? 'production' : 'development'} mode...`);

    const config = createConfig(production);
    const result = await esbuild.build(config);

    if (result.metafile) {
      // Write metafile for analysis
      writeFileSync('./dist/meta.json', JSON.stringify(result.metafile, null, 2));

      // Calculate bundle metrics
      const stats = readFileSync('./dist/extension.js');
      const sizeKB = (stats.length / 1024).toFixed(2);
      const targetKB = 50;

      console.log('✅ Build completed successfully!');
      console.log(`📦 Bundle size: ${sizeKB} KB`);

      // Target verification
      if (parseFloat(sizeKB) > targetKB) {
        console.log(
          // eslint-disable-next-line @stylistic/max-len
          `⚠️  Bundle exceeds ${targetKB}KB target by ${(parseFloat(sizeKB) - targetKB).toFixed(2)}KB`,
        );
      } else {
        console.log(
          `✨ Bundle is ${(targetKB - parseFloat(sizeKB)).toFixed(2)}KB under ${targetKB}KB target!`,
        );
      }

      // Bundle analysis summary
      const inputs = Object.keys(result.metafile.inputs).length;
      const outputs = Object.keys(result.metafile.outputs).length;
      console.log(`📋 Bundle analysis: ${inputs} input files, ${outputs} output files`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Watch function for development
async function watch(): Promise<void> {
  console.log('👀 Starting watch mode...');

  const config = createConfig(false);
  const context = await esbuild.context({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      {
        name: 'watch-plugin',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              console.log('🔄 Rebuild completed at', new Date().toLocaleTimeString());
            }
          });
        },
      },
    ],
  });

  await context.watch();
}

/**
 * Build lazy services as separate bundles (optional optimization)
 * This function creates separate chunks for services that can be loaded on demand
 * Note: The current architecture uses dynamic imports which achieves similar results
 */
async function buildLazyServices(isProduction = false): Promise<void> {
  console.log('🔄 Building lazy service bundles...');

  // Ensure dist/lazy directory exists
  const lazyDir = './dist/lazy';
  if (!existsSync(lazyDir)) {
    mkdirSync(lazyDir, { recursive: true });
  }

  for (const service of LAZY_SERVICES) {
    const serviceName = path.basename(service, '.ts');
    const entryPoint = `./${service}`;
    const outFile = path.join(lazyDir, `${serviceName}.js`);

    try {
      await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        outfile: outFile,
        external: ['vscode'],
        format: 'cjs',
        platform: 'node',
        target: 'node16',
        sourcemap: !isProduction,
        minify: isProduction,
        treeShaking: true,
        metafile: true,
      });

      console.log(`  ✅ Built lazy bundle: ${serviceName}`);
    } catch (error) {
      console.warn(`  ⚠️  Skipped lazy bundle for ${serviceName}:`, error);
    }
  }

  console.log('✨ Lazy service bundles complete');
}

/**
 * Analyze bundle composition for optimization opportunities
 */
function analyzeBundle(metafilePath: string): void {
  if (!existsSync(metafilePath)) {
    return;
  }

  try {
    const metafile = JSON.parse(readFileSync(metafilePath, 'utf-8'));
    const outputs = metafile.outputs;

    for (const [filePath, output] of Object.entries(outputs)) {
      if (filePath.endsWith('.js')) {
        const bytes = output.bytes;
        const kb = (bytes / 1024).toFixed(2);
        console.log(`  📄 ${path.basename(filePath)}: ${kb} KB`);

        // Show largest inputs
        const inputs = Object.entries(output.inputs ?? {})
          .map(([name, data]) => ({ name, bytes: (data as { bytes: number }).bytes }))
          .sort((a, b) => b.bytes - a.bytes)
          .slice(0, 5);

        if (inputs.length > 0) {
          console.log(`     Top contributors:`);
          for (const input of inputs) {
            const inputKb = (input.bytes / 1024).toFixed(2);
            console.log(`       - ${path.basename(input.name)}: ${inputKb} KB`);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not analyze bundle:', error);
  }
}

// Export for external use
export { build, buildLazyServices, createConfig, watch, analyzeBundle };

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production') || process.env['NODE_ENV'] === 'production';
  const isWatch = args.includes('--watch');
  const isAnalyze = args.includes('--analyze');

  if (isWatch) {
    watch().catch(console.error);
  } else if (isAnalyze) {
    build(isProduction).then(() => {
      analyzeBundle('./dist/meta.json');
    });
  } else {
    build(isProduction).catch(console.error);
  }
}