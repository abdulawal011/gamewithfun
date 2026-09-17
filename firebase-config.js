// ========================================
// FIREBASE CONFIGURATION
// GameWithFun
// ========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyBmsDEIWswcmxdDoJuDCMAh3j3OJQKkG9I",
  authDomain: "game-with-fun-58521.firebaseapp.com",
  projectId: "game-with-fun-58521",
  storageBucket: "game-with-fun-58521.firebasestorage.app",
  messagingSenderId: "475244952455",
  appId: "1:475244952455:web:1d6f18b335867c03037122",
  measurementId: "G-CRHNTHH34B"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// AUTH
// ========================================

const auth = getAuth(app);


// ========================================
// FIRESTORE
// ========================================

const db = getFirestore(app);


// ========================================
// GOOGLE PROVIDER
// ========================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});


// ========================================
// EXPORT
// ========================================

export {
  app,
  auth,
  db,
  googleProvider,

  // Authentication
  signInWithPopup,
  signOut,
  onAuthStateChanged,

  // Firestore
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs
};
