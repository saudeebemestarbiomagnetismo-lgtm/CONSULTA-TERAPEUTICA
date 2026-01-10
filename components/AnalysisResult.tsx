
import React from 'react';
import { SessionAnalysis } from '../types';

interface AnalysisResultProps {
  data: SessionAnalysis;
  onSave?: () => void;
  isSaved?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onSave, isSaved }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex-1 w-full">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Queixa Principal</h2>
          <p className="text-xl font-bold text-slate-900">{data.queixa_principal_paciente}</p>
        </div>
        {onSave && !isSaved && (
          <button 
            onClick={onSave}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Salvar no Histórico</span>
          </button>
        )}
        {isSaved && (
          <div className="w-full sm:w-auto bg-emerald-50 text-emerald-700 px-8 py-4 rounded-2xl font-bold border border-emerald-100 flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Salvo com Sucesso</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Professional Analysis */}
        <div className="space-y-6">
          <section className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="flex items-center text-lg font-bold text-purple-900 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Análise Técnica Profissional
            </h3>
            <p className="text-purple-800 leading-relaxed whitespace-pre-wrap">{data.analise_profissional}</p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="p-6 text-lg font-bold text-slate-900 border-b border-slate-100">Mapeamento de Pares</h3>
            <div className="divide-y divide-slate-100">
              {data.pares_encontrados_analise.map((p, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Par {idx + 1}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-700">{p.par}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Localização (pH Ácido)</span>
                      <p className="text-sm text-slate-600">{p.localizacao_pH_negativo}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Disfunção/Patógeno</span>
                      <p className="text-sm font-medium text-slate-800">{p.patogeno_disfuncao_sugerida}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Patient Friendly & Suggestions */}
        <div className="space-y-6">
          <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="flex items-center text-lg font-bold text-emerald-900 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resumo para o Paciente (Ético)
            </h3>
            <p className="text-emerald-800 leading-relaxed italic">"{data.resumo_paciente_friendly}"</p>
          </section>

          <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h3 className="flex items-center text-lg font-bold text-amber-900 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Sugestões para o Terapeuta
            </h3>
            <p className="text-amber-800 leading-relaxed">{data.sugestoes_adicionais_terapeuta}</p>
          </section>

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Exportar Relatório</h4>
            <div className="flex gap-4">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-white text-slate-900 hover:bg-slate-100 py-3 rounded-xl font-bold transition-all shadow-sm"
              >
                Imprimir / PDF
              </button>
              <button 
                onClick={() => {
                  const text = `ANÁLISE DE SESSÃO\n\nQueixa: ${data.queixa_principal_paciente}\n\nResumo para o Paciente:\n${data.resumo_paciente_friendly}`;
                  navigator.clipboard.writeText(text);
                  alert('Resumo copiado!');
                }}
                className="flex-1 bg-slate-800 text-white hover:bg-slate-700 py-3 rounded-xl font-bold transition-all"
              >
                Copiar Resumo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
