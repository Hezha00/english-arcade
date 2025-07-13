import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress, IconButton, LinearProgress } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const bookLabels = {
  prospect1: 'Prospect 1',
  prospect2: 'Prospect 2',
  prospect3: 'Prospect 3',
  vision1: 'Vision 1',
  vision2: 'Vision 2',
  vision3: 'Vision 3',
};

export default function IndependentLearning() {
  const { book } = useParams();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/games/${book}.json`)
      .then(res => res.json())
      .then(data => {
        setWords(data.words || []);
        setCurrent(0);
        setShowMeaning(false);
        setLoading(false);
      });
  }, [book]);

  const handleShuffle = () => {
    setWords(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setShowMeaning(false);
    setShuffled(true);
  };

  const handleTTS = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 10 }} />;
  if (!words.length) return <Typography sx={{ mt: 10 }}>کلمه‌ای برای این کتاب وجود ندارد.</Typography>;

  const word = words[current];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', color: '#fff', px: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{bookLabels[book] || ''} - فلش‌کارت</Typography>
      <Paper sx={{ p: 4, minWidth: 320, maxWidth: 400, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', textAlign: 'center', color: '#fff', mb: 2 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>{word.emoji}</Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{word.english}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{word.description}</Typography>
        <IconButton onClick={() => handleTTS(word.english)} color="primary" sx={{ color: '#fff', mb: 2 }}>
          <VolumeUpIcon />
        </IconButton>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setShowMeaning(!showMeaning)} sx={{ color: '#fff', borderColor: '#fff', fontWeight: 'bold' }}>
            {showMeaning ? word.persian : 'نمایش معنی فارسی'}
          </Button>
        </Box>
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" disabled={current === 0} onClick={() => { setCurrent(current - 1); setShowMeaning(false); }} sx={{ color: '#fff', borderColor: '#fff' }}>قبلی</Button>
        <Button variant="outlined" disabled={current === words.length - 1} onClick={() => { setCurrent(current + 1); setShowMeaning(false); }} sx={{ color: '#fff', borderColor: '#fff' }}>بعدی</Button>
        <Button variant="contained" onClick={handleShuffle} sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff' }}>🔀 شافل</Button>
      </Box>
      <LinearProgress variant="determinate" value={((current + 1) / words.length) * 100} sx={{ width: 300, mb: 2, bgcolor: '#222', '& .MuiLinearProgress-bar': { background: 'linear-gradient(to right, #6366f1, #4f46e5)' } }} />
      <Typography variant="body2">{current + 1} از {words.length}</Typography>
    </Box>
  );
} 