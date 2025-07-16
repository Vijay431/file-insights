export interface FileInsightsConfig {
	enabled: boolean;
	displayFormat: 'auto' | 'bytes' | 'kb' | 'mb';
	statusBarPosition: 'left' | 'right';
	showTooltip: boolean;
	refreshInterval: number;
	maxFileSize: number;
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