import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    login(username, password).then(success => {
      if (success) {
        navigate('/');
      } else {
        setError('Username atau password salah!');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 bg-blue-600 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">MANUFAKTUR SYSTEM</h1>
            <p className="text-blue-200 text-sm mt-1">Gondola Production Control</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <input 
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: admin"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all"
            >
                MASUK SISTEM
            </button>
        </form>
      </div>
    </div>
  );
};
