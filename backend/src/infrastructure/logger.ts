type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context,
    };
    const output = JSON.stringify(entry);

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else if (level === 'debug' && process.env.NODE_ENV !== 'production') {
        console.debug(output);
    } else {
        console.log(output);
    }
}

const logger = {
    info: (message: string, context?: Record<string, unknown>): void =>
        log('info', message, context),
    warn: (message: string, context?: Record<string, unknown>): void =>
        log('warn', message, context),
    error: (message: string, context?: Record<string, unknown>): void =>
        log('error', message, context),
    debug: (message: string, context?: Record<string, unknown>): void =>
        log('debug', message, context),
};

export default logger;
