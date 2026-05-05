import * as assert from 'assert';

import { EncodingDetector } from '../../src/utils/encodingDetector';
import { EncodingType } from '../../src/types/metrics';

suite('EncodingDetector', () => {
  suite('detectBOM', () => {
    test('should detect UTF-8 BOM', () => {
      const buffer = Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, 'utf-8');
    });

    test('should detect UTF-16 LE BOM', () => {
      const buffer = Buffer.from([0xff, 0xfe, 0x48, 0x00]);
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, 'utf-16le');
    });

    test('should detect UTF-16 BE BOM', () => {
      const buffer = Buffer.from([0xfe, 0xff, 0x00, 0x48]);
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, 'utf-16be');
    });

    test('should return null for buffer without BOM', () => {
      const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, null);
    });

    test('should return null for empty buffer', () => {
      const buffer = Buffer.from([]);
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, null);
    });

    test('should return null for buffer with only one byte', () => {
      const buffer = Buffer.from([0x48]);
      const result = EncodingDetector.detectBOM(buffer);

      assert.strictEqual(result, null);
    });
  });

  suite('hasBOM', () => {
    test('should return true for UTF-8 BOM', () => {
      const buffer = Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const result = EncodingDetector.hasBOM(buffer);

      assert.strictEqual(result, true);
    });

    test('should return false for buffer without BOM', () => {
      const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
      const result = EncodingDetector.hasBOM(buffer);

      assert.strictEqual(result, false);
    });

    test('should return false for short buffer', () => {
      const buffer = Buffer.from([0xef, 0xbb]);
      const result = EncodingDetector.hasBOM(buffer);

      assert.strictEqual(result, false);
    });
  });

  suite('analyzeBytePatterns', () => {
    test('should detect ASCII for plain text', () => {
      const buffer = Buffer.from('Hello World!', 'ascii');
      const result = EncodingDetector.analyzeBytePatterns(buffer);

      assert.strictEqual(result, 'ascii');
    });

    test('should detect UTF-8 for high byte content', () => {
      // UTF-8 encoded text with special characters
      const buffer = Buffer.from('Hello 世界', 'utf-8');
      const result = EncodingDetector.analyzeBytePatterns(buffer);

      assert.strictEqual(result, 'utf-8');
    });

    test('should detect UTF-16 LE for null-heavy even positions', () => {
      // UTF-16 LE encoded text
      const buffer = Buffer.from('Hello', 'utf16le');
      const result = EncodingDetector.analyzeBytePatterns(buffer);

      assert.strictEqual(result, 'utf-16le');
    });
  });

  suite('detect', () => {
    test('should detect UTF-8 with BOM', () => {
      const buffer = Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const result = EncodingDetector.detect(buffer);

      assert.strictEqual(result, 'utf-8');
    });

    test('should detect UTF-16 LE with BOM', () => {
      const buffer = Buffer.from([0xff, 0xfe, 0x48, 0x00]);
      const result = EncodingDetector.detect(buffer);

      assert.strictEqual(result, 'utf-16le');
    });

    test('should detect UTF-16 BE with BOM', () => {
      const buffer = Buffer.from([0xfe, 0xff, 0x00, 0x48]);
      const result = EncodingDetector.detect(buffer);

      assert.strictEqual(result, 'utf-16be');
    });

    test('should fallback to byte pattern analysis without BOM', () => {
      const buffer = Buffer.from('Hello World!', 'ascii');
      const result = EncodingDetector.detect(buffer);

      assert.strictEqual(result, 'ascii');
    });

    test('should return utf-8 for empty buffer', () => {
      const buffer = Buffer.from([]);
      const result = EncodingDetector.detect(buffer);

      assert.strictEqual(result, 'utf-8');
    });
  });

  suite('decode', () => {
    test('should decode UTF-8 buffer', () => {
      const buffer = Buffer.from('Hello World', 'utf-8');
      const result = EncodingDetector.decode(buffer, 'utf-8');

      assert.strictEqual(result, 'Hello World');
    });

    test('should decode UTF-16 LE buffer', () => {
      const buffer = Buffer.from('Hello', 'utf16le');
      const result = EncodingDetector.decode(buffer, 'utf-16le');

      assert.strictEqual(result, 'Hello');
    });

    test('should decode ASCII buffer', () => {
      const buffer = Buffer.from('Hello', 'ascii');
      const result = EncodingDetector.decode(buffer, 'ascii');

      assert.strictEqual(result, 'Hello');
    });

    test('should handle UTF-16 BE with byte swapping', () => {
      const buffer = Buffer.from([0x00, 0x48, 0x00, 0x65]); // "He" in UTF-16 BE
      const result = EncodingDetector.decode(buffer, 'utf-16be');

      assert.strictEqual(result, 'He');
    });

    test('should fallback to UTF-8 for unknown encoding', () => {
      const buffer = Buffer.from('Hello', 'utf-8');
      const result = EncodingDetector.decode(buffer, 'unknown' as EncodingType);

      assert.strictEqual(result, 'Hello');
    });
  });

  suite('encode', () => {
    test('should encode to UTF-8', () => {
      const text = 'Hello World';
      const result = EncodingDetector.encode(text, 'utf-8');

      assert.strictEqual(result.toString('utf-8'), 'Hello World');
    });

    test('should encode to UTF-16 LE', () => {
      const text = 'Hello';
      const result = EncodingDetector.encode(text, 'utf-16le');

      assert.strictEqual(result.toString('utf16le'), 'Hello');
    });

    test('should encode to ASCII', () => {
      const text = 'Hello';
      const result = EncodingDetector.encode(text, 'ascii');

      assert.strictEqual(result.toString('ascii'), 'Hello');
    });

    test('should encode to UTF-16 BE', () => {
      const text = 'Hi';
      const result = EncodingDetector.encode(text, 'utf-16be');

      // Verify it's in BE format
      assert.strictEqual(result[0], 0x00); // H high byte
      assert.strictEqual(result[1], 0x48); // H low byte
      assert.strictEqual(result[2], 0x00); // i high byte
      assert.strictEqual(result[3], 0x69); // i low byte
    });

    test('should fallback to UTF-8 for unknown encoding', () => {
      const text = 'Hello';
      const result = EncodingDetector.encode(text, 'unknown' as EncodingType);

      assert.strictEqual(result.toString('utf-8'), 'Hello');
    });
  });
});
