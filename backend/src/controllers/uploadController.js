const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Image optimization function
const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'jpeg'
  } = options;

  return await sharp(buffer)
    .resize(width, height, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .jpeg({ quality })
    .toBuffer();
};

// Generate multiple image sizes
const generateImageSizes = async (buffer, filename) => {
  const sizes = [
    { suffix: '_thumb', width: 150, height: 150 },
    { suffix: '_small', width: 300, height: 300 },
    { suffix: '_medium', width: 600, height: 600 },
    { suffix: '_large', width: 1200, height: 1200 }
  ];

  const results = [];
  const name = path.parse(filename).name;

  for (const size of sizes) {
    const optimized = await optimizeImage(buffer, {
      width: size.width,
      height: size.height
    });

    const newFilename = `${name}${size.suffix}.jpg`;
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', newFilename);
    
    await fs.writeFile(filePath, optimized);
    
    results.push({
      size: size.suffix.replace('_', ''),
      filename: newFilename,
      path: filePath,
      url: `/uploads/${newFilename}`,
      width: size.width,
      height: size.height
    });
  }

  return results;
};

const uploadController = {
  // Single file upload
  uploadSingle: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided.'
        });
      }

      const file = req.file;
      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;
      const uploadPath = process.env.UPLOAD_PATH || './uploads';

      // Ensure upload directory exists
      await fs.mkdir(uploadPath, { recursive: true });

      let fileInfo = {
        id: fileId,
        original_name: file.originalname,
        filename,
        mime_type: file.mimetype,
        size: file.size,
        url: `/uploads/${filename}`
      };

      if (file.mimetype.startsWith('image/')) {
        // Optimize and generate multiple sizes for images
        const imageSizes = await generateImageSizes(file.buffer, filename);
        
        // Save original
        const originalPath = path.join(uploadPath, filename);
        await fs.writeFile(originalPath, file.buffer);

        fileInfo.sizes = imageSizes;
        fileInfo.type = 'image';
      } else {
        // Save file as-is for non-images
        const filePath = path.join(uploadPath, filename);
        await fs.writeFile(filePath, file.buffer);
        fileInfo.type = 'file';
      }

      logger.info(`File uploaded: ${filename} (${file.size} bytes)`);

      res.json({
        success: true,
        message: 'File uploaded successfully.',
        data: { file: fileInfo }
      });

    } catch (error) {
      logger.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed.'
      });
    }
  },

  // Multiple files upload
  uploadMultiple: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided.'
        });
      }

      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      await fs.mkdir(uploadPath, { recursive: true });

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileId = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${fileId}${extension}`;

        let fileInfo = {
          id: fileId,
          original_name: file.originalname,
          filename,
          mime_type: file.mimetype,
          size: file.size,
          url: `/uploads/${filename}`
        };

        if (file.mimetype.startsWith('image/')) {
          // Optimize and generate multiple sizes for images
          const imageSizes = await generateImageSizes(file.buffer, filename);
          
          // Save original
          const originalPath = path.join(uploadPath, filename);
          await fs.writeFile(originalPath, file.buffer);

          fileInfo.sizes = imageSizes;
          fileInfo.type = 'image';
        } else {
          // Save file as-is for non-images
          const filePath = path.join(uploadPath, filename);
          await fs.writeFile(filePath, file.buffer);
          fileInfo.type = 'file';
        }

        uploadedFiles.push(fileInfo);
      }

      logger.info(`Multiple files uploaded: ${uploadedFiles.length} files`);

      res.json({
        success: true,
        message: 'Files uploaded successfully.',
        data: { files: uploadedFiles }
      });

    } catch (error) {
      logger.error('Multiple file upload error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed.'
      });
    }
  },

  // Delete file
  deleteFile: async (req, res) => {
    try {
      const { filename } = req.params;
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File not found.'
        });
      }

      // Delete main file
      await fs.unlink(filePath);

      // Delete image sizes if they exist
      const name = path.parse(filename).name;
      const sizes = ['_thumb', '_small', '_medium', '_large'];
      
      for (const suffix of sizes) {
        try {
          const sizeFilePath = path.join(uploadPath, `${name}${suffix}.jpg`);
          await fs.unlink(sizeFilePath);
        } catch (error) {
          // Ignore if size file doesn't exist
        }
      }

      logger.info(`File deleted: ${filename}`);

      res.json({
        success: true,
        message: 'File deleted successfully.'
      });

    } catch (error) {
      logger.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'File deletion failed.'
      });
    }
  },

  // Get file info
  getFileInfo: async (req, res) => {
    try {
      const { filename } = req.params;
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, filename);

      // Check if file exists
      try {
        const stats = await fs.stat(filePath);
        
        res.json({
          success: true,
          data: {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${filename}`
          }
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File not found.'
        });
      }

    } catch (error) {
      logger.error('Get file info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file info.'
      });
    }
  }
};

module.exports = {
  upload,
  uploadController
};