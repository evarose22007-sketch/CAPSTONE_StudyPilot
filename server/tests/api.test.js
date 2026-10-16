/**
 * End-to-end API tests against a throwaway in-memory MongoDB.
 * Run with: npm test
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-only-for-tests';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('../src/app');

let mongo;
let app;

// Set MONGODB_TEST_URI to test against an existing MongoDB instead of the in-memory one.
// The database it points to is dropped at the end.
before(async () => {
  let uri = process.env.MONGODB_TEST_URI;
  if (!uri) {
    mongo = await MongoMemoryServer.create();
    uri = mongo.getUri();
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  app = createApp();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function registerUser(email, name = 'Test Student') {
  const res = await api().post('/api/auth/register').send({ name, email, password: 'password123' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.token;
}

describe('accounts', () => {
  test('registers, stores a hash (not the password), and returns a token', async () => {
    const res = await api().post('/api/auth/register').send({ name: 'Asha', email: 'Asha@Example.com', password: 'password123' });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'asha@example.com');
    assert.equal(res.body.user.passwordHash, undefined);

    const stored = await mongoose.connection.collection('users').findOne({ email: 'asha@example.com' });
    assert.notEqual(stored.passwordHash, 'password123');
    assert.match(stored.passwordHash, /^\$2[aby]\$/);
  });

  test('rejects invalid registration with field messages', async () => {
    const res = await api().post('/api/auth/register').send({ name: '', email: 'nope', password: 'short' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.name);
    assert.ok(res.body.error.details.email);
    assert.ok(res.body.error.details.password);
  });

  test('rejects a duplicate email', async () => {
    const res = await api().post('/api/auth/register').send({ name: 'Asha 2', email: 'asha@example.com', password: 'password123' });
    assert.equal(res.status, 409);
    assert.ok(res.body.error.details.email);
  });

  test('logs in with the right password and refuses the wrong one', async () => {
    const ok = await api().post('/api/auth/login').send({ email: 'asha@example.com', password: 'password123' });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);

    const bad = await api().post('/api/auth/login').send({ email: 'asha@example.com', password: 'wrongpass1' });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error.message, 'Email or password is incorrect.');
  });

  test('protected routes need a valid token', async () => {
    assert.equal((await api().get('/api/tasks')).status, 401);
    assert.equal((await api().get('/api/tasks').set(auth('garbage'))).status, 401);
  });
});

describe('courses and tasks journey', () => {
  let token;
  let courseId;
  let taskId;

  before(async () => {
    token = await registerUser('journey@example.com');
  });

  test('creates a course (name required)', async () => {
    const blank = await api().post('/api/courses').set(auth(token)).send({ name: '  ' });
    assert.equal(blank.status, 400);
    assert.ok(blank.body.error.details.name);

    const res = await api().post('/api/courses').set(auth(token)).send({ name: 'Algorithms', code: 'FIT2004' });
    assert.equal(res.status, 201);
    courseId = res.body.course.id;
  });

  test('a blank task title is not saved', async () => {
    const res = await api().post('/api/tasks').set(auth(token)).send({ title: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.details.title, 'Give the task a title.');
    const list = await api().get('/api/tasks').set(auth(token));
    assert.equal(list.body.tasks.length, 0);
  });

  test('rejects invalid priority and due date', async () => {
    const res = await api().post('/api/tasks').set(auth(token)).send({ title: 'x', priority: 'urgent', dueDate: 'not-a-date' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.priority);
    assert.ok(res.body.error.details.dueDate);
  });

  test('creates tasks linked to a course', async () => {
    const res = await api()
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Problem set 3', course: courseId, dueDate: '2030-03-10', priority: 'high' });
    assert.equal(res.status, 201);
    assert.equal(res.body.task.status, 'pending');
    assert.equal(res.body.task.course.name, 'Algorithms');
    taskId = res.body.task.id;

    await api().post('/api/tasks').set(auth(token)).send({ title: 'Read chapter 5', dueDate: '2030-03-01' });
    await api().post('/api/tasks').set(auth(token)).send({ title: 'No date task' });
  });

  test('lists tasks sorted by due date with undated tasks last', async () => {
    const res = await api().get('/api/tasks?sort=dueDate').set(auth(token));
    assert.deepEqual(res.body.tasks.map((t) => t.title), ['Read chapter 5', 'Problem set 3', 'No date task']);
  });

  test('filters by course and status', async () => {
    const byCourse = await api().get(`/api/tasks?course=${courseId}`).set(auth(token));
    assert.deepEqual(byCourse.body.tasks.map((t) => t.title), ['Problem set 3']);
    const noCourse = await api().get('/api/tasks?course=none').set(auth(token));
    assert.equal(noCourse.body.tasks.length, 2);
    const bad = await api().get('/api/tasks?status=done').set(auth(token));
    assert.equal(bad.status, 400);
  });

  test('marks a task complete and it stays complete', async () => {
    const res = await api().patch(`/api/tasks/${taskId}`).set(auth(token)).send({ status: 'completed' });
    assert.equal(res.status, 200);
    assert.equal(res.body.task.status, 'completed');
    assert.ok(res.body.task.completedAt);

    const again = await api().get(`/api/tasks/${taskId}`).set(auth(token));
    assert.equal(again.body.task.status, 'completed');

    const done = await api().get('/api/tasks?status=completed').set(auth(token));
    assert.equal(done.body.tasks.length, 1);
  });

  test('completed tasks are listed after pending ones', async () => {
    const res = await api().get('/api/tasks').set(auth(token));
    assert.deepEqual(res.body.tasks.map((t) => t.status), ['pending', 'pending', 'completed']);
  });

  test("overdue is judged against the student's date", async () => {
    const res = await api().get('/api/tasks/summary?today=2030-03-05').set(auth(token));
    assert.equal(res.body.summary.overdue, 1); // "Read chapter 5" was due 2030-03-01
  });

  test('task survives logging out and back in', async () => {
    const login = await api().post('/api/auth/login').send({ email: 'journey@example.com', password: 'password123' });
    const res = await api().get(`/api/tasks/${taskId}`).set(auth(login.body.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.task.title, 'Problem set 3');
  });

  test('dashboard summary counts pending and completed', async () => {
    const res = await api().get('/api/tasks/summary').set(auth(token));
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.summary, { total: 3, pending: 2, completed: 1, overdue: 0 });
    assert.equal(res.body.upcoming[0].title, 'Read chapter 5');
  });

  test('course list includes task counts', async () => {
    const res = await api().get('/api/courses').set(auth(token));
    assert.equal(res.body.courses.length, 1);
    assert.deepEqual(res.body.courses[0].taskCounts, { pending: 0, completed: 1 });
  });

  test('edits a course and a task', async () => {
    const c = await api().patch(`/api/courses/${courseId}`).set(auth(token)).send({ name: 'Algorithms & Data' });
    assert.equal(c.body.course.name, 'Algorithms & Data');
    const t = await api().patch(`/api/tasks/${taskId}`).set(auth(token)).send({ title: 'Problem set 3 (revised)', dueDate: null });
    assert.equal(t.body.task.title, 'Problem set 3 (revised)');
    assert.equal(t.body.task.dueDate, null);
  });

  test('deleting a course keeps its tasks but unlinks them', async () => {
    const del = await api().delete(`/api/courses/${courseId}`).set(auth(token));
    assert.equal(del.status, 204);
    const t = await api().get(`/api/tasks/${taskId}`).set(auth(token));
    assert.equal(t.body.task.course, null);
  });

  test('deletes a task', async () => {
    assert.equal((await api().delete(`/api/tasks/${taskId}`).set(auth(token))).status, 204);
    assert.equal((await api().get(`/api/tasks/${taskId}`).set(auth(token))).status, 404);
  });
});

describe('ownership', () => {
  let ownerToken;
  let intruderToken;
  let courseId;
  let taskId;

  before(async () => {
    ownerToken = await registerUser('owner@example.com');
    intruderToken = await registerUser('intruder@example.com');
    courseId = (await api().post('/api/courses').set(auth(ownerToken)).send({ name: 'Private course' })).body.course.id;
    taskId = (await api().post('/api/tasks').set(auth(ownerToken)).send({ title: 'Private task', course: courseId })).body.task.id;
  });

  test("another user can't see the records in lists", async () => {
    assert.equal((await api().get('/api/tasks').set(auth(intruderToken))).body.tasks.length, 0);
    assert.equal((await api().get('/api/courses').set(auth(intruderToken))).body.courses.length, 0);
  });

  test("another user can't read, change or delete a task", async () => {
    assert.equal((await api().get(`/api/tasks/${taskId}`).set(auth(intruderToken))).status, 404);
    assert.equal((await api().patch(`/api/tasks/${taskId}`).set(auth(intruderToken)).send({ status: 'completed' })).status, 404);
    assert.equal((await api().delete(`/api/tasks/${taskId}`).set(auth(intruderToken))).status, 404);
  });

  test("another user can't change or delete a course", async () => {
    assert.equal((await api().patch(`/api/courses/${courseId}`).set(auth(intruderToken)).send({ name: 'Hacked' })).status, 404);
    assert.equal((await api().delete(`/api/courses/${courseId}`).set(auth(intruderToken))).status, 404);
  });

  test("a task can't be attached to someone else's course", async () => {
    const res = await api().post('/api/tasks').set(auth(intruderToken)).send({ title: 'Sneaky', course: courseId });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.course);
  });

  test("the owner's records are unchanged", async () => {
    const t = await api().get(`/api/tasks/${taskId}`).set(auth(ownerToken));
    assert.equal(t.body.task.status, 'pending');
    const c = await api().get(`/api/courses/${courseId}`).set(auth(ownerToken));
    assert.equal(c.body.course.name, 'Private course');
  });
});

describe('errors', () => {
  test('unknown routes return a JSON 404', async () => {
    const res = await api().get('/api/nothing-here');
    assert.equal(res.status, 404);
    assert.ok(res.body.error.message);
  });

  test('malformed JSON returns 400', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.message, 'Request body must be valid JSON.');
  });
});
