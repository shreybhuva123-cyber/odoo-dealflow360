import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminUsers,
  useToggleUserStatus,
  useUpdateAdminUser,
  useCreateAdminUser,
} from '@/hooks/useAdmin';
import { AdminUser, Role } from '@/types';
import {
  UsersTable,
  UserRoleEditorDialog,
  CreateUserDialog,
} from './components';

export function UsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const toggleStatus = useToggleUserStatus();
  const updateUser = useUpdateAdminUser();
  const createUser = useCreateAdminUser();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (id: string, updates: Partial<AdminUser>) => {
    updateUser.mutate({ id, updates });
  };

  const handleSaveCreate = (data: any) => {
    createUser.mutate(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <span>Users</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Workspace User Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage employee access, role designations, status toggles, and authentication permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/roles"
            className="btn btn-ghost btn-sm text-xs"
          >
            Role Permissions →
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
            onClick={() => setIsCreateOpen(true)}
          >
            <span>+ Provision User</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              className="field-input w-full pl-9 text-sm"
              placeholder="Search users by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
              🔍
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2 text-muted-foreground text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="field-input text-xs py-1.5 px-3 min-w-[140px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="SALES_REP">Sales Rep</option>
              <option value="FINANCE">Finance</option>
              <option value="WAREHOUSE_OPS">Warehouse Ops</option>
              <option value="CUSTOMER">Customer Portal</option>
            </select>

            <select
              className="field-input text-xs py-1.5 px-3 min-w-[110px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onToggleStatus={(id) => toggleStatus.mutate(id)}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      {/* Dialogs */}
      <UserRoleEditorDialog
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />

      <CreateUserDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveCreate}
      />
    </div>
  );
}
