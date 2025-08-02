// Input validation and sanitization utilities
import { useState, useCallback } from 'react';

// Validation rules
export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    NAME: /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/,
    CLASSROOM_NAME: /^[a-zA-Z0-9\u0600-\u06FF\s\-_]{1,50}$/,
    SCHOOL_NAME: /^[a-zA-Z0-9\u0600-\u06FF\s\-_]{2,100}$/,
    YEAR_LEVEL: /^[a-zA-Z0-9\u0600-\u06FF\s]{1,20}$/
};

// Sanitization functions
export const sanitizeInput = {
    // Remove HTML tags and dangerous characters
    html: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/<[^>]*>/g, '')
            .replace(/[<>]/g, '')
            .trim();
    },

    // Remove script tags and JavaScript
    script: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    },

    // Remove SQL injection patterns
    sql: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/['";]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '');
    },

    // Remove XSS patterns
    xss: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/<iframe/gi, '')
            .replace(/<object/gi, '')
            .replace(/<embed/gi, '')
            .replace(/<form/gi, '')
            .replace(/<input/gi, '')
            .replace(/<textarea/gi, '')
            .replace(/<select/gi, '');
    },

    // General sanitization
    general: (input) => {
        if (typeof input !== 'string') return input;
        return sanitizeInput.html(
            sanitizeInput.script(
                sanitizeInput.sql(
                    sanitizeInput.xss(input)
                )
            )
        );
    }
};

// Validation functions
export const validateInput = {
    // Email validation
    email: (email) => {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'ایمیل الزامی است' };
        }

        const sanitized = sanitizeInput.general(email);
        if (!VALIDATION_RULES.EMAIL.test(sanitized)) {
            return { isValid: false, error: 'فرمت ایمیل صحیح نیست' };
        }

        return { isValid: true, value: sanitized };
    },

    // Password validation
    password: (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'رمز عبور الزامی است' };
        }

        if (password.length < 8) {
            return { isValid: false, error: 'رمز عبور باید حداقل 8 کاراکتر باشد' };
        }

        if (!VALIDATION_RULES.PASSWORD.test(password)) {
            return { isValid: false, error: 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد' };
        }

        return { isValid: true, value: password };
    },

    // Username validation
    username: (username) => {
        if (!username || typeof username !== 'string') {
            return { isValid: false, error: 'نام کاربری الزامی است' };
        }

        const sanitized = sanitizeInput.general(username);
        if (!VALIDATION_RULES.USERNAME.test(sanitized)) {
            return { isValid: false, error: 'نام کاربری باید 3 تا 20 کاراکتر و شامل حروف، اعداد و _ باشد' };
        }

        return { isValid: true, value: sanitized };
    },

    // Name validation
    name: (name) => {
        if (!name || typeof name !== 'string') {
            return { isValid: false, error: 'نام الزامی است' };
        }

        const sanitized = sanitizeInput.general(name);
        if (!VALIDATION_RULES.NAME.test(sanitized)) {
            return { isValid: false, error: 'نام باید 2 تا 50 کاراکتر باشد' };
        }

        return { isValid: true, value: sanitized };
    },

    // Classroom name validation
    classroomName: (name) => {
        if (!name || typeof name !== 'string') {
            return { isValid: false, error: 'نام کلاس الزامی است' };
        }

        const sanitized = sanitizeInput.general(name);
        if (!VALIDATION_RULES.CLASSROOM_NAME.test(sanitized)) {
            return { isValid: false, error: 'نام کلاس باید 1 تا 50 کاراکتر باشد' };
        }

        return { isValid: true, value: sanitized };
    },

    // School name validation
    schoolName: (name) => {
        if (!name || typeof name !== 'string') {
            return { isValid: false, error: 'نام مدرسه الزامی است' };
        }

        const sanitized = sanitizeInput.general(name);
        if (!VALIDATION_RULES.SCHOOL_NAME.test(sanitized)) {
            return { isValid: false, error: 'نام مدرسه باید 2 تا 100 کاراکتر باشد' };
        }

        return { isValid: true, value: sanitized };
    },

    // Year level validation
    yearLevel: (level) => {
        if (!level || typeof level !== 'string') {
            return { isValid: false, error: 'پایه تحصیلی الزامی است' };
        }

        const sanitized = sanitizeInput.general(level);
        if (!VALIDATION_RULES.YEAR_LEVEL.test(sanitized)) {
            return { isValid: false, error: 'پایه تحصیلی باید 1 تا 20 کاراکتر باشد' };
        }

        return { isValid: true, value: sanitized };
    },

    // Phone number validation
    phone: (phone) => {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, error: 'شماره تلفن الزامی است' };
        }

        const sanitized = sanitizeInput.general(phone);
        if (!VALIDATION_RULES.PHONE.test(sanitized)) {
            return { isValid: false, error: 'فرمت شماره تلفن صحیح نیست' };
        }

        return { isValid: true, value: sanitized };
    },

    // Required field validation
    required: (value, fieldName = 'فیلد') => {
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            return { isValid: false, error: `${fieldName} الزامی است` };
        }

        return { isValid: true, value: typeof value === 'string' ? sanitizeInput.general(value) : value };
    },

    // Number validation
    number: (value, min = null, max = null) => {
        const num = Number(value);
        if (isNaN(num)) {
            return { isValid: false, error: 'مقدار باید عدد باشد' };
        }

        if (min !== null && num < min) {
            return { isValid: false, error: `مقدار باید حداقل ${min} باشد` };
        }

        if (max !== null && num > max) {
            return { isValid: false, error: `مقدار باید حداکثر ${max} باشد` };
        }

        return { isValid: true, value: num };
    },

    // Array validation
    array: (value, minLength = 0, maxLength = null) => {
        if (!Array.isArray(value)) {
            return { isValid: false, error: 'مقدار باید آرایه باشد' };
        }

        if (value.length < minLength) {
            return { isValid: false, error: `حداقل ${minLength} آیتم الزامی است` };
        }

        if (maxLength !== null && value.length > maxLength) {
            return { isValid: false, error: `حداکثر ${maxLength} آیتم مجاز است` };
        }

        return { isValid: true, value };
    }
};

// Form validation
export const validateForm = (data, rules) => {
    const errors = {};
    const sanitizedData = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        const validation = validateInput[rule.type](value, ...rule.params || []);

        if (!validation.isValid) {
            errors[field] = validation.error;
        } else {
            sanitizedData[field] = validation.value;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data: sanitizedData
    };
};

// Common form validation rules
export const FORM_RULES = {
    LOGIN: {
        email: { type: 'email' },
        password: { type: 'required', params: ['رمز عبور'] }
    },

    SIGNUP: {
        email: { type: 'email' },
        password: { type: 'password' },
        firstName: { type: 'name' },
        lastName: { type: 'name' }
    },

    STUDENT_CREATION: {
        firstName: { type: 'name' },
        lastName: { type: 'name' },
        classroom: { type: 'classroomName' },
        school: { type: 'schoolName' },
        yearLevel: { type: 'yearLevel' }
    },

    CLASSROOM_CREATION: {
        name: { type: 'classroomName' },
        school: { type: 'schoolName' },
        yearLevel: { type: 'yearLevel' }
    }
};

// Real-time validation hook
export const useValidation = (initialData = {}, rules = {}) => {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validate = useCallback((fieldData = data) => {
        const validation = validateForm(fieldData, rules);
        setErrors(validation.errors);
        return validation;
    }, [data, rules]);

    const handleChange = useCallback((field, value) => {
        const newData = { ...data, [field]: value };
        setData(newData);

        if (touched[field]) {
            const fieldValidation = validateInput[rules[field]?.type](value, ...rules[field]?.params || []);
            setErrors(prev => ({
                ...prev,
                [field]: fieldValidation.isValid ? undefined : fieldValidation.error
            }));
        }
    }, [data, touched, rules]);

    const handleBlur = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        const fieldValidation = validateInput[rules[field]?.type](data[field], ...rules[field]?.params || []);
        setErrors(prev => ({
            ...prev,
            [field]: fieldValidation.isValid ? undefined : fieldValidation.error
        }));
    }, [data, rules]);

    const handleSubmit = useCallback((onSubmit) => {
        const validation = validate();
        if (validation.isValid) {
            onSubmit(validation.data);
        }
        return validation;
    }, [validate]);

    return {
        data,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        validate,
        isValid: Object.keys(errors).length === 0
    };
};

// Export default validation
export default validateInput; 