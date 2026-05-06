import * as assert from 'assert';

import { SizeFormatter } from '../../src/utils/formatter';
import { FileInsightsConfig } from '../../src/types/extension';

suite('SizeFormatter', () => {
  // Helper to create test config with specific display format
  function createTestConfig(displayFormat: FileInsightsConfig['displayFormat']): FileInsightsConfig {
    return {
      enabled: true,
      displayFormat,
      colorCoding: {
        enabled: true,
        thresholds: { yellow: '100KB', orange: '1MB', red: '10MB' },
        colors: { green: 'terminal.ansiGreen', yellow: 'terminal.ansiYellow', orange: '', red: '' },
      },
      statusBar: { alignment: 'right', priority: 0, hideIfExceeds: false, hideThreshold: '100MB' },
      metadataDisplay: {
        showLineCount: true,
        showCharacterCount: true,
        showEncoding: true,
        showFileType: true,
        showRelativePath: true,
      },
      sizeWarnings: {
        enabled: true,
        thresholds: { yellow: '100KB', orange: '1MB', red: '10MB' },
        notificationFrequency: 'always',
        showNotification: true,
      },
      deltaDisplay: { showDeltaIndicator: true, showDeltaInTooltip: true },
    };
  }

  const configAuto = createTestConfig('auto');

  test('formats bytes without decimals in auto mode', () => {
    const formatted = SizeFormatter.formatSize(512, configAuto);

    assert.strictEqual(formatted.value, 512);
    assert.strictEqual(formatted.unit, 'B');
    assert.strictEqual(formatted.formatted, '512 B');
  });

  test('formats kilobytes with trimmed decimals in auto mode', () => {
    const formatted = SizeFormatter.formatSize(2048, configAuto);

    assert.strictEqual(formatted.value, 2);
    assert.strictEqual(formatted.unit, 'KB');
    assert.strictEqual(formatted.formatted, '2 KB');
  });

  test('respects forced megabyte format', () => {
    const configMb = createTestConfig('mb');
    const formatted = SizeFormatter.formatSize(2_359_296, configMb);

    assert.strictEqual(formatted.value, 2.25);
    assert.strictEqual(formatted.unit, 'MB');
    assert.strictEqual(formatted.formatted, '2.25 MB');
  });

  test('fallbacks to auto for unknown format values', () => {
    const configUnknown = createTestConfig('invalid_format' as FileInsightsConfig['displayFormat']);
    const formatted = SizeFormatter.formatSize(1_073_741_824, configUnknown);

    assert.strictEqual(formatted.unit, 'GB');
    assert.ok(formatted.formatted.endsWith('GB'));
  });
});
