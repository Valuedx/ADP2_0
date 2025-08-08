import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const AdminAnalytics = ({ userReport }) => {
  const userTypeData = [
    { name: 'Default Users', value: userReport?.statistics?.usersByType?.default || 0 },
    { name: 'Power Users', value: userReport?.statistics?.usersByType?.power || 0 },
    { name: 'Admin Users', value: userReport?.statistics?.usersByType?.admin || 0 }
  ];

  const usageData = [
    { name: 'Active Users', value: userReport?.statistics?.activeUsers || 0 },
    { name: 'At Limit', value: userReport?.statistics?.usersAtLimit || 0 },
    { name: 'Near Limit', value: userReport?.statistics?.usersNearLimit || 0 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart width={300} height={200}>
            <Pie dataKey="value" data={userTypeData} fill="#8884d8" />
            <Tooltip />
          </PieChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={300} height={200} data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
