
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { MachineBoard } from './pages/MachineBoard';
import { TvDisplay } from './pages/TvDisplay';
import { Materials } from './pages/Materials';
import { Machines } from './pages/Machines';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { Procurement } from './pages/Procurement';
import { DeliveryOrders } from './pages/DeliveryOrders';
import { Warehouse } from './pages/Warehouse';
import { Executive } from './pages/Executive';
import { BulkEntry } from './pages/BulkEntry';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const currentUser = useStore(state => state.currentUser);
  if (!currentUser) { return <Navigate to="/login" replace />; }
  return <>{children}</>;
};

function App() {
  const initializeStore = useStore(state => state.initialize);

  useEffect(() => {
    // Initialize the store with data from the API
    initializeStore();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/executive" element={<ProtectedRoute><Executive /></ProtectedRoute>} />
          <Route path="/bulk-entry" element={<ProtectedRoute><BulkEntry /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute><Procurement /></ProtectedRoute>} />
          <Route path="/warehouse" element={<ProtectedRoute><Warehouse /></ProtectedRoute>} />
          <Route path="/delivery-orders" element={<ProtectedRoute><DeliveryOrders /></ProtectedRoute>} />
          <Route path="/machines" element={<ProtectedRoute><Machines /></ProtectedRoute>} />
          <Route path="/machine-board" element={<ProtectedRoute><MachineBoard /></ProtectedRoute>} />
          <Route path="/tv-display" element={<ProtectedRoute><TvDisplay /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
