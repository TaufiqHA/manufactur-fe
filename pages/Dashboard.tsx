
import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { projects, machines, tasks, materials } = useStore();

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const lowStock = materials.filter(m => m.currentStock < m.safetyStock).length;
  const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  const machineStatusData = machines.map(m => ({
    name: m.name.replace('Laser Cutter', 'Laser').replace('Bending Press', 'Bend'),
    status: m.status,
    val: 1
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return '#3b82f6';
      case 'IDLE': return '#94a3b8';
      case 'MAINTENANCE': return '#eab308';
      default: return '#ef4444';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Control Center</h1>
          <p className="text-slate-500 font-bold text-sm">Monitoring real-time produksi pabrik gondola</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
            <p className="text-lg font-black text-blue-600">74.2%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Projects</p>
            <p className="text-4xl font-black text-slate-900">{activeProjects}</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] group-hover:scale-110 transition-transform">
            <Briefcase size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Tasks</p>
            <p className="text-4xl font-black text-indigo-600">{activeTasks}</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[20px] group-hover:scale-110 transition-transform">
            <Activity size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Finished Jobs</p>
            <p className="text-4xl font-black text-emerald-600">{completedTasks}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[20px] group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Low Material</p>
            <p className="text-4xl font-black text-red-600">{lowStock}</p>
          </div>
          <div className="p-4 bg-red-50 text-red-600 rounded-[20px] group-hover:scale-110 transition-transform">
            <AlertTriangle size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Machine Status Chart */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Machine Status Overview</h2>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">View Details <ArrowRight size={14}/></button>
          </div>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="val" radius={[0, 8, 8, 0]} barSize={24}>
                    {machineStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-slate-50 justify-center">
             <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"></span> Running</span>
             <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><span className="w-3 h-3 rounded-full bg-slate-300"></span> Idle</span>
             <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20"></span> Mainten.</span>
             <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></span> Down</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">System Logs</h2>
          <div className="space-y-6">
            {tasks.length > 0 ? tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex gap-4 group cursor-default">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'} group-hover:scale-125 transition-transform`} />
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tighter truncate">{task.status === 'COMPLETED' ? 'Job Finished' : 'In Production'} on {task.machineId}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{task.itemName}</p>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-slate-300 h-full" style={{width: `${(task.completedQty / task.targetQty) * 100}%`}} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">No recent activity</div>
            )}
          </div>
          <button onClick={() => window.location.hash = '#/reports'} className="w-full mt-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">Open Full Reports</button>
        </div>
      </div>
    </div>
  );
};