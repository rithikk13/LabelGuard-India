import React, { useState } from 'react';
import { Shield, LockKeyhole, UserRound, Loader2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { User } from '../../types';

interface LoginScreenProps {
  onLogin: (user: User, token: string) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Inspector', username: 'inspector.ramesh', role: 'inspector' },
  { label: 'Admin', username: 'admin.mukherjee', role: 'admin' },
  { label: 'Consumer', username: 'consumer.priya', role: 'consumer' }
] as const;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('inspector.ramesh');
  const [password, setPassword] = useState('LabelGuard@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await ApiService.login(username, password);
      if (!result.success) {
        setError(result.message || 'Invalid username or password');
        return;
      }
      localStorage.setItem('labelguard_auth_token', result.token);
      localStorage.setItem('labelguard_auth_user', JSON.stringify(result.user));
      onLogin(result.user, result.token);
    } catch {
      setError('Unable to reach the LabelGuard backend. Start the server and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 text-white rounded-t-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2.5 rounded-xl"><Shield className="w-7 h-7" /></div>
            <div>
              <h1 className="text-xl font-extrabold">LabelGuard <span className="text-amber-400">INDIA</span></h1>
              <p className="text-xs text-slate-400">Scan. Understand. Verify.</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-300">Secure prototype access for Consumer, Inspector and Admin workflows.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-b-2xl shadow-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Username</label>
            <div className="relative">
              <UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500" autoComplete="username" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500" autoComplete="current-password" />
            </div>
          </div>
          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-xs font-semibold">{error}</div>}
          <button disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Prototype demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(account => (
                <button type="button" key={account.role} onClick={() => { setUsername(account.username); setPassword('LabelGuard@2026'); }} className="border border-slate-200 rounded-lg p-2 text-left hover:bg-slate-50">
                  <div className="text-xs font-bold text-slate-700">{account.label}</div>
                  <div className="text-[9px] text-slate-400 truncate">{account.username}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Prototype only. Replace demo credentials with managed identity before production.</p>
          </div>
        </form>
      </div>
    </div>
  );
};
