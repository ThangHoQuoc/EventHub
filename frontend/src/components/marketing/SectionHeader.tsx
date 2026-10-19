import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; to: string };
};

export function SectionHeader({ action, description, eyebrow, title }: SectionHeaderProps) {
  return (
    <header className="ev-section-header">
      <div>
        {eyebrow ? <span className="ev-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <Link to={action.to}>{action.label}<LineIcon name="arrow-right" /></Link> : null}
    </header>
  );
}
