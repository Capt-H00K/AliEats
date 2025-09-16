// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthContextType, User } from "@/types";
import { 
  getUserProfile, 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut 
} from "@/services/auth";
import { addRestaurant } from "@/services/realtime";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Attempt to fetch user profile
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.warn("Error fetching user profile:", error);
          // Fallback user so the app can continue even if profile is missing
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "Unknown",
            role: "restaurant", // default role if unsure
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: "customer" | "driver" | "restaurant"
  ) => {
    await authSignUp(email, password, name, role);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      let profile: User | null = null;

      if (role === "restaurant") {
        // Create restaurant entry in Realtime DB
        const newRestaurant = await addRestaurant({
          name,
          description: "",
          image: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create restaurant user profile
        profile = {
          id: firebaseUser.uid,
          email,
          name,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          restaurantId: newRestaurant.id, // link to DB node
        };
      } else {
        // For customer/driver, fetch the profile normally
        profile = await getUserProfile(firebaseUser.uid);
      }

      setUser(profile);
    } catch (error) {
      console.warn("Error fetching profile after signup:", error);
    }
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
