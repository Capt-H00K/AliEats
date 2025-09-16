// src/services/auth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import { User, Restaurant } from "@/types";

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

  // Use a local Date variable to satisfy TypeScript
  const createdAt = new Date();

  // Prepare user profile
  const userProfile: Omit<User, "id"> = {
    email,
    name,
    role,
    createdAt, // TS Date
  };

  // Save user profile in Realtime Database as ISO string
  await set(ref(database, `users/${user.uid}`), {
    id: user.uid,
    email,
    name,
    role,
    createdAt: createdAt.toISOString(), // store as string
  });

  // Automatically create a restaurant node if the user is a restaurant
  if (role === "restaurant") {
    const restaurantRef = ref(database, `restaurants/${user.uid}`);
    const now = new Date();

    const defaultRestaurant: Omit<Restaurant, "id"> = {
      name,
      description: "Your restaurant description here",
      image: "https://via.placeholder.com/150",
      createdAt: now, // TS Date
      updatedAt: now, // TS Date
    };

    // Save restaurant node as ISO strings in DB
    await set(restaurantRef, {
      ...defaultRestaurant,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

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

  // Convert ISO string back to Date for TypeScript
  return {
    id: uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: new Date(userData.createdAt),
  };
};
