import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress, MenuItem, Grid
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const EMOJI_LIST = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","🥰","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱","🥵","🥶","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🥴","😇","🥳","🥺","🤠","🤡","🤥","🤫","🤭","🧐","🤓","😈","👿","👹","👺","💀","👻","👽","🤖","💩","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
];

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
      { name: 'pairs', label: 'جفت‌های ایموجی و کلمه', type: 'emojiPairs', required: true },
      { name: 'max_retries', label: 'حداکثر دفعات تکرار', type: 'number', required: true, min: 1, max: 5, default: 1 },
    ],
    minPairs: 5,
    maxPairs: 30,
  },
};

const TEMPLATE_TYPE_MAP = {
  'بازی حافظه (Memory Puzzle)': 'memory-puzzle',
  'بازی تطبیق ایموجی و کلمه (Emoji-Word Matching)': 'emoji-word-matching',
};

// Utility: check if a string is a visible emoji (not empty, not just whitespace)
function isValidEmoji(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

export default function CreateGame() {
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('memory-puzzle');
  const [form, setForm] = useState({ name: '', description: '', wordPairs: [{ english: '', persian: '' }], pairs: [{ emoji: '', word: '' }], max_retries: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(null); // null means no specific emoji picker open
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
    if (gameType === 'emoji-word-matching') {
      const updated = [...form.pairs];
      updated[idx][field] = value;
      setForm(f => ({ ...f, pairs: updated }));
    } else {
      const updated = [...form.wordPairs];
      updated[idx][field] = value;
      setForm(f => ({ ...f, wordPairs: updated }));
    }
  };

    const addPair = () => {
    if (gameType === 'emoji-word-matching') {
      setForm(f => ({ ...f, pairs: [...f.pairs, { emoji: '', word: '' }] }));
    } else {
      setForm(f => ({ ...f, wordPairs: [...f.wordPairs, { english: '', persian: '' }] }));
    }
  };
  const removePair = idx => {
    if (gameType === 'emoji-word-matching') {
      if (form.pairs.length > 1) {
        setForm(f => ({ ...f, pairs: f.pairs.filter((_, i) => i !== idx) }));
      }
    } else {
      if (form.wordPairs.length > 1) {
        setForm(f => ({ ...f, wordPairs: f.wordPairs.filter((_, i) => i !== idx) }));
      }
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
    } else if (gameType === 'emoji-word-matching') {
      if (form.pairs.length < 5 || form.pairs.length > 30) {
        setError('تعداد جفت‌های ایموجی و کلمه باید بین ۵ تا ۳۰ باشد.');
        return false;
      }
      if (form.pairs.some(p => !isValidEmoji(p.emoji) || !p.word.trim())) {
        setError('تمام جفت‌های ایموجی و کلمه باید کامل باشند.');
        return false;
      }
      if (!form.max_retries || isNaN(Number(form.max_retries)) || Number(form.max_retries) < 1 || Number(form.max_retries) > 5) {
        setError('حداکثر دفعات تکرار باید بین ۱ تا ۵ باشد.');
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
        gameContent = {
          type: 'emoji-word-matching',
                        version: '1.0',
                        created_at: new Date().toISOString(),
          pairs: form.pairs,
          settings: {
            maxRetries: 10,
            max_retries: Number(form.max_retries)
          },
        };
      }
      const { data, error: insertError } = await supabase.from('games').insert({
        name: form.name.trim(),
        description: form.description.trim(),
        teacher_id: user.id,
                    created_at: new Date().toISOString(),
                    game_content: gameContent,
        is_active: true,
        max_retries: Number(form.max_retries),
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
                          <Grid item xs={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => removePair(idx)}
                              sx={{ mt: 2 }}
                            >
                              حذف جفت
                            </Button>
                          </Grid>
                        </React.Fragment>
                      ))}
                    </Grid>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={addPair}
                      sx={{ mt: 2 }}
                    >
                      اضافه کردن جفت جدید
                    </Button>
                  </Box>
                );
              }
              if (field.type === 'emojiPairs') {
                return (
                  <Box key={field.name} sx={{ mb: 3 }}>
                    <Typography fontWeight="bold" sx={{ mb: 1 }}>{field.label}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {form.pairs.map((pair, idx) => (
                        <Paper key={idx} sx={{ p: 2, mb: 1, position: 'relative', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#222', borderRadius: 3, boxShadow: 4 }} elevation={0}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                            <label htmlFor={`emoji-${idx}`} style={{ fontWeight: 'bold', marginBottom: 4 }}>ایموجی</label>
                            <Button
                              variant="outlined"
                              sx={{ minWidth: 36, minHeight: 36, fontSize: '1.5rem', bgcolor: '#fff', borderRadius: 2 }}
                              onClick={() => setShowEmojiKeyboard(showEmojiKeyboard === idx ? null : idx)}
                            >
                              {pair.emoji || '🙂'}
                            </Button>
                            {showEmojiKeyboard === idx && (
                              <Box sx={{ position: 'absolute', top: 60, right: 0, zIndex: 2000 }}>
                                <Picker
                                  data={data}
                                  onEmojiSelect={emoji => {
                                    handlePairChange(idx, 'emoji', emoji.native || emoji.id);
                                    setShowEmojiKeyboard(null);
                                  }}
                                  theme="light"
                                  locale="fa"
                                  previewPosition="none"
                                  searchPosition="top"
                                  perLine={8}
                                  maxFrequentRows={0}
                                  autoFocus
                                  style={{ width: 350 }}
                                />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ flex: 1, mx: 2 }}>
                            <label htmlFor={`word-${idx}`} style={{ fontWeight: 'bold', marginBottom: 4, display: 'block' }}>کلمه</label>
                            <TextField
                              id={`word-${idx}`}
                              name={`word-${idx}`}
                        fullWidth
                              value={pair.word}
                              onChange={e => handlePairChange(idx, 'word', e.target.value)}
                              sx={{ bgcolor: '#fff', borderRadius: 2 }}
                              required
                            />
                          </Box>
                          <Box sx={{ minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => removePair(idx)}
                              sx={{ mt: 2 }}
                            >
                              حذف جفت
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={addPair}
                      sx={{ mt: 2 }}
                    >
                      اضافه کردن جفت جدید
                    </Button>
                  </Box>
                );
              }
            })}
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
          </>
        )}
      </Paper>
    </Box>
  );
}