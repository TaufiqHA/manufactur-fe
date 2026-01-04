
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, ArrowLeft, Activity, Monitor, Layers, Box, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TvDisplay: React.FC = () => {
  const { machines, tasks } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [time, setTime] = useState(new Date());

  // Logic: Get group from URL (?group=1, ?group=2)
  const groupIdx = parseInt(searchParams.get('group') || '1') - 1;
  const machinesPerTv = 6;
  const filteredMachines = machines.slice(groupIdx * machinesPerTv, (groupIdx + 1) * machinesPerTv);

  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-white p-6 lg:p-10 flex flex-col overflow-hidden font-sans">
      {/* Header - High Tech Look */}
      <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-900/50">
        <div className="flex items-center gap-8">
           <button onClick={() => navigate('/')} className="p-4 bg-slate-900/50 hover:bg-blue-600/20 rounded-[28px] transition-all border border-slate-800"><ArrowLeft size={28}/></button>
           <div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Monitor size={20}/></div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Floor Monitor <span className="text-blue-500">#{groupIdx + 1}</span></h1>
              </div>
              <p className="text-slate-500 font-bold text-sm tracking-[0.2em] uppercase mt-2 flex items-center gap-3">
                 <Activity size={14} className="text-emerald-500"/> MANUFACTURING EXECUTION REAL-TIME STATUS
              </p>
           </div>
        </div>
        <div className="flex items-center gap-6 text-4xl font-black text-white bg-slate-900/80 px-8 py-6 rounded-[32px] shadow-2xl border border-slate-800/50 tabular-nums">
           <Clock size={32} className="text-blue-500 animate-pulse"/>
           {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
        </div>
      </div>

      {/* Main Grid - Fully Responsive */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 overflow-hidden">
        {filteredMachines.map(m => {
            const activeTask = tasks.find(t => t.machineId === m.id && (t.status === 'IN_PROGRESS' || t.status === 'DOWNTIME'));
            const progress = activeTask ? (activeTask.completedQty / activeTask.targetQty) * 100 : 0;
            
            return (
                <div key={m.id} className={`group relative rounded-[48px] p-8 lg:p-10 flex flex-col shadow-2xl transition-all duration-700 h-full border-t-8 border-l-8 ${
                    m.status === 'RUNNING' ? 'bg-slate-900/40 border-emerald-500' : 
                    m.status === 'DOWNTIME' ? 'bg-amber-950/20 border-amber-500 animate-pulse' :
                    m.status === 'MAINTENANCE' ? 'bg-red-950/20 border-red-500' :
                    'bg-slate-900/20 border-slate-800'
                }`}>
                    <div className="absolute top-6 right-6">
                       <span className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl ${
                          m.status === 'RUNNING' ? 'bg-emerald-500 text-white' : 
                          m.status === 'DOWNTIME' ? 'bg-amber-500 text-white' :
                          'bg-slate-800 text-slate-500 border border-slate-700'
                       }`}>{m.status}</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">{m.name}</h2>
                        <div className="flex items-center gap-3">
                           <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest">{m.code}</span>
                           <div className="w-1 h-1 rounded-full bg-slate-700" />
                           <span className="text-slate-500 font-bold uppercase text-[10px]">{m.type}</span>
                        </div>
                    </div>

                    {activeTask ? (
                        <div className="flex-1 flex flex-col">
                            <div className="space-y-4 flex-1">
                                <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"><Layers size={14}/> PROCESSING JOB</p>
                                <h3 className="text-2xl font-black leading-tight text-white mb-4 pr-6 line-clamp-2">{activeTask.itemName}</h3>
                                <div className="flex gap-4">
                                   <span className="text-[9px] font-black bg-slate-800/80 text-blue-400 px-3 py-1.5 rounded-xl uppercase border border-slate-700/50">{activeTask.projectName}</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto space-y-6 bg-slate-950/40 p-6 lg:p-8 rounded-[32px] border border-slate-800/50">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Box size={12}/> OUTPUT</p>
                                       <p className="text-5xl font-black leading-none tabular-nums text-white">{activeTask.completedQty}<span className="text-lg text-slate-700 ml-2">/ {activeTask.targetQty}</span></p>
                                    </div>
                                    <div className="text-right">
                                       <div className="flex items-center gap-1 text-emerald-400 font-black text-4xl tabular-nums">
                                          <TrendingUp size={24}/> {Math.round(progress)}%
                                       </div>
                                       <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Eff.</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden shadow-2xl border border-slate-700/50">
                                    <div className={`h-full transition-all duration-1000 ${m.status === 'DOWNTIME' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${progress}%`}} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-6">
                            <Activity size={60} className="text-slate-600"/>
                            <p className="text-xl font-black text-slate-600 uppercase tracking-[0.5em] italic">Station Idle</p>
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em]">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Active Uplink</span>
         </div>
         <div className="flex gap-4">
            {Array.from({length: Math.ceil(machines.length / machinesPerTv)}).map((_, i) => (
               <button key={i} onClick={() => navigate(`/tv-display?group=${i+1}`)} className={`h-2 rounded-full transition-all duration-500 ${groupIdx === i ? 'bg-blue-600 w-16' : 'bg-slate-800 w-4 hover:bg-slate-700'}`} />
            ))}
         </div>
         <span>Plant Floor Management System</span>
      </div>
    </div>
  );
};
