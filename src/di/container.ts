import * as vscode from 'vscode';

import { TYPES } from './types';
import type { Logger } from '../utils/logger';
import type { ConfigurationService } from '../services/configurationService';
import type { FileStatsCacheService } from '../services/fileStatsCacheService';
import type { FileMetadataService } from '../services/fileMetadataService';
import type { FileStatsService } from '../services/fileStatsService';
import type { NotificationService } from '../services/notificationService';

interface ServiceDescriptor {
  factory: () => unknown;
  instance?: unknown;
  isInstantiated: boolean;
}

/**
 * Simple Dependency Injection Container
 * Provides service registration and resolution with singleton lifecycle
 * Supports hierarchical containers with parent fallback
 */
export class DIContainer {
  private services = new Map<symbol, ServiceDescriptor>();
  private factories = new Map<symbol, () => unknown>();
  private parent?: DIContainer;

  constructor(parent?: DIContainer) {
    if (parent !== undefined) {
      this.parent = parent;
    }
  }

  /**
   * Register a singleton service instance
   */
  public registerSingleton(token: symbol, instance: unknown): this {
    this.services.set(token, {
      factory: () => instance,
      instance,
      isInstantiated: true,
    });
    return this;
  }

  /**
   * Register a singleton service with a factory function for lazy initialization
   * The factory will be called on first use and the instance will be cached
   */
  public registerSingletonWithFactory<T>(token: symbol, factory: () => T): this {
    this.services.set(token, {
      factory,
      isInstantiated: false,
    });
    return this;
  }

  /**
   * Register a factory function for lazy initialization
   */
  public registerFactory(token: symbol, factory: () => unknown): this {
    this.factories.set(token, factory);
    return this;
  }

  /**
   * Register an instance directly
   * Use when you already have an instance that shouldn't be recreated
   */
  public registerInstance<T>(token: symbol, instance: T): this {
    this.services.set(token, {
      factory: () => instance,
      instance,
      isInstantiated: true,
    });
    return this;
  }

  /**
   * Create a child container that falls back to this container
   * Child containers can override services but share unresolved ones
   */
  public createChild(): DIContainer {
    return new DIContainer(this);
  }

  /**
   * Get a service by token
   * Throws an error if the service is not registered
   * Checks local container first, then parent if available
   */
  public get<T>(token: symbol): T {
    // Check if we have a cached instance
    if (this.services.has(token)) {
      const descriptor = this.services.get(token)!;
      if (!descriptor.isInstantiated && descriptor.factory) {
        const instance = descriptor.factory();
        descriptor.instance = instance;
        descriptor.isInstantiated = true;
        this.services.set(token, descriptor);
        return instance as T;
      }
      return descriptor.instance as T;
    }

    // Check if we have a factory to create the instance
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      this.services.set(token, {
        factory,
        instance,
        isInstantiated: true,
      });
      return instance as T;
    }

    // Check parent container if available
    if (this.parent) {
      return this.parent.get<T>(token);
    }

    throw new Error(`Service not registered: ${token.toString()}`);
  }

  /**
   * Check if a service is registered
   * Checks local container first, then parent if available
   */
  public has(token: symbol): boolean {
    return (
      this.services.has(token) ||
      this.factories.has(token) ||
      (this.parent?.has(token) ?? false)
    );
  }

  /**
   * Clear all registered services
   */
  public clear(): void {
    // Dispose all services that have a dispose method
    for (const [token, descriptor] of this.services.entries()) {
      if (
        descriptor.instance &&
        typeof descriptor.instance === 'object' &&
        'dispose' in descriptor.instance
      ) {
        try {
          (descriptor.instance as { dispose: () => void }).dispose();
        } catch (error) {
          console.error(`Error disposing service ${token.toString()}:`, error);
        }
      }
    }

    this.services.clear();
    this.factories.clear();
  }
}

/**
 * Global DI container instance
 */
export const container = new DIContainer();

/**
 * Initialize the DI container with all services
 * This function sets up the service dependency graph
 */
export async function initializeContainer(
  _context: vscode.ExtensionContext,
): Promise<void> {
  // Import services dynamically to avoid circular dependencies
  const { Logger } = await import('../utils/logger');
  const { ConfigurationService } = await import('../services/configurationService');
  const { FileStatsCacheService } = await import('../services/fileStatsCacheService');
  const { FileMetadataService } = await import('../services/fileMetadataService');
  const { FileStatsService } = await import('../services/fileStatsService');
  const { NotificationService } = await import('../services/notificationService');
  const { AccessibilityService } = await import('../services/accessibilityService');

  // Register services in dependency order
  // Logger has no dependencies
  container.registerSingleton(TYPES.Logger, Logger.create());

  // ConfigurationService depends on Logger
  const logger = container.get<Logger>(TYPES.Logger);
  container.registerSingleton(
    TYPES.ConfigurationService,
    ConfigurationService.create(logger),
  );

  // FileStatsCacheService depends on Logger
  container.registerSingleton(
    TYPES.FileStatsCacheService,
    FileStatsCacheService.create(logger),
  );

  // FileMetadataService depends on Logger
  container.registerSingleton(
    TYPES.FileMetadataService,
    FileMetadataService.create(logger),
  );

  // FileStatsService depends on Logger, FileStatsCacheService, and FileMetadataService
  const cache = container.get<FileStatsCacheService>(
    TYPES.FileStatsCacheService,
  );
  const metadata = container.get<FileMetadataService>(
    TYPES.FileMetadataService,
  );
  container.registerSingleton(
    TYPES.FileStatsService,
    FileStatsService.create(logger, cache, metadata),
  );

  // NotificationService depends on Logger
  container.registerSingleton(
    TYPES.NotificationService,
    NotificationService.create(logger),
  );

  // AccessibilityService depends on Logger
  container.registerSingleton(
    TYPES.AccessibilityService,
    AccessibilityService.create(logger),
  );

  // Managers are registered after all services
  // Import managers
  const { ExtensionManager } = await import('../managers/extensionManager');
  const { StatusBarManager } = await import('../managers/statusBarManager');

  // ExtensionManager depends on all services
  // Use factory to defer instantiation until services are ready
  container.registerFactory(TYPES.ExtensionManager, () => {
    return ExtensionManager.create(container);
  });

  // StatusBarManager depends on services
  const configService = container.get<ConfigurationService>(
    TYPES.ConfigurationService,
  );
  const fileStats = container.get<FileStatsService>(TYPES.FileStatsService);
  const cacheService = container.get<FileStatsCacheService>(
    TYPES.FileStatsCacheService,
  );
  const notification = container.get<NotificationService>(
    TYPES.NotificationService,
  );

  container.registerSingleton(
    TYPES.StatusBarManager,
    StatusBarManager.create(
      configService,
      fileStats,
      cacheService,
      notification,
      logger,
    ),
  );

  // ContextMenuManager depends on ConfigurationService and Logger
  const { ContextMenuManager } = await import('../managers/ContextMenuManager');
  container.registerSingleton(
    TYPES.ContextMenuManager,
    ContextMenuManager.create(configService, logger),
  );

  // CommandRegistry depends on Logger
  const { CommandRegistry } = await import('../managers/CommandRegistry');
  container.registerSingleton(TYPES.CommandRegistry, CommandRegistry.create(logger));
}

/**
 * Convenience function to resolve services from global container
 * Usage: const logger = getService<ILogger>(TYPES.Logger);
 */
export function getService<T>(token: symbol): T {
  return container.get<T>(token);
}

/**
 * Convenience function to check if service is registered
 * Usage: if (hasService(TYPES.Logger)) { ... }
 */
export function hasService(token: symbol): boolean {
  return container.has(token);
}
