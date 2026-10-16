const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const c = require('../controllers/courseController');

const router = Router();
router.use(requireAuth);

router.route('/').get(c.listCourses).post(c.createCourse);
router.route('/:id').get(c.getCourse).patch(c.updateCourse).delete(c.deleteCourse);

module.exports = router;
