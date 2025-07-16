/**
 * Common types used throughout the extension
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LoggableValue = string | number | boolean | null | undefined | Error | Record<string, unknown>;

export type NodeEnv = 'development' | 'production' | 'test';

export type Result<T, E = Error> = 
	| { success: true; data: T }
	| { success: false; error: E };

/**
 * Utility type for creating partial mock objects
 */
export type MockObject<T> = {
	[K in keyof T]?: T[K] extends (...args: unknown[]) => unknown 
		? (...args: Parameters<T[K]>) => ReturnType<T[K]>
		: T[K] extends object
		? MockObject<T[K]>
		: T[K];
};