import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, FileText, Truck, Trash2, CheckCircle, X, ChevronRight, Save, Eye, Edit3
} from 'lucide-react';
import { RFQ, PurchaseOrder, ReceivingGoods, ProcurementItem } from '../types';

type TabType = 'SUPPLIERS' | 'RFQ' | 'PO' | 'RECEIVING';

export const Procurement: React.FC = () => {
  const { suppliers, rfqs, pos, receivings, materials, addRFQ, createPO, receiveGoods, can } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('RFQ');

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState<RFQ | null>(null);
  const [isBdModalOpen, setIsBdModalOpen] = useState<PurchaseOrder | null>(null);

  const [newRfq, setNewRfq] = useState({ description: '', items: [] as ProcurementItem[] });
  const [tempItem, setTempItem] = useState({ materialId: '', qty: 0 });
  const [poData, setPoData] = useState({ supplierId: '', description: '', items: [] as ProcurementItem[] });
  const [bdData, setBdData] = useState({ description: '' });

  if (!can('view', 'PROCUREMENT')) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">Akses Ditolak.</div>;

  const handleAddRfqItem = () => {
    const mat = materials.find(m => m.id === tempItem.materialId);
    if (mat && tempItem.qty > 0) {
      setNewRfq(prev => ({
        ...prev,
        items: [...prev.items, { materialId: mat.id, name: mat.name, qty: tempItem.qty }]
      }));
      setTempItem({ materialId: '', qty: 0 });
    }
  };

  const submitRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRfq.items.length === 0) return alert("Pilih item!");
    const rfq: RFQ = {
      id: `rfq-${Date.now()}`,
      code: `RFQ-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString(),
      description: newRfq.description,
      items: newRfq.items,
      status: 'DRAFT'
    };
    addRFQ(rfq);
    setNewRfq({ description: '', items: [] });
    setIsRfqModalOpen(false);
  };

  const startCreatePO = (rfq: RFQ) => {
    setPoData({ supplierId: '', description: rfq.description, items: rfq.items.map(i => ({ ...i, price: 0 })) });
    setIsPoModalOpen(rfq);
    setActiveTab('PO');
  };

  const startReceiving = (po: PurchaseOrder) => {
    setBdData({ description: po.description });
    setIsBdModalOpen(po);
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Procurement</h1>
           <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Workflow RFQ &rarr; PO &rarr; Receiving &rarr; Stock Sync</p>
        </div>
        <div className="w-full md:w-auto">
           {activeTab === 'RFQ' && (
             <button onClick={() => setIsRfqModalOpen(true)} className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus size={18}/> NEW RFQ</button>
           )}
        </div>
      </div>

      <div className="flex gap-4 md:gap-8 border-b-2 border-slate-100 px-2 md:px-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
        {(['RFQ', 'PO', 'RECEIVING', 'SUPPLIERS'] as const).map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`pb-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {tab === 'RECEIVING' ? 'Goods Received' : tab}
             {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
           </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Kode / Tanggal</th>
                <th className="px-8 py-5">{activeTab === 'SUPPLIERS' ? 'Alamat' : 'Keterangan'}</th>
                <th className="px-8 py-5">{activeTab === 'SUPPLIERS' ? 'Kontak' : 'Total'}</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
               {activeTab === 'RFQ' && rfqs.map(r => (
                 <tr key={r.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-blue-600 font-black">{r.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(r.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-slate-600 truncate max-w-[200px]">{r.description || '-'}</td>
                   <td className="px-8 py-5 text-slate-400 uppercase text-[10px]">{r.items.length} Items</td>
                   <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.status === 'PO_CREATED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{r.status}</span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      {r.status === 'DRAFT' && (
                        <button onClick={() => startCreatePO(r)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95">CREATE PO <ChevronRight size={14}/></button>
                      )}
                   </td>
                 </tr>
               ))}
               
               {activeTab === 'PO' && pos.map(p => (
                 <tr key={p.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-emerald-600 font-black">{p.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(p.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-slate-800 uppercase text-xs truncate max-w-[200px]">{suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown Vendor'}</td>
                   <td className="px-8 py-5 text-blue-600 font-black text-base">Rp{p.grandTotal.toLocaleString()}</td>
                   <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'RECEIVED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      {p.status === 'OPEN' && (
                        <button onClick={() => startReceiving(p)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95">RECEIVE <Truck size={14}/></button>
                      )}
                   </td>
                 </tr>
               ))}

               {activeTab === 'RECEIVING' && receivings.map(bd => (
                 <tr key={bd.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-slate-900 font-black">{bd.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(bd.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-blue-600 font-black text-xs">{pos.find(p => p.id === bd.poId)?.code}</td>
                   <td className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-tighter">{bd.items.reduce((acc, c) => acc + c.qty, 0)} Units Ready</td>
                   <td className="px-8 py-5">
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border border-emerald-100"><CheckCircle size={10}/> SYNCED</div>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <button className="text-slate-300 p-2"><Eye size={16}/></button>
                   </td>
                 </tr>
               ))}

               {activeTab === 'SUPPLIERS' && suppliers.map(s => (
                 <tr key={s.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5 text-slate-900 uppercase font-black">{s.name}</td>
                   <td className="px-8 py-5 text-slate-400 italic text-[11px] truncate max-w-[250px]">{s.address}</td>
                   <td className="px-8 py-5 text-slate-600 font-mono text-xs">{s.contact}</td>
                   <td className="px-8 py-5"><span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Active</span></td>
                   <td className="px-8 py-5 text-right"><button className="text-slate-300 p-2"><Edit3 size={16}/></button></td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ MODAL */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
           <div className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">New RFQ Draft</h2>
                 <button onClick={() => setIsRfqModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={28}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Purpose / Description</label>
                    <input className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all" placeholder="e.g. Q4 Raw Material Restock" value={newRfq.description} onChange={e => setNewRfq({...newRfq, description: e.target.value})} />
                 </div>

                 <div className="bg-blue-50/50 p-6 rounded-[32px] border-2 border-blue-100 border-dashed space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                       <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Select Material</label>
                          <select className="w-full p-4 bg-white rounded-2xl font-black outline-none border border-slate-200 focus:ring-4 focus:ring-blue-100 transition-all appearance-none" value={tempItem.materialId} onChange={e => setTempItem({...tempItem, materialId: e.target.value})}>
                            <option value="">Choose material...</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.currentStock} {m.unit})</option>)}
                          </select>
                       </div>
                       <div className="w-full md:w-32 space-y-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center block">Quantity</label>
                          <input type="number" className="w-full p-4 bg-white rounded-2xl font-black text-center border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={tempItem.qty} onChange={e => setTempItem({...tempItem, qty: Number(e.target.value)})} />
                       </div>
                       <button onClick={handleAddRfqItem} className="w-full md:w-16 bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center shrink-0"><Plus size={24}/></button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText size={14}/> QUOTATION ITEMS</h4>
                    <div className="divide-y border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                       {newRfq.items.map((it, idx) => (
                         <div key={idx} className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center bg-white hover:bg-slate-50 transition-colors gap-4">
                            <div className="text-center sm:text-left">
                               <p className="font-black text-slate-800 text-base uppercase leading-tight">{it.name}</p>
                               <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">Ref ID: {it.materialId}</p>
                            </div>
                            <div className="flex items-center gap-8">
                               <p className="text-2xl font-black text-blue-600 leading-none">{formatNumber(it.qty)}</p>
                               <button onClick={() => setNewRfq(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="p-2 text-red-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                            </div>
                         </div>
                       ))}
                       {newRfq.items.length === 0 && <div className="p-16 text-center text-slate-200 font-black uppercase italic tracking-[0.2em] text-xs">No items added to draft</div>}
                    </div>
                 </div>
              </div>
              <div className="p-6 md:p-8 border-t shrink-0 bg-slate-50 flex justify-end">
                  <button onClick={submitRFQ} className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-lg uppercase shadow-2xl tracking-[0.1em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95"><Save size={20}/> SAVE RFQ DRAFT</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
