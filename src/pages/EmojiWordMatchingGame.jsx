import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function EmojiWordMatchingGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [matches, setMatches] = useState([]); // [{emojiIdx, wordIdx, correct, color}]
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [maxTries, setMaxTries] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(null); // {from: 'emoji'|'word', idx: number, x: number, y: number}
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef();
  const [shuffledWords, setShuffledWords] = useState([]);
  const emojiDotRefs = useRef([]);
  const wordDotRefs = useRef([]);
  const SNAP_THRESHOLD = 40; // px, how close mouse must be to a dot to snap
  // Remove fallingMatches state and logic, add cutMatches state
  const [cutMatches, setCutMatches] = useState([]); // [{...matchObj, cut: true, fading: true}]

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
        setPairs(data.game_content?.pairs || []);
        setShuffledWords(shuffleArray((data.game_content?.pairs || []).map(p => p.word)));
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

  // Helper: get dot positions for SVG lines
  function getDotPosition(side, idx) {
    const svgRect = svgRef.current?.getBoundingClientRect();
    const dot = (side === 'emoji' ? emojiDotRefs.current : wordDotRefs.current)[idx];
    if (svgRect && dot) {
      const dotRect = dot.getBoundingClientRect();
      return {
        x: dotRect.left + dotRect.width / 2 - svgRect.left,
        y: dotRect.top + dotRect.height / 2 - svgRect.top,
      };
    }
    return { x: 0, y: 0 };
  }

  // Drag logic
  function handleDotMouseDown(side, idx, e) {
    if (submitted) return;
    e.preventDefault();
    setDragging({ from: side, idx, x: e.clientX, y: e.clientY });
  }
  function handleMouseMove(e) {
    if (!dragging) return;
    setDragging(d => ({ ...d, x: e.clientX, y: e.clientY }));
  }
  function handleMouseUpWindow(e) {
    if (!dragging) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    const mouse = svgRect ? {
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top,
    } : { x: 0, y: 0 };
    let found = null;
    if (dragging.from === 'emoji') {
      // Dropping on a word dot
      let minDist = Infinity, minIdx = -1;
      shuffledWords.forEach((_, i) => {
        const pos = getDotPosition('word', i);
        const dist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
        if (dist < minDist) { minDist = dist; minIdx = i; }
      });
      if (minDist < SNAP_THRESHOLD) {
        handleMatch(dragging.idx, minIdx);
        found = true;
      }
    } else if (dragging.from === 'word') {
      // Dropping on an emoji dot
      let minDist = Infinity, minIdx = -1;
      pairs.forEach((_, i) => {
        const pos = getDotPosition('emoji', i);
        const dist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
        if (dist < minDist) { minDist = dist; minIdx = i; }
      });
      if (minDist < SNAP_THRESHOLD) {
        handleMatch(minIdx, dragging.idx);
        found = true;
      }
    }
    setDragging(null);
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpWindow);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUpWindow);
      };
    }
  }, [dragging]);

  const isMatchedEmoji = idx => matches.some(m => m.emojiIdx === idx && m.correct);
  const isMatchedWord = idx => matches.some(m => m.wordIdx === idx && m.correct);

  // Score always out of 20
  const maxScore = 20;
  const pairCount = pairs.length;
  const correctValue = pairCount > 0 ? maxScore / pairCount : 0;
  const wrongPenalty = correctValue * 0.6; // e.g. 60% of correct value
  const scoreDisplay = `${score} / ${maxScore}`;

  const canSubmit = matches.filter(m => m.correct).length === pairCount || tries >= maxTries;

  // Implement handleMatch
  function handleMatch(emojiIdx, wordIdx) {
    // Prevent duplicate matches
    if (matches.some(m => m.emojiIdx === emojiIdx || m.wordIdx === wordIdx)) return;
    const correct = pairs[emojiIdx].word === shuffledWords[wordIdx];
    let newScore = score;
    if (correct) newScore += correctValue;
    else newScore = Math.max(0, newScore - wrongPenalty);
    newScore = Math.min(maxScore, Math.max(0, Math.round(newScore * 100) / 100));
    // Calculate the Bezier path at the moment of drop
    const from = getDotPosition('emoji', emojiIdx);
    const to = getDotPosition('word', wordIdx);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sag = Math.max(60, dist * 0.6);
    const c1 = { x: from.x + dx * 0.3, y: from.y + sag };
    const c2 = { x: from.x + dx * 0.7, y: to.y + sag };
    const path = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
    const matchObj = { emojiIdx, wordIdx, correct, color: correct ? '#4caf50' : 'red', path, from, to, c1, c2, id: Date.now() + Math.random() };
    setMatches([...matches, matchObj]);
    setScore(newScore);
    setTries(t => t + 1);
    if (!correct) {
      // After 0.25s, cut the thread, then fade out over 0.5s, then remove
      setTimeout(() => {
        setCutMatches(cuts => [...cuts, { ...matchObj, cut: true, fading: false }]);
        setMatches(ms => ms.filter(m => !(m.emojiIdx === emojiIdx && m.wordIdx === wordIdx)));
        setTimeout(() => {
          setCutMatches(cuts => cuts.map(c => c.id === matchObj.id ? { ...c, fading: true } : c));
          setTimeout(() => {
            setCutMatches(cuts => cuts.filter(c => c.id !== matchObj.id));
          }, 500);
        }, 500);
      }, 250);
    }
  }

  // Remove useEffect for fallingMatches animation

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('دانش‌آموز یافت نشد');
      let student = JSON.parse(localStorage.getItem('student'));
      // Fetch username/classroom/teacher_id if missing
      if (!student.username || !student.classroom_id || !student.teacher_id) {
        const { data: stuRow, error: stuErr } = await supabase
          .from('students')
          .select('username, classroom_id, teacher_id')
          .eq('id', student.id)
          .single();
        if (stuRow) student = { ...student, ...stuRow };
      }
      // Ensure students row exists for this user
      const { error: upsertStudentError } = await supabase.from('students').upsert({
        id: user.id,
        username: student.username || user.email || user.id,
        password: student.password || 'default-password',
        auth_id: user.id,
        teacher_id: student.teacher_id,
        school: student.school,
        classroom_id: student.classroom_id,
        login_streak: student.login_streak,
        last_login: student.last_login,
        name: student.name,
        profile_color: student.profile_color,
        year_level: student.year_level
      }, { onConflict: ['id'] });
      if (upsertStudentError) {
        console.error('Upsert error:', upsertStudentError, {
          id: user.id,
          username: student.username || user.email || user.id,
          password: student.password || 'default-password',
          auth_id: user.id,
          teacher_id: student.teacher_id,
          school: student.school,
          classroom_id: student.classroom_id,
          login_streak: student.login_streak,
          last_login: student.last_login,
          name: student.name,
          profile_color: student.profile_color,
          year_level: student.year_level
        });
      }
      const { data: debugStudent, error: debugFetchError } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      console.log('DEBUG: students row after upsert', debugStudent, debugFetchError);
      // Prepare insert object
      const roundedScore = Math.round(score);
      const insertObj = {
        student_id: user.id, // Use auth.uid() for RLS
        game_id: gameId,
        score: roundedScore,
        total: 20,
        submitted_at: new Date().toISOString(),
        type: 'emoji-word-matching',
        finished: true,
        username: student.username,
        classroom: student.classroom, // use classroom (text) if available
        teacher_id: student.teacher_id
      };
      // Remove undefined/null fields and classroom_id if present
      delete insertObj.classroom_id;
      Object.keys(insertObj).forEach(k => (insertObj[k] === undefined || insertObj[k] === null) && delete insertObj[k]);
      const { error: insertError } = await supabase.from('results').insert(insertObj);
      if (insertError) {
        console.error('Supabase insert error:', insertError, insertObj);
        setError('خطا در ثبت نتیجه: ' + (insertError.message || insertError.details || ''));
        return;
      }
      // Upsert into student_game_status for attempts tracking
      const { data: existingStatus, error: fetchError, status } = await supabase
        .from('student_game_status')
        .select('attempts')
        .eq('student_id', user.id)
        .eq('game_id', gameId)
        .single();
      const prevAttempts = (status === 406) ? 0 : (existingStatus?.attempts || 0);
      const { error: upsertStatusError } = await supabase
        .from('student_game_status')
        .upsert({
          student_id: user.id,
          game_id: gameId,
          score: roundedScore,
          attempts: prevAttempts + 1,
          completed_at: new Date().toISOString(),
        }, { onConflict: ['student_id', 'game_id'] });
      if (upsertStatusError) throw upsertStatusError;
      setSubmitted(true);
    } catch (err) {
      setError('خطا در ثبت نتیجه: ' + (err.message || ''));
      console.error('handleSubmit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 10 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!gameData) return null;

  return (
    <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
      <Paper sx={{ maxWidth: 700, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#4f46e5' }}>
          🧩 بازی تطبیق ایموجی و کلمه: {gameData.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
          هر ایموجی را با کلمه مناسب با کشیدن خط بین دایره‌ها تطبیق دهید. هر تطبیق صحیح ۵ امتیاز و هر اشتباه ۳ امتیاز کم می‌کند. امتیاز نهایی از ۲۰ است.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ color: '#4f46e5' }}>تلاش‌ها: {tries} / {maxTries}</Typography>
          <Typography sx={{ color: '#4f46e5' }}>امتیاز: {scoreDisplay}</Typography>
        </Box>
        <Box
          ref={containerRef}
          sx={{ position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', minHeight: 400, mb: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 3 }}
          onMouseMove={handleMouseMove}
        >
          {/* Emojis (far left) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flex: 1, pr: 4 }}>
            {pairs.map((p, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', height: 48, mb: 1, justifyContent: 'flex-end' }}>
                <Typography sx={{ fontSize: '2rem', color: isMatchedEmoji(i) ? '#4caf50' : '#222', minWidth: 40, textAlign: 'right' }}>{p.emoji}</Typography>
              </Box>
            ))}
          </Box>
          {/* Emoji Dots */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 0, px: 2 }}>
            {pairs.map((_, i) => (
              <Box
                key={i}
                ref={el => emojiDotRefs.current[i] = el}
                sx={{ height: 48, display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}
              >
                <span
                  id={`emoji-dot-${i}`}
                  style={{
                    display: 'inline-block',
                    width: 18, height: 18, borderRadius: '50%', background: isMatchedEmoji(i) ? '#4caf50' : '#fff', border: '2px solid #4f46e5', cursor: isMatchedEmoji(i) ? 'not-allowed' : 'pointer',
                  }}
                  onMouseDown={e => !isMatchedEmoji(i) && handleDotMouseDown('emoji', i, e)}
                />
              </Box>
            ))}
          </Box>
          {/* SVG lines (center, absolute) */}
          <Box sx={{ position: 'relative', flex: 0, width: 80, minWidth: 80, maxWidth: 80, height: '100%' }}>
            <svg ref={svgRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', minHeight: 400, background: 'rgba(0,0,0,0.07)' }}>
              {/* Render all connection lines */}
              {matches.map((m, i) => {
                const from = getDotPosition('emoji', m.emojiIdx);
                const to = getDotPosition('word', m.wordIdx);
                return (
                  <line
                    key={m.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={m.color}
                    strokeWidth={6}
                    fill="none"
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })}
              {/* Dragging thread (curved, white, thick, with gravity) */}
              {dragging && (() => {
                const svgRect = svgRef.current?.getBoundingClientRect();
                const from = getDotPosition(dragging.from, dragging.idx);
                const to = svgRect ? {
                  x: dragging.x - svgRect.left,
                  y: dragging.y - svgRect.top,
                } : { x: 0, y: 0 };
                // Rope-like sag: more sag for longer lines, and a little horizontal offset
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const sag = Math.max(60, dist * 0.6); // more dramatic sag
                const c1 = { x: from.x + dx * 0.3, y: from.y + sag };
                const c2 = { x: from.x + dx * 0.7, y: to.y + sag };
                const path = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
                return (
                  <path
                    d={path}
                    stroke="white"
                    strokeWidth={10}
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 8px #fff8), drop-shadow(0 0 16px #4fc3f7)', pointerEvents: 'none' }}
                  />
                );
              })()}
            </svg>
          </Box>
          {/* Word Dots */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 0, px: 2 }}>
            {shuffledWords.map((_, i) => (
              <Box
                key={i}
                ref={el => wordDotRefs.current[i] = el}
                sx={{ height: 48, display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}
              >
                <span
                  id={`word-dot-${i}`}
                  style={{
                    display: 'inline-block',
                    width: 18, height: 18, borderRadius: '50%', background: isMatchedWord(i) ? '#4caf50' : '#fff', border: '2px solid #4f46e5', cursor: isMatchedWord(i) ? 'not-allowed' : 'pointer',
                  }}
                  onMouseDown={e => !isMatchedWord(i) && handleDotMouseDown('word', i, e)}
                />
              </Box>
            ))}
          </Box>
          {/* Words (far right) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', flex: 1, pl: 4 }}>
            {shuffledWords.map((word, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', height: 48, mb: 1, justifyContent: 'flex-start' }}>
                <Typography sx={{ fontSize: '1.1rem', color: isMatchedWord(i) ? '#4caf50' : '#222', minWidth: 90, textAlign: 'left', direction: 'ltr' }}>{word}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        {submitted ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            بازی به پایان رسید! امتیاز شما: {scoreDisplay}
          </Alert>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.1rem' }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            ثبت نتیجه و پایان بازی
          </Button>
        )}
        {tries > maxTries && !submitted && (
          <Alert severity="error" sx={{ mt: 2 }}>
            تعداد تلاش‌ها به پایان رسید. لطفاً نتیجه را ثبت کنید.
          </Alert>
        )}
        {/* SVG lines for connections */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ display: 'block', position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
          >
            {/* Render all permanent connection lines (correct matches) */}
            {matches.filter(m => m.correct).map((m, i) => (
              <path
                key={m.id}
                d={m.path}
                stroke="#4caf50"
                strokeWidth={10}
                fill="none"
                style={{ filter: 'drop-shadow(0 0 8px #4caf50aa), drop-shadow(0 0 16px #4caf50aa)', pointerEvents: 'none' }}
              />
            ))}
            {/* Render all cut/fading wrong matches */}
            {cutMatches.map((m, i) => {
              function bezier(t, p0, p1, p2, p3) {
                const x = Math.pow(1-t,3)*p0.x + 3*Math.pow(1-t,2)*t*p1.x + 3*(1-t)*t*t*p2.x + t*t*t*p3.x;
                const y = Math.pow(1-t,3)*p0.y + 3*Math.pow(1-t,2)*t*p1.y + 3*(1-t)*t*t*p2.y + t*t*t*p3.y;
                return {x, y};
              }
              const mid = bezier(0.5, m.from, m.c1, m.c2, m.to);
              if (!m.cut) {
                // Not cut yet: show as a single red thread
                return (
                  <path
                    key={m.id}
                    d={m.path}
                    stroke="red"
                    strokeWidth={10}
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 8px #ff8888)', pointerEvents: 'none', opacity: 1, transition: 'opacity 0.5s' }}
                  />
                );
              } else {
                // Cut: show two halves, fading out if m.fading
                const leftPath = `M${m.from.x},${m.from.y} C${m.c1.x},${m.c1.y} ${mid.x},${mid.y} ${mid.x},${mid.y}`;
                const rightPath = `M${mid.x},${mid.y} C${m.c2.x},${m.c2.y} ${m.to.x},${m.to.y} ${m.to.x},${m.to.y}`;
                return [
                  <path
                    key={m.id + '-left'}
                    d={leftPath}
                    stroke="red"
                    strokeWidth={10}
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 8px #ff8888)',
                      pointerEvents: 'none',
                      opacity: m.fading ? 0 : 1,
                      transition: 'opacity 0.5s',
                    }}
                  />,
                  <path
                    key={m.id + '-right'}
                    d={rightPath}
                    stroke="red"
                    strokeWidth={10}
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 8px #ff8888)',
                      pointerEvents: 'none',
                      opacity: m.fading ? 0 : 1,
                      transition: 'opacity 0.5s',
                    }}
                  />
                ];
              }
            })}
            {/* Dragging thread (curved, white, thick, with gravity) */}
            {dragging && (() => {
              const svgRect = svgRef.current?.getBoundingClientRect();
              const from = getDotPosition(dragging.from, dragging.idx);
              const to = svgRect ? {
                x: dragging.x - svgRect.left,
                y: dragging.y - svgRect.top,
              } : { x: 0, y: 0 };
              // Rope-like sag: more sag for longer lines, and a little horizontal offset
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const sag = Math.max(60, dist * 0.6); // more dramatic sag
              const c1 = { x: from.x + dx * 0.3, y: from.y + sag };
              const c2 = { x: from.x + dx * 0.7, y: to.y + sag };
              const path = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
              return (
                <path
                  d={path}
                  stroke="white"
                  strokeWidth={10}
                  fill="none"
                  style={{ filter: 'drop-shadow(0 0 8px #fff8), drop-shadow(0 0 16px #fff8)', pointerEvents: 'none' }}
                />
              );
            })()}
          </svg>
        </Box>
      </Paper>
    </Box>
  );
} 