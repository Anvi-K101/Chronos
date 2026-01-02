import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration optimized for Netlify deployment.
 * Prioritizes process.env for security while maintaining fallbacks for local stability.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCkQSl2XJWKlrpU4PWDqqazqwO1nRHfLI4",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "the-tree-7a6b1.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "the-tree-7a6b1",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "the-tree-7a6b1.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "652498284468",
  appId: process.env.FIREBASE_APP_ID || "1:652498284468:web:239db769174200f3834ce1",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-M4M772475F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Chronos: Firebase Initialized for Netlify Deployment");

export { auth, db };