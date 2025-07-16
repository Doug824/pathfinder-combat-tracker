import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug Firebase configuration
console.log('Firebase config debug:', {
  apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
  authDomain: firebaseConfig.authDomain || 'Missing',
  projectId: firebaseConfig.projectId || 'Missing',
  appId: firebaseConfig.appId ? 'Present' : 'Missing'
});

// Validate Firebase configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing Firebase configuration:', missingFields);
  console.error('Please check your .env.local file and ensure all required Firebase environment variables are set.');
  console.error('Current environment variables:', {
    REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY ? 'Present' : 'Missing',
    REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Missing',
    REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Missing',
    REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID ? 'Present' : 'Missing'
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;