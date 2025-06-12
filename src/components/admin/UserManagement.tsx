import React, { useState, useMemo } from 'react';
import { useAdminData, User } from '@/hooks/useAdminData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { UserDetailsModal } from './UserDetailsModal';

export const UserManagement: React.FC = () => {
  const { users, refresh: refreshAdminData } = useAdminData();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: 'email', direction: 'asc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let result = [...users];

    if (filter) {
      result = result.filter(user =>
        user.email?.toLowerCase().includes(filter.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
        user.business_name?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const aVal = a[sort.key as keyof typeof a] || '';
      const bVal = b[sort.key as keyof typeof b] || '';
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, filter, sort]);
  
  const handleSort = (key: string) => {
    if (sort.key === key) {
      setSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, direction: 'asc' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500">View, search, and manage all users on the platform.</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <Input
          placeholder="Filter by email, name, or business..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Email <ArrowUpDown className="w-4 h-4 inline-block ml-1" />
              </TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Roles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredUsers.map((user) => (
              <TableRow key={user.id} onClick={() => handleOpenModal(user)} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.business_name || 'N/A'}</TableCell>
                <TableCell>{user.roles?.join(', ') || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserUpdate={refreshAdminData}
      />
    </div>
  );
}; 