import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SelfLearnerAuthChoice() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'none',
        color: '#fff',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={0}
        dir="rtl"
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* Back button in top left of Paper */}
        <Button
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            minWidth: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(99,102,241,0.18)',
            color: '#fff',
            boxShadow: 2,
            backdropFilter: 'blur(4px)',
            zIndex: 2,
            '&:hover': {
              bgcolor: 'rgba(99,102,241,0.32)',
            },
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          🧑‍💻 ورود یا ثبت‌نام دانش‌آموز مستقل
        </Typography>
        <Button
          fullWidth
          startIcon={<LoginIcon />}
          variant="contained"
          sx={{
            mb: 2,
            fontSize: '1rem',
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            background: 'linear-gradient(to right, #6366f1, #4f46e5)',
            color: '#fff',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
              background: 'linear-gradient(to right, #4f46e5, #4338ca)'
            }
          }}
          onClick={() => navigate('/self-learner-login')}
        >
          ورود
        </Button>
        <Button
          fullWidth
          startIcon={<PersonAddIcon />}
          variant="outlined"
          sx={{
            fontSize: '1rem',
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            color: '#fff',
            borderColor: '#4ade80',
            '&:hover': {
              backgroundColor: 'rgba(74,222,128,0.08)',
              borderColor: '#4ade80',
              transform: 'scale(1.03)'
            }
          }}
          onClick={() => navigate('/self-learner-signup')}
        >
          ثبت‌نام
        </Button>
      </Paper>
    </Box>
  );
} 