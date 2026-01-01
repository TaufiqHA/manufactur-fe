
import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Crown, TrendingUp, CheckCircle, Clock, BarChart3, PieChart as PieIcon, Layers, Info, Calendar, ArrowUpRight, Target, PackageCheck, X, Zap, Trophy, History, AlertCircle, Timer
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const Executive: React.FC = () => {
  const { projects, items, tasks } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projectStats = useMemo(() => {
    return projects.map(p => {
      const projItems = items.filter(it => it.projectId === p.id);
      
      // Target Total: Sum of (qtySet * procurementQty) for all items in project
      const targetTotalItems = projItems.reduce((acc, it) => acc + (it.qtySet * p.procurementQty), 0) || p.totalQty;
      
      // Actual Total: Sum of warehouseQty for all items in project
      const actualTotalItems = projItems.reduce((acc, it) => acc + (it.warehouseQty || 0), 0);
      
      const remainingItems = Math.max(0, targetTotalItems - actualTotalItems);
      const progress = targetTotalItems > 0 ? (actualTotalItems / targetTotalItems) * 100 : 0;

      // Time Calculations
      const start = new Date(p.startDate).getTime();
      const deadline = new Date(p.deadline).getTime();
      const now = new Date().getTime();
      
      const totalDays = Math.max(1, Math.ceil((deadline - start) / (1000 * 60 * 60 * 24)));
      const daysElapsed = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
      const daysLeft = Math.max(1, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

      // Required Daily Output: Remaining / Days Left
      const requiredDaily = Math.ceil(remainingItems / daysLeft);

      const pieData = [
        { name: 'Selesai', value: actualTotalItems, color: progress >= 100 ? '#3b82f6' : '#10b981' }, 
        { name: 'Sisa', value: remainingItems, color: '#f1f5f9' } 
      ];

      return { 
        ...p, 
        actualTotalItems, 
        remainingItems, 
        progress, 
        pieData, 
        targetTotalItems,
        totalDays,
        daysElapsed,
        daysLeft,
        requiredDaily
      };
    });
  }, [projects, items, tasks]);

  const selectedProj = projectStats.find(p => p.id === selectedProjectId);

  const getProgressBarColor = (progress: number) => {
    if (progress < 50) return '#ef4444'; // Red
    if (progress < 100) return '#fbbf24'; // Yellow/Amber
    return '#3b82f6'; // Blue
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Executive Board</h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Strategic Project Progress & Capacity Monitoring</p>
        </div>
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl flex items-center gap-5 border border-slate-800">
           <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Crown size={24}/></div>
           <div>
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] leading-none mb-1">Director Access</p>
              <p className="font-black text-base uppercase tracking-tighter">Strategic Insight Board</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projectStats.map(proj => (
          <div 
            key={proj.id} 
            onClick={() => setSelectedProjectId(proj.id)}
            className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group relative cursor-pointer"
          >
             <div className="absolute top-8 right-8 z-10">
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${proj.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                   {proj.status}
                </span>
             </div>

             <div className="p-10 pb-6">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{proj.code}</p>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">{proj.name}</h3>
                <div className="flex items-center gap-2 mt-4">
                   <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center"><Target size={12} className="text-slate-400"/></div>
                   <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{proj.customer}</p>
                </div>
             </div>

             <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={proj.pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                        {proj.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                   </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <p className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{Math.round(proj.progress)}%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Overall Progress</p>
                </div>
             </div>

             <div className="p-10 pt-0 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                   <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50 flex flex-col items-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Layers size={10}/> Target</p>
                      <p className="text-xl font-black text-slate-900">{formatNumber(proj.targetTotalItems)}<span className="text-[10px] font-bold text-slate-400 ml-1">PCS</span></p>
                   </div>
                   <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100/50 flex flex-col items-center">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2"><PackageCheck size={10}/> Gudang</p>
                      <p className="text-xl font-black text-emerald-600">{formatNumber(proj.actualTotalItems)}<span className="text-[10px] font-bold text-emerald-400 ml-1">PCS</span></p>
                   </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[40px] flex justify-between items-center text-white shadow-xl shadow-slate-900/20 overflow-hidden relative">
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10"><Clock size={24}/></div>
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Durasi Pengerjaan</p>
                         <p className="text-xl font-black">Hari Ke-{proj.daysElapsed}</p>
                      </div>
                   </div>
                   <div className="text-right relative z-10">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Sisa Waktu</p>
                      <p className="text-sm font-black uppercase text-blue-400">{proj.daysLeft} Hari</p>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selectedProj && (
        <div className="fixed inset-0 bg-slate-950/90 z-[600] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
              <div className="p-10 md:p-14 border-b flex justify-between items-center bg-slate-50 shrink-0">
                 <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{selectedProj.code}</p>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedProj.name}</h2>
                 </div>
                 <button onClick={() => setSelectedProjectId(null)} className="p-4 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm"><X size={32}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 custom-scrollbar">
                 {/* Timeline Logic */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 flex flex-col items-center">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Hari Pengerjaan</p>
                       <p className="text-4xl font-black text-blue-700">{selectedProj.daysElapsed}</p>
                       <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Hari Berjalan</p>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[40px] flex flex-col items-center text-white">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Harian</p>
                       <p className="text-4xl font-black text-blue-400">{formatNumber(selectedProj.requiredDaily)}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Pcs / Hari</p>
                    </div>
                    <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex flex-col items-center">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Sisa Waktu</p>
                       <p className="text-4xl font-black text-emerald-700">{selectedProj.daysLeft}</p>
                       <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Hari Tersisa</p>
                    </div>
                 </div>

                 {/* Bar Chart Section */}
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-2 bg-blue-600 rounded-full"/>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Analisa Kapasitas & Target Kontrak</h3>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 space-y-10 shadow-inner">
                       {/* Target Bar (Green) - "YANG HARUS DISELESAIKAN" */}
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-[#10b981]"/>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Kontrak (100% Selesai)</p>
                             </div>
                             <p className="text-xl font-black text-emerald-600">{formatNumber(selectedProj.targetTotalItems)} <span className="text-xs text-slate-400">PCS</span></p>
                          </div>
                          <div className="w-full h-10 bg-white rounded-2xl border border-slate-200 overflow-hidden p-1.5 shadow-sm">
                             <div className="h-full bg-[#10b981] rounded-xl shadow-lg shadow-emerald-500/20" style={{width: '100%'}} />
                          </div>
                       </div>

                       {/* Progress Bar (Dynamic Color) - Realisasi Berdasarkan Qty/Set * Pengadaan */}
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: getProgressBarColor(selectedProj.progress) }}/>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Realisasi Gudang Saat Ini ({Math.round(selectedProj.progress)}%)</p>
                             </div>
                             <p className="text-xl font-black" style={{ color: getProgressBarColor(selectedProj.progress) }}>
                                {formatNumber(selectedProj.actualTotalItems)} <span className="text-xs text-slate-400">PCS</span>
                             </p>
                          </div>
                          <div className="w-full h-14 bg-white rounded-2xl border border-slate-200 overflow-hidden p-1.5 shadow-sm">
                             <div 
                                className="h-full rounded-xl shadow-lg transition-all duration-1000 flex items-center justify-end px-4 overflow-hidden" 
                                style={{ 
                                  width: `${Math.min(100, selectedProj.progress)}%`,
                                  backgroundColor: getProgressBarColor(selectedProj.progress)
                                }}
                             >
                                <Zap size={16} className="text-white/40 animate-pulse"/>
                             </div>
                          </div>
                          <div className="flex justify-between px-2">
                             <span className="text-[10px] font-black text-red-500">LOW (0-50%)</span>
                             <span className="text-[10px] font-black text-amber-500">PROCEEDING (50-99%)</span>
                             <span className="text-[10px] font-black text-blue-500">REACHED (100%)</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Information Banner */}
                 <div className="bg-blue-600 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                       <TrendingUp size={120}/>
                    </div>
                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shrink-0 shadow-2xl bg-white/20 backdrop-blur-md`}>
                       <Timer size={48}/>
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-2xl font-black uppercase tracking-tighter">Status Delivery Deadline</h4>
                       <p className="text-blue-100 font-bold mt-2 leading-relaxed">
                          Untuk mencapai deadline dalam <span className="text-white underline">{selectedProj.daysLeft} hari</span>, tim produksi perlu menjaga ritme output rata-rata <span className="text-white text-lg">{formatNumber(selectedProj.requiredDaily)} Pcs per hari</span>. 
                          {selectedProj.progress < 50 ? " Perhatian: Progress masih di zona merah, evaluasi hambatan di stasiun kerja." : " Terus pertahankan performa saat ini."}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {projectStats.length === 0 && <div className="py-40 text-center text-slate-300 font-black uppercase tracking-widest italic border-4 border-dashed border-slate-100 rounded-[60px]">Belum ada project aktif yang dipantau.</div>}
    </div>
  );
};
