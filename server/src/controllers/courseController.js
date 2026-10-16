const mongoose = require('mongoose');
const Course = require('../models/Course');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const { validateCourse, isObjectId } = require('../utils/validate');

/**
 * Loads a course only if it belongs to the logged-in user.
 * Someone else's course gives the same 404 as a missing one, so ids can't be probed.
 */
async function findOwnCourse(req) {
  const { id } = req.params;
  if (!isObjectId(id)) throw ApiError.notFound('Course not found.');
  const course = await Course.findOne({ _id: id, owner: req.user.id });
  if (!course) throw ApiError.notFound('Course not found.');
  return course;
}

// GET /api/courses
async function listCourses(req, res) {
  const owner = new mongoose.Types.ObjectId(req.user.id);
  const courses = await Course.find({ owner }).lean();
  courses.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  // Attach task counts so the courses screen can show "3 of 5 done".
  const counts = await Task.aggregate([
    { $match: { owner } },
    { $group: { _id: { course: '$course', status: '$status' }, n: { $sum: 1 } } },
  ]);
  const byCourse = {};
  for (const { _id, n } of counts) {
    const key = String(_id.course);
    byCourse[key] ??= { pending: 0, completed: 0 };
    byCourse[key][_id.status] = n;
  }

  res.json({
    // eslint-disable-next-line no-unused-vars
    courses: courses.map(({ _id, __v, ...c }) => ({
      id: _id,
      ...c,
      taskCounts: byCourse[String(_id)] || { pending: 0, completed: 0 },
    })),
  });
}

// GET /api/courses/:id
async function getCourse(req, res) {
  res.json({ course: await findOwnCourse(req) });
}

// POST /api/courses
async function createCourse(req, res) {
  const data = validateCourse(req.body);
  const course = await Course.create({ ...data, owner: req.user.id });
  res.status(201).json({ course });
}

// PATCH /api/courses/:id
async function updateCourse(req, res) {
  const course = await findOwnCourse(req);
  const data = validateCourse(req.body, { partial: true });
  course.set(data);
  await course.save();
  res.json({ course });
}

// DELETE /api/courses/:id
// Tasks in the course are kept, but no longer linked to a course.
async function deleteCourse(req, res) {
  const course = await findOwnCourse(req);
  await Task.updateMany({ owner: req.user.id, course: course._id }, { $set: { course: null } });
  await course.deleteOne();
  res.status(204).end();
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };
