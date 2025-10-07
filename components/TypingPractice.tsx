'use client';

import { useState, useEffect, useRef } from 'react';
import { shuffleWords, WORD_BANK } from '@/lib/words';

interface TypingPracticeProps {
  onComplete: (score: number, wpm: number, accuracy: number, timeInSeconds: number) => void;
  onViewLeaderboard: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const COUNTDOWN_TIME = 60; // 60 seconds = 1 minute
const WORDS_PER_LINE = 10; // Words per line (fits more with smaller text)
const VISIBLE_LINES = 2; // Always show 2 lines

export default function TypingPractice({ onComplete, onViewLeaderboard, isLoggedIn, onLogout }: TypingPracticeProps) {
  const [words, setWords] = useState<Array<{text: string, status: 'upcoming' | 'correct' | 'wrong'}>>([]);
  const [shuffledWordBank, setShuffledWordBank] = useState<string[]>([]);
  const [wordBankIndex, setWordBankIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [isTypingWrong, setIsTypingWrong] = useState(false); // Track if currently typing wrong
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoutClick = () => {
    if (window.confirm('If you log out, you will not be able to save your scores. Are you sure you want to logout?')) {
      onLogout?.();
    }
  };

  const generateRandomWord = (currentIndex: number) => {
    // Get next word from shuffled bank
    const word = shuffledWordBank[currentIndex % shuffledWordBank.length];
    return word;
  };

  useEffect(() => {
    // Shuffle word bank on mount
    setShuffledWordBank(shuffleWords(WORD_BANK));
  }, []);

  useEffect(() => {
    // Generate initial words after word bank is shuffled
    if (shuffledWordBank.length > 0 && words.length === 0) {
      const initialWords = [];
      const totalWords = WORDS_PER_LINE * VISIBLE_LINES + 10;
      for (let i = 0; i < totalWords; i++) {
        initialWords.push({ text: generateRandomWord(i), status: 'upcoming' as const });
      }
      setWords(initialWords);
      setWordBankIndex(totalWords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffledWordBank]);

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (startTime && !isComplete && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsComplete(true);
            calculateResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, isComplete, timeRemaining]);

  const handleInputChange = (value: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Check if user pressed space (word completed)
    if (value.endsWith(' ') && value.trim() !== '') {
      const typedWord = value.trim();
      const currentWord = words[currentWordIndex];

      // Update word status
      const updatedWords = [...words];
      if (typedWord === currentWord.text) {
        updatedWords[currentWordIndex].status = 'correct';
        setCorrectWords(correctWords + 1);
      } else {
        updatedWords[currentWordIndex].status = 'wrong';
        setIncorrectWords(incorrectWords + 1);
      }

      // Add new word at the end
      const newWord = generateRandomWord(wordBankIndex);
      updatedWords.push({ text: newWord, status: 'upcoming' });
      setWords(updatedWords);
      setWordBankIndex(wordBankIndex + 1);
      
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setIsTypingWrong(false); // Reset typing state
    } else {
      setUserInput(value);
      
      // Check if current typing is wrong (live feedback)
      const currentWord = words[currentWordIndex];
      if (currentWord && value.length > 0) {
        const isCorrectSoFar = currentWord.text.startsWith(value);
        setIsTypingWrong(!isCorrectSoFar);
      } else {
        setIsTypingWrong(false);
      }
    }
  };

  const calculateResults = () => {
    if (!startTime) return;

    const timeElapsed = COUNTDOWN_TIME; // Always use full 60 seconds
    const totalWords = correctWords + incorrectWords;
    const wpm = totalWords > 0 ? Math.round((correctWords / (timeElapsed / 60))) : 0;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
    const score = wpm; // Score is just WPM

    setTimeout(() => {
      onComplete(score, wpm, accuracy, timeElapsed);
    }, 1500);
  };

  const resetPractice = () => {
    // Shuffle word bank again for new practice
    const newShuffled = shuffleWords(WORD_BANK);
    setShuffledWordBank(newShuffled);
    
    // Generate new initial words
    const initialWords = [];
    const totalWords = WORDS_PER_LINE * VISIBLE_LINES + 10;
    for (let i = 0; i < totalWords; i++) {
      initialWords.push({ text: newShuffled[i % newShuffled.length], status: 'upcoming' as const });
    }
    setWords(initialWords);
    setWordBankIndex(totalWords);
    setUserInput('');
    setCurrentWordIndex(0);
    setStartTime(null);
    setIsComplete(false);
    setCorrectWords(0);
    setIncorrectWords(0);
    setTimeRemaining(COUNTDOWN_TIME);
    setIsTypingWrong(false);
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate which line we're on and show 2 lines
  const currentLine = Math.floor(currentWordIndex / WORDS_PER_LINE);
  const startWordIndex = currentLine * WORDS_PER_LINE;
  const endWordIndex = startWordIndex + (WORDS_PER_LINE * VISIBLE_LINES);
  const visibleWords = words.slice(startWordIndex, endWordIndex);
  const currentWordOffset = currentWordIndex - startWordIndex;

  return (
    <div className="min-h-screen flex flex-col animate-slide-up" style={{ backgroundColor: '#E8E4D9' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg p-4 sm:p-5 sticky top-0 z-10 border-b-2" style={{ borderColor: '#9DB668' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div className="flex-1 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="flex flex-col items-start">
              <h1 className="text-3xl sm:text-4xl font-bold leading-none mb-2 hover:opacity-80 transition-opacity" style={{ color: '#3D3D3D', fontFamily: 'var(--font-space-grotesk)' }}>
                Type <span style={{ color: '#9DB668' }}>Digital</span>
              </h1>
              <a 
                href="https://www.sheakh.digital" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm hover:underline transition-all inline-block ml-1"
                style={{ color: '#6B6B6B', fontWeight: '500' }}
                onClick={(e) => e.stopPropagation()}
              >
                by Digital Sheakh
              </a>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onViewLeaderboard}
              className="px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all hover:shadow-lg active:scale-95 shadow-md flex-shrink-0"
              style={{ backgroundColor: '#9DB668', color: 'white' }}
            >
              🏆 Leaderboard
            </button>
            {isLoggedIn && onLogout && (
              <button
                onClick={handleLogoutClick}
                className="px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all hover:shadow-lg active:scale-95 shadow-md flex-shrink-0"
                style={{ backgroundColor: '#D9534F', color: 'white' }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-6 px-4 sm:py-8 sm:px-6">
        <div className="w-full max-w-4xl">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-5 text-center shadow-lg border-2 border-transparent hover:border-opacity-50 transition-all" style={{ borderColor: timeRemaining <= 10 ? '#D9534F' : '#9DB668' }}>
              <p className="text-xs sm:text-sm font-bold mb-2" style={{ color: '#6B6B6B' }}>TIME LEFT</p>
              <p className="text-2xl sm:text-4xl font-black" style={{ color: timeRemaining <= 10 ? '#D9534F' : '#9DB668' }}>
                {formatTime(timeRemaining)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-5 text-center shadow-lg border-2 border-transparent hover:border-green-200 transition-all">
              <p className="text-xs sm:text-sm font-bold mb-2" style={{ color: '#6B6B6B' }}>CORRECT</p>
              <p className="text-2xl sm:text-4xl font-black" style={{ color: '#4A7C59' }}>
                {correctWords}
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-5 text-center shadow-lg border-2 border-transparent hover:border-red-200 transition-all">
              <p className="text-xs sm:text-sm font-bold mb-2" style={{ color: '#6B6B6B' }}>WRONG</p>
              <p className="text-2xl sm:text-4xl font-black" style={{ color: incorrectWords > 0 ? '#D9534F' : '#6B6B6B' }}>
                {incorrectWords}
              </p>
            </div>
          </div>

          {/* Words Display - Clean 2 Line Layout */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-5 sm:p-7 mb-5 border-2" style={{ borderColor: '#9DB668' }}>
            <div className="mb-5">
              <div 
                className="p-6 sm:p-8 rounded-2xl flex items-center justify-center" 
                style={{ 
                  backgroundColor: '#F5F3ED', 
                  minHeight: '110px',
                  maxHeight: '110px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {/* All words in one container that wraps to 2 lines */}
                <div className="flex flex-wrap gap-x-2 gap-y-2 justify-center" style={{ lineHeight: '1.8', alignContent: 'center' }}>
                  {visibleWords.map((word, index) => {
                    const isCurrentWord = index === currentWordOffset;
                    
                    // Determine styling based on state
                    let bgColor = 'transparent';
                    let textColor = '#3D3D3D';
                    
                    if (isCurrentWord) {
                      // Current word being typed
                      if (isTypingWrong) {
                        bgColor = '#D9534F'; // Red when typing wrong
                        textColor = 'white';
                      } else {
                        bgColor = '#9E9E9E'; // Grey when typing correctly or not started
                        textColor = 'white';
                      }
                    } else if (word.status === 'correct') {
                      textColor = '#4A7C59'; // Green text for correct (no background)
                    } else if (word.status === 'wrong') {
                      textColor = '#D9534F'; // Red text for wrong (no background)
                    }
                    
                    return (
                      <span
                        key={startWordIndex + index}
                        className="font-semibold"
                        style={{
                          color: textColor,
                          fontSize: 'clamp(14px, 2vw, 18px)',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontWeight: '600',
                          backgroundColor: bgColor,
                          padding: bgColor !== 'transparent' ? '2px 6px' : '0',
                          borderRadius: bgColor !== 'transparent' ? '4px' : '0',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isComplete}
                className="w-full p-5 sm:p-6 rounded-2xl border-3 focus:outline-none transition-all text-center font-bold"
                style={{
                  borderColor: '#9DB668',
                  borderWidth: '3px',
                  color: '#3D3D3D',
                  fontSize: '24px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  backgroundColor: 'white',
                  boxShadow: '0 6px 20px rgba(157, 182, 104, 0.2)'
                }}
                placeholder="Start typing..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={resetPractice}
            className="w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all hover:shadow-2xl active:scale-95 shadow-xl"
            style={{ backgroundColor: '#9DB668', color: 'white' }}
          >
            New Practice
          </button>

          {isComplete && (
            <div className="mt-4 bg-white rounded-2xl p-6 text-center shadow-xl border-2 animate-scale-in" style={{ borderColor: '#9DB668' }}>
              <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#9DB668' }}>
                Time Up!
              </p>
              <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
                Calculating your results...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-solid" 
                     style={{ borderColor: '#9DB668', borderTopColor: 'transparent' }}>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
