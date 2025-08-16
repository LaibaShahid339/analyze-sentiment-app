// Replace with your own Firebase project config
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJUKq1YlWfvFQzmh5KMzkhMK4e6gYH7Bs",
  authDomain: "smart-study-companion-81804.firebaseapp.com",
  projectId: "smart-study-companion-81804",
  storageBucket: "smart-study-companion-81804.firebasestorage.app",
  messagingSenderId: "704002370575",
  appId: "1:704002370575:web:93956dd8a2b5ce93ac477a",
  measurementId: "G-P25ETYYHNT"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
