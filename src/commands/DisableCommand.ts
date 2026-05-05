import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { ILogger } from '../di/interfaces/ILogger';

import { BaseCommandHandler, CommandResult } from './BaseCommandHandler';

/**
 * Command handler for disabling the File Insights extension
 */
export class DisableCommand extends BaseCommandHandler {
  constructor(
    private configService: IConfigurationService,
    logger: ILogger,
    accessibility: IAccessibilityService,
  ) {
    super(logger, accessibility);
  }

  public async execute(): Promise<CommandResult> {
    try {
      this.logInfo('Disable command executed');

      await this.configService.disableExtension();

      await this.announceSuccess('Extension disabled', 'File Insights is now inactive');

      return this.success('Extension disabled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logError('Failed to disable extension', error);
      await this.announceError('Disable extension', errorMessage);
      return this.error(error, 'Failed to disable extension');
    }
  }
}
