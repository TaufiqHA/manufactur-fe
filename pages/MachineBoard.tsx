
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Box, Info, AlertCircle, Layers, Coffee, Play, Pause, Activity, TrendingUp, Hammer, Timer, UserCheck, Target, CheckCircle2, Save } from 'lucide-react';
import { Task, Shift, ProcessStep, ALL_STEPS, ASSEMBLY_STEPS } from '../types';

export const MachineBoard: React.FC = () => {
  const { machines, tasks, items, projects, currentUser, setTaskStatus, startDowntime, endDowntime, reportProduction } = useStore();
  
  const [viewMode, setViewMode] = useState<'STATION' | 'PROCESS'>('PROCESS');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [selectedProcess, setSelectedProcess] = useState<ProcessStep>('POTONG');
  const [selectedShift, setSelectedShift] = useState<Shift>('SHIFT_1');
  const [reportModal, setReportModal] = useState<Task | null>(null);
  const [qtyGood, setQtyGood] = useState<number>(0);
  const [qtyDefect, setQtyDefect] = useState<number>(0);
  
  const availableTasks = useMemo(() => {
    if (viewMode === 'STATION') {
      return tasks.filter(t => t.machineId === selectedMachineId && t.status !== 'COMPLETED');
    } else {
      return tasks.filter(t => t.step === selectedProcess && t.status !== 'COMPLETED');
    }
  }, [tasks, viewMode, selectedMachineId, selectedProcess]);

  const activeTask = availableTasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'DOWNTIME');
  const pendingTasks = availableTasks.filter(t => t.status === 'PENDING' || t.status === 'PAUSED');

  // Menghitung Target Harian Real-time berdasarkan estimasi sisa hari
  const currentDailyTarget = useMemo(() => {
    if (!activeTask) return 0;
    const project = projects.find(p => p.id === activeTask.projectId);
    if (!project) return 0;
    
    const deadline = new Date(project.deadline).getTime();
    const today = new Date().getTime();
    const sisaHari = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
    const sisaQty = activeTask.targetQty - activeTask.completedQty;
    
    return Math.ceil(sisaQty / sisaHari);
  }, [activeTask, projects]);

  const [timer, setTimer] = useState(0);
  useEffect(() => {
    let interval: any;
    if (activeTask?.status === 'DOWNTIME') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeTask?.status]);

  const getReadyQty = (task: Task) => {
    const item = items.find(i => i.id === task.itemId);
    if (!item) return 0;

    if (task.subAssemblyId) {
      const sa = item.subAssemblies.find(x => x.id === task.subAssemblyId);
      if (!sa) return 0;

      // Convert processes to array if it's stored as an object
      const processesArray = Array.isArray(sa.processes)
        ? sa.processes
        : Object.values(sa.processes || []);

      const processIdx = processesArray.indexOf(task.step);
      if (processIdx === 0) {
        const producedAtThisStep = sa.stepStats[task.step]?.produced || 0;
        return Math.max(0, sa.totalNeeded - producedAtThisStep);
      }
      const prevStep = processesArray[processIdx - 1];
      return sa.stepStats[prevStep]?.available || 0;
    } else {
      const currentStepIdx = ASSEMBLY_STEPS.indexOf(task.step);
      if (task.step === 'LAS') {
        const saBalances = item.subAssemblies.map(sa => {
          // Convert processes to array if it's stored as an object
          const processesArray = Array.isArray(sa.processes)
            ? sa.processes
            : Object.values(sa.processes || []);
          return Math.floor(sa.completedQty / sa.qtyPerParent);
        });
        return saBalances.length > 0 ? Math.min(...saBalances) : Math.max(0, task.targetQty - task.completedQty);
      }
      if (currentStepIdx > 0) {
        const prevStep = ASSEMBLY_STEPS[currentStepIdx - 1];
        return item.assemblyStats?.[prevStep]?.available || 0;
      }
      return Math.max(0, task.targetQty - task.completedQty);
    }
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportModal) {
      const ready = getReadyQty(reportModal);
      const inputTotal = qtyGood + qtyDefect;
      if (inputTotal === 0) return alert("Jumlah input tidak boleh nol!");
      if (inputTotal > ready && !confirm(`Input (${inputTotal}) melebihi stok tersedia (${ready}). Lanjut?`)) return;
      
      reportProduction(reportModal.id, qtyGood, qtyDefect, selectedShift, currentUser?.name || 'Operator');
      setReportModal(null);
      setQtyGood(0);
      setQtyDefect(0);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 font-sans">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-8 items-center justify-between">
         <div className="flex bg-slate-100 p-2 rounded-[24px] w-full xl:w-auto shrink-0">
            <button onClick={() => setViewMode('STATION')} className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'STATION' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>MONITOR STATION</button>
            <button onClick={() => setViewMode('PROCESS')} className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'PROCESS' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>GLOBAL PROSES</button>
         </div>
         <div className="flex flex-col sm:flex-row gap-6 w-full items-center">
            {viewMode === 'STATION' ? (
              <div className="flex-1 w-full relative">
                 <select value={selectedMachineId} onChange={(e) => setSelectedMachineId(e.target.value)} className="w-full font-black text-xl bg-slate-50 p-5 rounded-[24px] outline-none border-2 border-transparent focus:border-blue-500 transition-all appearance-none">
                    {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                 </select>
                 <Activity className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20}/>
              </div>
            ) : (
              <div className="flex-1 w-full relative">
                 <select value={selectedProcess} onChange={(e) => setSelectedProcess(e.target.value as ProcessStep)} className="w-full font-black text-xl bg-slate-50 p-5 rounded-[24px] outline-none border-2 border-transparent focus:border-blue-500 transition-all appearance-none">
                    {ALL_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <Hammer className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20}/>
              </div>
            )}
            <div className="w-full sm:w-64 relative">
               <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value as Shift)} className="w-full font-black text-xl bg-slate-50 p-5 rounded-[24px] outline-none border-2 border-transparent focus:border-blue-500 transition-all appearance-none">
                  <option value="SHIFT_1">SHIFT 1 (PAGI)</option>
                  <option value="SHIFT_2">SHIFT 2 (SORE)</option>
                  <option value="SHIFT_3">SHIFT 3 (MALAM)</option>
               </select>
               <UserCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20}/>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            {activeTask ? (
              <div className={`bg-white rounded-[56px] border-8 shadow-2xl overflow-hidden transition-all duration-500 ${activeTask.status === 'DOWNTIME' ? 'border-amber-500 bg-amber-50/20' : 'border-blue-600'}`}>
                  <div className={`px-10 py-6 flex justify-between items-center text-white ${activeTask.status === 'DOWNTIME' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                           {activeTask.status === 'DOWNTIME' ? <Coffee size={20}/> : <Play size={20}/>}
                        </div>
                        <span className="font-black tracking-widest uppercase text-xl">{activeTask.status === 'DOWNTIME' ? 'SEDANG ISTIRAHAT' : 'DALAM PRODUKSI'}</span>
                     </div>
                     <span className="bg-white/20 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/30">{activeTask.projectName}</span>
                  </div>
                  
                  <div className="p-12 space-y-12">
                      <div className="text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">ITEM SEDANG DIPROSES</p>
                         <h2 className="text-6xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{activeTask.subAssemblyName || activeTask.itemName}</h2>
                         
                         {activeTask.status === 'DOWNTIME' ? (
                           <div className="mt-10 py-10 bg-white rounded-[40px] shadow-inner border border-amber-100 flex flex-col items-center gap-4">
                              <Timer size={48} className="text-amber-500 animate-pulse"/>
                              <p className="text-5xl font-black text-amber-600 font-mono tracking-widest">{formatTime(timer)}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Terhenti</p>
                           </div>
                         ) : (
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                              <div className="bg-slate-50 px-6 py-6 rounded-[32px] border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Bahan Sedia</p>
                                 <p className="text-3xl font-black text-blue-600">{getReadyQty(activeTask)}</p>
                              </div>
                              <div className="bg-emerald-50 px-6 py-6 rounded-[32px] border border-emerald-100">
                                 <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Selesai (Aktual)</p>
                                 <p className="text-3xl font-black text-emerald-700">{activeTask.completedQty}</p>
                              </div>
                              <div className="bg-amber-50 px-6 py-6 rounded-[32px] border border-amber-100">
                                 <p className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center justify-center gap-2"><Target size={12}/> Target Hari Ini</p>
                                 <p className="text-3xl font-black text-amber-700">{currentDailyTarget}</p>
                                 <p className="text-[8px] font-bold text-amber-400 uppercase">Hitungan Sisa Hari</p>
                              </div>
                              <div className="bg-slate-900 px-6 py-6 rounded-[32px] shadow-2xl">
                                 <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Target Total</p>
                                 <p className="text-3xl font-black text-white">{activeTask.targetQty}</p>
                              </div>
                           </div>
                         )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6">
                         {activeTask.status === 'DOWNTIME' ? (
                            <button onClick={() => endDowntime(activeTask.id)} className="flex-1 bg-emerald-600 text-white p-10 rounded-[40px] font-black text-3xl flex flex-col items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"><Play size={48}/> RESUME PRODUKSI</button>
                         ) : (
                            <>
                               <button onClick={() => setReportModal(activeTask)} className="flex-[2] bg-blue-600 text-white p-10 rounded-[40px] font-black text-3xl flex flex-col items-center gap-4 shadow-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"><Plus size={48}/> LAPOR HASIL</button>
                               <div className="flex-1 flex flex-col gap-4">
                                  <button onClick={() => startDowntime(activeTask.id)} className="flex-1 bg-slate-100 text-slate-500 rounded-[32px] font-black text-lg flex items-center justify-center gap-4 shadow-sm hover:bg-amber-100 hover:text-amber-600 transition-all active:scale-95"><Coffee size={24}/> ISTIRAHAT</button>
                                  <button onClick={() => setTaskStatus(activeTask.id, 'PAUSED')} className="flex-1 bg-slate-900 text-white rounded-[32px] font-black text-lg flex items-center justify-center gap-4 shadow-xl hover:bg-red-600 transition-all active:scale-95"><Pause size={24}/> PINDAH TUGAS</button>
                               </div>
                            </>
                         )}
                      </div>
                  </div>
              </div>
            ) : (
              <div className="h-[600px] bg-white rounded-[56px] flex flex-col items-center justify-center text-center p-20 border-8 border-dashed border-slate-100 group">
                  <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform duration-700 mb-10"><Hammer size={60}/></div>
                  <h2 className="text-4xl font-black text-slate-300 uppercase tracking-widest leading-tight">Standby Mode</h2>
                  <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.4em] text-[10px]">Silahkan pilih tugas dari antrian kerja di samping.</p>
              </div>
            )}
         </div>

         <div className="space-y-8">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.4em] flex items-center gap-4 px-2">
               <Layers size={18} className="text-blue-600"/> ANTRIAN TUGAS ({pendingTasks.length})
            </h3>
            <div className="space-y-6 overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
               {pendingTasks.map(task => {
                 const ready = getReadyQty(task);
                 return (
                  <div key={task.id} className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm flex flex-col gap-8 hover:border-blue-600 hover:shadow-2xl transition-all group">
                      <div className="space-y-4">
                          <div className="flex justify-between items-start">
                             <p className={`text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest ${task.subAssemblyId ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>{task.subAssemblyId ? 'RAKITAN' : 'ASSEMBLY'}</p>
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{task.step}</span>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase text-xl leading-tight group-hover:text-blue-600 transition-colors">{task.subAssemblyName || task.itemName}</h4>
                          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-[24px] border border-white">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">STOK READY</p>
                                <p className="text-xl font-black text-blue-600">{ready}</p>
                             </div>
                             <div className="border-l pl-6">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TARGET TOTAL</p>
                                <p className="text-xl font-black text-slate-900">{task.targetQty}</p>
                             </div>
                          </div>
                      </div>
                      <button onClick={() => setTaskStatus(task.id, 'IN_PROGRESS')} disabled={!!activeTask} className="bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 disabled:opacity-20 transition-all active:scale-95">MULA KERJAKAN</button>
                  </div>
                 );
               })}
            </div>
         </div>
      </div>

      {reportModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-[700] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-xl shadow-2xl animate-in zoom-in-95">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Lapor Hasil Produksi</h2>
                 <button onClick={() => setReportModal(null)} className="p-3 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={submitReport} className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Barang Bagus</label>
                       <input type="number" required min="1" className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-4xl font-black text-center text-emerald-600 outline-none focus:border-emerald-500 transition-all" value={qtyGood} onChange={e => setQtyGood(Number(e.target.value))} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Barang Rusak/NG</label>
                       <input type="number" required min="0" className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-4xl font-black text-center text-red-500 outline-none focus:border-red-500 transition-all" value={qtyDefect} onChange={e => setQtyDefect(Number(e.target.value))} />
                    </div>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex items-center gap-4">
                    <Info size={24} className="text-blue-500 shrink-0"/>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Total input ini: <span className="font-black">{qtyGood + qtyDefect}</span>. Stok tersedia: <span className="font-black">{getReadyQty(reportModal)}</span></p>
                 </div>
                 <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[32px] font-black uppercase text-lg tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all active:scale-95">
                    <Save size={24}/> SIMPAN LAPORAN
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
