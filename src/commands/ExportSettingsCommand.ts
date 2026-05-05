import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { ILogger } from '../di/interfaces/ILogger';

import { BaseCommandHandler, CommandResult } from './BaseCommandHandler';

/**
 * Command handler for exporting File Insights settings to a JSON file
 */
export class ExportSettingsCommand extends BaseCommandHandler {
  constructor(
    private configService: IConfigurationService,
    logger: ILogger,
    accessibility: IAccessibilityService,
  ) {
    super(logger, accessibility);
  }

  public async execute(): Promise<CommandResult> {
    try {
      this.logInfo('Export settings command executed');

      await this.configService.exportSettings();

      await this.announceSuccess('Settings exported', 'Configuration saved to file');

      return this.success('Settings exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logError('Failed to export settings', error);
      await this.announceError('Export settings', errorMessage);
      return this.error(error, 'Failed to export settings');
    }
  }
}
