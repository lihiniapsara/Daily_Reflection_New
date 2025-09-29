// Import the functions you need from the SDKs you need
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSr8dTAX20VMAr2FA1PLDSMuVQDr8yT3o",
  authDomain: "daily-reflection-app-46c93.firebaseapp.com",
  projectId: "daily-reflection-app-46c93",
  storageBucket: "daily-reflection-app-46c93.firebasestorage.app",
  messagingSenderId: "458282997070",
  appId: "1:458282997070:web:79befa64167bbd6a09fa1f",
  measurementId: "G-1CH217T25C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };
