import { Router } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage, validateImageFile } from './firebase.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const validation = validateImageFile(file);
    if (validation.isValid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error || 'Invalid file'), false);
    }
  },
});

// Upload profile image
router.post('/upload/profile', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      'profiles',
      req.file.mimetype
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload profile image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload restaurant logo/cover image
router.post('/upload/restaurant', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      'restaurants',
      req.file.mimetype
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Restaurant image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload restaurant image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload menu item image
router.post('/upload/menu-item', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      'menu-items',
      req.file.mimetype
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Menu item image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload menu item image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload category image
router.post('/upload/category', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      'categories',
      req.file.mimetype
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Category image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload category image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete image
router.delete('/image', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    await deleteImage(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload multiple images (for galleries, etc.)
router.post('/upload/multiple/:folder', upload.array('images', 10), async (req, res) => {
  try {
    const { folder } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!['profiles', 'restaurants', 'menu-items', 'categories'].includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder specified' });
    }

    const uploadPromises = files.map(file => 
      uploadImage(
        file.buffer,
        file.originalname,
        folder as 'profiles' | 'restaurants' | 'menu-items' | 'categories',
        file.mimetype
      )
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware for multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
  }
  
  res.status(400).json({ error: error.message || 'File upload error' });
});

export default router;