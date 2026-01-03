
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getEnv = (key: string) => {
  const val = process.env[key];
  return (val && val !== "undefined" && val !== "") ? val : null;
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
};

const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Internal default fallback project
const finalConfig = isConfigured ? firebaseConfig : {
  apiKey: "AIzaSyCkQSl2XJWKlrpU4PWDqqazqwO1nRHfLI4",
  authDomain: "the-tree-7a6b1.firebaseapp.com",
  projectId: "the-tree-7a6b1",
  storageBucket: "the-tree-7a6b1.firebasestorage.app",
  messagingSenderId: "652498284468",
  appId: "1:652498284468:web:239db769174200f3834ce1",
  measurementId: "G-M4M772475F"
};

// Use console.info for expected fallback behavior to keep logs clean
if (!isConfigured) {
  console.info("Chronos: Running in Local-First mode. (No custom Firebase keys detected).");
} else {
  console.info(`Chronos: Connected to Private Vault (${finalConfig.projectId})`);
}

const app = initializeApp(finalConfig as any);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, isConfigured };
