import { v4 as uuidv4 } from 'uuid';
import { AppLogEntry } from '../types/index.js';

class StructuredLogger {
  private logs: AppLogEntry[] = [];
  private maxLogs = 500;

  public log(level: AppLogEntry['level'], context: string, message: string, metadata?: Record<string, any>): void {
    const entry: AppLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      metadata
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'debug' ? '\x1b[35m' : '\x1b[36m';
    console.log(`${color}[${entry.timestamp}] [${level.toUpperCase()}] [${context}]\x1b[0m ${message}${metaStr}`);
  }

  public info(context: string, message: string, metadata?: Record<string, any>): void {
    this.log('info', context, message, metadata);
  }

  public warn(context: string, message: string, metadata?: Record<string, any>): void {
    this.log('warn', context, message, metadata);
  }

  public error(context: string, message: string, metadata?: Record<string, any>): void {
    this.log('error', context, message, metadata);
  }

  public debug(context: string, message: string, metadata?: Record<string, any>): void {
    this.log('debug', context, message, metadata);
  }

  public getRecentLogs(limit = 100, context?: string): AppLogEntry[] {
    let list = this.logs;
    if (context) {
      list = list.filter(l => l.context.toLowerCase() === context.toLowerCase());
    }
    return list.slice(0, limit);
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new StructuredLogger();
