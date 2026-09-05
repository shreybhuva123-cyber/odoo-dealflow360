import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DealFlowDoodleBackground } from './DealFlowDoodleBackground';

export function CustomerPortalLayout() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Customer Header as specified: DealFlow360 ... Help */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">DealFlow360</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure Portal Session</span>
          </div>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>Help</span>
          </button>
        </div>
      </header>

      {/* Portal Main Content: strictly isolated, NO internal sidebar */}
      <main className="relative flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* DealFlow Project Doodle Pattern */}
        <DealFlowDoodleBackground opacity={0.04} />
        <div className="relative z-10">
          <React.Suspense fallback={<div className="py-16 text-center text-xs text-slate-400">Loading secure quotation...</div>}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>

      {/* Customer Portal Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 DealFlow360 Enterprise Deal Operations</span>
          <span>Encrypted Commercial Communication</span>
        </div>
      </footer>

      {/* Help Modal */}
      <Dialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        title="Customer Support & Guidance"
        description="Assistance for reviewing, negotiating, and approving your quotation."
      >
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Welcome to the secure DealFlow360 Customer Portal. Here you can review detailed quote line items, propose modified terms or volume discounts in the Negotiation tab, chat directly with your sales representative, and digitally sign the agreement.
          </p>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-1">
            <p className="font-semibold text-white">Need immediate sales contact?</p>
            <p>Email: <span className="text-blue-400">enterprise-deals@dealflow360.com</span></p>
            <p>Phone: <span className="font-mono text-white">+1 (800) 555-3600</span></p>
          </div>
          <Button onClick={() => setHelpOpen(false)} size="sm" className="w-full bg-blue-600 hover:bg-blue-500">
            Close Help
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
