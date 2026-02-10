import { supabase } from './supabase';

export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug'
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: any;
    userId?: string;
    error?: Error;
    url?: string;
    method?: string;
}

class Logger {
    private async saveToDatabase(entry: LogEntry) {
        // Save to Supabase logs table (non-blocking)
        try {
            await supabase.from('app_logs').insert({
                level: entry.level,
                message: entry.message,
                context: entry.context ? JSON.stringify(entry.context) : null,
                user_id: entry.userId || null,
                error_stack: entry.error?.stack || null,
                url: entry.url || null,
                method: entry.method || null,
                created_at: entry.timestamp.toISOString()
            });
        } catch (e) {
            // Fallback to console if database save fails
            console.error('Failed to save log to database:', e);
        }
    }

    /**
     * Log informational message
     */
    info(message: string, context?: any, userId?: string) {
        const entry: LogEntry = {
            level: LogLevel.INFO,
            message,
            context,
            userId,
            timestamp: new Date()
        };

        console.log(`[INFO] ${message}`, context || '');

        // Save to database asynchronously (don't await)
        this.saveToDatabase(entry).catch(() => { });
    }

    /**
     * Log warning message
     */
    warn(message: string, context?: any, userId?: string) {
        const entry: LogEntry = {
            level: LogLevel.WARN,
            message,
            context,
            userId,
            timestamp: new Date()
        };

        console.warn(`[WARN] ${message}`, context || '');
        this.saveToDatabase(entry).catch(() => { });
    }

    /**
     * Log error message
     */
    error(message: string, error?: Error, context?: any, userId?: string) {
        const entry: LogEntry = {
            level: LogLevel.ERROR,
            message,
            error,
            context,
            userId,
            timestamp: new Date()
        };

        console.error(`[ERROR] ${message}`, error || '', context || '');
        this.saveToDatabase(entry).catch(() => { });
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, context?: any) {
        if (process.env.NODE_ENV === 'development') {
            const entry: LogEntry = {
                level: LogLevel.DEBUG,
                message,
                context,
                timestamp: new Date()
            };

            console.debug(`[DEBUG] ${message}`, context || '');
            // Don't save debug logs to database
        }
    }

    /**
     * Log API request
     */
    apiRequest(method: string, url: string, userId?: string, context?: any) {
        const entry: LogEntry = {
            level: LogLevel.INFO,
            message: `API Request: ${method} ${url}`,
            method,
            url,
            userId,
            context,
            timestamp: new Date()
        };

        console.log(`[API] ${method} ${url}`, context || '');
        this.saveToDatabase(entry).catch(() => { });
    }

    /**
     * Log API error
     */
    apiError(method: string, url: string, error: Error, userId?: string, context?: any) {
        const entry: LogEntry = {
            level: LogLevel.ERROR,
            message: `API Error: ${method} ${url}`,
            method,
            url,
            error,
            userId,
            context,
            timestamp: new Date()
        };

        console.error(`[API ERROR] ${method} ${url}`, error, context || '');
        this.saveToDatabase(entry).catch(() => { });
    }
}

// Export singleton instance
export const logger = new Logger();
