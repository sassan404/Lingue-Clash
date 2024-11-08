// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL:
    "https://word-clash-2aa96-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
// The Firebase Admin SDK to access the Firebase Realtime Database.
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };
