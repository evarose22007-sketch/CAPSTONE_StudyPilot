import { useId } from 'react';

/**
 * Labelled form control with an optional hint and error message.
 * Errors are linked with aria-describedby so screen readers announce them.
 * `as` can be 'input' (default), 'textarea' or 'select'.
 */
export default function Field({ label, error, hint, as: Tag = 'input', optional, children, ...props }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <Tag
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
