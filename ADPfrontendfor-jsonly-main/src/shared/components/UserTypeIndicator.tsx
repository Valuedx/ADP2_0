interface Props {
  userType: 'default' | 'power' | 'admin' | null;
  documentsProcessed?: number;
  maxDocuments?: number;
}

const UserTypeIndicator = ({ userType, documentsProcessed = 0, maxDocuments = 0 }: Props) => {
  const getTypeConfig = (type: string | null) => {
    switch (type) {
      case 'default':
        return {
          label: 'Customer',
          color: 'bg-green-100 text-green-800',
          icon: '🟢',
          limits: `${documentsProcessed}/${maxDocuments} documents`,
        };
      case 'power':
        return {
          label: 'Power User',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '🟡',
          limits: 'Unlimited documents',
        };
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-red-100 text-red-800',
          icon: '🔴',
          limits: 'Full access',
        };
      default:
        return { label: '', color: '', icon: '', limits: '' };
    }
  };

  const config = getTypeConfig(userType);

  return (
    <span className={`px-2 py-1 rounded text-xs ${config.color}`}> {config.icon} {config.label} {config.limits}</span>
  );
};

export default UserTypeIndicator;
