
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit3, X, Search, ChevronLeft, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { Material } from '../types';

const CATEGORIES = ['RAW', 'FINISHING', 'HARDWARE'];
const UNITS = ['PCS', 'BOX', 'LEMBAR', 'KG', 'METER', 'ROLL', 'SET'];

export const Materials: React.FC = () => {
  const { materials, addMaterial, updateMaterial, adjustStock, can } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [adjustModal, setAdjustModal] = useState<{id: string, name: string} | null>(null);
  const [adjustValue, setAdjustValue] = useState(0);
  const itemsPerPage = 10;

  if (!can('view', 'MATERIALS')) return <div className="p-8 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  const initialFormState: Partial<Material> = {
    code: '', name: '', unit: 'PCS', currentStock: 0, safetyStock: 0, pricePerUnit: 0, category: 'RAW'
  };
  const [formData, setFormData] = useState<Partial<Material>>(initialFormState);

  // Function to generate a unique material code
  const generateMaterialCode = () => {
    const prefix = 'MAT';
    const year = new Date().getFullYear().toString().slice(-2); // Last 2 digits of the year
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp

    return `${prefix}-${year}-${randomNum}${timestamp}`;
  };

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMaterial({ ...formData, id: editingId } as Material);
    } else {
      // Generate a unique code if not provided
      const materialCode = formData.code || generateMaterialCode();
      addMaterial({
        ...formData,
        id: `mat-${Date.now()}`,
        code: materialCode
      } as Material);
    }
    setIsModalOpen(false);
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustModal) {
      adjustStock(adjustModal.id, adjustValue);
      setAdjustModal(null);
      setAdjustValue(0);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inventory Material</h1>
            <p className="text-slate-500 font-bold">Monitor ketersediaan stok bahan baku manufaktur</p>
         </div>
         <button onClick={() => {
           setEditingId(null);
           setFormData({ ...initialFormState, code: generateMaterialCode() });
           setIsModalOpen(true);
         }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">+ TAMBAH MATERIAL</button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari material berdasarkan SKU atau Nama..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                   <th className="px-8 py-5">Identitas Material (SKU)</th>
                   <th className="px-8 py-5">Kategori</th>
                   <th className="px-8 py-5 text-center">Stok Fisik</th>
                   <th className="px-8 py-5 text-center">Batas Minimum</th>
                   <th className="px-8 py-5 text-right">Harga Satuan</th>
                   <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 font-bold">
                {paginatedMaterials.map(mat => (
                   <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                         <p className="text-[10px] text-blue-600 font-black mb-1">{mat.code}</p>
                         <p className="font-black text-slate-800 text-base">{mat.name}</p>
                      </td>
                      <td className="px-8 py-5">
                         <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${mat.category === 'RAW' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{mat.category}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`text-xl font-black ${Number(mat.currentStock) < Number(mat.safetyStock) ? 'text-red-600' : 'text-slate-800'}`}>{Number(mat.currentStock).toFixed(2)}</span>
                         <span className="text-[9px] text-slate-400 ml-2 uppercase tracking-tighter">{mat.unit}</span>
                      </td>
                      <td className="px-8 py-5 text-center text-slate-500 font-bold">{Number(mat.safetyStock)} <span className="text-[9px] uppercase tracking-tighter">{mat.unit}</span></td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">Rp {Number(mat.pricePerUnit).toLocaleString()}</td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => setAdjustModal({id: mat.id, name: mat.name})} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Adjustment Stock"><Package size={18}/></button>
                            <button onClick={() => { setEditingId(mat.id); setFormData(mat); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18}/></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
           <div className="bg-white rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                <h3 className="font-black text-xl md:text-2xl text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Material Master' : 'Tambah Material Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                <form id="materialForm" onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Kode Unik</label>
                         <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black uppercase">
                           {formData.code || 'Akan di-generate otomatis'}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Material</label>
                         <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Material Lengkap</label>
                         <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan / Unit</label>
                         <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                            {UNITS.map(u => (<option key={u} value={u}>{u}</option>))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Stock (Limit)</label>
                         <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.safetyStock} onChange={e => setFormData({...formData, safetyStock: Number(e.target.value)})} />
                      </div>
                   </div>
                </form>
              </div>
              <div className="p-6 md:p-8 border-t bg-slate-50 shrink-0">
                <button type="submit" form="materialForm" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-700 transition-all">SIMPAN MASTER MATERIAL</button>
              </div>
           </div>
        </div>
      )}

      {adjustModal && (
         <div className="fixed inset-0 bg-black/80 z-[310] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
            <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 text-center">
               <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-center mb-6"><div className="bg-emerald-100 p-6 rounded-full text-emerald-600"><Package size={48}/></div></div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Adjustment Stock</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic mb-8">{adjustModal.name}</p>
                  <form id="adjustForm" onSubmit={handleAdjust} className="space-y-8">
                     <div className="flex items-center justify-center gap-6">
                        <button type="button" onClick={() => setAdjustValue(v => v - 10)} className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-2xl font-black text-xl hover:bg-slate-200 transition-colors">-10</button>
                        <input type="number" className="w-24 md:w-32 text-center text-4xl md:text-5xl font-black outline-none bg-transparent" value={adjustValue} onChange={(e) => setAdjustValue(Number(e.target.value))} />
                        <button type="button" onClick={() => setAdjustValue(v => v + 10)} className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-2xl font-black text-xl hover:bg-slate-200 transition-colors">+10</button>
                     </div>
                     <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3 text-amber-700 text-[9px] font-bold uppercase text-left">
                        <AlertCircle size={20} className="shrink-0"/> Perubahan ini akan langsung mempengaruhi stok gudang saat ini.
                     </div>
                  </form>
               </div>
               <div className="p-8 border-t bg-slate-50 shrink-0 flex flex-col gap-3">
                  <button type="submit" form="adjustForm" className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-base shadow-2xl hover:bg-emerald-700 transition-all">EKSEKUSI ADJUSTMENT</button>
                  <button type="button" onClick={() => setAdjustModal(null)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest py-2 hover:text-slate-600 transition-colors">Batalkan</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};