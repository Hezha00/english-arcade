// Input validation utilities
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    // Remove HTML tags and dangerous characters
    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateUsername = (username) => {
    // Username: 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

export const validatePassword = (password) => {
    // Password: at least 6 characters
    return password && password.length >= 6;
};

export const validateName = (name) => {
    // Name: 2-50 characters, letters and spaces only
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/;
    return nameRegex.test(name);
};

export const validateClassroomName = (name) => {
    // Classroom name: 2-100 characters
    return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateSchoolName = (name) => {
    // School name: 2-100 characters
    return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateYearLevel = (year) => {
    // Year level: 1-20 characters
    return year && year.trim().length >= 1 && year.trim().length <= 20;
};

export const validateGameTitle = (title) => {
    // Game title: 3-100 characters
    return title && title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateGameDescription = (description) => {
    // Game description: 0-500 characters
    return !description || description.length <= 500;
};

export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
    // maxSize in bytes (default 10MB)
    return file && file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
    return file && allowedTypes.includes(file.type);
};

export const validateAssignmentTitle = (title) => {
    // Assignment title: 3-100 characters
    return title && title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateAssignmentDescription = (description) => {
    // Assignment description: 0-1000 characters
    return !description || description.length <= 1000;
};

export const validateQuestionText = (text) => {
    // Question text: 5-500 characters
    return text && text.trim().length >= 5 && text.trim().length <= 500;
};

export const validateAnswerText = (text) => {
    // Answer text: 1-1000 characters
    return text && text.trim().length >= 1 && text.trim().length <= 1000;
};

export const validateScore = (score) => {
    // Score: 0-100
    const num = Number(score);
    return !isNaN(num) && num >= 0 && num <= 100;
};

export const validateUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

export const validateDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

export const validatePhoneNumber = (phone) => {
    // Iranian phone number format
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateLicenseCode = (code) => {
    // License code: 8-20 characters, alphanumeric and hyphens
    const codeRegex = /^[a-zA-Z0-9-]{8,20}$/;
    return codeRegex.test(code);
};

// Rate limiting utilities
export class RateLimiter {
    constructor(maxRequests = 100, windowMs = 900000) { // 15 minutes default
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    isAllowed(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];

        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => now - time < this.windowMs);

        if (validRequests.length >= this.maxRequests) {
            return false;
        }

        // Add current request
        validRequests.push(now);
        this.requests.set(userId, validRequests);

        return true;
    }

    getRemainingRequests(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
}

// Session management utilities
export class SessionManager {
    constructor(timeoutMs = 3600000) { // 1 hour default
        this.timeoutMs = timeoutMs;
        this.checkSession();
    }

    checkSession() {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > this.timeoutMs) {
                this.logout();
                return false;
            }
        }
        this.updateActivity();
        return true;
    }

    updateActivity() {
        localStorage.setItem('lastActivity', Date.now().toString());
    }

    logout() {
        localStorage.removeItem('student');
        localStorage.removeItem('teacher');
        localStorage.removeItem('lastActivity');
        window.location.href = '/';
    }

    startActivityMonitor() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const updateActivity = () => this.updateActivity();

        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Check session every minute
        setInterval(() => {
            if (!this.checkSession()) {
                alert('جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید.');
            }
        }, 60000);
    }
}

// Data validation utilities
export const validateStudentData = (data) => {
    const errors = [];

    if (!validateName(data.first_name)) {
        errors.push('نام باید بین 2 تا 50 کاراکتر باشد و فقط شامل حروف باشد');
    }

    if (!validateName(data.last_name)) {
        errors.push('نام خانوادگی باید بین 2 تا 50 کاراکتر باشد و فقط شامل حروف باشد');
    }

    if (!validateClassroomName(data.classroom)) {
        errors.push('نام کلاس باید بین 2 تا 100 کاراکتر باشد');
    }

    if (!validateSchoolName(data.school)) {
        errors.push('نام مدرسه باید بین 2 تا 100 کاراکتر باشد');
    }

    if (!validateYearLevel(data.year_level)) {
        errors.push('سطح تحصیلی باید بین 1 تا 20 کاراکتر باشد');
    }

    return errors;
};

export const validateTeacherData = (data) => {
    const errors = [];

    if (!validateEmail(data.email)) {
        errors.push('ایمیل معتبر نیست');
    }

    if (!validatePassword(data.password)) {
        errors.push('رمز عبور باید حداقل 6 کاراکتر باشد');
    }

    if (data.username && !validateUsername(data.username)) {
        errors.push('نام کاربری باید بین 3 تا 20 کاراکتر باشد و فقط شامل حروف، اعداد و _ باشد');
    }

    return errors;
};

export const validateGameData = (data) => {
    const errors = [];

    if (!validateGameTitle(data.name)) {
        errors.push('عنوان بازی باید بین 3 تا 100 کاراکتر باشد');
    }

    if (data.description && !validateGameDescription(data.description)) {
        errors.push('توضیحات بازی نمی‌تواند بیش از 500 کاراکتر باشد');
    }

    if (data.duration_min && (data.duration_min < 1 || data.duration_min > 180)) {
        errors.push('مدت زمان باید بین 1 تا 180 دقیقه باشد');
    }

    if (data.max_retries && (data.max_retries < 0 || data.max_retries > 10)) {
        errors.push('حداکثر تلاش باید بین 0 تا 10 باشد');
    }

    return errors;
};

export const validateAssignmentData = (data) => {
    const errors = [];

    if (!validateAssignmentTitle(data.title)) {
        errors.push('عنوان تکلیف باید بین 3 تا 100 کاراکتر باشد');
    }

    if (data.description && !validateAssignmentDescription(data.description)) {
        errors.push('توضیحات تکلیف نمی‌تواند بیش از 1000 کاراکتر باشد');
    }

    if (data.max_attempts && (data.max_attempts < 1 || data.max_attempts > 10)) {
        errors.push('حداکثر تلاش باید بین 1 تا 10 باشد');
    }

    return errors;
}; 