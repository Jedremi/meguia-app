import { db, rtdb, auth } from './firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';

// ======== Realtime Database ========

// Sincroniza favoritos em tempo real
export const syncFavorites = (userId, callback) => {
  const favoritesRef = ref(rtdb, `users/${userId}/favorites`);
  return onValue(favoritesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || []);
  });
};

// Salva favoritos na nuvem
export const saveFavoritesToCloud = async (userId, favorites) => {
  try {
    await set(ref(rtdb, `users/${userId}/favorites`), favorites);
    return true;
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
    return false;
  }
};

// Sincroniza viagens em tempo real
export const setupRealTimeSync = (userId, callback) => {
  const tripsRef = ref(rtdb, `users/${userId}/trips`);
  return onValue(tripsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || []);
  });
};

// Alterna favorito
export const toggleFavorite = async (userId, itemId, isFavorite) => {
  try {
    const favoritesRef = ref(rtdb, `users/${userId}/favorites/${itemId}`);
    await set(favoritesRef, isFavorite ? true : null);
    return true;
  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
    return false;
  }
};

// ======== Firestore ========

// Salva itinerário
export const salvarItinerario = async (userId, itinerario) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      itinerarios: arrayUnion(itinerario)
    });
    console.log('Itinerário salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar itinerário:', error);
    throw error;
  }
};

// Busca itinerários
export const buscarItinerarios = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    return snap.data()?.itinerarios || [];
  } catch (error) {
    console.error('Erro ao buscar itinerários:', error);
    throw error;
  }
};

// ======== Authentication ========

// Cadastro de usuário
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Login de usuário
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Logout de usuário
export const logoutUser = async () => {
  return await signOut(auth);
};

// Reset de senha
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};
