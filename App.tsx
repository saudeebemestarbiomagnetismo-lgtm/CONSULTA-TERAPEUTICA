
import React, { useState, useEffect, useMemo } from 'react';
import { SessionAnalysis, Patient, SavedSession, GoizPair, UserProfile } from './types';
import { analyzeSession } from './geminiService';
import { supabase } from './supabaseClient';
import AnalysisResult from './components/AnalysisResult';
import PatientManagement from './components/PatientManagement';
import ReportManagement from './components/ReportManagement';
import GoizBaseManagement from './components/GoizBaseManagement';
import ProfileManagement from './components/ProfileManagement';
import UserManager from './components/UserManager';
import Auth from './components/Auth';
import { GOIZ_PAIRS as INITIAL_PAIRS } from './constants';

type TabType = 'session' | 'patients' | 'reports' | 'goiz_base' | 'profile' | 'users';

const ADMIN_EMAIL = 'neskacatedral@hotmail.com';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('session');
  const [sessionType, setSessionType] = useState<'biomagnetismo' | 'emocional'>('biomagnetismo');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [goizPairs, setGoizPairs] = useState<GoizPair[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
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
      // 1. Fetch Profile
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (pError || !profile) {
        // Se não existir perfil, cria um básico
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          is_authorized: session.user.email === ADMIN_EMAIL, // Admin auto-autoriza
          nome_profissional: '',
          registro_profissional: '',
          whatsapp_comercial: '',
          bio_assinatura: ''
        };
        await supabase.from('profiles').upsert(newProfile);
        setUserProfile(newProfile as UserProfile);
      } else {
        setUserProfile(profile as UserProfile);
      }

      // Se for admin ou autorizado, carrega o resto
      if (session.user.email === ADMIN_EMAIL || profile?.is_authorized) {
        // 2. Fetch Patients
        const { data: pts } = await supabase.from('patients').select('*').order('nome');
        if (pts) setPatients(pts);

        // 3. Fetch Sessions
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

        // 4. Fetch Custom Goiz Pairs
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
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const isAuthorized = userProfile?.is_authorized || isAdmin;

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { id: 'session', label: 'Nova Sessão', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>, hidden: !isAuthorized },
    { id: 'patients', label: 'Pacientes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round"/></svg>, hidden: !isAuthorized },
    { id: 'reports', label: 'Histórico', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round"/></svg>, hidden: !isAuthorized },
    { id: 'goiz_base', label: 'Base Goiz', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round"/></svg>, hidden: !isAuthorized },
    { id: 'profile', label: 'Meu Perfil', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: 'users', label: 'Gestor Usuários', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round"/></svg>, hidden: !isAdmin },
  ];

  if (!session) return <Auth onLogin={() => {}} />;

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
          {menuItems.filter(m => !m.hidden).map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setAnalysis(null); }} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        {userProfile && (
          <div className="mx-4 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status: {isAuthorized ? 'Autorizado' : 'Pendente'}</p>
            <p className="text-sm font-bold text-slate-700 truncate">{userProfile.nome_profissional || session.user.email}</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {!isAuthorized ? (
            <div className="max-w-md mx-auto py-20 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-100">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Aguardando Autorização</h2>
              <p className="text-slate-500">
                Seu cadastro foi realizado, mas o acesso aos módulos profissionais requer aprovação do administrador <strong>({ADMIN_EMAIL})</strong>.
              </p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enquanto isso...</p>
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className="w-full bg-purple-50 text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                >
                  Configurar Meu Perfil
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'session' && (
                /* ... Lógica de sessão existente ... */
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => setSessionType('biomagnetismo')} className={`p-4 rounded-xl font-bold transition-all border-2 ${sessionType === 'biomagnetismo' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>Biomagnetismo</button>
                    <button onClick={() => setSessionType('emocional')} className={`p-4 rounded-xl font-bold transition-all border-2 ${sessionType === 'emocional' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>Emocional</button>
                  </div>
                  {/* Form de Nova Sessão */}
                  {!analysis && !isLoading && (
                    <form onSubmit={(e) => { e.preventDefault(); setIsLoading(true); analyzeSession(complaint, pairsText, sessionType).then(setAnalysis).finally(() => setIsLoading(false)); }} className="bg-white rounded-[2.5rem] shadow-xl p-10 space-y-6 border border-slate-100">
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Paciente</label>
                        <select 
                          value={selectedPatientId} 
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          <option value="">Paciente Avulso</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Queixa Principal</label>
                        <input type="text" value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Motivo da consulta..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none" required />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Pares Encontrados</label>
                        <textarea rows={6} value={pairsText} onChange={(e) => setPairsText(e.target.value)} placeholder="Digite os pares..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none" required />
                      </div>
                      <button type="submit" className={`w-full text-white font-bold py-5 rounded-2xl shadow-xl transition-all ${sessionType === 'biomagnetismo' ? 'bg-purple-600' : 'bg-emerald-600'}`}>Realizar Análise IA</button>
                    </form>
                  )}
                  {isLoading && <div className="text-center py-20 animate-pulse">Consultando Inteligência...</div>}
                  {analysis && <AnalysisResult data={analysis} onSave={() => {}} isSaved={false} />}
                </div>
              )}
              {activeTab === 'patients' && <PatientManagement patients={patients} onAddPatient={() => {}} onDeletePatient={() => {}} onLoadExamples={() => {}} />}
              {activeTab === 'reports' && <ReportManagement sessions={sessions} patients={patients} />}
              {activeTab === 'goiz_base' && <GoizBaseManagement pairs={goizPairs} onAddPair={() => {}} onUpdatePair={() => {}} onDeletePair={() => {}} onResetBase={() => {}} />}
              {activeTab === 'users' && <UserManager />}
            </>
          )}
          {activeTab === 'profile' && (
            <ProfileManagement 
              userId={session.user.id} 
              initialProfile={userProfile} 
              onSave={(p) => setUserProfile(p)} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
