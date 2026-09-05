import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Settings, HelpCircle, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function UserMenu() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <DropdownMenu
        trigger={
          <div className="flex items-center gap-2 pl-1 cursor-pointer rounded-md p-1 hover:bg-secondary/60 transition-colors">
            <Avatar src={user?.avatarUrl} name={user?.name || 'User'} size="default" />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {role?.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
          </div>
        }
      >
        <div className="p-2 border-b border-border/40">
          <p className="text-xs font-bold text-foreground">{user?.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" size="sm" className="text-[9px] py-0 px-1 font-mono text-primary border-primary/30">
              {role?.replace('_', ' ')}
            </Badge>
            <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>

        <DropdownMenuItem onClick={() => setProfileModalOpen(true)} className="gap-2 py-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreferencesModalOpen(true)} className="gap-2 py-2">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setHelpModalOpen(true)} className="gap-2 py-2">
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          Help & Documentation
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="gap-2 py-2 text-rose-400 hover:text-rose-300">
          <LogOut className="h-3.5 w-3.5" />
          🚪 Logout
        </DropdownMenuItem>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        title="User Profile"
        description="Your DealFlow360 account profile and security role."
      >
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-secondary/40 space-y-1">
            <p><strong className="text-foreground">Name:</strong> {user?.name}</p>
            <p><strong className="text-foreground">Email:</strong> {user?.email}</p>
            <p><strong className="text-foreground">Role:</strong> {role}</p>
            <p><strong className="text-foreground">Department:</strong> {user?.department || 'Sales Operations'}</p>
          </div>
          <Button onClick={() => setProfileModalOpen(false)} size="sm" className="w-full">
            Close
          </Button>
        </div>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog
        open={preferencesModalOpen}
        onOpenChange={setPreferencesModalOpen}
        title="Application Preferences"
        description="Configure notifications, table pagination, and default workspace currency."
      >
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-secondary/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-foreground">Default Currency:</span>
              <span className="font-mono text-primary font-semibold">USD ($)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground">Audio Notifications:</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground">Auto-Refresh Interval:</span>
              <span className="font-mono text-foreground">30s</span>
            </div>
          </div>
          <Button onClick={() => setPreferencesModalOpen(false)} size="sm" className="w-full">
            Save Preferences
          </Button>
        </div>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
        title="Help & DealFlow360 Knowledgebase"
        description="Assistance for discount matrices, Odoo connectors, and deal approvals."
      >
        <div className="space-y-3 text-xs text-muted-foreground">
          <p>
            Need help navigating quotation rules or configuring multi-tier discount approval limits? Check our live documentation in <code className="text-primary font-mono font-bold">info.md</code>.
          </p>
          <Button onClick={() => setHelpModalOpen(false)} size="sm" className="w-full">
            Got it
          </Button>
        </div>
      </Dialog>
    </>
  );
}
