import React, { useState } from 'react';
import { Role } from '@/types';
import { showToast } from '@/stores/toast.store';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function CreateUserDialog({
  isOpen,
  onClose,
  onSave,
}: CreateUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('SALES_REP');
  const [department, setDepartment] = useState('Commercial Sales');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'amber');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: department.trim(),
      phone: phone.trim(),
      status: 'ACTIVE',
    });

    onClose();
    setName('');
    setEmail('');
  };

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <div className="modal-title">Provision New User</div>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body space-y-4">
            <div className="field-group">
              <label className="field-label">Full Name *</label>
              <input
                type="text"
                className="field-input text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Email Address *</label>
              <input
                type="email"
                className="field-input text-sm font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rachel.adams@dealflow360.com"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Assigned Role *</label>
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
                <option value="CUSTOMER">Customer Portal Contact</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Department / Unit</label>
              <input
                type="text"
                className="field-input text-sm"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Enterprise Sales"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <input
                type="text"
                className="field-input text-sm font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
