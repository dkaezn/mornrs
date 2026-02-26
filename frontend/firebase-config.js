// firebase-config.js
// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6kmfbGfQJ5PKcQd7asAbWsThRGHcLCKo",
  authDomain: "mornrs-memories.firebaseapp.com",
  projectId: "mornrs-memories",
  storageBucket: "mornrs-memories.firebasestorage.app",
  messagingSenderId: "825439707253",
  appId: "1:825439707253:web:442c5fe45aeca912b3d83c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create Firestore database reference
const db = firebase.firestore();

// Make db available globally
window.db = db;

console.log('Firebase initialized successfully!');