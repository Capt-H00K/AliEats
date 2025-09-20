// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthContextType, User } from "@/types";
import {
  getUserProfile,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
} from "@/services/auth";
import { addRestaurant } from "@/services/realtime";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to fetch full profile from DB
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.warn("Error fetching user profile:", error);
          // Fallback: basic profile with a default role
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "Unknown",
            role: "customer", // safer default than restaurant
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
  };

  // Sign up function
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
      let profile: User;

      if (role === "restaurant") {
        // Create restaurant entry in DB
        const newRestaurant = await addRestaurant(
          {
            name,
            description: "Your restaurant description here",
            image: "https://via.placeholder.com/150",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          firebaseUser.uid
        );

        profile = {
          id: firebaseUser.uid,
          email,
          name,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          restaurantId: newRestaurant.id,
        };
      } else {
        // Customer and driver
        profile = {
          id: firebaseUser.uid,
          email,
          name,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Save profile to state immediately
      setUser(profile);
    } catch (error) {
      console.warn("Error creating user profile after signup:", error);
    }
  };

  // Sign out function
  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  const value: AuthContextType = { user, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
