import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  fileName: string;
  path: string;
}

interface UseImageUploadOptions {
  folder: 'profile' | 'restaurant' | 'menu-item' | 'category';
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<UploadResult | null> => {
    const { folder, onSuccess, onError, maxSize = 5 } = options;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select a valid image file';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/images/upload/${folder}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  const deleteImage = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/images/image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    deleteImage,
    isUploading,
    error,
    clearError,
  };
};

// Hook for multiple image uploads
interface UseMultipleImageUploadOptions {
  folder: 'profile' | 'restaurant' | 'menu-item' | 'category';
  maxFiles?: number;
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
}

export const useMultipleImageUpload = (options: UseMultipleImageUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = useCallback(async (files: FileList | File[]): Promise<UploadResult[] | null> => {
    const { folder, onSuccess, onError, maxFiles = 10, maxSize = 5 } = options;
    const fileArray = Array.from(files);

    if (fileArray.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed`;
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    // Validate each file
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        const errorMsg = `File "${file.name}" is too large. Maximum size is ${maxSize}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      if (!file.type.startsWith('image/')) {
        const errorMsg = `File "${file.name}" is not a valid image`;
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      fileArray.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/images/upload/multiple/${folder}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImages,
    isUploading,
    error,
    clearError,
  };
};