// Loading state management utilities
import { create } from 'zustand';

// Loading state store
export const useLoadingStore = create((set, get) => ({
    loadingStates: new Map(),
    globalLoading: false,

    // Set loading state for a specific key
    setLoading: (key, isLoading) => {
        set((state) => {
            const newLoadingStates = new Map(state.loadingStates);
            if (isLoading) {
                newLoadingStates.set(key, true);
            } else {
                newLoadingStates.delete(key);
            }
            return {
                loadingStates: newLoadingStates,
                globalLoading: newLoadingStates.size > 0
            };
        });
    },

    // Check if a specific key is loading
    isLoading: (key) => {
        return get().loadingStates.has(key);
    },

    // Check if any loading is happening
    isAnyLoading: () => {
        return get().globalLoading;
    },

    // Clear all loading states
    clearAll: () => {
        set({ loadingStates: new Map(), globalLoading: false });
    },

    // Get all loading keys
    getLoadingKeys: () => {
        return Array.from(get().loadingStates.keys());
    }
}));

// Loading wrapper for async functions
export const withLoading = (key, asyncFunction) => {
    return async (...args) => {
        const { setLoading } = useLoadingStore.getState();

        try {
            setLoading(key, true);
            const result = await asyncFunction(...args);
            return result;
        } finally {
            setLoading(key, false);
        }
    };
};

// Loading hook for components
export const useLoading = (key) => {
    const { isLoading, setLoading } = useLoadingStore();

    return {
        loading: isLoading(key),
        setLoading: (isLoading) => setLoading(key, isLoading)
    };
};

// Multiple loading states hook
export const useMultipleLoading = (keys) => {
    const { isLoading, setLoading } = useLoadingStore();

    return {
        loadingStates: keys.reduce((acc, key) => {
            acc[key] = isLoading(key);
            return acc;
        }, {}),
        setLoading: (key, isLoading) => setLoading(key, isLoading),
        isAnyLoading: keys.some(key => isLoading(key))
    };
};

// Loading component wrapper
export const withLoadingState = (Component, loadingKey) => {
    return (props) => {
        const { loading } = useLoading(loadingKey);

        if (loading) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem'
                }}>
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        return <Component {...props} />;
    };
};

// Loading spinner component
export const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
    const sizeMap = {
        small: '1rem',
        medium: '2rem',
        large: '3rem'
    };

    const colorMap = {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#2e7d32',
        warning: '#ed6c02',
        error: '#d32f2f'
    };

    return (
        <div
            style={{
                width: sizeMap[size],
                height: sizeMap[size],
                border: `2px solid ${colorMap[color]}20`,
                borderTop: `2px solid ${colorMap[color]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
    );
};

// Loading overlay component
export const LoadingOverlay = ({ loading, children, message = 'در حال بارگذاری...' }) => {
    if (!loading) return children;

    return (
        <div style={{ position: 'relative' }}>
            {children}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}
            >
                <LoadingSpinner size="large" />
                <p style={{ marginTop: '1rem', color: '#666' }}>{message}</p>
            </div>
        </div>
    );
};

// Loading button component
export const LoadingButton = ({
    loading,
    children,
    onClick,
    disabled,
    loadingText = 'در حال پردازش...',
    ...props
}) => {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            onClick={onClick}
            style={{
                ...props.style,
                opacity: loading ? 0.7 : 1,
                cursor: (disabled || loading) ? 'not-allowed' : 'pointer'
            }}
        >
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="small" />
                    {loadingText}
                </div>
            ) : (
                children
            )}
        </button>
    );
};

// Loading text component
export const LoadingText = ({ loading, children, loadingText = 'در حال بارگذاری...' }) => {
    return loading ? loadingText : children;
};

// CSS for loading spinner animation
const loadingStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #1976d220;
    border-top: 2px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
`;

// Inject styles if not already present
if (!document.getElementById('loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = loadingStyles;
    document.head.appendChild(style);
}

export default useLoadingStore; 