const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

// Single file upload (field name: 'file')
router.post('/file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    message: 'File uploaded successfully',
    fileUrl: `${baseUrl}/uploads/${req.file.filename}`
  });
});

module.exports = router;
