// Error handling utilities
import { supabase } from '../supabaseClient';

// Error types
export const ERROR_TYPES = {
    NETWORK: 'NETWORK',
    AUTH: 'AUTH',
    VALIDATION: 'VALIDATION',
    DATABASE: 'DATABASE',
    UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

// Error logger class
class ErrorLogger {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors in memory
    }

    log(error, context = {}, severity = ERROR_SEVERITY.MEDIUM) {
        const errorData = {
            message: error.message || error.toString(),
            stack: error.stack,
            type: this.getErrorType(error),
            severity,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Add to memory
        this.errors.push(errorData);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error logged:', errorData);
        }

        // Send to external service in production
        if (process.env.NODE_ENV === 'production') {
            this.sendToExternalService(errorData);
        }

        return errorData;
    }

    getErrorType(error) {
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            return ERROR_TYPES.NETWORK;
        }
        if (error.message?.includes('auth') || error.message?.includes('session')) {
            return ERROR_TYPES.AUTH;
        }
        if (error.message?.includes('validation') || error.message?.includes('invalid')) {
            return ERROR_TYPES.VALIDATION;
        }
        if (error.message?.includes('database') || error.message?.includes('supabase')) {
            return ERROR_TYPES.DATABASE;
        }
        return ERROR_TYPES.UNKNOWN;
    }

    async sendToExternalService(errorData) {
        try {
            // You can integrate with services like Sentry, LogRocket, etc.
            // For now, we'll store in Supabase if available
            const { data: { user } } = await supabase.auth.getUser();

            // Store error in database if user is authenticated
            if (user) {
                await supabase.from('error_logs').insert({
                    user_id: user.id,
                    error_message: errorData.message,
                    error_type: errorData.type,
                    severity: errorData.severity,
                    context: errorData.context,
                    stack_trace: errorData.stack,
                    url: errorData.url
                });
            }
        } catch (err) {
            // Fallback to console if external service fails
            console.error('Failed to send error to external service:', err);
        }
    }

    getErrors() {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
    }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();

// Error handler function
export const handleError = (error, context = {}, severity = ERROR_SEVERITY.MEDIUM) => {
    const errorData = errorLogger.log(error, context, severity);

    // Return user-friendly message
    return {
        message: getErrorMessage(errorData.type, errorData.message),
        type: errorData.type,
        severity: errorData.severity,
        originalError: error
    };
};

// Get user-friendly error messages
const getErrorMessage = (type, originalMessage) => {
    const messages = {
        [ERROR_TYPES.NETWORK]: 'مشکل در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
        [ERROR_TYPES.AUTH]: 'جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید.',
        [ERROR_TYPES.VALIDATION]: 'اطلاعات وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.',
        [ERROR_TYPES.DATABASE]: 'مشکل در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.',
        [ERROR_TYPES.UNKNOWN]: 'خطایی رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید.'
    };

    return messages[type] || messages[ERROR_TYPES.UNKNOWN];
};

// Async error wrapper
export const withErrorHandling = (asyncFunction, context = {}) => {
    return async (...args) => {
        try {
            return await asyncFunction(...args);
        } catch (error) {
            const errorInfo = handleError(error, context);
            throw errorInfo;
        }
    };
};

// Validation error handler
export const handleValidationError = (errors) => {
    const errorMessages = Array.isArray(errors)
        ? errors.map(err => err.message || err).join(', ')
        : errors.message || errors.toString();

    return handleError(new Error(errorMessages), {}, ERROR_SEVERITY.LOW);
};

// Network error handler
export const handleNetworkError = (error) => {
    return handleError(error, {}, ERROR_SEVERITY.HIGH);
};

// Auth error handler
export const handleAuthError = (error) => {
    return handleError(error, {}, ERROR_SEVERITY.CRITICAL);
};

// Database error handler
export const handleDatabaseError = (error) => {
    return handleError(error, {}, ERROR_SEVERITY.HIGH);
};

// Rate limiting error handler
export const handleRateLimitError = (error) => {
    return {
        message: 'درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.MEDIUM,
        originalError: error
    };
};

// Export default error handler
export default handleError; 