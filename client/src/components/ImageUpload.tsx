import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (imageUrl: string, filePath: string) => void;
  onError?: (error: string) => void;
  folder: 'profile' | 'restaurant' | 'menu-item' | 'category';
  currentImage?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  folder,
  currentImage,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  placeholder = 'Click to upload image'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size must be less than ${maxSize}MB`;
      onError?.(error);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select a valid image file';
      onError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/images/upload/${folder}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUpload(result.data.url, result.data.path);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      try {
        // Extract file path from URL if needed
        const urlParts = currentImage.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];
        const filePath = `${folderName}/${fileName}`;

        await fetch('/api/images/image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath }),
        });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setPreview(null);
    onUpload('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed border-gray-300 rounded-lg p-6 
          text-center cursor-pointer transition-colors hover:border-gray-400
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
          ${preview ? 'border-solid border-gray-200' : ''}
        `}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
            <p className="text-sm text-gray-600">
              {isUploading ? 'Uploading...' : placeholder}
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WebP up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Multiple image upload component
interface MultipleImageUploadProps {
  onUpload: (images: Array<{ url: string; filePath: string }>) => void;
  onError?: (error: string) => void;
  folder: 'profile' | 'restaurant' | 'menu-item' | 'category';
  currentImages?: Array<{ url: string; filePath: string }>;
  maxFiles?: number;
  className?: string;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  onUpload,
  onError,
  folder,
  currentImages = [],
  maxFiles = 10,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/images/upload/multiple/${folder}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newImages = [...images, ...result.data];
        setImages(newImages);
        onUpload(newImages);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      await fetch('/api/images/image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: imageToRemove.filePath }),
      });
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {images.length < maxFiles && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed border-gray-300 rounded-lg h-32 
              flex flex-col items-center justify-center cursor-pointer
              transition-colors hover:border-gray-400
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {images.length}/{maxFiles} images uploaded
      </p>
    </div>
  );
};