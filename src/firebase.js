import firebase from '@firebase/app'
require('firebase/auth')
require('firebase/firestore')
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAnMvfTP1KHGosU_Vl3pE6a7Yn0T5m52VY",
    authDomain: "moster-chat-8da0e.firebaseapp.com",
    databaseURL: "https://moster-chat-8da0e.firebaseio.com",
    projectId: "moster-chat-8da0e",
    storageBucket: "moster-chat-8da0e.appspot.com",
    messagingSenderId: "692275694614",
    appId: "1:692275694614:web:6f6f2dfae192958a"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db =firebase.firestore();
  
  export{
      auth,db
  }