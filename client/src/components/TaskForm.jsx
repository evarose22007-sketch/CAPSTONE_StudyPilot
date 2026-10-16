import { useState } from 'react';
import Field from './Field';
import { toDateInput } from '../utils/dates';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

/**
 * Add/edit form for a task. `onSubmit` receives the cleaned values and may throw
 * an ApiError whose `details` are shown next to the matching fields.
 */
export default function TaskForm({ task, courses, defaultCourse = '', onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    dueDate: toDateInput(task?.dueDate),
    course: task?.course?.id ?? defaultCourse,
    priority: task?.priority ?? 'medium',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.title.trim()) {
      setErrors({ title: 'Give the task a title.' });
      e.currentTarget.querySelector('input')?.focus();
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        dueDate: values.dueDate || null,
        course: values.course || null,
      });
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.details && Object.keys(err.details).length ? '' : err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      {formError && (
        <p className="notice notice--error" role="alert">
          {formError}
        </p>
      )}

      <Field
        label="Title"
        value={values.title}
        onChange={set('title')}
        error={errors.title}
        maxLength={120}
        placeholder="e.g. Finish problem set 3"
        autoFocus
        required
      />

      <Field
        as="textarea"
        label="Notes"
        optional
        rows={3}
        value={values.description}
        onChange={set('description')}
        error={errors.description}
        maxLength={1000}
      />

      <div className="form-row">
        <Field label="Due date" optional type="date" value={values.dueDate} onChange={set('dueDate')} error={errors.dueDate} />
        <Field as="select" label="Course" optional value={values.course} onChange={set('course')} error={errors.course}>
          <option value="">No course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code ? `${c.code} ${c.name}` : c.name}
            </option>
          ))}
        </Field>
      </div>

      <fieldset className="segmented-field">
        <legend>Priority</legend>
        <div className="segmented">
          {PRIORITIES.map((p) => (
            <label key={p.value} className={`segmented__option priority-${p.value}`}>
              <input type="radio" name="priority" value={p.value} checked={values.priority === p.value} onChange={set('priority')} />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
