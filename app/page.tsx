'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import TypingPractice from '@/components/TypingPractice';
import Results from '@/components/Results';
import Leaderboard from '@/components/Leaderboard';

type AppState = 'practice' | 'results' | 'leaderboard';

interface ScoreData {
  score: number;
  wpm: number;
  accuracy: number;
  timeInSeconds: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('practice');
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || '');
        setUserName(user.displayName || 'User');
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleComplete = (score: number, wpm: number, accuracy: number, timeInSeconds: number) => {
    setScoreData({ score, wpm, accuracy, timeInSeconds });
    setAppState('results');
  };

  const handleSaveScore = async (name: string, email: string) => {
    if (!scoreData) return;
    
    try {
      // First, check if user already has a score and delete it
      const { query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const q = query(collection(db, 'scores'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      // Delete all existing scores for this email
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'scores', docSnapshot.id))
      );
      await Promise.all(deletePromises);
      
      // Add new score
      await addDoc(collection(db, 'scores'), {
        name,
        email,
        score: scoreData.score,
        wpm: scoreData.wpm,
        accuracy: scoreData.accuracy,
        timestamp: Date.now(),
      });
      
      setUserEmail(email);
      setAppState('leaderboard');
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score. Please try again.');
    }
  };

  const handlePracticeAgain = () => {
    setScoreData(null);
    setAppState('practice');
  };

  const handleViewLeaderboard = () => {
    setAppState('leaderboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserEmail('');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {appState === 'practice' && (
        <TypingPractice
          onComplete={handleComplete}
          onViewLeaderboard={handleViewLeaderboard}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}
      {appState === 'results' && scoreData && (
        <Results
          score={scoreData.score}
          wpm={scoreData.wpm}
          accuracy={scoreData.accuracy}
          timeInSeconds={scoreData.timeInSeconds}
          onSaveScore={handleSaveScore}
          onPracticeAgain={handlePracticeAgain}
          onViewLeaderboard={handleViewLeaderboard}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          userName={userName}
        />
      )}
      {appState === 'leaderboard' && (
        <Leaderboard
          currentUserEmail={userEmail}
          onContinue={handlePracticeAgain}
          onSaveScore={handleSaveScore}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
