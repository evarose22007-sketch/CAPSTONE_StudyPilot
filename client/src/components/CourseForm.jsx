import { useState } from 'react';
import Field from './Field';

export default function CourseForm({ course, onSubmit, onCancel }) {
  const [values, setValues] = useState({ name: course?.name ?? '', code: course?.code ?? '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.name.trim()) {
      setErrors({ name: 'Course name is required.' });
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit({ name: values.name.trim(), code: values.code.trim() });
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
        label="Course name"
        value={values.name}
        onChange={set('name')}
        error={errors.name}
        maxLength={80}
        placeholder="e.g. Algorithms and Data Structures"
        autoFocus
        required
      />
      <Field
        label="Course code"
        optional
        value={values.code}
        onChange={set('code')}
        error={errors.code}
        maxLength={20}
        placeholder="e.g. FIT2004"
      />
      <div className="form-actions">
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : course ? 'Save changes' : 'Add course'}
        </button>
      </div>
    </form>
  );
}
