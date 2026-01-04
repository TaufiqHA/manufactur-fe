
import React from 'react';
import { useStore } from '../store/useStore';
import { Database, Download } from 'lucide-react';

export const Settings: React.FC = () => {
  const { downloadDatabase } = useStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">System configuration and data management</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} className="text-blue-500" /> Database Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Export raw data for backup or external analysis.</p>
        </div>
        
        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-700">Export Raw JSON</p>
              <p className="text-xs text-slate-500">Download all projects, items, tasks, and logs.</p>
            </div>
            <button 
              onClick={downloadDatabase}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download size={16} /> Download DB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
