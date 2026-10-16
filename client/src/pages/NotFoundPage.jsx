import { Link } from 'react-router';
import { MapIllustration } from '../components/Illustrations';
import { EmptyState } from '../components/States';

export default function NotFoundPage() {
  return (
    <div className="full-page-center">
      <EmptyState
        illustration={<MapIllustration />}
        title="This page isn't here"
        action={
          <Link to="/" className="btn btn--primary">
            Go to your dashboard
          </Link>
        }
      >
        The link may be mistyped, or the page may have moved. If you followed a link to a task or course, it may belong to a
        different account.
      </EmptyState>
    </div>
  );
}
