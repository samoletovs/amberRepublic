import { useState, useEffect, useRef } from 'react';
import type { QuizQuestion, QuizAnswer } from '../engine/types';
import { generateQuizQuestions, formatStatValue } from '../engine/quiz';

interface Props {
  onBack: () => void;
}

export default function QuizScreen({ onBack }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    generateQuizQuestions(8)
      .then(qs => {
        if (cancelled) return;
        if (qs.length === 0) {
          setError('Could not load quiz data. Please try again later.');
        } else {
          setQuestions(qs);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not connect to the statistics service.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const currentQ = questions[currentIndex];
  const finished = currentIndex >= questions.length && questions.length > 0;
  const score = answers.filter(a => a.correct).length;

  const handleSelect = (value: number) => {
    if (showResult) return;
    setSelected(value);
    const correct = value === currentQ.correctValue;
    const timeTaken = Date.now() - startTime.current;

    setAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selectedValue: value,
      correct,
      timeTaken,
    }]);
    setShowResult(true);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setSelected(null);
    setShowResult(false);
    setShowHint(false);
    startTime.current = Date.now();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center fade-in">
          <div className="text-4xl mb-4">📊</div>
          <div className="skeleton-pulse mb-3" style={{ width: 200, height: 20, borderRadius: 8, margin: '0 auto' }} />
          <div className="skeleton-pulse" style={{ width: 160, height: 14, borderRadius: 6, margin: '0 auto' }} />
          <p className="text-sm mt-4" style={{ color: '#78716C' }}>Loading real Latvia statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center fade-in glass-card p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-sm mb-6" style={{ color: '#78716C' }}>{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#9E3039', color: '#fff' }}
            aria-label="Back to menu"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Finished state
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? { emoji: '🎓', label: 'Expert Statistician!', color: '#16A34A' }
      : pct >= 60 ? { emoji: '📊', label: 'Policy Analyst', color: '#B8860B' }
      : pct >= 40 ? { emoji: '📰', label: 'Informed Citizen', color: '#2563EB' }
      : { emoji: '🤔', label: 'Casual Observer', color: '#9E3039' };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full fade-in">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#1C1917' }}>
            {grade.label}
          </h2>
          <p className="text-lg mb-6 font-data" style={{ color: grade.color }}>
            {score} / {questions.length} correct ({pct}%)
          </p>

          <div className="glass-card p-4 mb-6 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#B8860B' }}>
              Your Answers
            </h3>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const answer = answers[i];
                return (
                  <div key={q.id} className="flex items-center gap-2 text-sm py-1"
                    style={{ borderBottom: '1px solid rgba(28,25,23,0.05)' }}>
                    <span>{answer?.correct ? '✅' : '❌'}</span>
                    <span className="flex-1 truncate" style={{ color: '#3D3731' }}>{q.text}</span>
                    <span className="font-data text-xs shrink-0" style={{ color: answer?.correct ? '#16A34A' : '#DC2626' }}>
                      {formatStatValue(q.correctValue, q.unit)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#3D3731' }}
              aria-label="Back to menu"
            >
              Back to Menu
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setAnswers([]);
                setSelected(null);
                setShowResult(false);
                setShowHint(false);
                setLoading(true);
                generateQuizQuestions(8).then(qs => {
                  setQuestions(qs);
                  setLoading(false);
                  startTime.current = Date.now();
                });
              }}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: '#9E3039', color: '#fff' }}
              aria-label="Play again"
            >
              Play Again
            </button>
          </div>

          <p className="text-xs mt-4" style={{ color: '#A8A29E' }}>
            Data from Centrālā statistikas pārvalde (CSP) · data.stat.gov.lv
          </p>
        </div>
      </div>
    );
  }

  // Question state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in" key={currentIndex}>
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-sm px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(28,25,23,0.06)', color: '#78716C' }}
            aria-label="Exit quiz"
          >
            ← Exit
          </button>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(28,25,23,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: '#9E3039',
              }}
            />
          </div>
          <span className="text-xs font-data" style={{ color: '#78716C' }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Score */}
        <div className="text-center mb-2">
          <span className="text-xs font-data" style={{ color: '#B8860B' }}>
            Score: {score}/{answers.length}
          </span>
        </div>

        {/* Question card */}
        <div className="glass-card p-5 sm:p-6 mb-4">
          <div className="text-center mb-4">
            <span className="text-3xl">{currentQ.emoji}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-center mb-2" style={{ color: '#1C1917' }}>
            {currentQ.text}
          </h2>
          <p className="text-xs text-center mb-1" style={{ color: '#78716C' }}>
            Period: {currentQ.period} · Source: {currentQ.source}
          </p>

          {!showHint && !showResult && (
            <button
              onClick={() => setShowHint(true)}
              className="block mx-auto text-xs mt-2 px-3 py-1 rounded-full transition-all"
              style={{ background: 'rgba(184,134,11,0.08)', color: '#B8860B' }}
              aria-label="Show hint"
            >
              💡 Show hint
            </button>
          )}
          {showHint && !showResult && (
            <p className="text-xs text-center mt-2 italic" style={{ color: '#B8860B' }}>
              {currentQ.hint}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentQ.options.map((value) => {
            const isCorrect = value === currentQ.correctValue;
            const isSelected = value === selected;
            let bg = 'rgba(255, 255, 255, 0.5)';
            let border = 'rgba(28, 25, 23, 0.06)';
            let textColor = '#1C1917';

            if (showResult) {
              if (isCorrect) {
                bg = 'rgba(22, 163, 74, 0.1)';
                border = 'rgba(22, 163, 74, 0.4)';
                textColor = '#15803D';
              } else if (isSelected && !isCorrect) {
                bg = 'rgba(220, 38, 38, 0.08)';
                border = 'rgba(220, 38, 38, 0.3)';
                textColor = '#DC2626';
              } else {
                bg = 'rgba(28, 25, 23, 0.03)';
                textColor = '#A8A29E';
              }
            }

            return (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                disabled={showResult}
                className="p-4 rounded-xl text-center transition-all duration-200"
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  color: textColor,
                  cursor: showResult ? 'default' : 'pointer',
                  opacity: showResult && !isCorrect && !isSelected ? 0.5 : 1,
                }}
                aria-label={`Select ${formatStatValue(value, currentQ.unit)}`}
              >
                <span className="text-lg sm:text-xl font-data font-bold block">
                  {formatStatValue(value, currentQ.unit)}
                </span>
                <span className="text-[10px]" style={{ color: '#78716C' }}>
                  {currentQ.unit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className="fade-in">
            <div className="glass-card p-4 mb-4 text-center">
              <span className="text-2xl">
                {selected === currentQ.correctValue ? '✅' : '❌'}
              </span>
              <p className="text-sm font-medium mt-1" style={{
                color: selected === currentQ.correctValue ? '#16A34A' : '#DC2626'
              }}>
                {selected === currentQ.correctValue ? 'Correct!' : `Not quite — the answer is ${formatStatValue(currentQ.correctValue, currentQ.unit)}`}
              </p>
              {currentQ.funFact && (
                <p className="text-xs mt-2 italic" style={{ color: '#78716C' }}>
                  📚 {currentQ.funFact}
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#9E3039', color: '#fff' }}
              aria-label={currentIndex < questions.length - 1 ? 'Next question' : 'See results'}
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
