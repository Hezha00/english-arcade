import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress, LinearProgress, RadioGroup, FormControlLabel, Radio, Alert, TextField } from '@mui/material';

const bookLabels = {
  prospect1: 'Prospect 1',
  prospect2: 'Prospect 2',
  prospect3: 'Prospect 3',
  vision1: 'Vision 1',
  vision2: 'Vision 2',
  vision3: 'Vision 3',
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffleArray(array) {
  return array.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
}

export default function IndependentTest() {
  const { book } = useParams();
  const [words, setWords] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(7);
  const timerRef = useRef();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/games/${book}.json`)
      .then(res => res.json())
      .then(data => {
        setWords(data.words || []);
        setLoading(false);
      });
  }, [book]);

  useEffect(() => {
    if (!started || showResult) return;
    setTimer(7);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handleSkip();
          return 7;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [started, current, showResult]);

  const startQuiz = () => {
    let qs = shuffleArray(words).slice(0, numQuestions).map(word => {
      // Randomly decide to show English or Persian
      const showEnglish = Math.random() > 0.5;
      let correct, options;
      if (showEnglish) {
        correct = word.persian;
        options = [word.persian];
        while (options.length < 4) {
          const distractor = words[getRandomInt(words.length)].persian;
          if (!options.includes(distractor)) options.push(distractor);
        }
      } else {
        correct = word.english;
        options = [word.english];
        while (options.length < 4) {
          const distractor = words[getRandomInt(words.length)].english;
          if (!options.includes(distractor)) options.push(distractor);
        }
      }
      return {
        question: showEnglish ? word.english : word.persian,
        correct,
        options: shuffleArray(options),
        showEnglish,
      };
    });
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setSkipped(0);
    setAnswers([]);
    setShowResult(false);
    setStarted(true);
  };

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    let isCorrect = selected === questions[current].correct;
    setAnswers(prev => [...prev, { selected, correct: questions[current].correct, isCorrect }]);
    setScore(prev => prev + (isCorrect ? 1 : 0));
    setSelected(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
      saveResult(prev => prev + (isCorrect ? 1 : 0));
    }
  };

  const handleSkip = () => {
    clearInterval(timerRef.current);
    setAnswers(prev => [...prev, { selected: null, correct: questions[current].correct, isCorrect: false }]);
    setSkipped(prev => prev + 1);
    setSelected(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
      saveResult(score);
    }
  };

  const saveResult = (finalScore) => {
    // Save to localStorage for average calculation
    const key = `independent_${book}_results`;
    let arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ score: finalScore, total: questions.length });
    localStorage.setItem(key, JSON.stringify(arr));
    // Calculate average
    const avg = arr.reduce((sum, r) => sum + (20 * r.score / r.total), 0) / arr.length;
    setAverage(avg.toFixed(1));
  };

  if (loading) return <CircularProgress sx={{ mt: 10 }} />;
  if (!words.length) return <Typography sx={{ mt: 10 }}>کلمه‌ای برای این کتاب وجود ندارد.</Typography>;

  if (!started) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', color: '#fff', px: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{bookLabels[book] || ''} - آزمون</Typography>
        <Paper sx={{ p: 4, minWidth: 320, maxWidth: 400, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', textAlign: 'center', color: '#fff', mb: 2 }}>
          <Typography sx={{ mb: 2 }}>تعداد کلمات برای تمرین را انتخاب کنید:</Typography>
          <TextField
            type="number"
            value={numQuestions}
            onChange={e => setNumQuestions(Math.max(4, Math.min(words.length, Number(e.target.value))))}
            inputProps={{ min: 4, max: words.length, style: { color: '#fff' } }}
            sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
            label="تعداد سوالات"
          />
          <Button variant="contained" fullWidth sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff', mt: 2 }} onClick={startQuiz}>شروع آزمون</Button>
        </Paper>
      </Box>
    );
  }

  if (showResult) {
    const outOf20 = Math.round((score / questions.length) * 20);
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', color: '#fff', px: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{bookLabels[book] || ''} - نتیجه آزمون</Typography>
        <Paper sx={{ p: 4, minWidth: 320, maxWidth: 400, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', textAlign: 'center', color: '#fff', mb: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>امتیاز شما: {outOf20} از 20</Alert>
          <Typography sx={{ mb: 2 }}>تعداد صحیح: {score} / {questions.length}</Typography>
          <Typography sx={{ mb: 2 }}>تعداد رد شده (اسکیپ): {skipped}</Typography>
          <Typography sx={{ mb: 2 }}>میانگین شما برای این کتاب: {average ? `${average} از 20` : '---'}</Typography>
          <Button variant="contained" fullWidth sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff', mt: 2 }} onClick={() => window.location.reload()}>آزمون جدید</Button>
        </Paper>
      </Box>
    );
  }

  const q = questions[current];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', color: '#fff', px: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{bookLabels[book] || ''} - آزمون</Typography>
      <Paper sx={{ p: 4, minWidth: 320, maxWidth: 400, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', textAlign: 'center', color: '#fff', mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>سوال {current + 1} از {questions.length}</Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{q.question}</Typography>
        <RadioGroup value={selected} onChange={e => handleSelect(e.target.value)}>
          {q.options.map((opt, i) => (
            <FormControlLabel key={i} value={opt} control={<Radio sx={{ color: '#fff' }} />} label={opt} sx={{ color: '#fff' }} />
          ))}
        </RadioGroup>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={handleSkip} sx={{ color: '#fff', borderColor: '#fff' }}>اسکیپ</Button>
          <Button variant="contained" onClick={handleNext} disabled={!selected} sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff' }}>بعدی</Button>
        </Box>
        <LinearProgress variant="determinate" value={(timer / 7) * 100} sx={{ width: 200, mt: 2, bgcolor: '#222', '& .MuiLinearProgress-bar': { background: 'linear-gradient(to right, #6366f1, #4f46e5)' } }} />
        <Typography variant="body2" sx={{ mt: 1 }}>زمان باقی‌مانده: {timer} ثانیه</Typography>
      </Paper>
    </Box>
  );
} 