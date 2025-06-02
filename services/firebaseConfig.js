import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKHu-YPsyruOPsOKr0mrVWok1U5cwn_6M",
  authDomain: "meguia-3d239.firebaseapp.com",
  databaseURL: "https://meguia-3d239-default-rtdb.firebaseio.com",
  projectId: "meguia-3d239",
  storageBucket: "meguia-3d239.appspot.com",  // Corrigido o domínio
  messagingSenderId: "210995706385",
  appId: "1:210995706385:web:859c2da63bc666a7a0cfb0",
  measurementId: "G-99GDWWSZYR"  // Opcional, pode manter ou remover
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

export { db, rtdb, auth };
