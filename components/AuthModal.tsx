'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (name: string, email: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || 'User';
        onSuccess(displayName, email);
      } else {
        // Signup
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onSuccess(name, email);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // User-friendly error messages
      const err = error as { code?: string };
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#3D3D3D', fontFamily: 'var(--font-space-grotesk)' }}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {isLogin ? 'Login to save your scores' : 'Sign up to join the leaderboard'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFE5E5', color: '#D9534F' }}>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#3D3D3D' }}>
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
                style={{ 
                  borderColor: '#9DB668',
                  color: '#3D3D3D'
                }}
                placeholder="Enter your name"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#3D3D3D' }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
              style={{ 
                borderColor: '#9DB668',
                color: '#3D3D3D'
              }}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#3D3D3D' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
              style={{ 
                borderColor: '#9DB668',
                color: '#3D3D3D'
              }}
              placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#9DB668' }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-semibold hover:underline"
              style={{ color: '#9DB668' }}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm font-semibold transition-all hover:opacity-80"
          style={{ color: '#6B6B6B' }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
