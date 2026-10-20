import { Link } from "react-router-dom";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <section className="empty-state" role="status">
      <span className="empty-icon">◇</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && actionTo ? (
        <Link className="btn btn-secondary" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
