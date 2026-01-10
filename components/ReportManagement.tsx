
import React, { useState } from 'react';
import { SavedSession, Patient } from '../types';

interface ReportManagementProps {
  sessions: SavedSession[];
  patients: Patient[];
}

const ReportManagement: React.FC<ReportManagementProps> = ({ sessions, patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');

  const filteredSessions = selectedPatientId === 'all' 
    ? sessions 
    : sessions.filter(s => s.patientId === selectedPatientId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios de Atendimento</h2>
          <p className="text-slate-500 text-sm">Histórico completo de sessões realizadas.</p>
        </div>
        
        <select 
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
        >
          <option value="all">Todos os Pacientes</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-purple-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">
                    {new Date(session.date).toLocaleDateString('pt-BR')} às {new Date(session.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{session.patientName}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const text = `RELATÓRIO: ${session.patientName}\nData: ${new Date(session.date).toLocaleDateString()}\nQueixa: ${session.queixa_principal_paciente}\n\nResumo: ${session.resumo_paciente_friendly}`;
                      navigator.clipboard.writeText(text);
                      alert('Relatório copiado para a área de transferência!');
                    }}
                    className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                    title="Copiar Resumo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Queixa</h4>
                  <p className="text-sm text-slate-700">{session.queixa_principal_paciente}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Resumo Ético</h4>
                  <p className="text-sm text-slate-600 italic">"{session.resumo_paciente_friendly}"</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-1">
                  {session.pares_encontrados_analise.slice(0, 5).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600">
                      {i + 1}
                    </div>
                  ))}
                  {session.pares_encontrados_analise.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{session.pares_encontrados_analise.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {session.pares_encontrados_analise.length} pares identificados
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 font-medium">Nenhum atendimento registrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
