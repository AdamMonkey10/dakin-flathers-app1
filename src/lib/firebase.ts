import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDink0eWHioleVVrJ0-hjoY70iYdE-QJY4",
  authDomain: "bladetech-data.firebaseapp.com",
  projectId: "bladetech-data",
  storageBucket: "bladetech-data.appspot.com",
  messagingSenderId: "292544753458",
  appId: "1:292544753458:web:414fc489e2ba763999712b",
  measurementId: "G-SLF0SYJPZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable local persistence for Auth
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error enabling auth persistence:', error);
  });

export { db, auth };