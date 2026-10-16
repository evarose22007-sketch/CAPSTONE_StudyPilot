import { useState } from 'react';
import { dueGroup, formatDate, relativeDue } from '../utils/dates';
import { CheckIcon, EditIcon, TrashIcon } from './Icons';

/** One task row: tick box, title, course / due / priority, and edit + delete actions. */
export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [busy, setBusy] = useState(false);
  const done = task.status === 'completed';
  const late = !done && dueGroup(task.dueDate) === 'Overdue';

  async function toggle() {
    setBusy(true);
    try {
      await onToggle(task);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`task${done ? ' task--done' : ''}`}>
      <label className="tick">
        <input
          type="checkbox"
          checked={done}
          onChange={toggle}
          disabled={busy}
          aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        />
        <span className="tick__box" aria-hidden="true">
          <CheckIcon />
        </span>
      </label>

      <div className="task__body">
        <p className="task__title">{task.title}</p>
        {task.description && <p className="task__desc">{task.description}</p>}
        <p className="task__meta">
          {task.course && <span className="chip">{task.course.code || task.course.name}</span>}
          {task.dueDate && done && (
            <span className="due">
              <span className="visually-hidden">Was due </span>
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.dueDate && !done && (
            <span className={`due${late ? ' due--late' : ''}${relativeDue(task.dueDate) === 'Today' ? ' due--today' : ''}`}>
              <span className="visually-hidden">Due </span>
              {relativeDue(task.dueDate)}
            </span>
          )}
          {!done && task.priority !== 'medium' && (
            <span className={`priority priority--${task.priority}`}>
              {task.priority === 'high' ? 'High priority' : 'Low priority'}
            </span>
          )}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="task__actions">
          {onEdit && (
            <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label={`Edit "${task.title}"`}>
              <EditIcon />
            </button>
          )}
          {onDelete && (
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => onDelete(task)} aria-label={`Delete "${task.title}"`}>
              <TrashIcon />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
