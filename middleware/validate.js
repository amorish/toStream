const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscore only'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .normalizeEmail()
    .isEmail().withMessage('Valid email required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters')
    .custom(value => {
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        throw new Error('Password must contain at least one letter and one number');
      }
      return true;
    }),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match');
      }
      return true;
    })
];

const loginRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .normalizeEmail()
    .isEmail().withMessage('Valid email required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const createRoomRules = [
  body('name').optional().trim().isLength({ min: 0, max: 50 }),
  body('mode').optional().isIn(['camera', 'url-video', 'music']),
  body('password').optional().custom(value => {
    if (value && value.trim().length > 0 && value.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }
    return true;
  })
];

const joinRoomRules = [
  body('roomId').trim().notEmpty().isLength({ min: 10, max: 10 }).isAlphanumeric(),
  body('password').optional()
];

module.exports = { validate, registerRules, loginRules, createRoomRules, joinRoomRules };
