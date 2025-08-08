import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import UserTypeIndicator from '@/shared/components/UserTypeIndicator';
import UsageBadge from '@/shared/components/UsageBadge';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

interface User {
  id: string;
  username: string;
  userType: string;
  documentsProcessed: number;
  maxDocumentsAllowed: number;
  lastDocumentProcessed: string;
}

interface Props {
  users: User[];
  onUserUpdate: () => void;
}

const UserManagementTable = ({ users, onUserUpdate }: Props) => {
  const { handleError } = useErrorHandler();
  const handleUserTypeChange = async (userId: string, newType: string) => {
    try {
      await apiService.manageUser(userId, 'change_type', { new_type: newType });
      toast.success(`User type updated to ${newType}`);
      onUserUpdate();
    } catch (error) {
      handleError(error, 'Failed to update user type');
    }
  };

  const handleResetUsage = async (userId: string) => {
    try {
      await apiService.manageUser(userId, 'reset_usage');
      toast.success('Usage reset successfully');
      onUserUpdate();
    } catch (error) {
      handleError(error, 'Failed to reset usage');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <UserTypeIndicator userType={user.userType} />
                </TableCell>
                <TableCell>
                  <UsageBadge
                    current={user.documentsProcessed}
                    max={user.maxDocumentsAllowed}
                    userType={user.userType}
                  />
                </TableCell>
                <TableCell>{user.lastDocumentProcessed}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleUserTypeChange(user.id, 'power')}
                      >
                        Promote to Power User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUserTypeChange(user.id, 'default')}
                      >
                        Demote to Default
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleResetUsage(user.id)}
                      >
                        Reset Usage
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;
