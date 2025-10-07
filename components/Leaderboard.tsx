'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthModal from './AuthModal';

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  score: number;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

interface LeaderboardProps {
  currentUserEmail?: string;
  onContinue: () => void;
  onSaveScore?: (name: string, email: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Leaderboard({ currentUserEmail, onContinue, onSaveScore, isLoggedIn, onLogout }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [animatingRank, setAnimatingRank] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLogoutClick = () => {
    if (window.confirm('If you log out, you will not be able to save your scores. Are you sure you want to logout?')) {
      onLogout?.();
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'scores'),
        orderBy('score', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboardData: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        leaderboardData.push({
          id: doc.id,
          ...doc.data()
        } as LeaderboardEntry);
      });
      
      setLeaders(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E4D9' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg p-4 sm:p-5 sticky top-0 z-10 border-b-2" style={{ borderColor: '#9DB668' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div className="flex-1 cursor-pointer" onClick={onContinue}>
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
            {isLoggedIn && onLogout ? (
              <button
                onClick={handleLogoutClick}
                className="px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all hover:shadow-lg active:scale-95 shadow-md flex-shrink-0"
                style={{ backgroundColor: '#D9534F', color: 'white' }}
              >
                Logout
              </button>
            ) : onSaveScore && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all hover:shadow-lg active:scale-95 shadow-md flex-shrink-0"
                style={{ backgroundColor: '#9DB668', color: 'white' }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid" 
                 style={{ borderColor: '#9DB668', borderTopColor: 'transparent' }}>
            </div>
            <p className="mt-4 text-lg" style={{ color: '#6B6B6B' }}>Loading leaderboard...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-4">
            <p className="text-2xl font-bold mb-2" style={{ color: '#9DB668' }}>
              No scores yet!
            </p>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Be the first to practice and save your score
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 mb-4">
            {leaders.map((entry, index) => {
              const isCurrentUser = currentUserEmail && entry.email === currentUserEmail;
              const isTopThree = index < 3;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 flex items-center gap-2 sm:gap-4 transition-all hover:shadow-lg"
                  style={{
                    border: isCurrentUser ? '2px solid #9DB668' : 'none',
                    backgroundColor: isCurrentUser ? '#9DB66810' : 'white'
                  }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg"
                       style={{
                         backgroundColor: isTopThree ? '#9DB668' : '#E8E4D9',
                         color: isTopThree ? 'white' : '#3D3D3D'
                       }}>
                    {index + 1}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm sm:text-base" style={{ color: '#3D3D3D' }}>
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full" 
                              style={{ backgroundColor: '#9DB668', color: 'white' }}>
                          You
                        </span>
                      )}
                    </p>
                  </div>

                  {/* WPM Display */}
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#9DB668' }}>
                      {entry.wpm}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#6B6B6B' }}>WPM</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-6 sm:mt-8 sticky bottom-4">
          <button
            onClick={onContinue}
            className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
            style={{ backgroundColor: '#9DB668' }}
          >
            Practice Again
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && onSaveScore && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={(name, email) => {
            onSaveScore(name, email);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: '24px'
              }}
            >
              🎈
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
