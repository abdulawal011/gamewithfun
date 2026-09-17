// ========================================
// GAMEWITHFUN FIREBASE CONFIG
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
  apiKey: "AIzaSyBX1dTH92fM5RPo4Hc6npiiR8-7fBr-GmY",
  authDomain: "gamewithfun-bc508.firebaseapp.com",
  projectId: "gamewithfun-bc508",
  storageBucket: "gamewithfun-bc508.firebasestorage.app",
  messagingSenderId: "470439578687",
  appId: "1:470439578687:web:33da16c62fe4709b627c8a"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

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

  // Firebase Auth
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
