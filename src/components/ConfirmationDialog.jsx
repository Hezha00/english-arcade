import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { Warning, Info, Error, CheckCircle } from '@mui/icons-material';

const ConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title = 'تأیید',
    message = 'آیا مطمئن هستید؟',
    confirmText = 'تأیید',
    cancelText = 'انصراف',
    severity = 'warning',
    type = 'confirmation', // confirmation, warning, info, error, success
    confirmButtonColor = 'primary',
    showCancelButton = true,
    loading = false,
    maxWidth = 'sm'
}) => {
    const getIcon = () => {
        switch (severity) {
            case 'error':
                return <Error color="error" />;
            case 'warning':
                return <Warning color="warning" />;
            case 'info':
                return <Info color="info" />;
            case 'success':
                return <CheckCircle color="success" />;
            default:
                return <Warning color="warning" />;
        }
    };

    const getTitleColor = () => {
        switch (severity) {
            case 'error':
                return '#d32f2f';
            case 'warning':
                return '#ed6c02';
            case 'info':
                return '#0288d1';
            case 'success':
                return '#2e7d32';
            default:
                return '#ed6c02';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minWidth: 300
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: getTitleColor(),
                    pb: 1
                }}
            >
                {getIcon()}
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    {type === 'confirmation' && (
                        <Alert severity={severity} sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    )}

                    {type !== 'confirmation' && (
                        <DialogContentText>
                            {message}
                        </DialogContentText>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                {showCancelButton && (
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outlined"
                        color="inherit"
                    >
                        {cancelText}
                    </Button>
                )}

                <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    variant="contained"
                    color={confirmButtonColor}
                    autoFocus
                    sx={{
                        minWidth: 100,
                        ...(loading && {
                            '& .MuiButton-startIcon': {
                                animation: 'spin 1s linear infinite'
                            }
                        })
                    }}
                >
                    {loading ? 'در حال پردازش...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Specialized dialog components
export const DeleteConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    itemName = 'آیتم',
    loading = false
}) => (
    <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        title="حذف آیتم"
        message={`آیا مطمئن هستید که می‌خواهید "${itemName}" را حذف کنید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        severity="error"
        confirmButtonColor="error"
        loading={loading}
    />
);

export const LogoutConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    loading = false
}) => (
    <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        title="خروج از حساب"
        message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
        confirmText="خروج"
        cancelText="انصراف"
        severity="warning"
        loading={loading}
    />
);

export const SaveConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    message = 'آیا می‌خواهید تغییرات را ذخیره کنید؟',
    loading = false
}) => (
    <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        title="ذخیره تغییرات"
        message={message}
        confirmText="ذخیره"
        cancelText="انصراف"
        severity="info"
        loading={loading}
    />
);

export const SuccessDialog = ({
    open,
    onClose,
    title = 'موفقیت',
    message = 'عملیات با موفقیت انجام شد.',
    confirmText = 'باشه'
}) => (
    <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={onClose}
        title={title}
        message={message}
        confirmText={confirmText}
        severity="success"
        showCancelButton={false}
    />
);

export const ErrorDialog = ({
    open,
    onClose,
    title = 'خطا',
    message = 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.',
    confirmText = 'باشه'
}) => (
    <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={onClose}
        title={title}
        message={message}
        confirmText={confirmText}
        severity="error"
        showCancelButton={false}
    />
);

export default ConfirmationDialog; 