/**
 * Dependency Injection Module
 * Exports the DI container, types, and all service interfaces
 */

export { DIContainer, container, initializeContainer } from './container';
export { TYPES } from './types';

// Export all interfaces
export type { ILogger } from './interfaces/ILogger';
export type { IConfigurationService } from './interfaces/IConfigurationService';
export type { IFileStatsService } from './interfaces/IFileStatsService';
export type { IFileStatsCacheService } from './interfaces/IFileStatsCacheService';
export type { IFileMetadataService } from './interfaces/IFileMetadataService';
export type { INotificationService } from './interfaces/INotificationService';
export type { IAccessibilityService } from './interfaces/IAccessibilityService';
