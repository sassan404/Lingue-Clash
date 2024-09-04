import admin = require("firebase-admin");

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL:
    "https://word-clash-2aa96-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
// The Firebase Admin SDK to access the Firebase Realtime Database.
const app = admin.initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = app.database();

export { database };
