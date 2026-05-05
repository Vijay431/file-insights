import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { ILogger } from '../di/interfaces/ILogger';

import { BaseCommandHandler, CommandResult } from './BaseCommandHandler';

/**
 * Command handler for importing File Insights settings from a JSON file
 */
export class ImportSettingsCommand extends BaseCommandHandler {
  constructor(
    private configService: IConfigurationService,
    logger: ILogger,
    accessibility: IAccessibilityService,
  ) {
    super(logger, accessibility);
  }

  public async execute(): Promise<CommandResult> {
    try {
      this.logInfo('Import settings command executed');

      await this.configService.importSettings();

      await this.announceSuccess('Settings imported', 'Configuration loaded from file');

      return this.success('Settings imported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logError('Failed to import settings', error);
      await this.announceError('Import settings', errorMessage);
      return this.error(error, 'Failed to import settings');
    }
  }
}
