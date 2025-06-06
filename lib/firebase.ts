import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAgKX66H9j9y-gDNwx6T7eevntLC-JaCYg",
  authDomain: "handwritesvg.firebaseapp.com",
  projectId: "handwritesvg",
  storageBucket: "handwritesvg.firebasestorage.app",
  messagingSenderId: "686333111034",
  appId: "1:686333111034:web:74d872580710707554f743",
  measurementId: "G-3X0FSN5NYT"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics }; 