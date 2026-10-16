const mongoose = require('mongoose');
const Task = require('../models/Task');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const { validateTask, isObjectId, STATUSES } = require('../utils/validate');

const COURSE_FIELDS = 'name code';

async function findOwnTask(req) {
  const { id } = req.params;
  if (!isObjectId(id)) throw ApiError.notFound('Task not found.');
  const task = await Task.findOne({ _id: id, owner: req.user.id });
  if (!task) throw ApiError.notFound('Task not found.');
  return task;
}

/** A task may only be linked to a course the same user owns. */
async function assertOwnCourse(req, courseId) {
  if (!courseId) return;
  const ok = await Course.exists({ _id: courseId, owner: req.user.id });
  if (!ok) throw ApiError.badRequest('Please check the highlighted fields.', { course: 'Choose one of your courses.' });
}

/** Due date ascending, tasks without a due date last; newest first as a tie-breaker. */
function byDueDate(direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1;
  return (a, b) => {
    if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return sign * (a.dueDate - b.dueDate) || b.createdAt - a.createdAt;
  };
}

// GET /api/tasks?status=pending|completed&course=<id>|none&sort=dueDate|-dueDate|newest
async function listTasks(req, res) {
  const { status, course, sort = 'dueDate' } = req.query;
  const filter = { owner: req.user.id };

  if (status) {
    if (!STATUSES.includes(status)) throw ApiError.badRequest('Status filter must be pending or completed.');
    filter.status = status;
  }
  if (course) {
    if (course === 'none') filter.course = null;
    else if (!isObjectId(course)) throw ApiError.badRequest('Course filter is not valid.');
    else filter.course = course;
  }

  const tasks = await Task.find(filter).populate('course', COURSE_FIELDS);
  const order = sort === 'newest' ? (a, b) => b.createdAt - a.createdAt : byDueDate(sort === '-dueDate' ? 'desc' : 'asc');
  // In the "all" view, finished work sinks below what is still to do.
  const pendingFirst = (a, b) => (a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1);
  tasks.sort((a, b) => pendingFirst(a, b) || order(a, b));

  res.json({ tasks });
}

// GET /api/tasks/summary?today=YYYY-MM-DD — numbers and upcoming work for the dashboard.
// Due dates are stored as calendar days (midnight UTC), so "overdue" is judged against
// the student's own date, which the client sends as `today`.
async function getSummary(req, res) {
  const owner = new mongoose.Types.ObjectId(req.user.id);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.query.today || '') ? req.query.today : new Date().toISOString().slice(0, 10);
  const startOfToday = new Date(`${today}T00:00:00.000Z`);

  const [counts, pendingTasks] = await Promise.all([
    Task.aggregate([{ $match: { owner } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Task.find({ owner, status: 'pending' }).populate('course', COURSE_FIELDS),
  ]);

  const totals = { pending: 0, completed: 0 };
  for (const { _id, n } of counts) totals[_id] = n;

  pendingTasks.sort(byDueDate('asc'));
  const overdue = pendingTasks.filter((t) => t.dueDate && t.dueDate < startOfToday).length;

  res.json({
    summary: {
      total: totals.pending + totals.completed,
      pending: totals.pending,
      completed: totals.completed,
      overdue,
    },
    upcoming: pendingTasks.slice(0, 6),
  });
}

// GET /api/tasks/:id
async function getTask(req, res) {
  const task = await findOwnTask(req);
  await task.populate('course', COURSE_FIELDS);
  res.json({ task });
}

// POST /api/tasks
async function createTask(req, res) {
  const data = validateTask(req.body);
  await assertOwnCourse(req, data.course);
  if (data.status === 'completed') data.completedAt = new Date();

  const task = await Task.create({ ...data, owner: req.user.id });
  await task.populate('course', COURSE_FIELDS);
  res.status(201).json({ task });
}

// PATCH /api/tasks/:id — also used to mark a task complete: { status: "completed" }
async function updateTask(req, res) {
  const task = await findOwnTask(req);
  const data = validateTask(req.body, { partial: true });
  await assertOwnCourse(req, data.course);

  if (data.status && data.status !== task.status) {
    data.completedAt = data.status === 'completed' ? new Date() : null;
  }

  task.set(data);
  await task.save();
  await task.populate('course', COURSE_FIELDS);
  res.json({ task });
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const task = await findOwnTask(req);
  await task.deleteOne();
  res.status(204).end();
}

module.exports = { listTasks, getSummary, getTask, createTask, updateTask, deleteTask };
