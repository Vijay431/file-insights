/**
 * Context Menu Manager interface for dependency injection
 * Manages VS Code context menu visibility and command registration
 */
export interface IContextMenuManager {
  /**
   * Initialize the context menu manager
   * Sets up context variables for when clauses
   */
  initialize(): Promise<void>;

  /**
   * Dispose of resources
   */
  dispose(): void;
}
