
import React, { useState } from 'react';
import { GoizPair } from '../types';

interface GoizBaseManagementProps {
  pairs: GoizPair[];
  onAddPair: (pair: Omit<GoizPair, 'id'>) => void;
  onUpdatePair: (pair: GoizPair) => void;
  onDeletePair: (id: string) => void;
  onResetBase: () => void;
}

const GoizBaseManagement: React.FC<GoizBaseManagementProps> = ({ 
  pairs, onAddPair, onUpdatePair, onDeletePair, onResetBase 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      onUpdatePair({ id: editingId, ...formData });
      setEditingId(null);
    } else {
      onAddPair(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', description: '' });
  };

  const startEdit = (pair: GoizPair) => {
    setEditingId(pair.id);
    setFormData({ name: pair.name, description: pair.description });
    setIsAdding(true);
  };

  const filteredPairs = pairs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Base de Conhecimento Goiz</h2>
          <p className="text-slate-500 text-sm">Gerencie sua biblioteca personalizada de pares biomagnéticos.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onResetBase}
            className="text-slate-500 hover:text-red-600 px-4 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center space-x-2 border border-slate-200 bg-white"
          >
            <span>Resetar Padrão</span>
          </button>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              setFormData({ name: '', description: '' });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-100 flex items-center space-x-2"
          >
            {isAdding ? 'Cancelar' : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Novo Par</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-purple-900">{editingId ? 'Editar Par' : 'Cadastrar Novo Par'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome do Par (Negativo / Positivo)</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ex: Pineal / Pineal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descrição / Observação Técnica</label>
              <input 
                type="text"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ex: Reservatório de vírus, disfunção glandular..."
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
            {editingId ? 'Salvar Alterações' : 'Adicionar à Base'}
          </button>
        </form>
      )}

      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar par por nome ou descrição..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
        />
        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Nome do Par</th>
              <th className="px-6 py-4">Descrição Técnica</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPairs.map(pair => (
              <tr key={pair.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">{pair.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">{pair.description}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => startEdit(pair)}
                    className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDeletePair(pair.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPairs.length === 0 && (
          <div className="py-20 text-center text-slate-400">Nenhum par encontrado na base.</div>
        )}
      </div>
    </div>
  );
};

export default GoizBaseManagement;
