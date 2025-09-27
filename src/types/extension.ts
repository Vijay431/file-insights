export interface FileInsightsConfig {
  enabled: boolean;
  displayFormat: 'auto' | 'bytes' | 'kb' | 'mb' | 'gb';
}

export interface FileStats {
  size: number;
  path: string;
  lastModified: Date;
}

export interface FormattedSize {
  value: number;
  unit: string;
  formatted: string;
}