
import React, { useState, useEffect, useMemo } from 'react';
import { SessionAnalysis, Patient, SavedSession, GoizPair } from './types';
import { analyzeSession } from './geminiService';
import { supabase } from './supabaseClient';
import AnalysisResult from './components/AnalysisResult';
import PatientManagement from './components/PatientManagement';
import ReportManagement from './components/ReportManagement';
import GoizBaseManagement from './components/GoizBaseManagement';
import Auth from './components/Auth';
import { GOIZ_PAIRS as INITIAL_PAIRS } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // 1. Fetch Patients
      const { data: pts } = await supabase.from('patients').select('*').order('nome');
      if (pts) setPatients(pts);

      // 2. Fetch Sessions with joined patient names
      const { data: ses } = await supabase.from('sessions').select('*, patients(nome)').order('created_at', { ascending: false });
      if (ses) {
        setSessions(ses.map(s => ({
          ...s,
          tipo_sessao: s.tipo_sessao,
          queixa_principal_paciente: s.queixa_principal,
          analise_profissional: s.analise_profissional,
          pares_encontrados_analise: s.pares_json,
          resumo_paciente_friendly: s.resumo_paciente,
          sugestoes_adicionais_terapeuta: s.sugestoes_terapeuta,
          patientName: s.patients?.nome || 'Paciente Avulso'
        })));
      }

      // 3. Fetch Custom Goiz Pairs
      const { data: customGoiz } = await supabase.from('custom_goiz_pairs').select('*');
      const combinedGoiz = [...INITIAL_PAIRS];
      if (customGoiz) {
        customGoiz.forEach(cg => {
          if (!combinedGoiz.find(ig => ig.name === cg.name)) {
            combinedGoiz.push({ id: cg.id, name: cg.name, description: cg.description });
          }
        });
      }
      setGoizPairs(combinedGoiz);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  const handleLogin = (userId: string, email: string) => {
    // Session state will be updated by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const addPatient = async (newPatient: Omit<Patient, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('patients').insert([{
      user_id: session.user.id,
      nome: newPatient.nome,
      whatsapp: newPatient.whatsapp,
      data_nascimento: newPatient.data_nascimento,
      observacoes: newPatient.observacoes
    }]).select();
    
    if (!error && data) fetchData();
  };

  const deletePatient = async (id: string) => {
    if (window.confirm("Excluir paciente?")) {
      await supabase.from('patients').delete().eq('id', id);
      fetchData();
    }
  };

  const addGoizPair = async (pair: Omit<GoizPair, 'id'>) => {
    await supabase.from('custom_goiz_pairs').insert([{
      user_id: session.user.id,
      name: pair.name,
      description: pair.description
    }]);
    fetchData();
  };

  const deleteGoizPair = async (id: string) => {
    if (id.startsWith('R')) {
      alert("Não é possível deletar pares da base padrão.");
      return;
    }
    await supabase.from('custom_goiz_pairs').delete().eq('id', id);
    fetchData();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !pairsText) {
      setError("Preencha a queixa e os pares.");
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    setIsSessionSaved(false);
    try {
      const result = await analyzeSession(complaint, pairsText, sessionType);
      setAnalysis(result);
    } catch (err) {
      setError("Erro ao analisar com IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentSession = async () => {
    if (!analysis || !session) return;
    const { error } = await supabase.from('sessions').insert([{
      user_id: session.user.id,
      patient_id: selectedPatientId || null,
      tipo_sessao: analysis.tipo_sessao,
      queixa_principal: analysis.queixa_principal_paciente,
      analise_profissional: analysis.analise_profissional,
      pares_json: analysis.pares_encontrados_analise,
      resumo_paciente: analysis.resumo_paciente_friendly,
      sugestoes_terapeuta: analysis.sugestoes_adicionais_terapeuta
    }]);
    
    if (!error) {
      setIsSessionSaved(true);
      fetchData();
    } else {
      console.error(error);
    }
  };

  const filteredPatientsSearch = useMemo(() => {
    if (!patientSearch || selectedPatientId) return [];
    return patients.filter(p => p.nome.toLowerCase().includes(patientSearch.toLowerCase())).slice(0, 5);
  }, [patientSearch, patients, selectedPatientId]);

  const filteredGoizPairs = useMemo(() => {
    if (!pairSearch) return [];
    return goizPairs.filter(p => p.name.toLowerCase().includes(pairSearch.toLowerCase())).slice(0, 8);
  }, [pairSearch, goizPairs]);

  if (!session) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">B</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">BioMagnet</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cloud Profissional</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['session', 'patients', 'reports', 'goiz_base'].map((id) => (
            <button key={id} onClick={() => { setActiveTab(id as any); setAnalysis(null); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'}`}>
              <span className="capitalize">{id.replace('_', ' ')}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50">Sair</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'session' && (
            <>
              {!analysis && !isLoading && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4 bg-white p-2 rounded-2xl shadow-sm">
                    <button onClick={() => setSessionType('biomagnetismo')} className={`p-4 rounded-xl border-2 transition-all ${sessionType === 'biomagnetismo' ? 'border-purple-600 bg-purple-50' : 'border-transparent'}`}>Biomagnetismo</button>
                    <button onClick={() => setSessionType('emocional')} className={`p-4 rounded-xl border-2 transition-all ${sessionType === 'emocional' ? 'border-emerald-600 bg-emerald-50' : 'border-transparent'}`}>Emocional</button>
                  </div>
                  <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-xl p-10 space-y-6">
                    <div className="relative">
                      <label className="text-sm font-bold text-slate-700">Paciente</label>
                      <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Pesquisar..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4" readOnly={!!selectedPatientId} />
                      {selectedPatientId && <button type="button" onClick={() => { setSelectedPatientId(''); setPatientSearch(''); }} className="absolute right-4 top-10 text-red-500 font-bold">X</button>}
                      {filteredPatientsSearch.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border">
                          {filteredPatientsSearch.map(p => (
                            <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setPatientSearch(p.nome); }} className="w-full text-left px-4 py-4 hover:bg-purple-50">{p.nome}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">Queixa</label>
                      <input type="text" value={complaint} onChange={(e) => setComplaint(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4" />
                    </div>
                    <div className="space-y-4">
                      <input type="text" value={pairSearch} onChange={(e) => setPairSearch(e.target.value)} placeholder="Pesquisar na Base Goiz..." className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-2 text-sm" />
                      {filteredGoizPairs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {filteredGoizPairs.map(p => (
                            <button key={p.id} type="button" onClick={() => setPairsText(prev => prev ? `${prev}\n${p.name}` : p.name)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-200 transition-colors">{p.name}</button>
                          ))}
                        </div>
                      )}
                      <textarea rows={6} value={pairsText} onChange={(e) => setPairsText(e.target.value)} placeholder="Pares encontrados..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-mono text-sm" />
                    </div>
                    <button type="submit" className={`w-full text-white font-bold py-5 rounded-2xl transition-all ${sessionType === 'biomagnetismo' ? 'bg-purple-600' : 'bg-emerald-600'}`}>Analisar Sessão</button>
                  </form>
                </div>
              )}
              {isLoading && <div className="text-center py-32"><div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 font-bold">Consultando Inteligência...</p></div>}
              {analysis && (
                <div className="space-y-6">
                  <button onClick={() => setAnalysis(null)} className="font-bold text-purple-600">← Nova Consulta</button>
                  <AnalysisResult data={analysis} onSave={saveCurrentSession} isSaved={isSessionSaved} />
                </div>
              )}
            </>
          )}
          {activeTab === 'patients' && <PatientManagement patients={patients} onAddPatient={addPatient} onDeletePatient={deletePatient} onLoadExamples={() => {}} />}
          {activeTab === 'reports' && <ReportManagement sessions={sessions} patients={patients} />}
          {activeTab === 'goiz_base' && <GoizBaseManagement pairs={goizPairs} onAddPair={addGoizPair} onUpdatePair={() => {}} onDeletePair={deleteGoizPair} onResetBase={() => {}} />}
        </div>
      </main>
    </div>
  );
};

export default App;
