import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress, Alert, Grid, Chip } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function EmojiWordMatchingGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState([]); // [{emoji, word, correct: true/false}]
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [maxTries, setMaxTries] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchGame() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('games')
          .select('id, name, description, game_content')
          .eq('id', gameId)
          .single();
        if (error) throw error;
        setGameData(data);
        setMaxTries(data.game_content?.settings?.maxRetries || 10);
        setPairs(shuffleArray(data.game_content?.pairs || []));
      } catch (err) {
        setError('خطا در بارگذاری بازی.');
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [gameId]);

  function shuffleArray(array) {
    return array.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
  }

  const handleEmojiClick = (emoji) => {
    if (submitted) return;
    setSelectedEmoji(emoji);
  };

  const handleWordClick = (word) => {
    if (submitted) return;
    setSelectedWord(word);
  };

  useEffect(() => {
    if (selectedEmoji && selectedWord) {
      const correct = pairs.find(p => p.emoji === selectedEmoji && p.word === selectedWord);
      setMatches(prev => [...prev, { emoji: selectedEmoji, word: selectedWord, correct: !!correct }]);
      setTries(t => t + 1);
      if (correct) setScore(s => s + 1);
      setTimeout(() => {
        setSelectedEmoji(null);
        setSelectedWord(null);
      }, 600);
    }
    // eslint-disable-next-line
  }, [selectedEmoji, selectedWord]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const student = JSON.parse(localStorage.getItem('student'));
      if (!student?.id) throw new Error('دانش‌آموز یافت نشد');
      const { error } = await supabase.from('game_results').insert({
        student_id: student.id,
        game_id: gameId,
        score,
        tries,
        created_at: new Date().toISOString(),
        details: { matches },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      setError('خطا در ثبت نتیجه.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 10 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!gameData) return null;

  // Prepare lists for UI
  const matchedEmojis = matches.map(m => m.emoji);
  const matchedWords = matches.map(m => m.word);
  const remainingEmojis = pairs.map(p => p.emoji).filter(e => !matchedEmojis.includes(e));
  const remainingWords = pairs.map(p => p.word).filter(w => !matchedWords.includes(w));

  return (
    <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
      <Paper sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#4f46e5' }}>
          🧩 بازی تطبیق ایموجی و کلمه: {gameData.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
          ایموجی را با کلمه مناسب تطبیق دهید. روی یک ایموجی و سپس روی یک کلمه کلیک کنید. هر تطبیق صحیح یک امتیاز دارد.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ color: '#4f46e5' }}>تلاش‌ها: {tries} / {maxTries}</Typography>
          <Typography sx={{ color: '#4f46e5' }}>امتیاز: {score} از {pairs.length}</Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#6366f1' }}>ایموجی‌ها</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {pairs.map((p, i) => (
                <Button
                  key={i}
                  variant={selectedEmoji === p.emoji ? 'contained' : 'outlined'}
                  color={matchedEmojis.includes(p.emoji) ? 'success' : 'primary'}
                  onClick={() => handleEmojiClick(p.emoji)}
                  disabled={matchedEmojis.includes(p.emoji) || submitted}
                  sx={{ fontSize: '2rem', minWidth: 56, minHeight: 56, borderRadius: 2, m: 0.5 }}
                  aria-label={`ایموجی ${p.emoji}`}
                >
                  {p.emoji}
                </Button>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#6366f1' }}>کلمات</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {pairs.map((p, i) => (
                <Button
                  key={i}
                  variant={selectedWord === p.word ? 'contained' : 'outlined'}
                  color={matchedWords.includes(p.word) ? 'success' : 'primary'}
                  onClick={() => handleWordClick(p.word)}
                  disabled={matchedWords.includes(p.word) || submitted}
                  sx={{ fontSize: '1.1rem', minWidth: 80, minHeight: 56, borderRadius: 2, m: 0.5 }}
                  aria-label={`کلمه ${p.word}`}
                >
                  {p.word}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
        {submitted ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            بازی به پایان رسید! امتیاز شما: {score} از {pairs.length}
          </Alert>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.1rem' }}
            onClick={handleSubmit}
            disabled={matches.length < pairs.length || tries > maxTries}
          >
            ثبت نتیجه و پایان بازی
          </Button>
        )}
        {tries > maxTries && !submitted && (
          <Alert severity="error" sx={{ mt: 2 }}>
            تعداد تلاش‌ها به پایان رسید. لطفاً نتیجه را ثبت کنید.
          </Alert>
        )}
      </Paper>
    </Box>
  );
} 