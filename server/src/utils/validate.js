const mongoose = require('mongoose');
const ApiError = require('./ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'completed'];

const isObjectId = (value) => mongoose.isValidObjectId(value) && String(new mongoose.Types.ObjectId(value)) === String(value);

const str = (value) => (typeof value === 'string' ? value.trim() : '');

/** Throws a 400 with field messages if `errors` has any keys. */
function throwIfErrors(errors) {
  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Please check the highlighted fields.', errors);
  }
}

function validateRegister(body = {}) {
  const errors = {};
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) errors.name = 'Name is required.';
  else if (name.length > 60) errors.name = 'Name must be 60 characters or fewer.';

  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (password.length > 72) errors.password = 'Password must be 72 characters or fewer.';

  throwIfErrors(errors);
  return { name, email, password };
}

function validateLogin(body = {}) {
  const errors = {};
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email) errors.email = 'Email is required.';
  if (!password) errors.password = 'Password is required.';
  throwIfErrors(errors);
  return { email, password };
}

/** `partial` = true for PATCH-style updates where missing fields are left alone. */
function validateCourse(body = {}, { partial = false } = {}) {
  const errors = {};
  const out = {};

  if (!partial || body.name !== undefined) {
    const name = str(body.name);
    if (!name) errors.name = 'Course name is required.';
    else if (name.length > 80) errors.name = 'Course name must be 80 characters or fewer.';
    else out.name = name;
  }

  if (body.code !== undefined) {
    const code = str(body.code);
    if (code.length > 20) errors.code = 'Course code must be 20 characters or fewer.';
    else out.code = code;
  }

  throwIfErrors(errors);
  return out;
}

function validateTask(body = {}, { partial = false } = {}) {
  const errors = {};
  const out = {};

  if (!partial || body.title !== undefined) {
    const title = str(body.title);
    if (!title) errors.title = 'Give the task a title.';
    else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';
    else out.title = title;
  }

  if (body.description !== undefined) {
    const description = str(body.description);
    if (description.length > 1000) errors.description = 'Description must be 1000 characters or fewer.';
    else out.description = description;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') {
      out.dueDate = null;
    } else {
      const date = new Date(body.dueDate);
      if (Number.isNaN(date.getTime())) errors.dueDate = 'Enter a valid due date.';
      else out.dueDate = date;
    }
  }

  if (body.course !== undefined) {
    if (body.course === null || body.course === '') out.course = null;
    else if (!isObjectId(body.course)) errors.course = 'Choose a valid course.';
    else out.course = body.course;
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) errors.priority = 'Priority must be low, medium or high.';
    else out.priority = body.priority;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) errors.status = 'Status must be pending or completed.';
    else out.status = body.status;
  }

  throwIfErrors(errors);
  return out;
}

module.exports = {
  PRIORITIES,
  STATUSES,
  isObjectId,
  validateRegister,
  validateLogin,
  validateCourse,
  validateTask,
};
