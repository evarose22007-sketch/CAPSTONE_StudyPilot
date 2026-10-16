import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import Modal, { ConfirmDialog } from '../components/Modal';
import { EmptyState, ErrorNotice, Loading } from '../components/States';
import { ChecklistIllustration } from '../components/Illustrations';
import { PlusIcon } from '../components/Icons';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'To do' },
  { value: 'completed', label: 'Done' },
];

export default function TasksPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const course = params.get('course') || '';
  const sort = params.get('sort') || 'dueDate';

  const [tasks, setTasks] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new task, task = edit
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Open the add form when arriving from "Add task" elsewhere (?new=1).
  useEffect(() => {
    if (params.get('new')) {
      setEditing({});
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const load = useCallback(() => {
    setError('');
    return api
      .listTasks({ status, course, sort })
      .then(({ tasks }) => setTasks(tasks))
      .catch((err) => setError(err.message));
  }, [status, course, sort]);

  useEffect(() => {
    setTasks(null);
    load();
  }, [load]);

  useEffect(() => {
    api
      .listCourses()
      .then(({ courses }) => setCourses(courses))
      .catch(() => {});
  }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  async function save(values) {
    if (editing?.id) {
      await api.updateTask(editing.id, values);
      toast('Task saved');
    } else {
      await api.createTask(values);
      toast('Task added');
    }
    setEditing(null);
    await load();
  }

  async function toggle(task) {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      toast(nextStatus === 'completed' ? `Marked "${task.title}" as done` : `Moved "${task.title}" back to to-do`);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteTask(deleting.id);
      toast('Task deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const filtered = Boolean(status || course);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Tasks</h1>
          {tasks && (
            <p className="page__sub">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              {filtered ? ' match these filters' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
          <PlusIcon />
          Add task
        </button>
      </header>

      <div className="filters" role="group" aria-label="Filter and sort tasks">
        <fieldset className="segmented-field">
          <legend className="visually-hidden">Status</legend>
          <div className="segmented">
            {STATUS_OPTIONS.map((o) => (
              <label key={o.value || 'all'} className="segmented__option">
                <input type="radio" name="status" value={o.value} checked={status === o.value} onChange={() => setFilter('status', o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="inline-select">
          <span>Course</span>
          <select value={course} onChange={(e) => setFilter('course', e.target.value)}>
            <option value="">All courses</option>
            <option value="none">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code || c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-select">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setFilter('sort', e.target.value === 'dueDate' ? '' : e.target.value)}>
            <option value="dueDate">Due soonest</option>
            <option value="-dueDate">Due latest</option>
            <option value="newest">Recently added</option>
          </select>
        </label>
      </div>

      {error && <ErrorNotice message={error} onRetry={load} />}
      {!tasks && !error && <Loading label="Loading tasks" />}

      {tasks && tasks.length === 0 && !filtered && (
        <EmptyState
          illustration={<ChecklistIllustration />}
          title="No tasks yet"
          action={
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              Add your first task
            </button>
          }
        >
          Add anything you need to work on: readings, problem sets, revision. Link it to a course to keep things grouped.
        </EmptyState>
      )}

      {tasks && tasks.length === 0 && filtered && (
        <div className="notice">
          <p>No tasks match these filters.</p>
          <button type="button" className="btn btn--quiet btn--small" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <ul className="task-list task-list--sheet">
          {tasks.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit task' : 'Add a task'} onClose={() => setEditing(null)}>
        {editing && (
          <TaskForm
            key={editing.id || 'new'}
            task={editing.id ? editing : null}
            courses={courses}
            defaultCourse={course && course !== 'none' ? course : ''}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this task?"
        message={deleting ? `"${deleting.title}" will be removed for good.` : ''}
        confirmLabel="Delete task"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
