
import React, { useState, useEffect, useMemo } from 'react';
import { SessionAnalysis, Patient, SavedSession, GoizPair } from './types';
import { analyzeSession } from './geminiService';
import AnalysisResult from './components/AnalysisResult';
import PatientManagement from './components/PatientManagement';
import ReportManagement from './components/ReportManagement';
import GoizBaseManagement from './components/GoizBaseManagement';
import { GOIZ_PAIRS as INITIAL_PAIRS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'session' | 'patients' | 'reports' | 'goiz_base'>('session');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [goizPairs, setGoizPairs] = useState<GoizPair[]>([]);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [complaint, setComplaint] = useState('');
  const [pairsText, setPairsText] = useState('');
  const [pairSearch, setPairSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro de pacientes para vinculação
  const filteredPatientsSearch = useMemo(() => {
    if (!patientSearch || selectedPatientId) return [];
    return patients.filter(p => 
      p.nome.toLowerCase().includes(patientSearch.toLowerCase()) || 
      p.whatsapp.includes(patientSearch)
    ).slice(0, 5);
  }, [patientSearch, patients, selectedPatientId]);

  // Filtro de pares em tempo real baseado na base dinâmica
  const filteredGoizPairs = useMemo(() => {
    if (!pairSearch) return [];
    return goizPairs.filter(p => 
      p.name.toLowerCase().includes(pairSearch.toLowerCase())
    ).slice(0, 8);
  }, [pairSearch, goizPairs]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedPatients = localStorage.getItem('biomagnet_patients');
    const savedSessions = localStorage.getItem('biomagnet_sessions');
    const savedGoiz = localStorage.getItem('biomagnet_goiz_base');

    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    
    if (savedGoiz) {
      setGoizPairs(JSON.parse(savedGoiz));
    } else {
      setGoizPairs(INITIAL_PAIRS);
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('biomagnet_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('biomagnet_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('biomagnet_goiz_base', JSON.stringify(goizPairs));
  }, [goizPairs]);

  const addPatient = (newPatient: Omit<Patient, 'id' | 'createdAt'>) => {
    const patient: Patient = {
      ...newPatient,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setPatients([patient, ...patients]);
  };

  const deletePatient = (id: string) => {
    if (window.confirm("Deseja realmente excluir este paciente? Isso não removerá o histórico de sessões.")) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const loadExamples = () => {
    const examples: Patient[] = [
      { id: 'ex1', nome: 'Ana Maria Silva', whatsapp: '(11) 98765-4321', dataNascimento: '1985-05-12', observacoes: 'Dores articulares crônicas e fadiga.', createdAt: Date.now() },
      { id: 'ex2', nome: 'Carlos Eduardo Santos', whatsapp: '(21) 99888-7766', dataNascimento: '1972-10-20', observacoes: 'Histórico de gastrite e refluxo.', createdAt: Date.now() },
      { id: 'ex3', nome: 'Mariana Costa', whatsapp: '(31) 97766-5544', dataNascimento: '1993-02-15', observacoes: 'Ansiedade e insônia recorrente.', createdAt: Date.now() },
      { id: 'ex4', nome: 'Roberto Oliveira', whatsapp: '(41) 91122-3344', dataNascimento: '1968-08-30', observacoes: 'Diabetes tipo 2 e problemas circulatórios.', createdAt: Date.now() },
      { id: 'ex5', nome: 'Fernanda Lima', whatsapp: '(51) 92233-4455', dataNascimento: '1990-12-05', observacoes: 'Enxaquecas constantes no período menstrual.', createdAt: Date.now() },
      { id: 'ex6', nome: 'José Pereira', whatsapp: '(61) 93344-5566', dataNascimento: '1955-03-25', observacoes: 'Recuperação pós-operatória de joelho.', createdAt: Date.now() },
      { id: 'ex7', nome: 'Luciana Rocha', whatsapp: '(71) 94455-6677', dataNascimento: '1982-07-14', observacoes: 'Alergias sazonais e sinusite.', createdAt: Date.now() },
      { id: 'ex8', nome: 'Ricardo Almeida', whatsapp: '(81) 95566-7788', dataNascimento: '1978-11-11', observacoes: 'Estresse ocupacional elevado.', createdAt: Date.now() },
      { id: 'ex9', nome: 'Patrícia Gomes', whatsapp: '(91) 96677-8899', dataNascimento: '1988-04-02', observacoes: 'Disfunção hormonal e hipotireoidismo.', createdAt: Date.now() },
      { id: 'ex10', nome: 'Gustavo Machado', whatsapp: '(11) 90000-1111', dataNascimento: '2000-01-01', observacoes: 'Fadiga adrenal e baixa imunidade.', createdAt: Date.now() },
    ];
    const existingNames = new Set(patients.map(p => p.nome));
    const newOnes = examples.filter(e => !existingNames.has(e.nome));
    if (newOnes.length > 0) setPatients([...newOnes, ...patients]);
  };

  const addGoizPair = (pair: Omit<GoizPair, 'id'>) => {
    const newPair: GoizPair = { ...pair, id: 'C' + Math.random().toString(36).substr(2, 5).toUpperCase() };
    setGoizPairs([newPair, ...goizPairs]);
  };

  const updateGoizPair = (updated: GoizPair) => {
    setGoizPairs(goizPairs.map(p => p.id === updated.id ? updated : p));
  };

  const deleteGoizPair = (id: string) => {
    if (window.confirm("Remover este par da base definitiva?")) {
      setGoizPairs(goizPairs.filter(p => p.id !== id));
    }
  };

  const resetGoizBase = () => {
    if (window.confirm("Isso irá restaurar a base original e apagar suas personalizações. Confirmar?")) {
      setGoizPairs(INITIAL_PAIRS);
    }
  };

  const addPairToText = (pairName: string) => {
    const newText = pairsText ? `${pairsText.trim()}\n${pairName}` : pairName;
    setPairsText(newText);
    setPairSearch('');
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setPatientSearch(patient.nome);
  };

  const clearPatientSelection = () => {
    setSelectedPatientId('');
    setPatientSearch('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !pairsText) {
      setError("Por favor, preencha a queixa e a lista de pares.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setIsSessionSaved(false);
    try {
      const result = await analyzeSession(complaint, pairsText);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Erro ao processar análise. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentSession = () => {
    if (!analysis) return;
    const patient = patients.find(p => p.id === selectedPatientId);
    const newSavedSession: SavedSession = {
      ...analysis,
      id: Math.random().toString(36).substr(2, 9),
      patientId: selectedPatientId || 'anonymous',
      patientName: patient ? patient.nome : 'Paciente Avulso',
      date: Date.now()
    };
    setSessions([newSavedSession, ...sessions]);
    setIsSessionSaved(true);
  };

  const menuItems = [
    { id: 'session', label: 'Nova Sessão', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'patients', label: 'Pacientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'reports', label: 'Relatórios', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'goiz_base', label: 'Base Goiz', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
  ];

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">
            B
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">BioMagnet</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assist Profissional</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setAnalysis(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                  : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status do Sistema</p>
            <div className="flex items-center text-xs font-medium text-slate-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Base Ativa: {goizPairs.length} Pares
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'session' && (
            <>
              {!analysis && !isLoading && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900">Nova Análise</h2>
                    <p className="text-lg text-slate-500">Gere relatórios técnicos a partir do rastreio biomagnético.</p>
                  </div>

                  <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-10 border border-slate-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Vincular Paciente (Opcional)</label>
                      <div className="relative">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            readOnly={!!selectedPatientId}
                            placeholder="Pesquisar por Nome ou WhatsApp..."
                            className={`w-full border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all ${selectedPatientId ? 'bg-purple-50 font-bold border-purple-200' : 'bg-slate-50'}`}
                          />
                          {selectedPatientId && (
                            <button 
                              type="button"
                              onClick={clearPatientSelection}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {filteredPatientsSearch.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="divide-y divide-slate-50">
                              {filteredPatientsSearch.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => selectPatient(p)}
                                  className="w-full text-left px-4 py-4 hover:bg-purple-50 transition-colors flex items-center space-x-3 group"
                                >
                                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold">
                                    {p.nome.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600">{p.nome}</p>
                                    <p className="text-[11px] text-slate-400">{p.whatsapp || 'Sem WhatsApp'}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Queixa Principal</label>
                      <input 
                        type="text" 
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder="Ex: Enxaqueca recorrente e sinusite"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Pesquisar na Sua Base Goiz</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={pairSearch}
                            onChange={(e) => setPairSearch(e.target.value)}
                            placeholder="Digite para buscar..."
                            className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl px-10 py-3 text-slate-900 placeholder-purple-300 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                          />
                          <svg className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          
                          {filteredGoizPairs.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                                {filteredGoizPairs.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => addPairToText(p.name)}
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex justify-between items-center group"
                                  >
                                    <div>
                                      <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                      <p className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">{p.description}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Pares Biomagnéticos da Sessão</label>
                        <textarea 
                          rows={6}
                          value={pairsText}
                          onChange={(e) => setPairsText(e.target.value)}
                          placeholder="Os pares aparecerão aqui ou você pode digitar livremente..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono text-sm leading-relaxed"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-100 transition-all flex items-center justify-center space-x-3 transform active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Analisar Biomagnetismo</span>
                    </button>
                  </form>
                </div>
              )}

              {isLoading && (
                <div className="max-w-2xl mx-auto py-32 text-center space-y-8">
                   <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                   <h3 className="text-2xl font-bold text-slate-800">Processando Pares...</h3>
                </div>
              )}

              {analysis && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAnalysis(null)}
                      className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Nova Consulta
                    </button>
                  </div>
                  <AnalysisResult 
                    data={analysis} 
                    onSave={saveCurrentSession} 
                    isSaved={isSessionSaved} 
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'patients' && (
            <PatientManagement 
              patients={patients} 
              onAddPatient={addPatient} 
              onDeletePatient={deletePatient}
              onLoadExamples={loadExamples} 
            />
          )}

          {activeTab === 'reports' && (
            <ReportManagement 
              sessions={sessions} 
              patients={patients} 
            />
          )}

          {activeTab === 'goiz_base' && (
            <GoizBaseManagement 
              pairs={goizPairs}
              onAddPair={addGoizPair}
              onUpdatePair={updateGoizPair}
              onDeletePair={deleteGoizPair}
              onResetBase={resetGoizBase}
            />
          )}
        </div>
      </main>

      {/* Floating Info */}
      <footer className="fixed bottom-6 right-6 z-40">
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center space-x-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>Terapeuta: Dr. Biomagnetismo</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
