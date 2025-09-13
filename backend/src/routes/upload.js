const express = require('express');
const { upload, uploadController } = require('../controllers/uploadController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/single', 
  authMiddleware, 
  authorize('super_admin', 'admin', 'manager', 'staff'),
  upload.single('file'), 
  uploadController.uploadSingle
);

router.post('/multiple', 
  authMiddleware, 
  authorize('super_admin', 'admin', 'manager', 'staff'),
  upload.array('files', 10), // Max 10 files
  uploadController.uploadMultiple
);

router.delete('/:filename', 
  authMiddleware, 
  authorize('super_admin', 'admin', 'manager'),
  uploadController.deleteFile
);

router.get('/:filename/info', 
  authMiddleware,
  uploadController.getFileInfo
);

module.exports = router;