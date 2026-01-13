
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onLogin: (userId: string, email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmailFormat = (email: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    const cleanEmail = email.replace(/\s+/g, '').toLowerCase();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setSuccessMessage('Instruções de recuperação enviadas para seu e-mail.');
      setIsResetMode(false);
    } catch (err: any) {
      setError('Erro ao recuperar senha: ' + (err.message || 'Verifique o e-mail digitado.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const cleanEmail = email.replace(/\s+/g, '').toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || (!isResetMode && !cleanPassword)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setError('O formato do e-mail parece inválido.');
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (signInError) throw signInError;
        if (data.user) onLogin(data.user.id, data.user.email!);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        
        if (signUpError) throw signUpError;
        
        // Se o Supabase estiver configurado para auto-confirmar, ele retorna a sessão
        if (data.user && data.session) {
            onLogin(data.user.id, data.user.email!);
        } else {
            setSuccessMessage('Conta criada com sucesso! Você já pode tentar acessar.');
            setIsLoginMode(true);
            setPassword('');
        }
      }
    } catch (err: any) {
      console.error('Auth Error Details:', err);
      
      const msg = err.message || '';
      let userFriendlyMessage = msg;

      if (msg.includes('Invalid login credentials')) {
        userFriendlyMessage = 'E-mail ou senha incorretos.';
      } else if (msg.includes('Email not confirmed')) {
        userFriendlyMessage = 'Este e-mail requer confirmação. Verifique sua caixa de entrada.';
      } else if (msg.includes('Failed to fetch')) {
        userFriendlyMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (msg.includes('User already registered')) {
        userFriendlyMessage = 'Este e-mail já está cadastrado.';
      } else if (msg.includes('rate limit')) {
        userFriendlyMessage = 'Muitas tentativas. Aguarde um pouco.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Recuperar Senha</h2>
            <p className="text-slate-500 text-sm text-center mb-8">Enviaremos um link para redefinir sua senha.</p>
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">E-mail cadastrado</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none" 
                  required 
                />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-purple-700 transition-all disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
              <button type="button" onClick={() => setIsResetMode(false)} className="w-full text-slate-500 font-bold py-2 hover:text-slate-700 transition-colors text-sm">Voltar ao Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-purple-200 mx-auto mb-6">B</div>
          <h1 className="text-3xl font-extrabold text-slate-900">BioMagnet Assist</h1>
          <p className="text-slate-500 mt-2">Plataforma Profissional Cloud</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            {isLoginMode ? 'Acesse sua conta' : 'Criar Conta Profissional'}
          </h2>

          <form onSubmit={handleAction} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-4 rounded-2xl text-sm font-bold border border-red-100 flex items-start space-x-2 animate-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-4 rounded-2xl text-sm font-bold border border-emerald-100 flex items-start space-x-2 animate-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
              <input 
                type="email" 
                autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="seu@email.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                {isLoginMode && (
                  <button type="button" onClick={() => setIsResetMode(true)} className="text-xs text-purple-600 font-bold hover:underline">Esqueceu?</button>
                )}
              </div>
              <input 
                type="password" 
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aguarde...</span>
                </div>
              ) : isLoginMode ? 'Entrar agora' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setSuccessMessage('');
              }} 
              className="text-purple-600 font-bold hover:text-purple-700 transition-colors text-sm"
            >
              {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Faça o Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
