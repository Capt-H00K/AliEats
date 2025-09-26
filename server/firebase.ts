import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '..', 'flavorfleet-a9b09-firebase-adminsdk-fbsvc-30fb05c745.json');

let app: App | null = null;
let storage: Storage | null = null;
let auth: Auth | null = null;
let bucket: any = null;

try {
  if (getApps().length === 0) {
    // Try to use service account file first
    if (fs.existsSync(serviceAccountPath)) {
      app = initializeApp({
        credential: cert(serviceAccountPath),
        storageBucket: 'flavorfleet-a9b09.appspot.com'
      });
    } else {
      // Fallback to environment variables or application default credentials
      console.warn('Firebase service account file not found. Firebase admin features will be limited.');
      // In development without service account, we'll skip Firebase admin initialization
      // This allows the app to run without Firebase admin features
    }
  } else {
    app = getApps()[0];
  }

  if (app) {
    storage = getStorage(app);
    auth = getAuth(app);
    bucket = storage.bucket();
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.warn('Failed to initialize Firebase Admin SDK:', error instanceof Error ? error.message : 'Unknown error');
  console.log('App will run with limited Firebase functionality');
}

export { storage, auth, bucket };

// Image upload utility functions
export interface UploadResult {
  url: string;
  fileName: string;
  path: string;
}

export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: 'profiles' | 'restaurants' | 'menu-items' | 'categories',
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  if (!bucket) {
    throw new Error('Firebase storage is not available. Please configure Firebase admin credentials.');
  }

  try {
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${folder}/${uniqueFileName}`;
    
    const fileRef = bucket.file(filePath);
    
    await fileRef.save(file, {
      metadata: {
        contentType,
        metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        }
      }
    });

    // Make the file publicly accessible
    await fileRef.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    return {
      url: publicUrl,
      fileName: uniqueFileName,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(filePath: string): Promise<void> {
  if (!bucket) {
    throw new Error('Firebase storage is not available. Please configure Firebase admin credentials.');
  }

  try {
    const fileRef = bucket.file(filePath);
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

export function validateImageFile(file: any): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum size is 5MB.' };
  }

  return { isValid: true };
}

// Utility function to resize images (optional - requires sharp package)
export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number = 80
): Promise<Buffer> {
  try {
    // This would require installing sharp package
    // For now, return the original buffer
    // In production, you'd want to implement image resizing
    return buffer;
  } catch (error) {
    console.error('Error resizing image:', error);
    return buffer;
  }
}