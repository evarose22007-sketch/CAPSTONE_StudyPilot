const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * On success, sets req.user = { id, name, email }.
 */
async function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Your account could not be found. Please log in again.');

  req.user = { id: user.id, name: user.name, email: user.email };
  next();
}

module.exports = requireAuth;
