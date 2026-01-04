
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Edit3, X, ChevronLeft, ChevronRight, Search, UserCheck } from 'lucide-react';
import { User, PermissionMap, ModuleName } from '../types';

// Added missing EXECUTIVE and BULK_ENTRY permissions to satisfy PermissionMap type
const INITIAL_PERMISSIONS: PermissionMap = {
  PROJECTS: { view: false, create: false, edit: false, delete: false },
  MATERIALS: { view: false, create: false, edit: false, delete: false },
  MACHINES: { view: false, create: false, edit: false, delete: false },
  USERS: { view: false, create: false, edit: false, delete: false },
  DASHBOARD: { view: true, create: false, edit: false, delete: false },
  REPORTS: { view: false, create: false, edit: false, delete: false },
  PROCUREMENT: { view: false, create: false, edit: false, delete: false },
  SJ: { view: false, create: false, edit: false, delete: false },
  WAREHOUSE: { view: false, create: false, edit: false, delete: false },
  EXECUTIVE: { view: false, create: false, edit: false, delete: false },
  BULK_ENTRY: { view: false, create: false, edit: false, delete: false },
};

// Added EXECUTIVE and BULK_ENTRY to the list of modules for UI management
const MODULES: ModuleName[] = ['DASHBOARD', 'PROJECTS', 'MATERIALS', 'MACHINES', 'USERS', 'REPORTS', 'PROCUREMENT', 'SJ', 'WAREHOUSE', 'EXECUTIVE', 'BULK_ENTRY'];

export const Users: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, can } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<Partial<User>>({ 
      name: '', username: '', role: 'OPERATOR', permissions: JSON.parse(JSON.stringify(INITIAL_PERMISSIONS)) 
  });

  if (!can('view', 'USERS')) return <div className="p-12 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenEdit = (u: User) => {
    setEditingId(u.id);
    setFormData({...u, permissions: u.permissions || JSON.parse(JSON.stringify(INITIAL_PERMISSIONS))});
    setIsModalOpen(true);
  };

  const handlePermissionChange = (module: ModuleName, action: keyof PermissionMap[ModuleName]) => {
      setFormData(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions!,
              [module]: { ...prev.permissions![module], [action]: !prev.permissions![module][action] }
          }
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId) { updateUser({ ...formData, id: editingId } as User); }
      else { addUser({ ...formData, id: `u-${Date.now()}` } as User); }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manajemen User</h1>
           <p className="text-slate-500 font-bold">Kelola karyawan dan hak akses sistem MES</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({name: '', username: '', role: 'OPERATOR', permissions: JSON.parse(JSON.stringify(INITIAL_PERMISSIONS))}); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">+ TAMBAH USER</button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari user berdasarkan nama..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                   <th className="px-8 py-5">Nama Karyawan</th>
                   <th className="px-8 py-5">Username</th>
                   <th className="px-8 py-5">Role</th>
                   <th className="px-8 py-5">Hak Akses</th>
                   <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 font-bold">
                {paginatedUsers.map(user => (
                   <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 shadow-sm">{user.name.charAt(0)}</div>
                         <p className="font-black text-slate-800 text-base">{user.name}</p>
                      </td>
                      <td className="px-8 py-5 text-blue-600 font-black tracking-widest text-xs">@{user.username}</td>
                      <td className="px-8 py-5"><span className="bg-slate-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase text-slate-600 tracking-widest border border-slate-200">{user.role}</span></td>
                      <td className="px-8 py-5">
                         <div className="flex gap-1 flex-wrap max-w-xs">
                            {Object.entries(user.permissions || {}).filter(([_, p]) => (p as any).view).map(([mod]) => (
                               <span key={mod} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-400 text-[8px] font-black rounded uppercase">{mod}</span>
                            ))}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex justify-end gap-2">
                            {user.id !== currentUser?.id && (
                               <>
                                  <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18}/></button>
                                  <button onClick={() => deleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                               </>
                            )}
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
              <div className="bg-white rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 md:p-8 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Karyawan' : 'Daftar Baru'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={24}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10">
                    <form id="userForm" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                          <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                          <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                          <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                             <option value="OPERATOR">OPERATOR</option>
                             <option value="MANAGER">MANAGER</option>
                             <option value="ADMIN">ADMIN</option>
                          </select>
                       </div>
                    </form>
                    <div className="space-y-4">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Hak Akses Modul</h4>
                       <div className="border border-slate-200 rounded-[32px] overflow-x-auto custom-scrollbar">
                          <table className="w-full text-xs text-left min-w-[500px]">
                             <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                                <tr>
                                   <th className="px-8 py-5">Modul</th>
                                   <th className="px-8 py-5 text-center">View</th>
                                   <th className="px-8 py-5 text-center">Create</th>
                                   <th className="px-8 py-5 text-center">Edit</th>
                                   <th className="px-8 py-5 text-center">Delete</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {MODULES.map(mod => (
                                   <tr key={mod}>
                                      <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tighter">{mod}</td>
                                      {['view', 'create', 'edit', 'delete'].map(action => (
                                         <td key={action} className="px-8 py-5 text-center">
                                            <input type="checkbox" className="w-6 h-6 rounded-lg text-blue-600" checked={(formData.permissions![mod] as any)[action]} onChange={() => handlePermissionChange(mod, action as any)} />
                                         </td>
                                      ))}
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 border-t shrink-0 bg-slate-50 flex justify-end gap-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                    <button type="submit" form="userForm" className="px-10 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl uppercase tracking-widest text-sm flex items-center gap-3 active:scale-95 transition-all"><UserCheck size={20}/> {editingId ? 'Simpan' : 'Daftarkan'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
