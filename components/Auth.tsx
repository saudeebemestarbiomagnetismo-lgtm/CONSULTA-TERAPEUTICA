
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onLogin: (userId: string, email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) onLogin(data.user.id, data.user.email!);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Verifique seu e-mail ou faça login.');
        setIsLoginMode(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-purple-200 mx-auto mb-6">B</div>
          <h1 className="text-3xl font-extrabold text-slate-900">BioMagnet Assist</h1>
          <p className="text-slate-500 mt-2">Sistema Profissional na Nuvem</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            {isLoginMode ? 'Bem-vindo' : 'Criar Conta'}
          </h2>

          <form onSubmit={handleAction} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none" required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50">
              {loading ? 'Processando...' : isLoginMode ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-purple-600 font-bold hover:text-purple-700">
              {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
