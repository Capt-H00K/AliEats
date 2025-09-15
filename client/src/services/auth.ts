import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string, name: string, role: 'customer' | 'driver') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in Firestore
  const userProfile: Omit<User, 'id'> = {
    email,
    name,
    role,
    createdAt: new Date(),
  };
  
  await setDoc(doc(db, 'users', user.uid), userProfile);
  
  return userCredential;
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

export const getUserProfile = async (uid: string): Promise<User> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }
  
  const userData = userDoc.data();
  return {
    id: uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: userData.createdAt.toDate(),
  };
};
