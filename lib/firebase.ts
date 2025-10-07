import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDKti9Lx04BlyE4B6FzNjd-Kxn9dQgoy_M",
  authDomain: "typing-practice-ed510.firebaseapp.com",
  projectId: "typing-practice-ed510",
  storageBucket: "typing-practice-ed510.firebasestorage.app",
  messagingSenderId: "978206479237",
  appId: "1:978206479237:web:5556932306f9f042f5eaec",
  measurementId: "G-RLCW05H9H3"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Enable persistence - keep user logged in across browser sessions
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error enabling auth persistence:', error);
  });
}

export { app, db, auth };
