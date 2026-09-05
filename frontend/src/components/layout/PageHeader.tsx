import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, badge, actions, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
