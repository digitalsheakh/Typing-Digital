'use client';

import { useState } from 'react';
import AuthModal from './AuthModal';

interface ResultsProps {
  score: number;
  wpm: number;
  accuracy: number;
  timeInSeconds: number;
  onSaveScore: (name: string, email: string) => void;
  onPracticeAgain: () => void;
  onViewLeaderboard: () => void;
  isLoggedIn?: boolean;
  userEmail?: string;
  userName?: string;
}

export default function Results({ 
  wpm, 
  accuracy, 
  onSaveScore, 
  onPracticeAgain,
  onViewLeaderboard,
  isLoggedIn,
  userEmail,
  userName
}: ResultsProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAuthSuccess = async (name: string, email: string) => {
    setSaving(true);
    await onSaveScore(name, email);
    setSaving(false);
    setShowAuthModal(false);
  };

  const handleSaveClick = async () => {
    if (isLoggedIn && userEmail && userName) {
      // User is already logged in, save directly
      setSaving(true);
      await onSaveScore(userName, userEmail);
      setSaving(false);
    } else {
      // Show login modal
      setShowAuthModal(true);
    }
  };

  const handleShareFacebook = () => {
    const shareUrl = `https://typing.sheakh.digital`;
    const url = encodeURIComponent(shareUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const shareUrl = `https://typing.sheakh.digital`;
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`I just scored ${wpm} WPM on Typing Digital! 🎯\n\nCan you beat my typing speed?`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const shareUrl = `https://typing.sheakh.digital`;
    const text = encodeURIComponent(`I just scored ${wpm} WPM on Typing Digital! 🎯\n\nCan you beat my typing speed? ${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E8E4D9' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg p-4 sm:p-5 sticky top-0 z-10 border-b-2" style={{ borderColor: '#9DB668' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div className="flex-1 cursor-pointer" onClick={onPracticeAgain}>
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
          <button
            onClick={onViewLeaderboard}
            className="px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all hover:shadow-lg active:scale-95 shadow-md flex-shrink-0"
            style={{ backgroundColor: '#9DB668', color: 'white' }}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Results Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#9DB668' }}>
                Great Job!
              </h2>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Here are your results
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-white rounded-xl p-6 mb-6 border-2" style={{ borderColor: '#9DB668' }}>
              <div className="text-center mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: '#6B6B6B' }}>Your Score (WPM)</p>
                <p className="text-6xl sm:text-7xl font-black mb-2" style={{ color: '#9DB668' }}>{wpm}</p>
                <p className="text-lg font-semibold" style={{ color: '#6B6B6B' }}>Words Per Minute</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2" style={{ borderColor: '#E8E4D9' }}>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-1" style={{ color: '#6B6B6B' }}>Correct</p>
                  <p className="text-2xl font-bold" style={{ color: '#4A7C59' }}>{Math.round(wpm * accuracy / 100)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-1" style={{ color: '#6B6B6B' }}>Incorrect</p>
                  <p className="text-2xl font-bold" style={{ color: '#D9534F' }}>{Math.round(wpm * (100 - accuracy) / 100)}</p>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3 text-center" style={{ color: '#6B6B6B' }}>
                Share Your Results
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleShareFacebook}
                  className="py-2.5 px-3 sm:flex-1 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#1877F2', color: 'white' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="py-2.5 px-3 sm:flex-1 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 sm:flex-1 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSaveClick}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                style={{ backgroundColor: '#9DB668' }}
                disabled={saving}
              >
                {saving ? 'Saving...' : (isLoggedIn ? 'Save Score to Leaderboard' : 'Login to Save Score')}
              </button>
              <button
                onClick={onPracticeAgain}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-95 border-2"
                style={{ borderColor: '#9DB668', color: '#3D3D3D', backgroundColor: 'white' }}
              >
                Practice Again
              </button>
              <button
                onClick={onViewLeaderboard}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#E8E4D9', color: '#3D3D3D' }}
              >
                View Leaderboard
              </button>
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: '#6B6B6B' }}>
            Want to save your score? Login or sign up to join the leaderboard!
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
