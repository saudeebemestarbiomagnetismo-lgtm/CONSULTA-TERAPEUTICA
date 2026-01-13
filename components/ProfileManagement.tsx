
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileManagementProps {
  userId: string;
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ userId, initialProfile, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Omit<UserProfile, 'id'>>({
    nome_profissional: initialProfile?.nome_profissional || '',
    registro_profissional: initialProfile?.registro_profissional || '',
    whatsapp_comercial: initialProfile?.whatsapp_comercial || '',
    bio_assinatura: initialProfile?.bio_assinatura || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const profileData = {
        id: userId,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      onSave(profileData as UserProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert('Erro ao salvar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Meu Perfil Profissional</h2>
        <p className="text-slate-500 mt-2">Configure como você aparece nos relatórios e para seus pacientes.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 mb-4 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={formData.nome_profissional}
                onChange={e => setFormData({...formData, nome_profissional: e.target.value})}
                placeholder="Ex: Dr. Marcelo Silva"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Registro / CRM (Opcional)</label>
              <input 
                type="text" 
                value={formData.registro_profissional}
                onChange={e => setFormData({...formData, registro_profissional: e.target.value})}
                placeholder="Ex: CNT 12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp Comercial</label>
              <input 
                type="text" 
                value={formData.whatsapp_comercial}
                onChange={e => setFormData({...formData, whatsapp_comercial: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assinatura do Relatório</label>
              <textarea 
                rows={4}
                value={formData.bio_assinatura}
                onChange={e => setFormData({...formData, bio_assinatura: e.target.value})}
                placeholder="Uma breve mensagem que aparecerá ao final dos seus atendimentos..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 ${
                success ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : success ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Perfil Atualizado!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManagement;
