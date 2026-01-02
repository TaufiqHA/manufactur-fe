
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus, FileText, Truck, Trash2, CheckCircle, X, ChevronRight, Save, Eye, Edit3
} from 'lucide-react';
import { RFQ, PurchaseOrder, ReceivingGoods, ProcurementItem, Supplier, RFQItem } from '../types';

type TabType = 'SUPPLIERS' | 'RFQ' | 'PO' | 'RECEIVING';

export const Procurement: React.FC = () => {
  const { suppliers, rfqs, pos, receivings, materials, addRFQ, createPO, receiveGoods, can, deleteRFQ, updateRFQ, loadRFQs, loadSuppliers, addSupplier, updateSupplier, deleteSupplier, addRfqItem, updateRfqItem, deleteRfqItem, loadRfqItems, loadPOs, addPO, updatePO: updatePOFromStore, deletePO, loadPoItems, addPoItem, updatePoItem, deletePoItem, addReceivingGood, loadReceivingGoods } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('RFQ');

  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState<RFQ | null>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [isBdModalOpen, setIsBdModalOpen] = useState<PurchaseOrder | null>(null);

  // Load data when component mounts or when specific tab is active
  useEffect(() => {
    if (activeTab === 'RFQ') {
      loadRFQs().catch(error => {
        console.error('Failed to load RFQs:', error);
      });
    }
    if (activeTab === 'PO') {
      loadPOs().catch(error => {
        console.error('Failed to load purchase orders:', error);
      });
    }
    if (activeTab === 'SUPPLIERS') {
      loadSuppliers().catch(error => {
        console.error('Failed to load suppliers:', error);
      });
    }
    if (activeTab === 'RECEIVING') {
      loadReceivingGoods().catch(error => {
        console.error('Failed to load receiving goods:', error);
      });
    }
  }, [activeTab, loadRFQs, loadPOs, loadSuppliers, loadReceivingGoods]);

  const [newRfq, setNewRfq] = useState({ description: '', items: [] as ProcurementItem[] });
  const [tempItem, setTempItem] = useState({ materialId: '', qty: 0 });
  const [poData, setPoData] = useState({ supplierId: '', description: '', items: [] as ProcurementItem[] });
  const [tempPoItem, setTempPoItem] = useState({ materialId: '', qty: 0, price: 0 });
  const [bdData, setBdData] = useState({ description: '' });

  // Receiving goods modal state
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState<PurchaseOrder | null>(null);
  const [receivingData, setReceivingData] = useState({ code: '', date: new Date().toISOString().split('T')[0], items: [] as ProcurementItem[] });

  // Supplier modal state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', address: '', contact: '' });

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

  const submitRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRfq.items.length === 0) return alert("Pilih item!");

    try {
      // First create the RFQ
      const rfq: RFQ = {
        id: `rfq-${Date.now()}`,
        code: `RFQ-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date().toISOString(),
        description: newRfq.description,
        items: newRfq.items,
        status: 'DRAFT'
      };
      await addRFQ(rfq);

      // Then create individual RFQ items if needed
      for (const item of newRfq.items) {
        try {
          await addRfqItem({
            rfq_id: rfq.id,
            material_id: item.materialId,
            name: item.name,
            qty: item.qty,
            price: item.price || 0
          });
        } catch (itemError) {
          console.error('Failed to create RFQ item:', itemError);
          // Continue with other items even if one fails
        }
      }

      setNewRfq({ description: '', items: [] });
      setIsRfqModalOpen(false);
    } catch (error) {
      console.error('Failed to create RFQ:', error);
      alert('Failed to create RFQ: ' + (error as Error).message);
    }
  };

  const startCreatePO = (rfq: RFQ) => {
    setPoData({ supplierId: '', description: rfq.description, items: rfq.items.map(i => ({ ...i, price: 0 })) });
    setIsPoModalOpen(rfq);
    setActiveTab('PO');
  };

  // Function to start editing an existing PO
  const startEditPO = (po: any) => {
    setPoData({
      supplierId: po.supplierId || po.supplier_id,
      description: po.description,
      items: po.items || []
    });
    setEditingPO(po); // Set the PO being edited
    setIsPoModalOpen(null); // We don't need the RFQ for editing
    setActiveTab('PO');
  };

  const createPOFromRFQ = async (rfq: RFQ) => {
    try {
      // Create the PO first
      const poDataToSend = {
        code: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date().toISOString().split('T')[0], // Format date as YYYY-MM-DD
        supplierId: poData.supplierId,
        rfq_id: rfq.id,
        description: poData.description,
        status: 'OPEN',
        grandTotal: poData.items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0),
        items: poData.items
      };

      const createdPO = await addPO(poDataToSend);

      // Update the RFQ status to 'PO_CREATED'
      await updateRFQ(rfq.id, { status: 'PO_CREATED' });

      // Close the modal and reset state
      setIsPoModalOpen(null);
      setPoData({ supplierId: '', description: '', items: [] });
    } catch (error) {
      console.error('Failed to create PO or update RFQ:', error);
      alert('Failed to create PO: ' + (error as Error).message);
    }
  };

  // Function to update an existing PO
  const updateExistingPO = async (poId?: string) => {
    try {
      const poIdToUpdate = poId || editingPO?.id;
      if (!poIdToUpdate) {
        alert('No PO ID provided for update');
        return;
      }

      const poDataToSend = {
        supplierId: poData.supplierId,
        description: poData.description,
        status: 'OPEN', // Keep status as OPEN for now
        grandTotal: poData.items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0),
        items: poData.items
      };

      await updatePOFromStore(poIdToUpdate, poDataToSend);

      // Close the modal and reset state
      setIsPoModalOpen(null);
      setEditingPO(null);
      setPoData({ supplierId: '', description: '', items: [] });
    } catch (error) {
      console.error('Failed to update PO:', error);
      alert('Failed to update PO: ' + (error as Error).message);
    }
  };

  // Note: The original startReceiving function has been replaced with the new implementation
  // that uses the receiving goods modal instead of the bd modal

  // Function to add an item to an existing RFQ using the API
  const addRfqItemToRfq = async (rfqId: string, item: ProcurementItem) => {
    try {
      await addRfqItem({
        rfq_id: rfqId,
        material_id: item.materialId,
        name: item.name,
        qty: item.qty,
        price: item.price || 0
      });
    } catch (error) {
      console.error('Failed to add RFQ item via API:', error);
      // The error is caught but we continue with local state update
    }
  };

  // Function to delete an item from an RFQ using the API
  const deleteRfqItemFromRfq = async (rfqId: string, itemIndex: number) => {
    // In the current implementation, we don't have individual RFQ item IDs
    // So we'll need to handle this differently - maybe by updating the entire RFQ
    // For now, we'll just update the local state
    console.log('Deleting item from RFQ:', rfqId, itemIndex);
  };

  // Function to delete a PO
  const deletePOHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deletePO(id);
      } catch (error) {
        console.error('Failed to delete PO:', error);
        alert('Failed to delete PO: ' + (error as Error).message);
      }
    }
  };

  // Function to add a PO item
  const handleAddPoItem = () => {
    const mat = materials.find(m => m.id === tempPoItem.materialId);
    if (mat && tempPoItem.qty > 0) {
      setPoData(prev => ({
        ...prev,
        items: [...prev.items, {
          materialId: mat.id,
          name: mat.name,
          qty: tempPoItem.qty,
          price: tempPoItem.price
        }]
      }));
      setTempPoItem({ materialId: '', qty: 0, price: 0 });
    }
  };

  // Function to remove a PO item
  const handleRemovePoItem = (index: number) => {
    setPoData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Supplier functions
  const openAddSupplierModal = () => {
    setEditingSupplier(null);
    setNewSupplier({ name: '', address: '', contact: '' });
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ name: supplier.name, address: supplier.address, contact: supplier.contact });
    setIsSupplierModalOpen(true);
  };

  const submitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (editingSupplier) {
        // Update existing supplier
        await updateSupplier(editingSupplier.id, newSupplier);
      } else {
        // Add new supplier
        const supplierToCreate: Supplier = {
          id: `sup-${Date.now()}`, // This will be replaced by the API response
          ...newSupplier
        };
        await addSupplier(supplierToCreate);
      }

      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', address: '', contact: '' });
    } catch (error) {
      console.error('Failed to save supplier:', error);
      alert('Failed to save supplier: ' + (error as Error).message);
    }
  };

  const deleteSupplierHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
        alert('Failed to delete supplier: ' + (error as Error).message);
      }
    }
  };

  // Receiving goods functions
  const startReceiving = (po: PurchaseOrder) => {
    // Pre-populate receiving items with the same items from the PO
    const receivingItems = Array.isArray(po.items)
      ? po.items.map(item => ({
          materialId: item.materialId || item.material_id,
          name: item.name,
          qty: item.qty
        }))
      : [];

    setReceivingData({
      code: `RG-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      items: receivingItems
    });
    setIsReceivingModalOpen(po);
  };

  const submitReceiving = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReceivingModalOpen) return;

    // Validate that received quantities are positive
    for (const item of receivingData.items) {
      if (item.qty <= 0) {
        alert(`Received quantity for ${item.name} must be greater than 0`);
        return;
      }
    }

    try {
      // Create the receiving good with only the required fields, ensuring clean data structure
      const receivingGoodData = {
        code: receivingData.code,
        date: receivingData.date,
        po_id: isReceivingModalOpen.id,
        items: receivingData.items.map(item => ({
          material_id: item.materialId || item.material_id,
          name: item.name,
          qty: Number(item.qty) // Ensure qty is a number
        }))
      };

      await addReceivingGood(receivingGoodData);

      // Update the PO status to RECEIVED - only send the status field to avoid validation errors
      try {
        await updatePOFromStore(isReceivingModalOpen.id, { status: 'RECEIVED' });
      } catch (statusUpdateError) {
        console.error('Failed to update PO status, but receiving good was created successfully:', statusUpdateError);
        // Continue with closing the modal even if status update fails
      }

      // Close the modal and reset state
      setIsReceivingModalOpen(null);
      setReceivingData({ code: '', date: new Date().toISOString().split('T')[0], items: [] as ProcurementItem[] });
    } catch (error) {
      console.error('Failed to create receiving good:', error);
      alert('Failed to create receiving good: ' + (error as Error).message);
    }
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
           {activeTab === 'SUPPLIERS' && (
             <button onClick={openAddSupplierModal} className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus size={18}/> NEW SUPPLIER</button>
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
                      <div className="flex justify-end gap-2">
                        {r.status === 'DRAFT' && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this RFQ?')) {
                                try {
                                  await deleteRFQ(r.id);
                                } catch (error) {
                                  console.error('Failed to delete RFQ:', error);
                                  alert('Failed to delete RFQ: ' + (error as Error).message);
                                }
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {r.status === 'DRAFT' && (
                          <button onClick={() => startCreatePO(r)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95">CREATE PO <ChevronRight size={14}/></button>
                        )}
                      </div>
                   </td>
                 </tr>
               ))}
               
               {activeTab === 'PO' && pos.map(p => (
                 <tr key={p.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-emerald-600 font-black">{p.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(p.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-slate-800 uppercase text-xs truncate max-w-[200px]">
                     {suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown Vendor'}
                   </td>
                   <td className="px-8 py-5 text-blue-600 font-black text-base">Rp{p.grandTotal.toLocaleString()}</td>
                   <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'RECEIVED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {p.status === 'OPEN' && (
                          <button onClick={() => startReceiving(p)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95">RECEIVE <Truck size={14}/></button>
                        )}
                        {p.status === 'OPEN' && (
                          <button onClick={() => startEditPO(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit3 size={16}/>
                          </button>
                        )}
                        {p.status === 'OPEN' && (
                          <button onClick={() => deletePOHandler(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
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
                   <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                       <button onClick={() => openEditSupplierModal(s)} className="text-slate-400 p-2 hover:text-blue-600 transition-colors"><Edit3 size={16}/></button>
                       <button onClick={() => deleteSupplierHandler(s.id)} className="text-slate-400 p-2 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                     </div>
                   </td>
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
                               <p className="text-2xl font-black text-blue-600 leading-none">{it.qty}</p>
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

      {/* PO MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
           <div className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Create Purchase Order</h2>
                 <button onClick={() => setIsPoModalOpen(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={28}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Supplier</label>
                    <select className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={poData.supplierId} onChange={e => setPoData({...poData, supplierId: e.target.value})}>
                      <option value="">Choose supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
                    <input className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={poData.description} onChange={e => setPoData({...poData, description: e.target.value})} />
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText size={14}/> PO ITEMS</h4>
                    <div className="bg-blue-50/50 p-6 rounded-[32px] border-2 border-blue-100 border-dashed space-y-6">
                       <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-1 w-full space-y-2">
                             <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Select Material</label>
                             <select className="w-full p-4 bg-white rounded-2xl font-black outline-none border border-slate-200 focus:ring-4 focus:ring-blue-100 transition-all appearance-none" value={tempPoItem.materialId} onChange={e => setTempPoItem({...tempPoItem, materialId: e.target.value})}>
                               <option value="">Choose material...</option>
                               {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.currentStock} {m.unit})</option>)}
                             </select>
                          </div>
                          <div className="w-full md:w-32 space-y-2">
                             <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center block">Quantity</label>
                             <input type="number" className="w-full p-4 bg-white rounded-2xl font-black text-center border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={tempPoItem.qty} onChange={e => setTempPoItem({...tempPoItem, qty: Number(e.target.value)})} />
                          </div>
                          <div className="w-full md:w-32 space-y-2">
                             <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center block">Price</label>
                             <input type="number" className="w-full p-4 bg-white rounded-2xl font-black text-center border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={tempPoItem.price} onChange={e => setTempPoItem({...tempPoItem, price: Number(e.target.value)})} />
                          </div>
                          <button onClick={handleAddPoItem} className="w-full md:w-16 bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center shrink-0"><Plus size={24}/></button>
                       </div>
                    </div>
                    <div className="divide-y border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                       {poData.items.map((it, idx) => (
                         <div key={idx} className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center bg-white hover:bg-slate-50 transition-colors gap-4">
                            <div className="text-center sm:text-left">
                               <p className="font-black text-slate-800 text-base uppercase leading-tight">{it.name}</p>
                               <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">Qty: {it.qty}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="w-32">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Price</label>
                                  <input type="number" className="w-full p-3 bg-white rounded-xl font-black text-center border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={it.price || 0} onChange={e => {
                                    const newItems = [...poData.items];
                                    newItems[idx] = { ...newItems[idx], price: Number(e.target.value) };
                                    setPoData({...poData, items: newItems});
                                  }} />
                               </div>
                               <p className="text-xl font-black text-emerald-600 leading-none">Rp{(it.price || 0) * it.qty}</p>
                               <button onClick={() => handleRemovePoItem(idx)} className="p-2 text-red-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                            </div>
                         </div>
                       ))}
                       {poData.items.length === 0 && <div className="p-16 text-center text-slate-200 font-black uppercase italic tracking-[0.2em] text-xs">No items in PO</div>}
                    </div>
                 </div>
              </div>
              <div className="p-6 md:p-8 border-t shrink-0 bg-slate-50 flex justify-end gap-4">
                 <button onClick={() => setIsPoModalOpen(null)} className="px-8 py-4 rounded-[24px] font-black text-lg uppercase border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all">CANCEL</button>
                 {isPoModalOpen ? (
                   <button onClick={() => createPOFromRFQ(isPoModalOpen!)} className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-600 transition-all">CREATE PO</button>
                 ) : (
                   <button onClick={() => updateExistingPO()} className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-600 transition-all">UPDATE PO</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
           <div className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                   {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                 </h2>
                 <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={28}/></button>
              </div>
              <form onSubmit={submitSupplier} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Supplier Name</label>
                    <input
                      className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="e.g. ABC Supplier"
                      value={newSupplier.name}
                      onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Address</label>
                    <textarea
                      className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[100px]"
                      placeholder="e.g. Jl. Merdeka No. 123, Jakarta"
                      value={newSupplier.address}
                      onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact</label>
                    <input
                      className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="e.g. 081234567890"
                      value={newSupplier.contact}
                      onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                      required
                    />
                 </div>
                 <div className="p-6 md:p-8 border-t shrink-0 bg-slate-50 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-8 py-4 rounded-[24px] font-black text-lg uppercase border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all">CANCEL</button>
                    <button type="submit" className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-600 transition-all">SAVE</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* RECEIVING GOODS MODAL */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md">
           <div className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Receive Goods</h2>
                 <button onClick={() => setIsReceivingModalOpen(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={28}/></button>
              </div>
              <form onSubmit={submitReceiving} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Receiving Code</label>
                       <input
                         className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                         placeholder="e.g. RG-001"
                         value={receivingData.code}
                         onChange={e => setReceivingData({...receivingData, code: e.target.value})}
                         required
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date</label>
                       <input
                         type="date"
                         className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                         value={receivingData.date}
                         onChange={e => setReceivingData({...receivingData, date: e.target.value})}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText size={14}/> RECEIVING ITEMS</h4>
                    <div className="divide-y border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                       {isReceivingModalOpen && receivingData.items.length > 0 ? (
                         receivingData.items.map((item, idx) => {
                           // Find the corresponding item in the original PO to get the PO quantity
                           const originalPoItem = isReceivingModalOpen?.items?.find(poItem =>
                             (poItem.materialId || poItem.material_id) === item.materialId
                           );
                           const poQty = originalPoItem ? originalPoItem.qty : item.qty;

                           return (
                           <div key={idx} className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center bg-white hover:bg-slate-50 transition-colors gap-4">
                              <div className="text-center sm:text-left">
                                 <p className="font-black text-slate-800 text-base uppercase leading-tight">{item.name}</p>
                                 <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">Ref ID: {item.materialId}</p>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-center">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">PO Qty</p>
                                    <p className="font-black text-slate-700 text-lg">{poQty}</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Received</p>
                                    <input
                                      type="number"
                                      className={`w-16 p-2 rounded-lg font-black text-center border outline-none focus:ring-2 focus:ring-blue-300 transition-all ${
                                        item.qty > poQty
                                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                                          : 'bg-blue-50 border-blue-200'
                                      }`}
                                      value={item.qty}
                                      onChange={e => {
                                        const newItems = [...receivingData.items];
                                        newItems[idx] = { ...newItems[idx], qty: Number(e.target.value) };
                                        setReceivingData({...receivingData, items: newItems});
                                      }}
                                      min="0"
                                    />
                                    {item.qty > poQty && (
                                      <p className="text-[8px] text-amber-600 font-black mt-1">OVER RECEIVED</p>
                                    )}
                                 </div>
                              </div>
                           </div>
                         )})
                       ) : isReceivingModalOpen ? (
                         <div className="p-16 text-center text-slate-200 font-black uppercase italic tracking-[0.2em] text-xs">
                           No items to receive from this PO
                         </div>
                       ) : (
                         <div className="p-16 text-center text-slate-200 font-black uppercase italic tracking-[0.2em] text-xs">
                           Loading items...
                         </div>
                       )}
                    </div>
                 </div>
                 <div className="p-6 md:p-8 border-t shrink-0 bg-slate-50 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsReceivingModalOpen(null)} className="px-8 py-4 rounded-[24px] font-black text-lg uppercase border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all">CANCEL</button>
                    <button type="submit" className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-600 transition-all">RECEIVE GOODS</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};