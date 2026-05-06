import { FileMetadata } from './metrics';

export interface FileInsightsConfig {
  enabled: boolean;
  displayFormat: 'auto' | 'bytes' | 'kb' | 'mb' | 'gb';
  colorCoding: ColorCodingConfig;
  statusBar: StatusBarConfig;
  metadataDisplay: MetadataDisplayConfig;
  sizeWarnings: SizeWarningsConfig;
  deltaDisplay: DeltaDisplayConfig;
}

export interface DeltaDisplayConfig {
  showDeltaIndicator: boolean;
  showDeltaInTooltip: boolean;
}

export interface SizeWarningsConfig {
  enabled: boolean;
  thresholds: {
    yellow: string;
    orange: string;
    red: string;
  };
  notificationFrequency: 'once' | 'always' | 'daily';
  showNotification: boolean;
}

export interface MetadataDisplayConfig {
  showLineCount: boolean;
  showCharacterCount: boolean;
  showEncoding: boolean;
  showFileType: boolean;
  showRelativePath: boolean;
}

export interface ColorCodingConfig {
  enabled: boolean;
  thresholds: {
    yellow: string;
    orange: string;
    red: string;
  };
  colors: {
    green: string;
    yellow: string;
    orange: string;
    red: string;
  };
}

export interface StatusBarConfig {
  alignment: 'left' | 'right';
  priority: number;
  hideIfExceeds: boolean;
  hideThreshold: string;
}

export interface FileStats {
  size: number;
  path: string;
  lastModified: Date;
  metadata?: FileMetadata;
}

export interface FormattedSize {
  value: number;
  unit: string;
  formatted: string;
}

export interface CacheEntry {
  stats: FileStats;
  cachedAt: number;
  fileMtime: number;
  hitCount: number;
  lastAccessed: number;
  previousSize?: number;
  lastSizeChange?: Date;
}

export interface CacheConfig {
  maxEntries: number;
  ttl: number;
}
