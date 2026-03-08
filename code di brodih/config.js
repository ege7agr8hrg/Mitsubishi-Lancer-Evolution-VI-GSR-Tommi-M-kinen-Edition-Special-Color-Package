// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCR18GU0f6kwZL898XCeLVR1DIKJ9lUXLo",
  authDomain: "manageslop3000.firebaseapp.com",
  projectId: "manageslop3000",
  storageBucket: "manageslop3000.firebasestorage.app",
  messagingSenderId: "271665063727",
  appId: "1:271665063727:web:e45c23a591dc673bd463da",
  measurementId: "G-Y683M3S1WM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.db = db;