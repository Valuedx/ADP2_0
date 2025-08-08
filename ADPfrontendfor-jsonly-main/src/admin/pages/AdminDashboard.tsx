import { useEffect, useState } from 'react';
import { StatCard } from '@/admin/components/StatCard';
import UserManagementTable from '@/admin/components/UserManagementTable';
import AdminAnalytics from '@/admin/components/AdminAnalytics';
import { handleError } from '@/shared/utils';
import { apiService } from '@/services/apiService';

const AdminDashboard = () => {
  const [userReport, setUserReport] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReport();
  }, []);

  const fetchUserReport = async () => {
    try {
      const data = await apiService.getUserReport();
      setUserReport(data);
    } catch (error) {
      handleError(error, 'Failed to fetch user report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={userReport?.statistics?.totalUsers}
          breakdown={userReport?.statistics?.usersByType}
        />
        <StatCard
          title="Users at Limit"
          value={userReport?.statistics?.usersAtLimit}
          color="red"
        />
        <StatCard
          title="Active This Month"
          value={userReport?.statistics?.activeUsers}
          color="green"
        />
      </div>

      <AdminAnalytics userReport={userReport} />

      {/* User Management Table */}
      <UserManagementTable
        users={userReport?.users}
        onUserUpdate={fetchUserReport}
      />
    </div>
  );
};

export default AdminDashboard;
