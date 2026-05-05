import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { ILogger } from '../di/interfaces/ILogger';

import { BaseCommandHandler, CommandResult } from './BaseCommandHandler';

/**
 * Command handler for enabling the File Insights extension
 */
export class EnableCommand extends BaseCommandHandler {
  constructor(
    private configService: IConfigurationService,
    logger: ILogger,
    accessibility: IAccessibilityService,
  ) {
    super(logger, accessibility);
  }

  public async execute(): Promise<CommandResult> {
    try {
      this.logInfo('Enable command executed');

      await this.configService.enableExtension();

      await this.announceSuccess('Extension enabled', 'File Insights is now active');

      return this.success('Extension enabled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logError('Failed to enable extension', error);
      await this.announceError('Enable extension', errorMessage);
      return this.error(error, 'Failed to enable extension');
    }
  }
}
