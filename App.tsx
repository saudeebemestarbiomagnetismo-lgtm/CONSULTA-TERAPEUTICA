
import React, { useState, useEffect, useMemo } from 'react';
import { SessionAnalysis, Patient, SavedSession, GoizPair } from './types';
import { analyzeSession } from './geminiService';
import AnalysisResult from './components/AnalysisResult';
import PatientManagement from './components/PatientManagement';
import ReportManagement from './components/ReportManagement';
import GoizBaseManagement from './components/GoizBaseManagement';
import Auth from './components/Auth';
import { GOIZ_PAIRS as INITIAL_PAIRS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'session' | 'patients' | 'reports' | 'goiz_base'>('session');
  const [sessionType, setSessionType] = useState<'biomagnetismo' | 'emocional'>('biomagnetismo');
  
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

  const filteredPatientsSearch = useMemo(() => {
    if (!patientSearch || selectedPatientId) return [];
    return patients.filter(p => 
      p.nome.toLowerCase().includes(patientSearch.toLowerCase()) || 
      p.whatsapp.includes(patientSearch)
    ).slice(0, 5);
  }, [patientSearch, patients, selectedPatientId]);

  const filteredGoizPairs = useMemo(() => {
    if (!pairSearch) return [];
    return goizPairs.filter(p => 
      p.name.toLowerCase().includes(pairSearch.toLowerCase())
    ).slice(0, 8);
  }, [pairSearch, goizPairs]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('biomagnet_current_user');
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
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

  useEffect(() => { localStorage.setItem('biomagnet_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('biomagnet_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('biomagnet_goiz_base', JSON.stringify(goizPairs)); }, [goizPairs]);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    sessionStorage.setItem('biomagnet_current_user', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem('biomagnet_current_user');
  };

  const addPatient = (newPatient: Omit<Patient, 'id' | 'createdAt'>) => {
    const patient: Patient = { ...newPatient, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    setPatients([patient, ...patients]);
  };

  const deletePatient = (id: string) => {
    if (window.confirm("Excluir paciente?")) setPatients(patients.filter(p => p.id !== id));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !pairsText) {
      setError("Preencha a queixa e os pares/pontos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setIsSessionSaved(false);
    try {
      const result = await analyzeSession(complaint, pairsText, sessionType);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Erro ao processar análise.");
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

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;

  const menuItems = [
    { id: 'session', label: 'Nova Sessão', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'patients', label: 'Pacientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'reports', label: 'Relatórios', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'goiz_base', label: 'Base Goiz', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">B</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">BioMagnet</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assist Profissional</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setAnalysis(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'session' && (
            <>
              {!analysis && !isLoading && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900">Nova Análise</h2>
                    <p className="text-lg text-slate-500">Escolha o tipo de atendimento para gerar o relatório.</p>
                  </div>

                  {/* PROTOCOL SELECTOR */}
                  <div className="grid grid-cols-2 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <button 
                      onClick={() => setSessionType('biomagnetismo')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${sessionType === 'biomagnetismo' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.52a2 2 0 00.547 2.132l.088.088a2 2 0 002.828 0l2.828-2.828a2 2 0 00.547-2.132l-.828-2.172z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3H7a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                      <span className="text-xs font-bold uppercase">Biomagnetismo</span>
                    </button>
                    <button 
                      onClick={() => setSessionType('emocional')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${sessionType === 'emocional' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <span className="text-xs font-bold uppercase">Emocional</span>
                    </button>
                  </div>

                  <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Vincular Paciente (Opcional)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          placeholder="Pesquisar..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        {filteredPatientsSearch.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                            {filteredPatientsSearch.map(p => (
                              <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setPatientSearch(p.nome); }} className="w-full text-left px-4 py-4 hover:bg-purple-50 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold">{p.nome.charAt(0)}</div>
                                <div><p className="text-sm font-bold text-slate-900">{p.nome}</p></div>
                              </button>
                            ))}
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
                        placeholder={sessionType === 'biomagnetismo' ? "Ex: Dor de dente, Enxaqueca..." : "Ex: Insônia, Ansiedade, Luto..."}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Pares Biomagnéticos da Sessão</label>
                      <textarea 
                        rows={6}
                        value={pairsText}
                        onChange={(e) => setPairsText(e.target.value)}
                        placeholder={sessionType === 'biomagnetismo' ? "Dente / Rim\nBaço / Pulmão..." : "Coração (Abandono)\nRim (Medo)..."}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                      />
                    </div>

                    <button type="submit" className={`w-full text-white font-bold py-5 rounded-2xl shadow-xl transition-all ${sessionType === 'biomagnetismo' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      <span>Analisar {sessionType === 'biomagnetismo' ? 'Biomagnetismo' : 'Desbloqueio Emocional'}</span>
                    </button>
                  </form>
                </div>
              )}

              {isLoading && (
                <div className="max-w-2xl mx-auto py-32 text-center space-y-8">
                   <div className={`w-24 h-24 border-4 rounded-full animate-spin mx-auto ${sessionType === 'biomagnetismo' ? 'border-purple-100 border-t-purple-600' : 'border-emerald-100 border-t-emerald-600'}`}></div>
                   <h3 className="text-2xl font-bold text-slate-800">Sintonizando Campo...</h3>
                </div>
              )}

              {analysis && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setAnalysis(null)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Nova Consulta</button>
                  </div>
                  <AnalysisResult data={analysis} onSave={saveCurrentSession} isSaved={isSessionSaved} />
                </div>
              )}
            </>
          )}

          {activeTab === 'patients' && <PatientManagement patients={patients} onAddPatient={addPatient} onDeletePatient={deletePatient} onLoadExamples={() => {}} />}
          {activeTab === 'reports' && <ReportManagement sessions={sessions} patients={patients} />}
          {activeTab === 'goiz_base' && <GoizBaseManagement pairs={goizPairs} onAddPair={() => {}} onUpdatePair={() => {}} onDeletePair={() => {}} onResetBase={() => {}} />}
        </div>
      </main>

      <footer className="fixed bottom-6 right-6 z-40">
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${sessionType === 'biomagnetismo' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
          <span>Terapeuta: {currentUser}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
