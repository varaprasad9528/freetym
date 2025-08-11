const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
    
  phone: body('phone')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid international phone number'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  otp: body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
    
  objectId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
    
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// Registration validations
const registrationValidations = {
  emailStep: [
    commonValidations.name,
    commonValidations.email,
    body('role')
      .isIn(['influencer', 'brand', 'agency'])
      .withMessage('Invalid role selected'),
    handleValidationErrors
  ],
  
  emailVerify: [
    commonValidations.email,
    commonValidations.otp,
    handleValidationErrors
  ],
  
  phoneStep: [
    commonValidations.phone,
    commonValidations.email,
    handleValidationErrors
  ],
  
  phoneVerify: [
    commonValidations.phone,
    commonValidations.otp,
    handleValidationErrors
  ],
  
  completeRegistration: [
    commonValidations.email,
    commonValidations.phone,
    commonValidations.password,
    body('role')
      .isIn(['influencer', 'brand', 'agency'])
      .withMessage('Invalid role selected'),
    body('country')
      .optional()
      .isLength({ min: 2, max: 3 })
      .withMessage('Country code must be 2-3 characters'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Language code must be 2-5 characters'),
    handleValidationErrors
  ]
};

// Login validation
const loginValidation = [
  commonValidations.email,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Campaign validations
const campaignValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId,
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    handleValidationErrors
  ],
  
  getById: [
    commonValidations.objectId,
    handleValidationErrors
  ]
};

// User profile validations
const profileValidations = {
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('instagram')
      .optional()
      .isURL()
      .withMessage('Instagram must be a valid URL'),
    body('youtube')
      .optional()
      .isURL()
      .withMessage('YouTube must be a valid URL'),
    body('followers')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Followers must be a positive number'),
    body('subscribers')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Subscribers must be a positive number'),
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Search validations
const searchValidations = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('category')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  query('platform')
    .optional()
    .isIn(['instagram', 'youtube', 'tiktok'])
    .withMessage('Platform must be instagram, youtube, or tiktok'),
  ...commonValidations.pagination,
  handleValidationErrors
];

// Demo request validation
const demoRequestValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('role')
    .isIn(['brand', 'influencer', 'other'])
    .withMessage('Role must be brand, influencer, or other'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  handleValidationErrors
];

// KYC validation
const kycValidations = {
  upload: [
    body('pancard.number')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage('Invalid PAN card number format'),
    body('pancard.images')
      .isArray({ min: 1 })
      .withMessage('At least one PAN card image is required'),
    body('aadhar.number')
      .matches(/^[0-9]{12}$/)
      .withMessage('Aadhar number must be 12 digits'),
    body('aadhar.front')
      .notEmpty()
      .withMessage('Aadhar front image is required'),
    body('aadhar.back')
      .notEmpty()
      .withMessage('Aadhar back image is required'),
    handleValidationErrors
  ]
};

// Reels validation
const reelsValidations = {
  create: [
    body('reelId')
      .notEmpty()
      .withMessage('Reel ID is required'),
    body('platform')
      .isIn(['instagram', 'youtube', 'tiktok'])
      .withMessage('Platform must be instagram, youtube, or tiktok'),
    body('url')
      .isURL()
      .withMessage('Reel URL must be valid'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    handleValidationErrors
  ],
  
  getReels: [
    query('platform')
      .optional()
      .isIn(['instagram', 'youtube', 'tiktok'])
      .withMessage('Platform must be instagram, youtube, or tiktok'),
    query('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),
    ...commonValidations.pagination,
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  registrationValidations,
  loginValidation,
  campaignValidations,
  profileValidations,
  searchValidations,
  demoRequestValidation,
  kycValidations,
  reelsValidations
}; 