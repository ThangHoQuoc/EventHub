import { LineIcon, type LineIconName } from "../ui/LineIcon";

type AuthIconProps = {
  name: LineIconName;
};

export function AuthIcon({ name }: AuthIconProps) {
  return <LineIcon className="eh-auth-icon" name={name} />;
}
