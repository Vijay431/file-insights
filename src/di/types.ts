/**
 * Dependency Injection Service Token Types
 * Using Symbol-based tokens for type safety and collision avoidance
 */

export const TYPES = {
  // Core Services
  Logger: Symbol.for('Logger'),
  ConfigurationService: Symbol.for('ConfigurationService'),

  // Data Services
  FileStatsService: Symbol.for('FileStatsService'),
  FileStatsCacheService: Symbol.for('FileStatsCacheService'),
  FileMetadataService: Symbol.for('FileMetadataService'),

  // UI Services
  NotificationService: Symbol.for('NotificationService'),
  AccessibilityService: Symbol.for('AccessibilityService'),

  // Managers
  ExtensionManager: Symbol.for('ExtensionManager'),
  StatusBarManager: Symbol.for('StatusBarManager'),
  ContextMenuManager: Symbol.for('ContextMenuManager'),
  CommandRegistry: Symbol.for('CommandRegistry'),
} as const;

export type ServiceToken = typeof TYPES[keyof typeof TYPES];
