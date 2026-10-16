import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskItem from '../components/TaskItem';
import { EmptyState, ErrorNotice, Loading } from '../components/States';
import { ChecklistIllustration, SproutIllustration } from '../components/Illustrations';
import { PlusIcon } from '../components/Icons';
import { dueGroup, greeting } from '../utils/dates';

const GROUP_ORDER = ['Overdue', 'Today', 'This week', 'Later', 'Someday'];

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    return api
      .getSummary()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(task) {
    try {
      await api.updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
      toast(`Marked "${task.title}" as done`);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const firstName = user.name.split(' ')[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="page__sub">{today}</p>
        </div>
        <Link to="/tasks?new=1" className="btn btn--primary">
          <PlusIcon />
          Add task
        </Link>
      </header>

      {error && <ErrorNotice message={error} onRetry={load} />}
      {!data && !error && <Loading label="Loading your week" />}
      {data && <DashboardBody data={data} onToggle={toggle} />}
    </div>
  );
}

function DashboardBody({ data, onToggle }) {
  const { summary, upcoming } = data;

  if (summary.total === 0) {
    return (
      <EmptyState
        illustration={<ChecklistIllustration />}
        title="Your list is empty"
        action={
          <div className="empty__actions">
            <Link to="/courses?new=1" className="btn btn--quiet">
              Add a course
            </Link>
            <Link to="/tasks?new=1" className="btn btn--primary">
              Add your first task
            </Link>
          </div>
        }
      >
        Start by adding the courses you're taking this term, then add the first thing you need to work on. A title is all a task
        needs; due dates and priority are optional.
      </EmptyState>
    );
  }

  const pct = Math.round((summary.completed / summary.total) * 100);
  const groups = GROUP_ORDER.map((name) => ({ name, tasks: upcoming.filter((t) => dueGroup(t.dueDate) === name) })).filter(
    (g) => g.tasks.length
  );

  return (
    <>
      <section className="progress" aria-labelledby="progress-title">
        <h2 id="progress-title" className="visually-hidden">
          Progress
        </h2>
        <dl className="tally">
          <div>
            <dt>To do</dt>
            <dd>{summary.pending}</dd>
          </div>
          <div>
            <dt>Done</dt>
            <dd>{summary.completed}</dd>
          </div>
          {summary.overdue > 0 && (
            <div className="tally--late">
              <dt>Overdue</dt>
              <dd>{summary.overdue}</dd>
            </div>
          )}
        </dl>
        <div className="bar" role="img" aria-label={`${summary.completed} of ${summary.total} tasks done`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="progress__caption">
          {summary.completed} of {summary.total} tasks done
        </p>
      </section>

      <section aria-labelledby="upcoming-title" className="upcoming">
        <div className="section-head">
          <h2 id="upcoming-title">Coming up</h2>
          <Link to="/tasks">See all tasks</Link>
        </div>

        {summary.pending === 0 ? (
          <EmptyState illustration={<SproutIllustration />} title="All caught up">
            Every task is done. Add the next thing when it comes in.
          </EmptyState>
        ) : (
          groups.map((g) => (
            <div key={g.name} className="group">
              <h3 className={`group__title group__title--${g.name.toLowerCase().replace(' ', '-')}`}>{g.name}</h3>
              <ul className="task-list">
                {g.tasks.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={onToggle} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
