// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnpSLyB27n8RlgeC4hOTzH7pRez4J4rU4",
  authDomain: "encore-c8b25.firebaseapp.com",
  projectId: "encore-c8b25",
  storageBucket: "encore-c8b25.firebasestorage.app",
  messagingSenderId: "916200483387",
  appId: "1:916200483387:web:a6483f6fff09375cdb8a1e",
  measurementId: "G-1PH7GLR33C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 