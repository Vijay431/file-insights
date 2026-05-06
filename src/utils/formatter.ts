import { FormattedSize, FileInsightsConfig } from '../types/extension';
import type { DeltaDisplay } from './sizeDeltaFormatter';

export class SizeFormatter {
  private static readonly UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  private static readonly BYTES_PER_UNIT = 1024;

  static formatSize(bytes: number, config: FileInsightsConfig): FormattedSize {
    if (bytes < 0) {
      return { value: 0, unit: 'B', formatted: '0 B' };
    }

    if (bytes === 0) {
      return { value: 0, unit: 'B', formatted: '0 B' };
    }

    // Handle forced format
    if (config.displayFormat !== 'auto') {
      return this.formatToSpecificUnit(bytes, config.displayFormat, config);
    }

    // Auto format based on size
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(this.BYTES_PER_UNIT));
    const clampedIndex = Math.max(0, Math.min(unitIndex, this.UNITS.length - 1));
    const unit = this.resolveUnit(clampedIndex);
    const decimals = clampedIndex === 0 ? 0 : 2;
    return this.formatValue(bytes, clampedIndex, unit, decimals, false);
  }

  private static formatToSpecificUnit(
    bytes: number,
    format: FileInsightsConfig['displayFormat'],
    config: FileInsightsConfig
  ): FormattedSize {
    switch (format) {
      case 'bytes': {
        return { value: bytes, unit: 'B', formatted: `${bytes} B` };
      }
      case 'kb': {
        return this.formatValue(bytes, 1, 'KB', 2, true);
      }
      case 'mb': {
        return this.formatValue(bytes, 2, 'MB', 2, true);
      }
      case 'gb': {
        return this.formatValue(bytes, 3, 'GB', 2, true);
      }
      default: {
        return this.formatSize(bytes, { ...config, displayFormat: 'auto' });
      }
    }
  }

  private static formatValue(
    bytes: number,
    exponent: number,
    unit: string,
    decimals: number,
    preserveTrailingZeros: boolean
  ): FormattedSize {
    const divisor = Math.pow(this.BYTES_PER_UNIT, exponent);
    const rawValue = divisor === 0 ? bytes : bytes / divisor;
    const formattedNumber = Number(rawValue.toFixed(decimals));
    const display = preserveTrailingZeros
      ? formattedNumber.toFixed(decimals)
      : formattedNumber.toString();

    return {
      value: formattedNumber,
      unit,
      formatted: `${display} ${unit}`,
    };
  }

  static createTooltip(
    size: FormattedSize,
    filePath: string,
    lastModified: Date,
    metadata?: import('../types/metrics').FileMetadata,
    config?: FileInsightsConfig,
    deltaDisplay?: DeltaDisplay
  ): string {
    const modifiedTime = lastModified.toLocaleString();
    const lines: string[] = [
      `**File**: ${filePath}`,
      `**Size**: ${size.formatted}`,
      `**Last Modified**: ${modifiedTime}`,
    ];

    if (metadata && config?.metadataDisplay) {
      const mdConfig = config.metadataDisplay;
      lines.push('');
      lines.push('**Metadata**:');

      if (mdConfig.showLineCount && metadata.lineCount > 0) {
        lines.push(`- Lines: ${metadata.lineCount.toLocaleString()}`);
      }

      if (mdConfig.showCharacterCount && metadata.characterCount > 0) {
        lines.push(`- Characters: ${metadata.characterCount.toLocaleString()}`);
      }

      if (mdConfig.showEncoding) {
        lines.push(`- Encoding: ${metadata.encoding.toUpperCase()}`);
      }

      if (mdConfig.showFileType) {
        lines.push(`- Type: ${metadata.fileType || '(none)'}`);
      }

      if (mdConfig.showRelativePath) {
        lines.push(`- Path: ${metadata.relativePath}`);
      }

      if (metadata.isBinary) {
        lines.push('- **Binary File**');
      }

      if (metadata.byteOrderMark) {
        lines.push('- Has BOM: Yes');
      }
    }

    if (deltaDisplay) {
      lines.push('');
      lines.push('**Size Change**:');
      lines.push(`- ${deltaDisplay.indicator} ${deltaDisplay.formatted}`);
    }

    return lines.join('\n');
  }

  static getColorForSize(bytes: number, config: FileInsightsConfig): string {
    if (!config.colorCoding.enabled) {
      return '';
    }

    const thresholds = config.colorCoding.thresholds;
    const yellowThreshold = SizeFormatter.parseSizeString(thresholds.yellow);
    const orangeThreshold = SizeFormatter.parseSizeString(thresholds.orange);
    const redThreshold = SizeFormatter.parseSizeString(thresholds.red);

    const colors = config.colorCoding.colors;

    if (bytes < yellowThreshold) {
      return colors.green;
    } else if (bytes < orangeThreshold) {
      return colors.yellow;
    } else if (bytes < redThreshold) {
      return colors.orange;
    } else {
      return colors.red;
    }
  }

  private static parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(
      // eslint-disable-next-line security/detect-unsafe-regex
      /^(\d+(?:\.\d+)?)(B|KB|MB|GB|TB)?$/i
    );
    if (!match?.[1]) {
      return 0;
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] ?? 'B').toUpperCase() as 'B' | 'KB' | 'MB' | 'GB' | 'TB';

    const validMultipliers = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };

    return value * validMultipliers[unit];
  }

  private static resolveUnit(index: number): string {
    switch (index) {
      case 0:
        return 'B';
      case 1:
        return 'KB';
      case 2:
        return 'MB';
      case 3:
        return 'GB';
      case 4:
        return 'TB';
      default:
        return 'B';
    }
  }
}
