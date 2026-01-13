
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const toggleAuthorization = async (userId: string, currentState: boolean) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ is_authorized: !currentState })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_authorized: !currentState } : u));
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Gestor de Usuários</h2>
        <p className="text-slate-500 mt-2">Autorize ou revogue o acesso de terapeutas à plataforma.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Usuário / Terapeuta</th>
                  <th className="px-8 py-5">Status de Acesso</th>
                  <th className="px-8 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                          {user.nome_profissional?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.nome_profissional || 'Não preenchido'}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.is_authorized ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 tracking-tighter">
                          ● Autorizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 tracking-tighter">
                          ○ Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.email !== 'neskacatedral@hotmail.com' && (
                        <button 
                          disabled={updatingId === user.id}
                          onClick={() => toggleAuthorization(user.id, user.is_authorized)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                            user.is_authorized 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                          } disabled:opacity-50`}
                        >
                          {updatingId === user.id ? 'Processando...' : user.is_authorized ? 'Revogar Acesso' : 'Autorizar Acesso'}
                        </button>
                      )}
                      {user.email === 'neskacatedral@hotmail.com' && (
                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Admin Master</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
