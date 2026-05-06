export interface DeltaDisplay {
  indicator: string;
  formatted: string;
  color: string;
}

export class SizeDeltaFormatter {
  private static readonly INDICATORS = {
    up: '↑',
    down: '↓',
    same: '=',
  };

  static formatDelta(currentSize: number, previousSize: number | undefined): DeltaDisplay | null {
    if (previousSize === undefined) {
      return null;
    }

    const delta = currentSize - previousSize;
    const isGrowth = delta > 0;
    const absoluteDelta = Math.abs(delta);

    if (absoluteDelta === 0) {
      return {
        indicator: SizeDeltaFormatter.INDICATORS.same,
        formatted: '0 B',
        color: '',
      };
    }

    const formatted = SizeDeltaFormatter.formatSize(absoluteDelta);
    const color = isGrowth ? 'errorForeground' : 'successForeground';

    return {
      indicator: isGrowth ? SizeDeltaFormatter.INDICATORS.up : SizeDeltaFormatter.INDICATORS.down,
      formatted: formatted.formatted,
      color,
    };
  }

  private static formatSize(bytes: number): { formatted: string; unit: string } {
    if (bytes < 0) {
      bytes = Math.abs(bytes);
    }
    if (bytes === 0) {
      return { formatted: '0 B', unit: 'B' };
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
    const threshold = 1024;

    const unitIndex = Math.floor(Math.log(bytes) / Math.log(threshold));
    const clampedIndex = Math.max(0, Math.min(unitIndex, units.length - 1));

    const value = bytes / Math.pow(threshold, clampedIndex);
    const formattedValue = clampedIndex === 0 ? value.toString() : value.toFixed(2);
    const unit = units[clampedIndex] ?? 'B';

    return {
      formatted: `${formattedValue} ${unit}`,
      unit,
    };
  }

  static getTrend(
    history: Array<{ timestamp: number; size: number }>,
    windowSize: number = 7
  ): 'up' | 'down' | 'stable' | null {
    if (history.length < 2) {
      return null;
    }

    const recent = history.slice(-windowSize);
    if (recent.length < 2) {
      return null;
    }

    const first = recent[0]!.size;
    const last = recent[recent.length - 1]!.size;
    const delta = last - first;

    const threshold = Math.max(Math.abs(first) * 0.1, 1);

    if (delta > threshold) {
      return 'up';
    }
    if (delta < -threshold) {
      return 'down';
    }

    return 'stable';
  }
}
