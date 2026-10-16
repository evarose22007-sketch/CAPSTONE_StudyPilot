const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { register, login, me } = require('../controllers/authController');

const router = Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: { message: 'Too many attempts. Please wait a few minutes and try again.' } },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;
