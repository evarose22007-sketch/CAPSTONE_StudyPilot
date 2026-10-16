const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { validateRegister, validateLogin } = require('../utils/validate');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = validateRegister(req.body);

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with this email already exists.', {
      email: 'This email is already registered. Try logging in instead.',
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({ user, token: signToken(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = validateLogin(req.body);

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  // Same message for unknown email and wrong password, so we don't reveal which accounts exist.
  if (!ok) throw ApiError.unauthorized('Email or password is incorrect.');

  res.json({ user, token: signToken(user) });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
