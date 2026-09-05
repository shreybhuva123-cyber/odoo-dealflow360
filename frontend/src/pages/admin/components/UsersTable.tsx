import React from 'react';
import { AdminUser } from '@/types';

interface UsersTableProps {
  users: AdminUser[];
  onToggleStatus: (id: string) => void;
  onEdit: (user: AdminUser) => void;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  onToggleStatus,
  onEdit,
  isLoading,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading system users...
      </div>
    );
  }

  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-purple text-xs font-semibold">Admin</span>;
      case 'SALES_MANAGER':
        return <span className="badge badge-blue text-xs font-semibold">Sales Manager</span>;
      case 'SALES_REP':
        return <span className="badge badge-gray text-xs font-semibold">Sales Rep</span>;
      case 'FINANCE':
        return <span className="badge badge-green text-xs font-semibold">Finance Director</span>;
      case 'WAREHOUSE_OPS':
        return <span className="badge badge-amber text-xs font-semibold">Warehouse Ops</span>;
      case 'CUSTOMER':
        return <span className="badge badge-gray text-xs">Customer Portal</span>;
      default:
        return <span className="badge badge-gray text-xs">{role}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Last Active</th>
              <th>Account Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        {u.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td>{getRoleBadge(u.role)}</td>

                <td className="text-xs text-muted-foreground">{u.department}</td>

                <td className="text-xs text-muted-foreground font-mono">
                  {u.phone || '—'}
                </td>

                <td className="text-xs text-muted-foreground">
                  {u.lastLoginAt ? (
                    new Date(u.lastLoginAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  ) : (
                    <span className="text-muted-foreground/60 italic">Never logged in</span>
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(u.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                  </button>
                </td>

                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-xs"
                    onClick={() => onEdit(u)}
                  >
                    Edit User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
