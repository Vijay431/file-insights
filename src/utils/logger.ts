import * as vscode from 'vscode';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('File Insights');
    this.logLevel = LogLevel.Info;
  }

  public static getInstance(): Logger {
    Logger.instance ??= new Logger();
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
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
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (args.length > 0) {
      this.outputChannel.appendLine(`${formattedMessage} ${JSON.stringify(args)}`);
    } else {
      this.outputChannel.appendLine(formattedMessage);
    }

    // Also log to console in development
    if (process.env['NODE_ENV'] === 'development') {
      switch (level) {
        case 'DEBUG':
          console.debug(formattedMessage, ...args);
          break;
        case 'INFO':
          console.info(formattedMessage, ...args);
          break;
        case 'WARN':
          console.warn(formattedMessage, ...args);
          break;
        case 'ERROR':
          console.error(formattedMessage, ...args);
          break;
      }
    }
  }

  public show(): void {
    this.outputChannel.show();
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}