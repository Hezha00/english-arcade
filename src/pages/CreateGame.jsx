import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress, MenuItem, Grid
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const GAME_TYPE_REGISTRY = {
  'memory-puzzle': {
    label: 'بازی حافظه',
    description: 'یک بازی حافظه با جفت‌سازی کلمات انگلیسی و فارسی.',
    fields: [
      { name: 'name', label: 'نام بازی', type: 'text', required: true },
      { name: 'description', label: 'توضیحات', type: 'text', required: false },
      { name: 'wordPairs', label: 'جفت‌های کلمه (۸ جفت)', type: 'wordPairs', required: true },
    ],
    minPairs: 8,
    maxPairs: 8,
  },
  'emoji-word-matching': {
    label: 'بازی تطبیق ایموجی و کلمه',
    description: 'یک بازی که دانش‌آموز باید هر ایموجی را با کلمه مناسب تطبیق دهد.',
    fields: [
      { name: 'name', label: 'نام بازی', type: 'text', required: true },
      { name: 'description', label: 'توضیحات', type: 'text', required: false },
      { name: 'emojis', label: 'ایموجی‌ها (هر خط یک ایموجی)', type: 'emojis', required: true },
      { name: 'words', label: 'کلمات (هر خط یک کلمه)', type: 'words', required: true },
    ],
    minPairs: 4,
    maxPairs: 12,
  },
};

const TEMPLATE_TYPE_MAP = {
  'بازی حافظه (Memory Puzzle)': 'memory-puzzle',
  'بازی تطبیق ایموجی و کلمه (Emoji-Word Matching)': 'emoji-word-matching',
};

export default function CreateGame() {
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('memory-puzzle');
  const [form, setForm] = useState({ name: '', description: '', wordPairs: [{ english: '', persian: '' }], emojis: '', words: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const emojiTextAreaRef = React.useRef();
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);

    useEffect(() => {
    async function fetchDownloadedTemplates() {
      setFetchingTemplates(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setAllowedTypes([]);
        setFetchingTemplates(false);
        return;
      }
      const { data: downloads } = await supabase
        .from('downloaded_games')
        .select('template_name')
        .eq('teacher_id', user.id);
      const types = (downloads || [])
        .map(d => TEMPLATE_TYPE_MAP[d.template_name])
        .filter(Boolean);
      setAllowedTypes(types);
      if (types.length > 0) setGameType(types[0]);
      setFetchingTemplates(false);
    }
    fetchDownloadedTemplates();
  }, []);

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
    setError('');
    return true;
  };

    const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
        try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('کاربر یافت نشد');
      let gameContent;
      if (gameType === 'memory-puzzle') {
        gameContent = {
                        type: 'memory-puzzle',
                        version: '1.0',
                        created_at: new Date().toISOString(),
          items: form.wordPairs.map((p, i) => ({ id: i + 1, word: p.english.trim(), match: p.persian.trim() })),
          settings: { gridSize: 4, maxRetries: 20 },
        };
      } else if (gameType === 'emoji-word-matching') {
        const emojiList = form.emojis.split('\n').map(e => e.trim()).filter(Boolean);
        const wordList = form.words.split('\n').map(w => w.trim()).filter(Boolean);
        if (emojiList.length !== wordList.length) throw new Error('تعداد ایموجی‌ها و کلمات باید برابر باشد.');
        gameContent = {
          type: 'emoji-word-matching',
                        version: '1.0',
                        created_at: new Date().toISOString(),
          pairs: emojiList.map((emoji, i) => ({ emoji, word: wordList[i] })),
          settings: { maxRetries: 10 },
        };
      }
      const { data, error: insertError } = await supabase.from('games').insert({
        name: form.name.trim(),
        description: form.description.trim(),
        teacher_id: user.id,
                    created_at: new Date().toISOString(),
                    game_content: gameContent,
        is_active: true,
      }).select('id').single();
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => navigate(`/assign-game/${data.id}`), 1200);
        } catch (err) {
      setError(err.message || 'خطا در ایجاد بازی');
    } finally {
      setLoading(false);
    }
  };

  const config = GAME_TYPE_REGISTRY[gameType];

    return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }} dir="rtl">
      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#4f46e5' }}>ساخت بازی جدید</Typography>
        {fetchingTemplates ? (
          <CircularProgress sx={{ my: 4 }} />
        ) : allowedTypes.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            شما هیچ قالب بازی‌ای دانلود نکرده‌اید. ابتدا یک قالب را از فروشگاه بازی‌ها دانلود کنید.
          </Alert>
        ) : (
          <>
            <TextField
              select
              fullWidth
              label="نوع بازی"
              value={gameType}
              onChange={e => setGameType(e.target.value)}
              sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }}
                        >
              {allowedTypes.map(key => (
                <MenuItem key={key} value={key}>{GAME_TYPE_REGISTRY[key].label}</MenuItem>
              ))}
            </TextField>
            {config.fields.map(field => {
              if (field.type === 'text') {
                return (
                  <Box key={field.name} sx={{ mb: 3 }}>
                    <label htmlFor={field.name} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>{field.label}</label>
                    <TextField
                      id={field.name}
                      name={field.name}
                      fullWidth
                      value={form[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      sx={{ bgcolor: '#fff', borderRadius: 2 }}
                      required={field.required}
                    />
                  </Box>
                );
              }
              if (field.type === 'wordPairs') {
                return (
                  <Box key={field.name} sx={{ mb: 3 }}>
                    <Typography fontWeight="bold" sx={{ mb: 1 }}>{field.label}</Typography>
                    <Grid container spacing={2}>
                      {form.wordPairs.map((pair, idx) => (
                        <React.Fragment key={idx}>
                          <Grid item xs={5}>
                            <label htmlFor={`english-${idx}`} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>کلمه انگلیسی</label>
                            <TextField
                              id={`english-${idx}`}
                              name={`english-${idx}`}
                              fullWidth
                              value={pair.english}
                              onChange={e => handlePairChange(idx, 'english', e.target.value)}
                              sx={{ bgcolor: '#fff', borderRadius: 2 }}
                              required
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <label htmlFor={`persian-${idx}`} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>معنی فارسی</label>
                            <TextField
                              id={`persian-${idx}`}
                              name={`persian-${idx}`}
                              fullWidth
                              value={pair.persian}
                              onChange={e => handlePairChange(idx, 'persian', e.target.value)}
                              sx={{ bgcolor: '#fff', borderRadius: 2 }}
                              required
                            />
                          </Grid>
                          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button color="error" onClick={() => removePair(idx)} disabled={form.wordPairs.length <= 1}>حذف</Button>
                          </Grid>
                        </React.Fragment>
                      ))}
                    </Grid>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={addPair} disabled={form.wordPairs.length >= config.maxPairs}>افزودن جفت جدید</Button>
                  </Box>
                );
              }
              if (field.type === 'emojis') {
                return (
                  <Box key={field.name} sx={{ mb: 3 }}>
                    <label htmlFor={field.name} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>{field.label}</label>
                    <TextField
                      id={field.name}
                      name={field.name}
                      fullWidth
                      value={form[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      sx={{ bgcolor: '#fff', borderRadius: 2 }}
                      multiline
                      minRows={4}
                      required={field.required}
                      inputRef={emojiTextAreaRef}
                      onFocus={() => setShowEmojiKeyboard(true)}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<EmojiEmotionsIcon />}
                      sx={{ mt: 1, mb: 1, mr: 1 }}
                      onClick={() => setShowEmojiKeyboard(v => !v)}
                    >
                      انتخاب ایموجی
                    </Button>
                    {showEmojiKeyboard && (
                      <Box sx={{
                        display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto', bgcolor: '#fff', borderRadius: 2, p: 1, boxShadow: 2, zIndex: 10
                      }}>
                        {EMOJI_LIST.map((emoji, i) => (
                    <Button 
                            key={i}
                            sx={{ minWidth: 36, minHeight: 36, fontSize: '1.5rem', m: 0.5 }}
                            onClick={() => {
                              const ref = emojiTextAreaRef.current;
                              if (ref) {
                                const start = ref.selectionStart;
                                const end = ref.selectionEnd;
                                const value = form.emojis;
                                const newValue = value.slice(0, start) + emoji + value.slice(end);
                                handleChange('emojis', newValue);
                                setTimeout(() => {
                                  ref.focus();
                                  ref.selectionStart = ref.selectionEnd = start + emoji.length;
                                }, 0);
                              } else {
                                handleChange('emojis', (form.emojis || '') + emoji);
                              }
                            }}
                            aria-label={`افزودن ایموجی ${emoji}`}
                          >
                            {emoji}
                    </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              }
              if (field.type === 'words') {
                return (
                  <Box key={field.name} sx={{ mb: 3 }}>
                    <label htmlFor={field.name} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>{field.label}</label>
                    <TextField
                      id={field.name}
                      name={field.name}
                      fullWidth
                      value={form[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      sx={{ bgcolor: '#fff', borderRadius: 2 }}
                      multiline
                      minRows={4}
                      required={field.required}
                    />
                  </Box>
                );
              }
              return null;
            })}
          </>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>بازی با موفقیت ساخته شد!</Alert>}
                    <Button 
                        variant="contained" 
          fullWidth
          sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: '#fff', mt: 2 }}
          onClick={handleSubmit}
          disabled={loading || allowedTypes.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'ثبت بازی'}
                    </Button>
      </Paper>
        </Box>
  );
}
