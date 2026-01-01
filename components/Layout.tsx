
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, FolderKanban, Factory, MonitorPlay, Settings, Users, PackageSearch, Menu, X, Wrench, LogOut, BarChart3, ShoppingCart, Truck, Warehouse, Crown, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ModuleName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Executive Board', icon: Crown, path: '/executive', module: 'EXECUTIVE' as ModuleName },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', module: 'DASHBOARD' as ModuleName },
  { label: 'Projects', icon: FolderKanban, path: '/projects', module: 'PROJECTS' as ModuleName },
  { label: 'Operator Admin', icon: ClipboardList, path: '/bulk-entry', module: 'BULK_ENTRY' as ModuleName },
  { label: 'Gudang Jadi', icon: Warehouse, path: '/warehouse', module: 'WAREHOUSE' as ModuleName },
  { label: 'Pengadaan', icon: ShoppingCart, path: '/procurement', module: 'PROCUREMENT' as ModuleName },
  { label: 'Surat Jalan', icon: Truck, path: '/delivery-orders', module: 'SJ' as ModuleName },
  { label: 'Materials', icon: PackageSearch, path: '/materials', module: 'MATERIALS' as ModuleName },
  { label: 'Master Mesin', icon: Wrench, path: '/machines', module: 'MACHINES' as ModuleName },
  { label: 'Operator Board', icon: Factory, path: '/machine-board', module: 'MACHINES' as ModuleName },
  { label: 'Analytics', icon: BarChart3, path: '/reports', module: 'REPORTS' as ModuleName },
  { label: 'TV Display', icon: MonitorPlay, path: '/tv-display', module: 'DASHBOARD' as ModuleName },
  { label: 'Users', icon: Users, path: '/users', module: 'USERS' as ModuleName },
  { label: 'Settings', icon: Settings, path: '/settings', module: 'USERS' as ModuleName },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, can } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (location.pathname === '/login') return <>{children}</>;
  if (location.pathname === '/tv-display') return <div className="min-h-screen bg-slate-900 text-white">{children}</div>;

  const handleLogout = () => { logout(); navigate('/login'); };
  const filteredNav = NAV_ITEMS.filter(item => can('view', item.module));

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className={`p-8 flex items-center justify-between ${isCollapsed ? 'px-4' : ''}`}>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-2xl font-black tracking-tighter text-blue-400 uppercase leading-none">Gondola</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Flow System</p>
            </div>
          )}
          {isCollapsed && <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">G</div>}
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsSidebarOpen(false)} 
                  className={`flex items-center gap-4 py-4 text-sm font-bold rounded-[20px] transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'} ${isCollapsed ? 'px-3 justify-center' : 'px-5'}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors shrink-0`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
        </nav>

        <div className={`p-6 mt-auto border-t border-slate-800/50 ${isCollapsed ? 'px-4' : ''}`}>
           {!isCollapsed && (
             <div className="flex items-center gap-4 mb-6 px-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-xl shadow-lg border border-white/10 shrink-0">{currentUser?.name?.charAt(0)}</div>
                  <div className="text-sm overflow-hidden">
                      <p className="text-white font-black truncate">{currentUser?.name}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none mt-1">{currentUser?.role}</p>
                  </div>
             </div>
           )}
           <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-red-500 text-slate-400 hover:text-white py-4 rounded-2xl text-xs font-black transition-all duration-300 ${isCollapsed ? 'px-0' : ''}`}>
              <LogOut size={18} className="shrink-0" /> {!isCollapsed && 'LOGOUT'}
           </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Menu size={24} /></button>
             <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Menu size={20} /></button>
             <h1 className="text-xl font-black text-blue-600 tracking-tighter uppercase">MES <span className="text-slate-900">SYSTEM</span></h1>
          </div>
          <div className="flex items-center gap-4 text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Date</p>
              <p className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 lg:p-10 scroll-smooth">{children}</div>
      </main>
    </div>
  );
};
