const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => (
    {
    folder: 'kyc_documents',
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    resource_type: 'auto'
  })
});

const upload = multer({ storage });

module.exports = upload;
