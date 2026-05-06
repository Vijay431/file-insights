import { EncodingType } from '../types/metrics';

export class EncodingDetector {
  static detect(buffer: Buffer): EncodingType {
    if (!buffer || buffer.length === 0) {
      return 'utf-8';
    }

    const bom = EncodingDetector.detectBOM(buffer);
    if (bom) {
      return bom;
    }

    return EncodingDetector.analyzeBytePatterns(buffer);
  }

  static detectBOM(buffer: Buffer): EncodingType | null {
    if (buffer.length < 2) {
      return null;
    }

    const byte0 = buffer[0];
    const byte1 = buffer[1];

    if (buffer.length >= 3 && byte0 === 0xef && byte1 === 0xbb && buffer[2] === 0xbf) {
      return 'utf-8';
    }

    if (byte0 === 0xff && byte1 === 0xfe) {
      return 'utf-16le';
    }

    if (byte0 === 0xfe && byte1 === 0xff) {
      return 'utf-16be';
    }

    return null;
  }

  static analyzeBytePatterns(buffer: Buffer): EncodingType {
    let nullBytes = 0;
    let highBytes = 0;
    const sampleSize = Math.min(buffer.length, 4096);

    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      if (byte !== undefined) {
        if (byte === 0) {
          nullBytes++;
        }
        if (byte > 127) {
          highBytes++;
        }
      }
    }

    const nullRatio = nullBytes / sampleSize;
    const highRatio = highBytes / sampleSize;

    if (nullRatio > 0.3) {
      let oddNulls = 0;
      let evenNulls = 0;

      for (let i = 0; i < sampleSize; i += 2) {
        if (i < buffer.length && buffer[i] === 0) {
          evenNulls++;
        }
        if (i + 1 < buffer.length && buffer[i + 1] === 0) {
          oddNulls++;
        }
      }

      return oddNulls > evenNulls ? 'utf-16le' : 'utf-16be';
    }

    if (highRatio > 0.3) {
      return 'utf-8';
    }

    if (nullBytes === 0 && highBytes === 0) {
      return 'ascii';
    }

    return 'utf-8';
  }

  static decode(buffer: Buffer, encoding: EncodingType): string {
    try {
      switch (encoding) {
        case 'utf-8':
          return buffer.toString('utf-8');
        case 'utf-16le':
          return buffer.toString('utf16le');
        case 'utf-16be':
          return EncodingDetector.swapBytesAndDecode(buffer);
        case 'ascii':
          return buffer.toString('ascii');
        case 'latin-1':
          return buffer.toString('latin1');
        default:
          return buffer.toString('utf-8');
      }
    } catch (error) {
      return buffer.toString('utf-8');
    }
  }

  private static swapBytesAndDecode(buffer: Buffer): string {
    const swapped = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length - 1; i += 2) {
      const byte1 = buffer[i + 1];
      const byte2 = buffer[i];
      if (byte1 !== undefined && byte2 !== undefined) {
        swapped[i] = byte1;
        swapped[i + 1] = byte2;
      }
    }
    if (buffer.length % 2 === 1) {
      const lastByte = buffer[buffer.length - 1];
      if (lastByte !== undefined) {
        swapped[buffer.length - 1] = lastByte;
      }
    }
    return swapped.toString('utf16le');
  }

  static encode(text: string, encoding: EncodingType): Buffer {
    try {
      switch (encoding) {
        case 'utf-8':
          return Buffer.from(text, 'utf-8');
        case 'utf-16le':
          return Buffer.from(text, 'utf16le');
        case 'utf-16be':
          return EncodingDetector.encodeToBE(text);
        case 'ascii':
          return Buffer.from(text, 'ascii');
        case 'latin-1':
          return Buffer.from(text, 'latin1');
        default:
          return Buffer.from(text, 'utf-8');
      }
    } catch (error) {
      return Buffer.from(text, 'utf-8');
    }
  }

  private static encodeToBE(text: string): Buffer {
    const le = Buffer.from(text, 'utf16le');
    const be = Buffer.alloc(le.length);
    for (let i = 0; i < le.length - 1; i += 2) {
      const byte1 = le[i + 1];
      const byte2 = le[i];
      if (byte1 !== undefined && byte2 !== undefined) {
        be[i] = byte1;
        be[i + 1] = byte2;
      }
    }
    if (le.length % 2 === 1) {
      const lastByte = le[le.length - 1];
      if (lastByte !== undefined) {
        be[le.length - 1] = lastByte;
      }
    }
    return be;
  }

  static hasBOM(buffer: Buffer): boolean {
    return EncodingDetector.detectBOM(buffer) !== null;
  }
}
