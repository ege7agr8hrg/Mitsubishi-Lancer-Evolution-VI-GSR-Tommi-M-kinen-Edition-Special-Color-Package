// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCR18GU0f6kwZL898XCeLVR1DIKJ9lUXLo",
  authDomain: "manageslop3000.firebaseapp.com",
  projectId: "manageslop3000",
  storageBucket: "manageslop3000.firebasestorage.app",
  messagingSenderId: "271665063727",
  appId: "1:271665063727:web:e45c23a591dc673bd463da",
  measurementId: "G-Y683M3S1WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);