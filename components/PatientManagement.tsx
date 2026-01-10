
import React, { useState } from 'react';
import { Patient } from '../types';

interface PatientManagementProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  onDeletePatient: (id: string) => void;
  onLoadExamples: () => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ patients, onAddPatient, onDeletePatient, onLoadExamples }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    dataNascimento: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;
    onAddPatient(formData);
    setFormData({ nome: '', whatsapp: '', dataNascimento: '', observacoes: '' });
    setIsAdding(false);
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Pacientes</h2>
          <p className="text-slate-500 text-sm">Cadastre e gerencie o histórico de seus clientes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onLoadExamples}
            className="text-purple-600 border border-purple-200 hover:bg-purple-50 px-4 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Carregar Exemplos</span>
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-100 flex items-center space-x-2"
          >
            {isAdding ? (
              <span>Cancelar</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Novo Paciente</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
              <input 
                required
                type="text"
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp / Telefone</label>
              <input 
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data de Nascimento</label>
              <input 
                type="date"
                value={formData.dataNascimento}
                onChange={e => setFormData({...formData, dataNascimento: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações Gerais</label>
              <textarea 
                rows={2}
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Alergias, histórico cirúrgico, etc."
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all">
            Salvar Cadastro
          </button>
        </form>
      )}

      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar paciente por nome ou telefone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
        />
        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div key={patient.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  {patient.nome.charAt(0)}
                </div>
                <button 
                  onClick={() => onDeletePatient(patient.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2"
                  title="Excluir Paciente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{patient.nome}</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {patient.whatsapp || 'Não informado'}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {patient.dataNascimento ? new Date(patient.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
              </div>
              {patient.observacoes && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 line-clamp-2">{patient.observacoes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Nenhum paciente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientManagement;
