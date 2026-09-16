import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

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


const firebaseConfig = {
  apiKey: "AIzaSyBmsDEIWswcmxdDoJuDCMAhM3J3OJQKkG9I",
  authDomain: "game-with-fun-58521.firebaseapp.com",
  projectId: "game-with-fun-58521",
  storageBucket: "game-with-fun-58521.firebasestorage.app",
  messagingSenderId: "475244952455",
  appId: "1:475244952455:web:1d6f18b335867c03037122",
  measurementId: "G-CRHNTHH34B"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


export {
  app,
  auth,
  db,
  googleProvider,

  signInWithPopup,
  signOut,
  onAuthStateChanged,

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
