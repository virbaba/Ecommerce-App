// firebase.js

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBp7PkMKNlmdxIy8_PZgm9f4wGQTVjjfZ8",
  authDomain: "ecommerce-app-86e00.firebaseapp.com",
  projectId: "ecommerce-app-86e00",
  storageBucket: "ecommerce-app-86e00.appspot.com",
  messagingSenderId: "619202220362",
  appId: "1:619202220362:web:8c19efd3d54979866071b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app; // export the initialized Firebase app
