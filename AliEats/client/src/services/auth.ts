// src/services/auth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import { User } from "@/types";

// ============================
// SIGN IN
// ============================
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// ============================
// SIGN UP
// ============================
export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: "customer" | "driver" | "restaurant"
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const createdAt = new Date();

  // Save user profile in Realtime Database
  await set(ref(database, `users/${user.uid}`), {
    id: user.uid,
    email,
    name,
    role,
    createdAt: createdAt.toISOString(),
  });

  // DO NOT create restaurant here anymore
  // The restaurant node will be created in AuthContext.tsx via addRestaurant

  return userCredential;
};

// ============================
// SIGN OUT
// ============================
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// ============================
// GET USER PROFILE
// ============================
export const getUserProfile = async (uid: string): Promise<User> => {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, `users/${uid}`));

  if (!snapshot.exists()) {
    throw new Error("User profile not found");
  }

  const userData = snapshot.val();

  return {
    id: uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: new Date(userData.createdAt),
  };
};
