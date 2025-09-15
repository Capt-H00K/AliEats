import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7NedynjEGpfMevRcG81n2gv1tLvT1g-k",
  authDomain: "flavorfleet-a9b09.firebaseapp.com",
  projectId: "flavorfleet-a9b09",
  storageBucket: "flavorfleet-a9b09.firebasestorage.app",
  messagingSenderId: "38387869918",
  appId: "1:38387869918:web:12f100d594eb8120673a4f",
  measurementId: "G-ERNMEW6E0J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
