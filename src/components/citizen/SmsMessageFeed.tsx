import React from 'react';
import { MessageSquare } from 'lucide-react';

export const SmsMessageFeed: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-card border border-slate-700 max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold leading-none">VM-MCKNRG</h5>
            <span className="text-[11px] text-slate-400">Karimnagar Municipal Corp</span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          Official SMS
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Message 1 */}
        <div className="bg-slate-800/90 rounded-xl p-2.5 border-l-2 border-blue-400">
          <p className="text-slate-200 text-[11px] leading-relaxed">
            "Your grievance <strong className="text-amber-300">#GRV2024-00234</strong> has been registered successfully."
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block text-right">10:15 AM</span>
        </div>

        {/* Message 2 */}
        <div className="bg-slate-800/90 rounded-xl p-2.5 border-l-2 border-amber-400">
          <p className="text-slate-200 text-[11px] leading-relaxed">
            "Your grievance <strong className="text-amber-300">#GRV2024-00234</strong> is in progress."
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block text-right">11:45 AM</span>
        </div>

        {/* Message 3 */}
        <div className="bg-slate-800/90 rounded-xl p-2.5 border-l-2 border-emerald-400">
          <p className="text-slate-200 text-[11px] leading-relaxed">
            "Your grievance <strong className="text-amber-300">#GRV2024-00234</strong> has been resolved."
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block text-right">04:20 PM</span>
        </div>
      </div>
    </div>
  );
};
