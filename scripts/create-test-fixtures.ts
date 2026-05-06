import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to create test fixture files for File Insights extension testing
 */

const FIXTURES_DIR = path.join(__dirname, '..', 'test', 'fixtures');

interface FixtureConfig {
  name: string;
  fileName: string;
  sizeInBytes: number;
  description: string;
}

const FIXTURES: FixtureConfig[] = [
  {
    name: 'SMALL',
    fileName: 'small-file.txt',
    sizeInBytes: 2 * 1024, // 2KB
    description: '2KB test file for KB format testing',
  },
  {
    name: 'MEDIUM',
    fileName: 'medium-file.txt',
    sizeInBytes: 2 * 1024 * 1024, // 2MB
    description: '2MB test file for MB format testing',
  },
  {
    name: 'LARGE',
    fileName: 'large-file.txt',
    sizeInBytes: 10 * 1024 * 1024, // 10MB
    description: '10MB test file for large file testing',
  },
];

async function createFixtures(): Promise<void> {
  console.log('🔧 Creating test fixtures...');

  // Ensure fixtures directory exists
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  for (const fixture of FIXTURES) {
    const filePath = path.join(FIXTURES_DIR, fixture.fileName);

    // Skip if file already exists and has correct size
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size === fixture.sizeInBytes) {
        console.log(
          `  ✓ ${fixture.fileName} (${formatBytes(fixture.sizeInBytes)}) - already exists with correct size`
        );
        continue;
      }
    }

    // Create file with specified size
    console.log(`  📝 Creating ${fixture.fileName} (${formatBytes(fixture.sizeInBytes)})...`);

    // For large files, use a more efficient approach
    if (fixture.sizeInBytes > 1024 * 1024) {
      // Create file using streams for large files
      await createLargeFile(filePath, fixture.sizeInBytes);
    } else {
      // Create file in memory for small files
      const content = 'A'.repeat(fixture.sizeInBytes);
      fs.writeFileSync(filePath, content);
    }

    console.log(`  ✅ Created ${fixture.fileName}`);
  }

  console.log('✅ Test fixtures created successfully!');
  console.log(`📁 Location: ${FIXTURES_DIR}`);
}

async function createLargeFile(filePath: string, sizeInBytes: number): Promise<void> {
  const fd = fs.openSync(filePath, 'w');
  try {
    const bufferSize = 1024 * 1024; // 1MB buffer
    const buffer = Buffer.alloc(bufferSize, 'A');

    let remainingBytes = sizeInBytes;
    let position = 0;

    while (remainingBytes > 0) {
      const writeSize = Math.min(bufferSize, remainingBytes);
      const writeBuffer = writeSize === bufferSize ? buffer : buffer.subarray(0, writeSize);

      fs.writeSync(fd, writeBuffer, 0, writeSize, position);

      position += writeSize;
      remainingBytes -= writeSize;
    }
  } finally {
    fs.closeSync(fd);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Run if called directly
if (require.main === module) {
  createFixtures().catch((error) => {
    console.error('❌ Failed to create test fixtures:', error);
    process.exit(1);
  });
}

export { createFixtures, FIXTURES };
