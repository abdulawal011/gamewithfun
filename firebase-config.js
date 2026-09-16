// GameWithFun Firebase Configuration

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ======================================
// PUT YOUR FIREBASE CONFIG HERE
// ======================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// ======================================
// INITIALIZE FIREBASE
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// Make available to leaderboard.js
export {
  auth,
  db,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
};
