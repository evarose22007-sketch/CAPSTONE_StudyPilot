import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import CourseForm from '../components/CourseForm';
import Modal, { ConfirmDialog } from '../components/Modal';
import { EmptyState, ErrorNotice, Loading } from '../components/States';
import { BooksIllustration } from '../components/Illustrations';
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons';

export default function CoursesPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (params.get('new')) {
      setEditing({});
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const load = useCallback(() => {
    setError('');
    return api
      .listCourses()
      .then(({ courses }) => setCourses(courses))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(values) {
    if (editing?.id) {
      await api.updateCourse(editing.id, values);
      toast('Course saved');
    } else {
      await api.createCourse(values);
      toast('Course added');
    }
    setEditing(null);
    await load();
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteCourse(deleting.id);
      toast('Course deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Courses</h1>
          {courses && courses.length > 0 && (
            <p className="page__sub">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} this term
            </p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
          <PlusIcon />
          Add course
        </button>
      </header>

      {error && <ErrorNotice message={error} onRetry={load} />}
      {!courses && !error && <Loading label="Loading courses" />}

      {courses && courses.length === 0 && (
        <EmptyState
          illustration={<BooksIllustration />}
          title="No courses yet"
          action={
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              Add your first course
            </button>
          }
        >
          Add the units you're taking so you can group tasks by course and filter your list.
        </EmptyState>
      )}

      {courses && courses.length > 0 && (
        <ul className="course-list">
          {courses.map((c) => {
            const total = c.taskCounts.pending + c.taskCounts.completed;
            return (
              <li key={c.id} className="course">
                <div className="course__body">
                  {c.code && <p className="course__code">{c.code}</p>}
                  <h2 className="course__name">{c.name}</h2>
                  <p className="course__count">
                    {total === 0
                      ? 'No tasks yet'
                      : `${c.taskCounts.completed} of ${total} ${total === 1 ? 'task' : 'tasks'} done`}
                  </p>
                  {total > 0 && (
                    <div className="bar bar--thin" aria-hidden="true">
                      <span style={{ width: `${(c.taskCounts.completed / total) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="course__actions">
                  <Link to={`/tasks?course=${c.id}`} className="btn btn--quiet btn--small">
                    View tasks
                  </Link>
                  <button type="button" className="icon-btn" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => setDeleting(c)}
                    aria-label={`Delete ${c.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit course' : 'Add a course'} onClose={() => setEditing(null)} size="sm">
        {editing && (
          <CourseForm
            key={editing.id || 'new'}
            course={editing.id ? editing : null}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this course?"
        message={deleting ? `"${deleting.name}" will be deleted. Its tasks stay in your list, without a course.` : ''}
        confirmLabel="Delete course"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
