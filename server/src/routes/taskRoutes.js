const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const t = require('../controllers/taskController');

const router = Router();
router.use(requireAuth);

router.get('/summary', t.getSummary); // must come before '/:id'
router.route('/').get(t.listTasks).post(t.createTask);
router.route('/:id').get(t.getTask).patch(t.updateTask).delete(t.deleteTask);

module.exports = router;
