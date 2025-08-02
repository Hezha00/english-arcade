import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export const LoadingSpinner = ({
    message = 'در حال بارگذاری...',
    size = 'medium',
    variant = 'circular',
    fullScreen = false
}) => {
    const getSize = () => {
        switch (size) {
            case 'small': return 20;
            case 'large': return 60;
            default: return 40;
        }
    };

    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 3
            }}
        >
            {variant === 'circular' ? (
                <CircularProgress
                    size={getSize()}
                    sx={{ color: '#6366f1' }}
                />
            ) : (
                <LinearProgress
                    sx={{
                        width: '100%',
                        maxWidth: 300,
                        '& .MuiLinearProgress-bar': {
                            bgcolor: '#6366f1'
                        }
                    }}
                />
            )}

            {message && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center' }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
};

export const PageLoader = ({ message = 'در حال بارگذاری صفحه...' }) => (
    <Box
        sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff'
        }}
    >
        <LoadingSpinner message={message} size="large" />
    </Box>
);

export const ButtonLoader = ({ size = 20 }) => (
    <CircularProgress
        size={size}
        sx={{
            color: 'inherit',
            ml: 1
        }}
    />
);

export const TableLoader = ({ rows = 5 }) => (
    <Box sx={{ p: 2 }}>
        {Array.from({ length: rows }).map((_, index) => (
            <Box
                key={index}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 1,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1
                }}
            >
                <CircularProgress size={20} sx={{ color: '#6366f1' }} />
                <Box sx={{ flex: 1 }}>
                    <LinearProgress
                        sx={{
                            mb: 1,
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#6366f1'
                            }
                        }}
                    />
                    <LinearProgress
                        sx={{
                            width: '60%',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#6366f1'
                            }
                        }}
                    />
                </Box>
            </Box>
        ))}
    </Box>
); 