import { FormattedSize, FileInsightsConfig } from '../types/extension';

export class SizeFormatter {
	private static readonly UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
	private static readonly BYTES_PER_UNIT = 1024;

	static formatSize(bytes: number, config: FileInsightsConfig): FormattedSize {
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
		
		const value = bytes / Math.pow(this.BYTES_PER_UNIT, clampedIndex);
		const unit = this.UNITS[clampedIndex] || 'B';
		
		// Format with appropriate decimal places
		const decimals = clampedIndex === 0 ? 0 : 2;
		const formattedValue = Number(value.toFixed(decimals));
		
		// Format display string
		const displayValue = formattedValue.toString();
		
		return {
			value: formattedValue,
			unit,
			formatted: `${displayValue} ${unit}`
		};
	}

	private static formatToSpecificUnit(bytes: number, format: FileInsightsConfig['displayFormat'], config: FileInsightsConfig): FormattedSize {
		switch (format) {
			case 'bytes': {
				return { value: bytes, unit: 'B', formatted: `${bytes} B` };
			}
			case 'kb': {
				const kb = bytes / this.BYTES_PER_UNIT;
				return { value: Number(kb.toFixed(2)), unit: 'KB', formatted: `${kb.toFixed(2)} KB` };
			}
			case 'mb': {
				const mb = bytes / Math.pow(this.BYTES_PER_UNIT, 2);
				return { value: Number(mb.toFixed(2)), unit: 'MB', formatted: `${mb.toFixed(2)} MB` };
			}
			default: {
				return this.formatSize(bytes, { ...config, displayFormat: 'auto' });
			}
		}
	}

	static createTooltip(size: FormattedSize, filePath: string, lastModified: Date): string {
		const modifiedTime = lastModified.toLocaleString();
		return `File: ${filePath}\nSize: ${size.formatted}\nLast Modified: ${modifiedTime}`;
	}
}