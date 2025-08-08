interface Props {
  current: number;
  max: number | null;
  className?: string;
  userType?: string;
}

const UsageBadge = ({ current, max, className = '' }: Props) => (
  <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 ${className}`}>
    {current}/{max && max > 0 ? max : '∞'}
  </span>
);

export default UsageBadge;
