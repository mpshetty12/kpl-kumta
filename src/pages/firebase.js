// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyC5ts8XqlBqYFvLRJ-8RyYMPsyBTHd0PK0",
  authDomain: "kpl-2025-d10a5.firebaseapp.com",
  projectId: "kpl-2025-d10a5",
  storageBucket: "kpl-2025-d10a5.appspot.com",
  messagingSenderId: "82956843654",
  appId: "1:82956843654:web:c6c3decc8935bd0c472f07",
  measurementId: "G-EMJQYXKXTB"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
