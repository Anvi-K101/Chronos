
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Provided Firebase Project Config
const firebaseConfig = {
  apiKey: "AIzaSyCkQSl2XJWKlrpU4PWDqqazqwO1nRHfLI4",
  authDomain: "the-tree-7a6b1.firebaseapp.com",
  projectId: "the-tree-7a6b1",
  storageBucket: "the-tree-7a6b1.firebasestorage.app",
  messagingSenderId: "652498284468",
  appId: "1:652498284468:web:239db769174200f3834ce1",
  measurementId: "G-M4M772475F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Chronos: Firebase Initialized");

export { auth, db };
