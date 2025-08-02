import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { supabase } from '../supabaseClient';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console and potentially to external service
        console.error('Error Boundary caught an error:', error, errorInfo);

        // You can send error to external service here
        // this.logErrorToService(error, errorInfo);
    }

    logErrorToService = async (error, errorInfo) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const errorData = {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                user: user?.id || 'anonymous',
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            // Send to your error tracking service
            console.log('Error data:', errorData);
        } catch (err) {
            console.error('Failed to log error:', err);
        }
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff'
                    }}
                    dir="rtl"
                >
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            maxWidth: 600,
                            '& .MuiAlert-message': { color: '#d32f2f' }
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            خطایی رخ داده است
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            متأسفانه مشکلی در برنامه پیش آمده است. لطفاً صفحه را مجدداً بارگذاری کنید.
                        </Typography>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box sx={{ mt: 2, textAlign: 'left' }}>
                                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={this.handleReload}
                            sx={{
                                bgcolor: '#1976d2',
                                '&:hover': { bgcolor: '#1565c0' }
                            }}
                        >
                            بارگذاری مجدد
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={this.handleGoHome}
                            sx={{
                                borderColor: '#fff',
                                color: '#fff',
                                '&:hover': {
                                    borderColor: '#fff',
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            بازگشت به صفحه اصلی
                        </Button>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 3, opacity: 0.7 }}>
                        اگر مشکل همچنان ادامه دارد، لطفاً با پشتیبانی تماس بگیرید.
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 