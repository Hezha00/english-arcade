// Session management utilities
import React from 'react';
import { supabase } from '../supabaseClient';
import { handleError, ERROR_TYPES, ERROR_SEVERITY } from './errorHandler';

// Session configuration
const SESSION_CONFIG = {
    TIMEOUT: 3600000, // 1 hour in milliseconds
    WARNING_TIME: 300000, // 5 minutes before timeout
    CHECK_INTERVAL: 60000, // Check every minute
    ACTIVITY_EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    STORAGE_KEYS: {
        LAST_ACTIVITY: 'lastActivity',
        SESSION_DATA: 'sessionData',
        USER_ROLE: 'userRole',
        TEACHER_DATA: 'teacherData',
        STUDENT_DATA: 'studentData'
    }
};

// Session manager class
class SessionManager {
    constructor(timeoutMs = SESSION_CONFIG.TIMEOUT) {
        this.timeoutMs = timeoutMs;
        this.warningTime = SESSION_CONFIG.WARNING_TIME;
        this.checkInterval = SESSION_CONFIG.CHECK_INTERVAL;
        this.activityEvents = SESSION_CONFIG.ACTIVITY_EVENTS;
        this.storageKeys = SESSION_CONFIG.STORAGE_KEYS;

        this.isMonitoring = false;
        this.warningShown = false;
        this.checkIntervalId = null;
        this.activityListeners = [];

        this.init();
    }

    init() {
        // Set up activity monitoring
        this.setupActivityMonitoring();

        // Start session checking
        this.startSessionChecking();

        // Check initial session state
        this.checkSession();
    }

    // Setup activity event listeners
    setupActivityMonitoring() {
        if (this.isMonitoring) return;

        this.activityEvents.forEach(event => {
            const listener = () => this.updateActivity();
            document.addEventListener(event, listener, true);
            this.activityListeners.push({ event, listener });
        });

        this.isMonitoring = true;
    }

    // Remove activity event listeners
    removeActivityMonitoring() {
        this.activityListeners.forEach(({ event, listener }) => {
            document.removeEventListener(event, listener, true);
        });

        this.activityListeners = [];
        this.isMonitoring = false;
    }

    // Update last activity timestamp
    updateActivity() {
        const now = Date.now();
        localStorage.setItem(this.storageKeys.LAST_ACTIVITY, now.toString());

        // Reset warning flag if user is active
        if (this.warningShown) {
            this.warningShown = false;
        }
    }

    // Check if session is still valid
    checkSession() {
        try {
            const lastActivity = localStorage.getItem(this.storageKeys.LAST_ACTIVITY);

            if (!lastActivity) {
                return false;
            }

            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

            // Check if session has expired
            if (timeSinceLastActivity > this.timeoutMs) {
                this.handleSessionExpired();
                return false;
            }

            // Check if warning should be shown
            if (timeSinceLastActivity > (this.timeoutMs - this.warningTime) && !this.warningShown) {
                this.showSessionWarning();
            }

            return true;
        } catch (error) {
            console.error('Session check error:', error);
            return false;
        }
    }

    // Handle session expiration
    async handleSessionExpired() {
        try {
            // Clear all session data
            this.clearSessionData();

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Show session expired message
            this.showSessionExpiredMessage();

            // Redirect to login
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            handleError(error, { context: 'session_expired' }, ERROR_SEVERITY.HIGH);
        }
    }

    // Show session warning
    showSessionWarning() {
        this.warningShown = true;

        const warningMessage = 'جلسه شما به زودی منقضی می‌شود. برای ادامه کار، لطفاً فعالیتی انجام دهید.';

        // Show browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('هشدار جلسه', { body: warningMessage });
        }

        // Show in-app notification
        this.showInAppNotification(warningMessage, 'warning');
    }

    // Show session expired message
    showSessionExpiredMessage() {
        const message = 'جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید.';
        this.showInAppNotification(message, 'error');
    }

    // Show in-app notification
    showInAppNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px;
            border-radius: 8px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;

        // Set background color based on type
        const colors = {
            info: '#1976d2',
            warning: '#ed6c02',
            error: '#d32f2f',
            success: '#2e7d32'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Start periodic session checking
    startSessionChecking() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }

        this.checkIntervalId = setInterval(() => {
            this.checkSession();
        }, this.checkInterval);
    }

    // Stop session checking
    stopSessionChecking() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }
    }

    // Store session data
    storeSessionData(data, role) {
        try {
            localStorage.setItem(this.storageKeys.SESSION_DATA, JSON.stringify(data));
            localStorage.setItem(this.storageKeys.USER_ROLE, role);

            if (role === 'teacher') {
                localStorage.setItem(this.storageKeys.TEACHER_DATA, JSON.stringify(data));
            } else if (role === 'student') {
                localStorage.setItem(this.storageKeys.STUDENT_DATA, JSON.stringify(data));
            }

            this.updateActivity();
        } catch (error) {
            handleError(error, { context: 'store_session_data' }, ERROR_SEVERITY.MEDIUM);
        }
    }

    // Get session data
    getSessionData(role = null) {
        try {
            if (role === 'teacher') {
                const data = localStorage.getItem(this.storageKeys.TEACHER_DATA);
                return data ? JSON.parse(data) : null;
            } else if (role === 'student') {
                const data = localStorage.getItem(this.storageKeys.STUDENT_DATA);
                return data ? JSON.parse(data) : null;
            } else {
                const data = localStorage.getItem(this.storageKeys.SESSION_DATA);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            handleError(error, { context: 'get_session_data' }, ERROR_SEVERITY.LOW);
            return null;
        }
    }

    // Get user role
    getUserRole() {
        try {
            return localStorage.getItem(this.storageKeys.USER_ROLE);
        } catch (error) {
            handleError(error, { context: 'get_user_role' }, ERROR_SEVERITY.LOW);
            return null;
        }
    }

    // Clear all session data
    clearSessionData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            handleError(error, { context: 'clear_session_data' }, ERROR_SEVERITY.MEDIUM);
        }
    }

    // Validate session with server
    async validateSessionWithServer() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return false;
            }

            // Check if user session is still valid on server
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                return false;
            }

            return true;
        } catch (error) {
            handleError(error, { context: 'validate_session_server' }, ERROR_SEVERITY.HIGH);
            return false;
        }
    }

    // Refresh session
    async refreshSession() {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession();

            if (error || !session) {
                throw new Error('Failed to refresh session');
            }

            this.updateActivity();
            return true;
        } catch (error) {
            handleError(error, { context: 'refresh_session' }, ERROR_SEVERITY.HIGH);
            return false;
        }
    }

    // Logout user
    async logout() {
        try {
            // Stop monitoring
            this.stopSessionChecking();
            this.removeActivityMonitoring();

            // Clear session data
            this.clearSessionData();

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Redirect to home
            window.location.href = '/';
        } catch (error) {
            handleError(error, { context: 'logout' }, ERROR_SEVERITY.MEDIUM);
        }
    }

    // Get session status
    getSessionStatus() {
        const isValid = this.checkSession();
        const lastActivity = localStorage.getItem(this.storageKeys.LAST_ACTIVITY);
        const timeRemaining = lastActivity ?
            Math.max(0, this.timeoutMs - (Date.now() - parseInt(lastActivity))) : 0;

        return {
            isValid,
            timeRemaining,
            lastActivity: lastActivity ? new Date(parseInt(lastActivity)) : null,
            warningShown: this.warningShown
        };
    }

    // Update session timeout
    updateTimeout(timeoutMs) {
        this.timeoutMs = timeoutMs;
        this.warningTime = timeoutMs - SESSION_CONFIG.WARNING_TIME;
    }

    // Cleanup
    destroy() {
        this.stopSessionChecking();
        this.removeActivityMonitoring();
    }
}

// Global session manager instance
export const sessionManager = new SessionManager();

// Session hook for React components
export const useSession = () => {
    const [sessionStatus, setSessionStatus] = React.useState(sessionManager.getSessionStatus());
    const [isValidating, setIsValidating] = React.useState(false);

    React.useEffect(() => {
        const updateStatus = () => {
            setSessionStatus(sessionManager.getSessionStatus());
        };

        // Update status every 30 seconds
        const interval = setInterval(updateStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const validateSession = React.useCallback(async () => {
        setIsValidating(true);
        try {
            const isValid = await sessionManager.validateSessionWithServer();
            if (!isValid) {
                await sessionManager.logout();
            }
            return isValid;
        } finally {
            setIsValidating(false);
        }
    }, []);

    const refreshSession = React.useCallback(async () => {
        setIsValidating(true);
        try {
            const success = await sessionManager.refreshSession();
            if (success) {
                setSessionStatus(sessionManager.getSessionStatus());
            }
            return success;
        } finally {
            setIsValidating(false);
        }
    }, []);

    const logout = React.useCallback(async () => {
        await sessionManager.logout();
    }, []);

    return {
        ...sessionStatus,
        isValidating,
        validateSession,
        refreshSession,
        logout
    };
};

// Export session manager and utilities
export default sessionManager; 