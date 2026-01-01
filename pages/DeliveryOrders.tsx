
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, Truck, Search, X, CheckCircle, Package, Calendar, MapPin, User, Trash2, Save, ArrowRight, FolderKanban, Box, AlertCircle, Info, ChevronLeft, ChevronRight, Eye, ShieldCheck, Edit3, Target, Printer
} from 'lucide-react';
import { DeliveryOrder, DeliveryOrderItem, Project } from '../types';

type TabType = 'DRAFT' | 'HISTORY';

export const DeliveryOrders: React.FC = () => {
  const { items, projects, deliveryOrders, createDeliveryOrder, updateDeliveryOrder, validateDeliveryOrder, deleteDeliveryOrder, can } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('DRAFT');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSJ, setEditingSJ] = useState<DeliveryOrder | null>(null);

  const [sjData, setSjData] = useState({
    customer: '', address: '', driverName: '', vehiclePlate: '', items: [] as DeliveryOrderItem[]
  });

  const processedItems = useMemo(() => {
    return items.map(item => {
      const availableStock = (item.warehouseQty || 0) - (item.shippedQty || 0);
      const project = projects.find(p => p.id === item.projectId);
      return { ...item, availableStock, projectName: project?.name || 'N/A' };
    });
  }, [items, projects]);

  const drafts = deliveryOrders.filter(o => o.status === 'DRAFT');
  const history = deliveryOrders.filter(o => o.status === 'VALIDATED');

  const filteredHistory = history.filter(sj => 
    sj.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sj.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isSjReadyToShip = (sjItems: DeliveryOrderItem[]) => {
    if (sjItems.length === 0) return false;
    return sjItems.every(si => {
      const it = processedItems.find(f => f.id === si.itemId);
      return it ? it.availableStock >= si.qty : false;
    });
  };

  const addProjectToSJ = (project: Project) => {
    const projectItems = items.filter(i => i.projectId === project.id);
    const newSjItems: DeliveryOrderItem[] = projectItems.map(item => ({
      projectId: project.id,
      projectName: project.name,
      itemId: item.id,
      itemName: item.name,
      qty: project.qtyPerUnit * item.qtySet,
      unit: item.unit
    }));

    setSjData(prev => {
      const existingIds = prev.items.map(i => i.itemId);
      const uniqueNewItems = newSjItems.filter(ni => !existingIds.includes(ni.itemId));
      return {
        ...prev,
        items: [...prev.items, ...uniqueNewItems],
        customer: prev.customer || project.customer,
        address: prev.address || "Alamat Default Customer"
      };
    });
  };

  const handleSubmitSJ = (e: React.FormEvent) => {
    e.preventDefault();
    const newSJ: DeliveryOrder = {
      ...sjData,
      id: editingSJ ? editingSJ.id : `sj-${Date.now()}`,
      code: editingSJ ? editingSJ.code : `SJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 900) + 100}`,
      date: new Date().toISOString(),
      status: 'DRAFT'
    };
    
    if (editingSJ) updateDeliveryOrder(newSJ);
    else createDeliveryOrder(newSJ);
    
    setIsModalOpen(false);
    setEditingSJ(null);
    setSjData({ customer: '', address: '', driverName: '', vehiclePlate: '', items: [] });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Surat Jalan</h1>
           <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Penerbitan & Monitoring Dokumen Pengiriman</p>
        </div>
        <button onClick={() => { setEditingSJ(null); setSjData({customer:'', address:'', driverName:'', vehiclePlate:'', items:[]}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
          <Plus size={20}/> BUAT DRAFT SJ
        </button>
      </div>

      <div className="flex gap-8 border-b-2 border-slate-100 px-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
        <button onClick={() => setActiveTab('DRAFT')} className={`pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'DRAFT' ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]' : 'text-slate-400'}`}>Draft & Validasi</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'HISTORY' ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]' : 'text-slate-400'}`}>Arsip Terkirim</button>
      </div>

      {activeTab === 'DRAFT' ? (
        <div className="grid grid-cols-1 gap-6">
           {drafts.map(sj => {
             const ready = isSjReadyToShip(sj.items);
             return (
               <div key={sj.id} className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm flex flex-col xl:flex-row gap-10 items-start xl:items-center animate-in slide-in-from-bottom-4">
                  <div className="flex-1 space-y-3">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sj.code}</span>
                        <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">DRAFT</span>
                     </div>
                     <h3 className="text-2xl font-black uppercase text-slate-900">{sj.customer}</h3>
                     <p className="text-xs text-slate-500 font-bold flex gap-2"><MapPin size={16} className="text-blue-500 shrink-0"/> {sj.address}</p>
                  </div>
                  <div className="flex gap-10 items-center">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">TOTAL MUATAN</p>
                       <p className="text-2xl font-black text-slate-900">{sj.items.reduce((acc, c) => acc + c.qty, 0)} <span className="text-xs">PCS</span></p>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => { setEditingSJ(sj); setSjData({ customer: sj.customer, address: sj.address, driverName: sj.driverName, vehiclePlate: sj.vehiclePlate, items: sj.items }); setIsModalOpen(true); }} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-100"><Edit3 size={20}/></button>
                       <button onClick={() => deleteDeliveryOrder(sj.id)} className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-100"><Trash2 size={20}/></button>
                       <button 
                        onClick={() => validateDeliveryOrder(sj.id)} disabled={!ready}
                        className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all ${ready ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                       >
                         {ready ? <><CheckCircle size={18}/> VALIDASI & TERBITKAN</> : <><AlertCircle size={18}/> STOK BELUM SIAP</>}
                       </button>
                    </div>
                  </div>
               </div>
             )
           })}
           {drafts.length === 0 && <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Tidak ada draft surat jalan.</div>}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari arsip berdasarkan nomor SJ atau customer..." className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[28px] font-black text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <div className="grid grid-cols-1 gap-6">
              {paginatedHistory.map(sj => (
                <div key={sj.id} className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm flex flex-col xl:flex-row gap-10 items-start xl:items-center hover:shadow-xl transition-all group">
                   <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{sj.code}</span>
                         <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">VALIDATED</span>
                         <span className="text-[9px] text-slate-400 font-bold ml-2">{new Date(sj.date).toLocaleString()}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-slate-900">{sj.customer}</h3>
                      <div className="flex gap-6 mt-2">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><User size={14} className="text-blue-500"/> Sopir: {sj.driverName}</p>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Truck size={14} className="text-blue-500"/> Plat: {sj.vehiclePlate}</p>
                      </div>
                   </div>
                   <div className="flex gap-10 items-center">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">TOTAL PCS</p>
                         <p className="text-2xl font-black text-slate-900">{sj.items.reduce((acc, c) => acc + c.qty, 0)}</p>
                      </div>
                      <div className="flex gap-3">
                         <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"><Printer size={18}/> Cetak SJ</button>
                      </div>
                   </div>
                </div>
              ))}
              {paginatedHistory.length === 0 && <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada arsip pengiriman.</div>}
           </div>
           
           {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                 <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 bg-white border rounded-2xl disabled:opacity-30"><ChevronLeft size={20}/></button>
                 <span className="bg-white border rounded-2xl px-6 py-4 font-black text-sm flex items-center">Halaman {currentPage} dari {totalPages}</span>
                 <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-white border rounded-2xl disabled:opacity-30"><ChevronRight size={20}/></button>
              </div>
           )}
        </div>
      )}

      {/* MODAL SJ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">{editingSJ ? 'Edit Draft Surat Jalan' : 'Input Surat Jalan Baru'}</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Dokumen Pengiriman Barang Jadi</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b">
                   <div className="p-8 bg-slate-50 border-r">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FolderKanban size={14}/> 1. Tarik Data Project Aktif</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar p-1">
                         {projects.filter(p => p.status === 'IN_PROGRESS' || p.isLocked).map(p => {
                           const isAdded = sjData.items.some(i => i.projectId === p.id);
                           return (
                             <div 
                               key={p.id}
                               className={`p-6 rounded-[32px] border-2 transition-all flex flex-col gap-2 relative group ${isAdded ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-white hover:border-blue-500 shadow-sm'}`}
                             >
                                <div className="flex justify-between items-start">
                                   <p className="text-[9px] font-black text-blue-600 uppercase">{p.code}</p>
                                   {isAdded && <CheckCircle size={14} className="text-emerald-500"/>}
                                </div>
                                <h5 className="font-black text-slate-900 uppercase text-sm leading-tight mb-2">{p.name}</h5>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                                   <span>{p.customer}</span>
                                </div>
                                {!isAdded && (
                                   <button 
                                     onClick={() => addProjectToSJ(p)}
                                     className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                                   >
                                     TAMBAHKAN KE SJ
                                   </button>
                                )}
                             </div>
                           );
                         })}
                      </div>
                   </div>

                   <div className="p-8 bg-white">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Truck size={14}/> 2. Detail Pengiriman</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                           <input placeholder="Nama Penerima / Customer" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.customer} onChange={e => setSjData({...sjData, customer: e.target.value})} />
                         </div>
                         <div className="md:col-span-2">
                           <textarea placeholder="Alamat Lengkap Tujuan" rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.address} onChange={e => setSjData({...sjData, address: e.target.value})} />
                         </div>
                         <input placeholder="Nama Sopir" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.driverName} onChange={e => setSjData({...sjData, driverName: e.target.value})} />
                         <input placeholder="No. Plat Kendaraan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.vehiclePlate} onChange={e => setSjData({...sjData, vehiclePlate: e.target.value})} />
                      </div>
                   </div>
                </div>

                <div className="p-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Box size={14}/> 3. Daftar Muatan Barang</h4>
                   <div className="border border-slate-200 rounded-[32px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs min-w-[900px]">
                         <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                            <tr>
                               <th className="px-8 py-5">Item Pekerjaan</th>
                               <th className="px-8 py-5">Asal Project</th>
                               <th className="px-8 py-5 text-center">Target Kontrak</th>
                               <th className="px-8 py-5 text-center">Qty SJ</th>
                               <th className="px-8 py-5 text-center">Ready di WH</th>
                               <th className="px-8 py-5 text-right">Aksi</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-bold">
                            {sjData.items.map((item, idx) => {
                               const fg = processedItems.find(f => f.id === item.itemId);
                               const proj = projects.find(p => p.id === item.projectId);
                               const targetTotal = proj ? proj.qtyPerUnit * (items.find(i=>i.id===item.itemId)?.qtySet || 1) : 0;
                               const isStockShort = fg ? fg.availableStock < item.qty : true;
                               
                               return (
                                 <tr key={idx} className={`hover:bg-slate-50/50 ${isStockShort ? 'bg-red-50/30' : ''}`}>
                                   <td className="px-8 py-5 uppercase text-slate-900">{item.itemName}</td>
                                   <td className="px-8 py-5 text-blue-600 uppercase text-[10px]">{item.projectName}</td>
                                   <td className="px-8 py-5 text-center">
                                      <div className="flex flex-col items-center">
                                         <span className="text-slate-900 font-black">{targetTotal} {item.unit}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-center">
                                      <input 
                                        type="number" 
                                        className="w-24 p-2 bg-white border-2 border-slate-200 rounded-lg text-center font-black text-blue-600 focus:border-blue-500 outline-none"
                                        value={item.qty}
                                        onChange={e => {
                                          const newItems = [...sjData.items];
                                          newItems[idx].qty = Number(e.target.value);
                                          setSjData({ ...sjData, items: newItems });
                                        }}
                                      />
                                   </td>
                                   <td className="px-8 py-5 text-center">
                                      <span className={`${isStockShort ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'} px-3 py-1.5 rounded-xl border border-current/20 font-black`}>
                                        {fg?.availableStock || 0} {item.unit}
                                      </span>
                                   </td>
                                   <td className="px-8 py-5 text-right">
                                      <button onClick={() => {
                                        const ni = sjData.items.filter((_, i) => i !== idx);
                                        setSjData({...sjData, items: ni});
                                      }} className="p-3 text-slate-300 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={18}/></button>
                                   </td>
                                 </tr>
                               );
                            })}
                            {sjData.items.length === 0 && (
                               <tr>
                                  <td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase italic text-[10px] tracking-widest">
                                     Silahkan tarik data project di atas untuk mengisi muatan.
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Info size={24}/></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Pastikan jumlah muatan tidak melebihi stok gudang<br/>untuk melakukan validasi pengiriman.</p>
                 </div>
                 <button 
                  onClick={handleSubmitSJ} disabled={sjData.items.length === 0 || !sjData.customer} 
                  className="w-full sm:w-auto bg-slate-900 text-white px-12 py-5 rounded-[28px] font-black uppercase shadow-2xl tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
                 >
                   <Save size={20}/> SIMPAN DRAFT SURAT JALAN
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
