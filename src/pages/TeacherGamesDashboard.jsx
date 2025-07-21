import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Button, Box, Grid, TextField, CircularProgress, Chip, IconButton
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

// Registry for future game types
const GAME_TYPE_REGISTRY = {
  'memory-puzzle': {
    label: 'بازی حافظه',
    createPath: '/create-game',
    color: 'primary',
  }
};

export default function TeacherGamesDashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return setLoading(false);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching games:', error);
        setGames([]);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    }
    fetchGames();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredGames(games);
    } else {
      setFilteredGames(
        games.filter(g =>
          g.name?.toLowerCase().includes(search.toLowerCase()) ||
          g.description?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, games]);

  const handleCreateGame = () => navigate('/create-game');
  const handleEdit = (gameId) => navigate(`/edit-game/${gameId}`);
  const handleAssign = (gameId) => navigate(`/assign-game/${gameId}`);
  const handleResults = (gameId) => navigate(`/game-details/${gameId}`);
  const handleDelete = async (gameId) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این بازی را حذف کنید؟\nتوجه: با حذف بازی، تمام تاریخچه و نمرات دانش‌آموزانی که این بازی را انجام داده‌اند نیز حذف خواهد شد.')) return;
    // First, delete all assignments for this game
    const { error: assignError } = await supabase.from('game_assignments').delete().eq('game_id', gameId);
    if (assignError) {
      alert('خطا در حذف اختصاص بازی: ' + assignError.message);
      return;
    }
    // Then, delete all student_game_status for this game
    const { error: statusError } = await supabase.from('student_game_status').delete().eq('game_id', gameId);
    if (statusError) {
      alert('خطا در حذف وضعیت دانش‌آموزان: ' + statusError.message);
      return;
    }
    // Finally, delete the game itself
    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (error) alert('خطا در حذف بازی: ' + error.message);
    else setGames(games.filter(g => g.id !== gameId));
  };

  return (
    <Container dir="rtl" sx={{ py: 4, mt: { xs: 10, md: 1 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#4f46e5' }}>
          🎮 مدیریت بازی‌ها
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%', maxWidth: 800 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="جستجو در بازی‌ها..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ bgcolor: '#fff', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGame}
            sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: '#fff' }}
          >
            ساخت بازی جدید
          </Button>
        </Box>
        <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', maxWidth: 800, width: '100%', boxShadow: 8 }}>
          {loading ? (
            <CircularProgress sx={{ mt: 10 }} />
          ) : filteredGames.length === 0 ? (
            <Typography color="text.secondary">📭 هیچ بازی‌ای برای نمایش وجود ندارد</Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredGames.map(game => (
                <Grid item xs={12} key={game.id}>
                  <Paper sx={{ p: 2, borderRadius: 3, mb: 1, bgcolor: 'rgba(255,255,255,0.85)', boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="#4f46e5">{game.name}</Typography>
                      <Typography variant="body2" color="#333">{game.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={GAME_TYPE_REGISTRY[game.game_content?.type]?.label || 'سفارشی'} color={GAME_TYPE_REGISTRY[game.game_content?.type]?.color || 'default'} />
                        <Chip label={`تاریخ ساخت: ${new Date(game.created_at).toLocaleDateString('fa-IR')}`} />
                        {game.is_active ? <Chip label="فعال" color="success" /> : <Chip label="غیرفعال" color="default" />}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton color="primary" onClick={() => handleEdit(game.id)} title="ویرایش">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleAssign(game.id)} title="اختصاص به کلاس">
                        <AssignmentIndIcon />
                      </IconButton>
                      <IconButton color="info" onClick={() => handleResults(game.id)} title="نتایج و جزئیات">
                        <LeaderboardIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(game.id)} title="حذف">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
}