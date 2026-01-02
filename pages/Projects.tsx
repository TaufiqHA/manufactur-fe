import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus, Search, Eye, Lock, Unlock, X, ChevronLeft, ChevronRight, Calculator, Edit3, Loader2, RotateCcw
} from 'lucide-react';
import { Project } from '../types';

const UNITS_LIST = ['PCS', 'SET', 'UNIT', 'BOX', 'KG', 'LEMBAR', 'ROLL', 'METER'];

export const Projects: React.FC = () => {
  const { projects, addProject, updateProject, validateProject, can, reloadProjects } = useStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '', customer: '', qtyPerUnit: 1, procurementQty: 1, unit: 'PCS', deadline: ''
  });

  // Load projects when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        await reloadProjects();
      } catch (error) {
        // Error loading projects
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [reloadProjects]);

  const calculatedTotal = useMemo(() => formData.qtyPerUnit * formData.procurementQty, [formData]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const existing = projects.find(p => p.id === editingId);
        if (existing) {
          await updateProject({
            ...existing,
            ...formData,
            totalQty: calculatedTotal
          } as Project);
        }
      } else {
        await addProject({
          ...formData,
          id: `prj-${Date.now()}`,
          startDate: new Date().toISOString().split('T')[0], // Format date for backend
          status: 'PLANNED',
          progress: 0,
          isLocked: false,
          totalQty: calculatedTotal
        } as Project);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      customer: p.customer,
      qtyPerUnit: p.qtyPerUnit,
      procurementQty: p.procurementQty,
      unit: p.unit,
      deadline: p.deadline
    });
    setIsModalOpen(true);
  };

  const handleValidateProject = async (id: string) => {
    setIsDeleting(id); // Reusing this state for the lock action
    try {
      await validateProject(id);
    } catch (error) {
      alert('Failed to validate project. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Project Management</h1>
          <p className="text-slate-500 text-sm font-bold">Monitor alur kerja & target produksi gondola</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({name: '', customer: '', qtyPerUnit: 1, procurementQty: 1, unit: 'PCS', deadline: ''});
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 font-black text-sm flex items-center justify-center gap-3 flex-1 md:flex-none"
          >
            <Plus size={20} /> TAMBAH PROJECT
          </button>
          <button
            onClick={reloadProjects}
            disabled={isLoading}
            className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all font-black text-sm flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama project..."
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">Kode / Nama</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5 text-center">Pengadaan</th>
                <th className="px-8 py-5 text-center">Total Target</th>
                <th className="px-8 py-5">Deadline</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {paginatedProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-[10px] text-blue-600 font-black mb-1">{p.code}</p>
                    <p className="font-black text-slate-800 text-base">{p.name}</p>
                  </td>
                  <td className="px-8 py-5 text-slate-500">{p.customer}</td>
                  <td className="px-8 py-5 text-center font-black text-slate-700">{p.procurementQty}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-black text-blue-700 text-lg">{p.totalQty}</span>
                    <span className="text-[9px] text-slate-400 ml-1 uppercase">{p.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-slate-600">{new Date(p.deadline).toLocaleDateString('id-ID')}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                        title="View Details"
                      >
                        <Eye size={20}/>
                      </button>
                      {!p.isLocked ? (
                        <>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                          >
                            <Edit3 size={20}/>
                          </button>
                          <button
                            onClick={() => handleValidateProject(p.id)}
                            className="p-3 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-2xl transition-all"
                            title="Lock & Publish"
                            disabled={isDeleting === p.id}
                          >
                            {isDeleting === p.id ? <Loader2 className="animate-spin" size={20} /> : <Unlock size={20}/>}
                          </button>
                        </>
                      ) : (
                        <div className="p-3 text-emerald-500" title="Project Locked"><Lock size={20}/></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
          <div className="bg-white rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 md:p-10 border-b shrink-0 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Project' : 'New Project'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 p-2.5 rounded-full transition-all"
                disabled={isSubmitting}
              >
                <X size={28}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
              <form id="projectForm" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Nama Project</label>
                    <input
                      required
                      className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Customer</label>
                    <input
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      value={formData.customer}
                      onChange={e => setFormData({...formData, customer: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Unit Luaran</label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      disabled={isSubmitting}
                    >
                      {UNITS_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Deadline</label>
                    <input
                      type="date"
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="md:col-span-2 bg-blue-50 p-6 md:p-8 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="flex-1 md:w-32">
                        <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Qty Order</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full p-4 rounded-2xl font-black text-center shadow-lg border-none"
                          value={formData.procurementQty}
                          onChange={e => setFormData({...formData, procurementQty: Number(e.target.value)})}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex-1 md:w-32">
                        <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Qty/Unit</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full p-4 rounded-2xl font-black text-center shadow-lg border-none"
                          value={formData.qtyPerUnit}
                          onChange={e => setFormData({...formData, qtyPerUnit: Number(e.target.value)})}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[11px] font-black text-blue-400 uppercase mb-1 flex items-center justify-center md:justify-end gap-2"><Calculator size={14}/> Total Target</p>
                      <p className="text-4xl md:text-5xl font-black text-blue-800 leading-none">{calculatedTotal} <span className="text-lg md:text-xl text-blue-400 uppercase">{formData.unit}</span></p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 md:p-10 border-t shrink-0 bg-slate-50">
              <button
                type="submit"
                form="projectForm"
                className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-lg flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingId ? 'Update Project' : 'Create Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
