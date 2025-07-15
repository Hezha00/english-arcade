import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress, MenuItem, Grid, Slider
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

const GAME_TYPE_REGISTRY = {
  'memory-puzzle': {
    label: 'بازی حافظه',
    description: 'یک بازی حافظه با جفت‌سازی کلمات انگلیسی و فارسی.',
    howToPlay: 'دو کارت را همزمان برگردانید و جفت انگلیسی-فارسی را پیدا کنید. اگر جفت درست باشد، کارت‌ها باز می‌مانند. هدف: همه جفت‌ها را پیدا کنید.',
    howToMake: '۸ جفت کلمه مرتبط انگلیسی-فارسی وارد کنید. کلمات باید ساده و قابل فهم باشند. از کلمات تکراری خودداری کنید.',
    fields: [
      { name: 'name', label: 'نام بازی', type: 'text', required: true },
      { name: 'description', label: 'توضیحات', type: 'text', required: false },
      { name: 'wordPairs', label: 'جفت‌های کلمه (۸ جفت)', type: 'wordPairs', required: true },
    ],
    minPairs: 8,
    maxPairs: 8,
  }
};

export default function EditGame() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [gameType, setGameType] = useState('memory-puzzle');
  const [form, setForm] = useState({ name: '', description: '', wordPairs: [{ english: '', persian: '' }], sentences: '', maxRetries: 3 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchGame() {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      if (error || !data) {
        setError('بازی پیدا نشد یا خطا در بارگذاری بازی');
        setLoading(false);
        return;
      }
      const type = data.game_content?.type || 'memory-puzzle';
      setGameType(type);
      if (type === 'memory-puzzle') {
        setForm({
          name: data.name || '',
          description: data.description || '',
          wordPairs: (data.game_content?.items || []).map(p => ({ english: p.word, persian: p.match })),
          sentences: '',
          maxRetries: data.game_content?.settings?.maxRetries || data.max_retries || 3,
        });
      } else if (type === 'sentence-structure') {
        setForm({
          name: data.name || '',
          description: data.description || '',
          wordPairs: [{ english: '', persian: '' }],
          sentences: (data.game_content?.sentences || []).join('\n'),
          maxRetries: data.game_content?.settings?.maxRetries || data.max_retries || 3,
        });
      }
      setLoading(false);
    }
    fetchGame();
  }, [gameId]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handlePairChange = (idx, field, value) => {
    const updated = [...form.wordPairs];
    updated[idx][field] = value;
    setForm(f => ({ ...f, wordPairs: updated }));
  };

  const addPair = () => {
    setForm(f => ({ ...f, wordPairs: [...f.wordPairs, { english: '', persian: '' }] }));
  };
  const removePair = idx => {
    if (form.wordPairs.length > 1) {
      setForm(f => ({ ...f, wordPairs: f.wordPairs.filter((_, i) => i !== idx) }));
    }
  };

  const validate = () => {
    const config = GAME_TYPE_REGISTRY[gameType];
    if (!form.name.trim()) {
      setError('نام بازی الزامی است');
      return false;
    }
    if (gameType === 'memory-puzzle') {
      if (form.wordPairs.length !== 8) {
        setError('برای بازی حافظه باید دقیقاً ۸ جفت کلمه وارد کنید');
        return false;
      }
      if (form.wordPairs.some(p => !p.english.trim() || !p.persian.trim())) {
        setError('تمام جفت‌های کلمه باید کامل باشند');
        return false;
      }
    }
    if (gameType === 'sentence-structure') {
      if (!form.sentences.trim()) {
        setError('حداقل یک جمله باید وارد شود');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let gameContent;
      if (gameType === 'memory-puzzle') {
        gameContent = {
          type: 'memory-puzzle',
          version: '1.0',
          created_at: new Date().toISOString(),
          items: form.wordPairs.map((p, i) => ({ id: i + 1, word: p.english.trim(), match: p.persian.trim() })),
          settings: { gridSize: 4, maxRetries: form.maxRetries },
        };
      } else if (gameType === 'sentence-structure') {
        gameContent = {
          type: 'sentence-structure',
          version: '1.0',
          created_at: new Date().toISOString(),
          sentences: form.sentences.trim().split('\n').filter(s => s.trim()),
          settings: { maxRetries: form.maxRetries },
        };
      }
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        game_content: gameContent,
        max_retries: form.maxRetries,
        updated_at: new Date().toISOString(),
      };
      console.log('EditGame payload:', payload);
      const { error: updateError } = await supabase.from('games').update(payload).eq('id', gameId);
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      setSuccess(true);
      setTimeout(() => navigate('/teacher-games'), 1200);
    } catch (err) {
      setError((err.message || 'خطا در ویرایش بازی') + (err.details ? `: ${err.details}` : ''));
    } finally {
      setLoading(false);
    }
  };

  const config = GAME_TYPE_REGISTRY[gameType];

  if (loading) return <CircularProgress sx={{ mt: 10 }} />;

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }} dir="rtl">
      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#4f46e5' }}>ویرایش بازی</Typography>
        <Typography variant="subtitle1" sx={{ mb: 2, color: '#6366f1' }}>
          {config.description}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#222' }}><b>راهنمای معلم:</b> {config.howToMake}</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#222' }}><b>راهنمای دانش‌آموز:</b> {config.howToPlay}</Typography>
        {config.fields.map(field => {
          if (field.type === 'text') {
            return (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                value={form[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }}
                required={field.required}
              />
            );
          }
          if (field.type === 'wordPairs') {
            return (
              <Box key={field.name} sx={{ mb: 3 }}>
                {form.wordPairs.map((pair, i) => (
                  <Grid container spacing={2} alignItems="center" key={i} sx={{ mb: 1 }}>
                    <Grid item xs={5}>
                      <TextField
                        label="کلمه انگلیسی"
                        value={pair.english}
                        onChange={e => handlePairChange(i, 'english', e.target.value)}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        label="معنی فارسی"
                        value={pair.persian}
                        onChange={e => handlePairChange(i, 'persian', e.target.value)}
                        fullWidth
                        sx={{ bgcolor: '#fff', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button color="error" onClick={() => removePair(i)} disabled={form.wordPairs.length === 1}>حذف</Button>
                    </Grid>
                  </Grid>
                ))}
                <Button onClick={addPair} variant="outlined" sx={{ mt: 1 }} disabled={form.wordPairs.length >= 8}>افزودن جفت جدید</Button>
              </Box>
            );
          }
          if (field.type === 'sentences') {
            return (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                value={form.sentences}
                onChange={e => handleChange('sentences', e.target.value)}
                sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }}
                multiline
                minRows={4}
                required
              />
            );
          }
          return null;
        })}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>تعداد دفعات مجاز انجام بازی توسط دانش‌آموز:</Typography>
          <Slider
            value={form.maxRetries}
            min={1}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(_, value) => handleChange('maxRetries', value)}
            sx={{ width: 200 }}
          />
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>بازی با موفقیت ویرایش شد!</Alert>}
        <Button
          variant="contained"
          fullWidth
          sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: '#fff', mt: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
        </Button>
      </Paper>
    </Box>
  );
} 