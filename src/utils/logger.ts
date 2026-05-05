import * as vscode from 'vscode';
import type { ILogger } from '../di/interfaces/ILogger';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export enum LogFormat {
  Text = 'text',
  JSON = 'json',
}

export class Logger implements ILogger {
  private static instance: Logger | undefined;
  private outputChannel: vscode.OutputChannel | null;
  private logLevel: LogLevel;
  private logFormat: LogFormat;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('File Insights');
    this.logLevel = LogLevel.Info;
    this.logFormat = LogFormat.Text;
  }

  /**
   * Create a new Logger instance (DI pattern)
   */
  public static create(): Logger {
    return new Logger();
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): Logger {
    Logger.instance ??= new Logger();
    return Logger.instance;
  }

  private ensureChannel(): vscode.OutputChannel {
    this.outputChannel ??= vscode.window.createOutputChannel('File Insights');
    return this.outputChannel;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public setLogFormat(format: LogFormat): void {
    this.logFormat = format;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Debug) {
      this.log('DEBUG', message, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Info) {
      this.log('INFO', message, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Warn) {
      this.log('WARN', message, ...args);
    }
  }

  public error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Error) {
      let errorMessage = message;
      if (error) {
        errorMessage += ` - ${error instanceof Error ? error.message : String(error)}`;
      }
      this.log('ERROR', errorMessage, ...args);
    }
  }

  private log(level: string, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const channel = this.ensureChannel();

    if (this.logFormat === LogFormat.JSON) {
      // JSON format: structured logging
      const logEntry = {
        timestamp,
        level,
        message,
        ...(args.length > 0 && { args }),
      };
      channel.appendLine(JSON.stringify(logEntry));
    } else {
      // Text format: traditional logging
      const formattedMessage = `[${timestamp}] [${level}] ${message}`;
      if (args.length > 0) {
        channel.appendLine(`${formattedMessage} ${JSON.stringify(args)}`);
      } else {
        channel.appendLine(formattedMessage);
      }
    }

    // Also log to console in development
    if (process.env['NODE_ENV'] === 'development') {
      switch (level) {
        case 'DEBUG':
          console.debug(message, ...args);
          break;
        case 'INFO':
          console.info(message, ...args);
          break;
        case 'WARN':
          console.warn(message, ...args);
          break;
        case 'ERROR':
          console.error(message, ...args);
          break;
      }
    }
  }

  public show(): void {
    this.ensureChannel().show();
  }

  public dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
  }
}