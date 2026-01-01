import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// INSTRUCTION: Replace this object with your Firebase Project Config
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "00000000000",
  appId: "1:00000000000:web:00000000000000"
};

let app, auth, db;

try {
  // Only initialize if config is real (basic check)
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Chronos: Firebase Initialized");
  } else {
    console.warn("Chronos: Firebase config missing. Running in Local Offline Mode.");
  }
} catch (e) {
  console.error("Chronos: Firebase Init Error", e);
}

export { auth, db };