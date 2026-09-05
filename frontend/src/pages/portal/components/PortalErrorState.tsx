import React from 'react';
import { ShieldAlert, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalErrorStateProps {
  message?: string;
}

export function PortalErrorState({
  message = 'The quotation link you accessed is invalid, expired, or has been revoked.',
}: PortalErrorStateProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center max-w-lg mx-auto shadow-xl space-y-5 backdrop-blur mt-12">
      <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <ShieldAlert className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Quotation Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <HelpCircle className="h-4 w-4 text-blue-400" />
          <span>Security & Access Notice</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Customer portal links are cryptographically protected and bound to unique customer sessions. If you believe this is an error, please verify that you copied the complete link or request a new invitation from your sales representative.
        </p>
      </div>

      <div className="pt-2">
        <a
          href="mailto:support@dealflow360.com"
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Contact Customer Operations Support
        </a>
      </div>
    </div>
  );
}
