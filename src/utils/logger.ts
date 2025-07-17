import picocolors from 'picocolors';
import { LogLevel, LoggableValue, NodeEnv } from '../types/common';

export class Logger {
	private context: string;

	constructor(context: string) {
		this.context = context;
	}

	info(message: string, ...args: LoggableValue[]): void {
		this.log('INFO', message, ...args);
	}

	warn(message: string, ...args: LoggableValue[]): void {
		this.log('WARN', message, ...args);
	}

	error(message: string, error?: unknown): void {
		let errorInfo: string;
		if (error instanceof Error) {
			errorInfo = `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
		} else if (typeof error === 'string') {
			errorInfo = error;
		} else if (error !== undefined) {
			errorInfo = JSON.stringify(error);
		} else {
			errorInfo = 'Unknown error';
		}
		this.log('ERROR', message, errorInfo);
	}

	debug(message: string, ...args: LoggableValue[]): void {
		const nodeEnv = (process.env['NODE_ENV'] as NodeEnv) || 'production';
		if (nodeEnv === 'development') {
			this.log('DEBUG', message, ...args);
		}
	}

	private log(level: LogLevel, message: string, ...args: LoggableValue[]): void {
		const timestamp = new Date().toISOString();
		const contextStr = picocolors.gray(`[${this.context}]`);
		
		let levelColor;
		switch (level) {
			case 'INFO':
				levelColor = picocolors.blue;
				break;
			case 'WARN':
				levelColor = picocolors.yellow;
				break;
			case 'ERROR':
				levelColor = picocolors.red;
				break;
			case 'DEBUG':
				levelColor = picocolors.magenta;
				break;
			default:
				levelColor = picocolors.white;
		}
		
		const levelStr = levelColor(`[${level}]`);
		const timestampStr = picocolors.gray(`[${timestamp}]`);
		const formattedMessage = `${timestampStr} ${levelStr} ${contextStr} ${message}`;
		
		if (args.length > 0) {
			console.log(`${formattedMessage} ${JSON.stringify(args)}`);
		} else {
			console.log(formattedMessage);
		}
	}

	dispose(): void {
		// No cleanup needed for console.log implementation
	}

	static showOutputChannel(): void {
		// No output channel to show for console.log implementation
		console.log(picocolors.cyan('File Insights logs are displayed in the terminal'));
	}
}