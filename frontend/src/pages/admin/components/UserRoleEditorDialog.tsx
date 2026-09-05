import React, { useState, useEffect } from 'react';
import { AdminUser, Role, UserStatus } from '@/types';
import { showToast } from '@/stores/toast.store';

interface UserRoleEditorDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<AdminUser>) => void;
}

export function UserRoleEditorDialog({
  isOpen,
  user,
  onClose,
  onSave,
}: UserRoleEditorDialogProps) {
  const [role, setRole] = useState<Role>('SALES_REP');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setDepartment(user.department || '');
      setPhone(user.phone || '');
      setStatus(user.status);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, {
      role,
      department: department.trim(),
      phone: phone.trim(),
      status,
    });
    onClose();
    showToast(`User ${user.name} permissions updated`, 'green');
  };

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <div className="modal-title">Edit User: {user.name}</div>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground">Account Email</div>
              <div className="font-mono text-xs font-semibold text-foreground mt-0.5">
                {user.email}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Assigned Role</label>
              <select
                className="field-input text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="SALES_REP">Sales Representative</option>
                <option value="SALES_MANAGER">Sales Operations Manager</option>
                <option value="FINANCE">Finance Director / Controller</option>
                <option value="WAREHOUSE_OPS">Warehouse & Logistics Operations</option>
                <option value="ADMIN">System Administrator</option>
                <option value="CUSTOMER">External Customer Portal Contact</option>
              </select>
              <span className="text-[11px] text-muted-foreground mt-1">
                Roles control access to discount authorizations, warehouse dispatch, and invoice creation.
              </span>
            </div>

            <div className="field-group">
              <label className="field-label">Department / Unit</label>
              <input
                type="text"
                className="field-input text-sm"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Mid-Market Sales"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Contact Phone</label>
              <input
                type="text"
                className="field-input text-sm font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Account Status</label>
              <select
                className="field-input text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / On Leave</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save User Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
