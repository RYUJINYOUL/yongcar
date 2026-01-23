// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrdm9iLABioN9GE7yRi_8M7jgYP0DSVxU",
  authDomain: "route-test-fe6fc.firebaseapp.com",
  projectId: "route-test-fe6fc",
  storageBucket: "route-test-fe6fc.firebasestorage.app",
  messagingSenderId: "790621700166",
  appId: "1:790621700166:web:4527fd2fa01d5bb1504a47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;




