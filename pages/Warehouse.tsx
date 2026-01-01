
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShieldCheck, Search, Package, CheckCircle, Edit3, X, Save, Warehouse as WhIcon, History, Clock, TrendingUp
} from 'lucide-react';

export const Warehouse: React.FC = () => {
  const { items, projects, tasks, logs, validateToWarehouse } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string, name: string, qty: number } | null>(null);
  const [historyItem, setHistoryItem] = useState<string | null>(null);

  const processedItems = useMemo(() => {
    return items.map(item => {
      // Sekarang stok menunggu validasi diambil langsung dari stasiun PACKING yang tersedia
      const pendingValidation = item.assemblyStats?.['PACKING']?.available || 0;
      const availableStock = (item.warehouseQty || 0) - (item.shippedQty || 0);
      const project = projects.find(p => p.id === item.projectId);
      
      return {
        ...item,
        pendingValidation,
        availableStock,
        projectName: project?.name || 'Unknown Project'
      };
    });
  }, [items, tasks, projects]);

  const validationList = processedItems.filter(p => p.pendingValidation > 0);
  const warehouseList = processedItems.filter(p => p.availableStock > 0 && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const itemHistory = useMemo(() => {
    if (!historyItem) return [];
    return logs.filter(l => l.itemId === historyItem && (l.step === 'PACKING' || l.type === 'WAREHOUSE_ENTRY'));
  }, [logs, historyItem]);

  const handleValidate = (id: string, qty: number) => {
    validateToWarehouse(id, qty);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Gudang Jadi</h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Validasi Hasil Produksi Packing &rarr; Stok Gudang</p>
      </div>

      {/* VALIDATION SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><ShieldCheck size={20}/></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Menunggu Validasi Masuk (dari Packing)</h2>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Item Pekerjaan</th>
                  <th className="px-8 py-5">Project</th>
                  <th className="px-8 py-5 text-center">Total Produksi</th>
                  <th className="px-8 py-5 text-center">Tunggu Validasi</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {validationList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-5 uppercase">{item.name}</td>
                    <td className="px-8 py-5 text-blue-600 text-[10px] uppercase">{item.projectName}</td>
                    <td className="px-8 py-5 text-center text-slate-400">{item.assemblyStats?.['PACKING']?.produced || 0}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-emerald-600 font-black text-lg">+{item.pendingValidation}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setEditingItem({ id: item.id, name: item.name, qty: item.pendingValidation })}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95"
                      >
                        VALIDASI MASUK <CheckCircle size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
                {validationList.length === 0 && (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada barang baru dari Packing.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STOCK SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><WhIcon size={20}/></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Posisi Stok Gudang Jadi</h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Cari stok..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Asal Project</th>
                  <th className="px-8 py-5 text-center">Total di Gudang</th>
                  <th className="px-8 py-5 text-center">Sedia Kirim</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {warehouseList.map(it => (
                  <tr key={it.id} className="hover:bg-slate-50/50 group">
                    <td className="px-8 py-5 uppercase">{it.name}</td>
                    <td className="px-8 py-5 text-blue-600 text-[10px] uppercase">{it.projectName}</td>
                    <td className="px-8 py-5 text-center text-slate-400">{it.warehouseQty}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 font-black text-lg">
                        {it.availableStock} {it.unit}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => setHistoryItem(it.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-100 flex items-center gap-2 ml-auto text-[10px] font-black uppercase"><History size={16}/> LIHAT RIWAYAT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {historyItem && (
        <div className="fixed inset-0 bg-slate-900/90 z-[500] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase">Riwayat Stok Barang Jadi</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{processedItems.find(i => i.id === historyItem)?.name}</p>
                 </div>
                 <button onClick={() => setHistoryItem(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {itemHistory.length > 0 ? itemHistory.map(log => (
                    <div key={log.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex justify-between items-center">
                       <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${log.type === 'WAREHOUSE_ENTRY' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                             {log.type === 'WAREHOUSE_ENTRY' ? <WhIcon size={24}/> : <Package size={24}/>}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                             <h4 className="font-black text-slate-800 uppercase">{log.type === 'WAREHOUSE_ENTRY' ? 'MASUK GUDANG (ACC)' : 'PACKING SELESAI'}</h4>
                             <p className="text-[9px] font-black text-blue-500 uppercase mt-1">Operator: {log.operator}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-2xl font-black ${log.type === 'WAREHOUSE_ENTRY' ? 'text-emerald-600' : 'text-blue-600'}`}>
                             +{log.goodQty}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PCS</p>
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada riwayat tercatat.</div>
                 )}
              </div>
              <div className="p-8 border-t bg-slate-50">
                 <button onClick={() => setHistoryItem(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest">Tutup Riwayat</button>
              </div>
           </div>
        </div>
      )}

      {/* EDIT QTY MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="bg-amber-100 p-5 rounded-full text-amber-600 inline-block mb-6"><WhIcon size={40}/></div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Validasi Qty Masuk</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest mb-8">{editingItem.name}</p>
            <div className="space-y-6">
              <input type="number" className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-4xl font-black text-center outline-none focus:border-blue-500 transition-all" value={editingItem.qty} onChange={e => setEditingItem({...editingItem, qty: Number(e.target.value)})} />
              <div className="flex flex-col gap-3">
                <button onClick={() => handleValidate(editingItem.id, editingItem.qty)} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3"><Save size={18}/> KONFIRMASI STOK</button>
                <button onClick={() => setEditingItem(null)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest py-2">Batalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
