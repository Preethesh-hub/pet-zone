import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web API keys are safe to expose in the client bundle
// Security is enforced via Firestore Security Rules, not by hiding these keys
const firebaseConfig = {
  apiKey: "AIzaSyDmzJMQ3XucPQA-yjHTNCmnpAZYQFG_vGA",
  authDomain: "pet-zone-f5611.firebaseapp.com",
  projectId: "pet-zone-f5611",
  storageBucket: "pet-zone-f5611.firebasestorage.app",
  messagingSenderId: "908881812128",
  appId: "1:908881812128:web:38b86e5e08265453d9c7c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
